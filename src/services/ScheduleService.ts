import {
    CompetitionData,
    SkatingClass,
    Person,
    Schedule,
    ScheduleSession
} from '../types'
import { v4 as uuidv4 } from 'uuid'
import { SchedulerSettings, RuleConfig } from '../store/settingsSlice'

export class ScheduleService {

    /**
     * Generates a basic schedule for the given competition data.
     */
    public generateSchedule(data: CompetitionData, settings: SchedulerSettings): Schedule {
        const warnings: string[] = []

        // 1. Define Availability Slots
        interface TimeSlot {
            start: Date
            end: Date
            name: string
        }

        let slots: TimeSlot[] = []

        if (settings.availability && settings.availability.length > 0) {
            slots = settings.availability.map(a => ({
                start: new Date(`${a.date}T${a.startTime}`),
                end: new Date(`${a.date}T${a.endTime}`),
                name: `${a.date} (${a.startTime}-${a.endTime})`
            })).sort((a, b) => a.start.getTime() - b.start.getTime())
        } else {
            // Fallback: Generate 3 days of standard hours
            const daysToGenerate = 3
            let currentDateStr = settings.startDate || new Date().toISOString().split('T')[0]

            for (let i = 0; i < daysToGenerate; i++) {
                const date = new Date(currentDateStr)
                date.setDate(date.getDate() + i)
                const dateIso = date.toISOString().split('T')[0]

                const start = new Date(`${dateIso}T${settings.startHour.toString().padStart(2, '0')}:00`)
                const end = new Date(`${dateIso}T${(settings.endHour || 19).toString().padStart(2, '0')}:00`)

                slots.push({ start, end, name: `Day ${i + 1}` })
            }
        }

        // 2. Prepare Sorting
        // Filter out non-competitive classes like "Tränare" (trainers/coaches)
        const allClasses = [...data.event.competitions.flatMap(comp => comp.classes)]
            .filter(c => !c.name.toLowerCase().includes('tränare'))

        const getTypePriority = (c: SkatingClass): number => {
            const lowerName = c.name.toLowerCase()
            const lowerType = c.type.toLowerCase()
            if (lowerName.includes('short') || lowerType.includes('short') || lowerName.includes('kort') || lowerType.includes('kort')) return 1
            if (lowerName.includes('free') || lowerType.includes('free') || lowerName.includes('fri') || lowerType.includes('fri') || lowerName.includes('lång') || lowerType.includes('lång')) return 2
            return 3
        }

        const defaultSort = (a: SkatingClass, b: SkatingClass) => {
            const pA = getTypePriority(a)
            const pB = getTypePriority(b)
            if (pA !== pB) return pA - pB
            return a.name.localeCompare(b.name)
        }

        if (settings.customClassOrder && settings.customClassOrder.length > 0) {
            const orderMap = new Map(settings.customClassOrder.map((id, index) => [id, index]))
            allClasses.sort((a, b) => {
                const indexA = orderMap.get(a.id)
                const indexB = orderMap.get(b.id)
                if (indexA !== undefined && indexB !== undefined) return indexA - indexB
                if (indexA !== undefined) return -1
                if (indexB !== undefined) return 1
                return defaultSort(a, b)
            })
        } else {
            allClasses.sort(defaultSort)
        }

        // 3. Process Logic
        let currentSlotIndex = 0
        let currentTime = new Date(slots[0].start)

        // Track Ice Maintenance Constraints globally across classes within a slot?
        // Or reset per slot? Usually reset per day (Slot).
        let accumulatedDuration = 0 // Time on ice since last resurface
        let accumulatedSkaters = 0

        // We use a temporary list to hold the finalized sessions
        const inputSessions: ScheduleSession[] = []

        for (const skatingClass of allClasses) {
            if (currentSlotIndex >= slots.length) break

            // Generate optimistic sessions for this class starting from currentTime
            const rawSessions = this.generateSessionsForClass(skatingClass, currentTime, settings)

            // Group into Atomic Blocks
            interface Block {
                sessions: ScheduleSession[]
                totalDuration: number
                type: 'group' | 'single'
            }

            const blocks: Block[] = []
            let currentBlock: Block | null = null
            let currentGroupId: number | null = null

            for (const s of rawSessions) {
                // Strip out internal Resurfacing/Breaks from GenerateSessions? 
                // The old logic inserted them. We might want to control them here at the high level now.
                // But generateSessionsForClass handles per-class rules (maxSkaters).
                // Let's Keep them but treat them as single blocks.

                if (s.type === 'warmup') {
                    if (currentBlock) blocks.push(currentBlock)
                    currentBlock = { sessions: [s], totalDuration: s.duration, type: 'group' }
                    currentGroupId = s.groupId || null
                } else if (s.type === 'performance') {
                    if (currentBlock && currentBlock.type === 'group' && s.groupId === currentGroupId) {
                        currentBlock.sessions.push(s)
                        currentBlock.totalDuration += s.duration
                    } else {
                        if (currentBlock) blocks.push(currentBlock)
                        currentBlock = { sessions: [s], totalDuration: s.duration, type: 'single' }
                        currentGroupId = null
                    }
                } else if (s.type === 'break' && s.name === '(Förb.)') {
                    // Treat Prep buffer as part of the group
                    if (currentBlock && currentBlock.type === 'group' && s.groupId === currentGroupId) {
                        currentBlock.sessions.push(s)
                        currentBlock.totalDuration += s.duration
                    } else {
                        if (currentBlock) blocks.push(currentBlock)
                        currentBlock = { sessions: [s], totalDuration: s.duration, type: 'single' } // Should not happen if flow is correct
                        currentGroupId = null
                    }
                } else {
                    if (currentBlock) blocks.push(currentBlock)
                    currentBlock = { sessions: [s], totalDuration: s.duration, type: 'single' }
                    currentGroupId = null
                }
            }
            if (currentBlock) blocks.push(currentBlock)

            // Place Blocks
            // We use a Transactional Try-Fit approach to account for dynamic expansions (Lunch/Resurface)

            for (const block of blocks) {
                let placed = false

                // Helper to perform placement simulation/commit
                // If 'commit' is true, we push to real list and update real state.
                // If 'commit' is false, we just return the final time or null if it fails.

                while (!placed && currentSlotIndex < slots.length) {
                    const slot = slots[currentSlotIndex]

                    // Snapshot state for this attempt
                    let simTime = new Date(currentTime)
                    let simAccumulatedDuration = accumulatedDuration
                    let simAccumulatedSkaters = accumulatedSkaters
                    const simSessions: ScheduleSession[] = []

                    let fits = true

                    for (const s of block.sessions) {
                        // IMPORTANT: Ignore s.startTime and s.endTime from generateSessionsForClass
                        // We only use s.duration and place from simTime
                        // This prevents gaps when breaks/lunch are inserted

                        // 1. Check Lunch - STRICT TIME CHECK (Automated)
                        // Rule: Lunch should be ~11:30-14:00.
                        // We enforce lunch if time passes 11:30 and we have a suitable break opportunity.
                        // Simplify: If simTime >= 12:00 (midday) and we haven't had lunch in this slot?
                        // Or better: If simTime crosses 12:00?

                        // 1. Check Lunch - STRICT TIME CHECK
                        // Rule: Lunch should be ~12:00.
                        const lunchTargetHour = 12
                        const lunchThreshold = new Date(simTime)
                        lunchThreshold.setHours(lunchTargetHour, 0, 0, 0)

                        const durationMs = s.duration * 1000

                        // Force lunch if we cross 12:00 or are past it
                        const crossesLunch = simTime.getTime() < lunchThreshold.getTime() && (simTime.getTime() + durationMs) > lunchThreshold.getTime()
                        const isPastLunch = simTime.getTime() >= lunchThreshold.getTime() && simTime.getTime() < (lunchThreshold.getTime() + 60 * 60000)

                        // If we hit lunch window
                        if (crossesLunch || isPastLunch) {
                            // Force Lunch Break
                            const lunchDuration = 60 * 60 // Fixed 60 min standard

                            // Lunch Break (Includes Resurfacing)
                            const lEnd = new Date(simTime.getTime() + lunchDuration * 1000)

                            // Only add if fit
                            if (lEnd.getTime() <= slot.end.getTime()) {
                                simSessions.push({
                                    id: uuidv4(), type: 'break',
                                    startTime: new Date(simTime), endTime: lEnd, duration: lunchDuration,
                                    name: 'Lunch (Inkl. Isvård)',
                                    classId: 'break'
                                })
                                simTime = lEnd

                                // RESET COUNTERS
                                simAccumulatedDuration = 0
                                simAccumulatedSkaters = 0

                                // Recalculate lunch threshold context for next pass isn't needed as we break loop or continue
                            } else {
                                fits = false
                                break
                            }
                        }

                        if (!fits) break

                        // 2. Check Dynamic Resurfacing (Rules)
                        // Only check if it's a content session (not break/resurf) and NOT immediately after a break (accumulatedDuration > 0)
                        if (s.type !== 'resurfacing' && s.type !== 'break') {
                            // Use Rule
                            const rule = (this as any).getRuleForClass(s.className || 'default', settings.rules)
                            const limitSkaters = rule.maxSkatersBetweenResurfacing

                            // We ignore global maxIceTime as per user req, relying on Skater Count table.
                            // But as a fallback for low-density classes, we might want a sanity check?
                            // User said: "Is få åkare... kan man spola oftare".
                            // Let's rely STRICTLY on skater count for now as requested.

                            let needResurface = false

                            // Skater Limit Check
                            if (simAccumulatedSkaters > 0 && s.skaterCount && (simAccumulatedSkaters + s.skaterCount) > limitSkaters) {
                                needResurface = true
                            }

                            if (needResurface) {
                                const resDuration = 15 * 60 // Fixed 15 min
                                const rEnd = new Date(simTime.getTime() + resDuration * 1000)

                                if (rEnd.getTime() <= slot.end.getTime()) {
                                    simSessions.push({
                                        id: uuidv4(), type: 'resurfacing',
                                        startTime: new Date(simTime), endTime: rEnd, duration: resDuration,
                                        classId: s.classId, name: 'Isvård'
                                    })
                                    simTime = rEnd
                                    // RESET COUNTERS
                                    simAccumulatedDuration = 0
                                    simAccumulatedSkaters = 0
                                } else {
                                    fits = false
                                    break
                                }
                            }
                        }

                        // 3. Place Session
                        const sEnd = new Date(simTime.getTime() + s.duration * 1000)
                        if (sEnd.getTime() > slot.end.getTime()) {
                            fits = false
                            break
                        }

                        simSessions.push({ ...s, startTime: new Date(simTime), endTime: sEnd })
                        simTime = sEnd

                        const isResettingBreak = s.type === 'resurfacing' || (s.type === 'break' && s.name !== '(Förb.)')
                        if (!isResettingBreak) {
                            simAccumulatedDuration += s.duration
                            if (s.skaterCount) simAccumulatedSkaters += s.skaterCount
                        } else {
                            // If we placed a manual break/resurf (shouldn't happen often here), reset?
                            simAccumulatedDuration = 0
                            simAccumulatedSkaters = 0
                        }
                    }

                    if (fits) {
                        // Commit!
                        simSessions.forEach(sess => inputSessions.push(sess))
                        currentTime = simTime
                        accumulatedDuration = simAccumulatedDuration
                        accumulatedSkaters = simAccumulatedSkaters
                        placed = true
                    } else {
                        // Try Next Slot
                        currentSlotIndex++
                        if (currentSlotIndex < slots.length) {
                            currentTime = new Date(slots[currentSlotIndex].start)
                            accumulatedDuration = 0
                            accumulatedSkaters = 0
                        }
                    }
                }

                if (!placed) {
                    warnings.push(`Could not schedule block from class ${skatingClass.name} - Schedule Full`)
                }
            }
        }

        // POST-PROCESSING: Compact schedule to remove gaps
        // Sort sessions by start time
        const sortedSessions = [...inputSessions].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )

        // Group by day
        const sessionsByDay = new Map<string, ScheduleSession[]>()
        sortedSessions.forEach(session => {
            const start = new Date(session.startTime)
            const dateKey = start.toISOString().split('T')[0]
            if (!sessionsByDay.has(dateKey)) {
                sessionsByDay.set(dateKey, [])
            }
            sessionsByDay.get(dateKey)!.push(session)
        })

        // Compact each day's sessions to remove gaps
        const compactedSessions: ScheduleSession[] = []
        sessionsByDay.forEach((daySessions) => {
            if (daySessions.length === 0) return

            // Start from the first session's original start time
            let currentTime = new Date(daySessions[0].startTime)

            daySessions.forEach((session) => {
                // Place session at currentTime
                const duration = session.duration
                const newStart = new Date(currentTime)
                const newEnd = new Date(currentTime.getTime() + duration * 1000)

                compactedSessions.push({
                    ...session,
                    startTime: newStart,
                    endTime: newEnd
                })

                // Move currentTime forward by the session's duration
                currentTime = newEnd
            })
        })

        return {
            id: uuidv4(),
            competitionId: data.event.id,
            sessions: compactedSessions,
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0',
                totalDuration: 0,
                efficiency: 0,
                validationWarnings: warnings // Custom field? If not in type, typescript will error.
            }
        }
    }


    private generateSessionsForClass(skatingClass: SkatingClass, startTime: Date, settings: SchedulerSettings): ScheduleSession[] {
        const sessions: ScheduleSession[] = []
        let currentTime = new Date(startTime)

        // Get rules for this class
        const rule = this.getRuleForClass(skatingClass.name, settings.rules)
        const isShort = skatingClass.type.toLowerCase().includes('short') || skatingClass.type.toLowerCase().includes('kort')

        const allSkaters = this.getAllSkaters(skatingClass)
        const groups = this.calculateWarmupGroups(allSkaters, rule.maxGroupSize)

        // Check for Lunch Break logic
        // If currentTime is within lunch window or we passed it significantly?
        // Actually, best to check "Are we about to cross lunch?"
        // OR: Simpler: If currentTime > lunchStart && lunchNotTaken, insert lunch.
        // BUT: We are inside a class. We usually don't break a class for lunch unless necessary.
        // Story says "Lunch... usually between 11:30-14:00... Combined with resurfacing".
        // Let's check BEFORE starting the groups.

        const lunchStartParts = (settings.lunchStartTime || '12:00').split(':').map(Number)
        const lunchStart = new Date(currentTime)
        lunchStart.setHours(lunchStartParts[0], lunchStartParts[1], 0, 0)

        // If currently before lunch, and starting this class would go well past lunch start?
        // Or if we already passed lunch start (but not by much)?
        // Simple logic: If currentTime >= lunchStart, and we haven't just had a big break...
        // We need context to know if lunch was taken. 
        // For this iteration/story, let's look at the time of day. 
        // If currentTime is between LunchStart and LunchStart + 2h?
        // Issues: 
        // 1. We might be generating day 2. 'lunchStart' needs to be for current day.

        // Fix: Adjust lunchStart to current day
        if (currentTime.getDate() !== lunchStart.getDate()) {
            lunchStart.setFullYear(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate())
            lunchStart.setHours(lunchStartParts[0], lunchStartParts[1], 0, 0)
        }

        // Logic: specific break session with resurfacing
        if (currentTime.getTime() >= lunchStart.getTime() && currentTime.getTime() < lunchStart.getTime() + 60 * 60000) {
            // We are in lunch window. Insert lunch if not already handled?
            // Since we iterate sequentially, if we arrive here and it's 12:00, we add lunch.
            // But we don't want to add it multiple times.
            // We can assume if the *previous* session ended exactly at currentTime, and no lunch session exists...
            // BUT we don't see previous sessions here easily (only returned ones).

            // Let's skip complicated "Have we had lunch?" state tracking for Story 07 and assume:
            // If currentTime is near lunch start (within 30 mins after), forced lunch.

            // Actually, simplest is: Insert lunch break session if constraints are met.
            // And we return it as first session of this block.
        }

        // IMPROVED RESURFACING LOGIC (Skater Count)
        // Rule: maxSkatersBetweenResurfacing
        // If not defined, fallback to global interval (groups)

        // This counter is local to class, which is a limitation. 
        // Ideal: Pass context. For now, we assume resurface at start OR handled by previous class.
        // We just handle INTERNAL resurfacing.

        let accumulatedSkaters = 0
        groups.forEach((groupSkaters, index) => {
            const groupIndex = index + 1
            const groupSize = groupSkaters.length
            accumulatedSkaters += groupSize

            // Check for potential Lunch Break BEFORE this group?
            // Re-eval lunch start for this specific time

            // 1. Warmup
            const warmupDuration = isShort ? rule.warmupTimeShort : rule.warmupTimeFree
            const warmupEnd = new Date(currentTime.getTime() + warmupDuration * 1000)

            sessions.push({
                id: uuidv4(),
                type: 'warmup',
                startTime: new Date(currentTime),
                endTime: warmupEnd,
                duration: warmupDuration,
                classId: skatingClass.id,
                className: skatingClass.name,
                groupId: groupIndex,
                name: `Uppvärmning Grupp ${groupIndex}`,
                skaterCount: groupSize
            })

            currentTime = warmupEnd

            // 1b. Buffer/Prep time (First Skater In Warmup Group)
            // This adds a small gap (e.g., 30s) between warmup and first skater
            if (rule.firstSkaterInWarmupGroup && rule.firstSkaterInWarmupGroup > 0) {
                const bufferDuration = rule.firstSkaterInWarmupGroup
                const bufferEnd = new Date(currentTime.getTime() + bufferDuration * 1000)

                sessions.push({
                    id: uuidv4(),
                    type: 'break', // Use break to occupy time but (maybe) not render prominently if handled by Timeline
                    startTime: new Date(currentTime),
                    endTime: bufferEnd,
                    duration: bufferDuration,
                    classId: skatingClass.id,
                    className: skatingClass.name,
                    name: '(Förb.)', // Short name
                    groupId: groupIndex // Associate with group
                })

                currentTime = bufferEnd
            }

            // 2. Performances
            groupSkaters.forEach(skater => {
                const judgingTime = isShort ? rule.judgingTimeShort : rule.judgingTimeFree
                const performanceTime = isShort ? rule.performanceTimeShort : rule.performanceTimeFree

                const duration = settings.introductionDuration + performanceTime + judgingTime
                const perfEnd = new Date(currentTime.getTime() + duration * 1000)

                sessions.push({
                    id: uuidv4(),
                    type: 'performance',
                    startTime: new Date(currentTime),
                    endTime: perfEnd,
                    duration: duration,
                    classId: skatingClass.id,
                    className: skatingClass.name,
                    groupId: groupIndex,
                    name: `${skater.firstName} ${skater.lastName}`
                })

                currentTime = perfEnd
            })
        })

        return sessions
    }

    public validateSchedule(schedule: Schedule): string[] {
        const warnings: string[] = []

        // 1. Check Short vs Free ordering and 4h gap
        // We need to map skaters or classes.
        // Group sessions by class name basis?
        // Assume class name indicates category.

        // Let's iterate all sessions and build a map of [Category] -> [Sessions].
        // Simple heuristic: name match.
        // Actually, we can check by Person Name?

        const skaterSessions = new Map<string, { short?: Date, free?: Date }>()

        schedule.sessions.forEach(s => {
            if (s.type !== 'performance') return

            // Key by skater name (assuming unique)
            const key = s.name
            if (!key) return

            // Check type from class name or session props?
            // We unfortunately didn't store "segment type" on session explicitly, only "type=performance".
            // But we have s.className.
            // Check for 'short' or 'free' in className.
            const isShort = s.className?.toLowerCase().includes('short') || s.className?.toLowerCase().includes('kort')
            const isFree = s.className?.toLowerCase().includes('free') || s.className?.toLowerCase().includes('fri') || s.className?.toLowerCase().includes('lång')

            if (!skaterSessions.has(key)) {
                skaterSessions.set(key, {})
            }
            const entry = skaterSessions.get(key)!

            if (isShort) entry.short = new Date(s.startTime)
            if (isFree) entry.free = new Date(s.startTime)
        })

        skaterSessions.forEach((times, skaterName) => {
            if (times.short && times.free) {
                // Check Order
                if (times.free < times.short) {
                    warnings.push(`Legacy Rule Violation: ${skaterName} skates Free before Short.`)
                }

                // Check 4h gap
                const diffMs = times.free.getTime() - times.short.getTime()
                const hours = diffMs / (1000 * 60 * 60)

                // Only if on same day
                if (times.short.getDate() === times.free.getDate()) {
                    if (hours < 4) {
                        warnings.push(`Recovery Violation: ${skaterName} has < 4h between Short and Free (${hours.toFixed(1)}h).`)
                    }
                }
            }
        })

        return warnings
    }

    private getAllSkaters(skatingClass: SkatingClass): Person[] {
        let persons: Person[] = []
        if (skatingClass.groups) {
            skatingClass.groups.forEach(g => {
                persons = [...persons, ...g.persons]
            })
        }
        return persons
    }

    public calculateWarmupGroups(skaters: Person[], maxGroupSize: number): Person[][] {
        const total = skaters.length
        if (total === 0) return []

        const numGroups = Math.ceil(total / maxGroupSize)
        const baseSize = Math.floor(total / numGroups)
        const remainder = total % numGroups

        const groups: Person[][] = []
        let currentSkaterIndex = 0

        for (let i = 0; i < numGroups; i++) {
            const extra = i >= (numGroups - remainder) ? 1 : 0
            const size = baseSize + extra

            groups.push(skaters.slice(currentSkaterIndex, currentSkaterIndex + size))
            currentSkaterIndex += size
        }

        return groups
    }

    private getRuleForClass(className: string, rules: RuleConfig[]): RuleConfig {
        const lowerName = className.toLowerCase()
        // Find first matching rule
        const match = rules.find(r => lowerName.includes(r.namePattern.toLowerCase()))
        // Return match or default (last rule is usually default or we search for it)
        return match || rules.find(r => r.namePattern === 'default') || rules[rules.length - 1]
    }
}
