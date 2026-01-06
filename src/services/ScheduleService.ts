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

        // 3. Group Classes into Scheduling Units (Merging Logic)
        interface SchedulingUnit {
            classes: SkatingClass[]
            isMerged: boolean
        }

        const units: SchedulingUnit[] = []
        let i = 0
        while (i < allClasses.length) {
            const current = allClasses[i]
            const currentUnit: SchedulingUnit = { classes: [current], isMerged: false }

            // Try to merge with next class(es)
            // Rules for merging:
            // 1. Both must be "small" (fit in one group individually)
            // 2. Combined size must fit in one group (using the stricter limit if they differ, or first one)
            // 3. Must have compatible warmup times (checked against rules)
            // 4. Must NOT be split classes (already handled by rule 1 basically, but we check if they generate >1 group)

            // Look ahead
            let j = i + 1
            while (j < allClasses.length) {
                const next = allClasses[j]

                // Attempt merge
                const canMerge = this.checkMergeCompatibility(currentUnit, next, settings)

                if (canMerge) {
                    currentUnit.classes.push(next)
                    currentUnit.isMerged = true
                    j++
                } else {
                    break
                }
            }

            units.push(currentUnit)
            i = j
        }

        // 4. Process Logic
        let currentSlotIndex = 0
        let currentTime = new Date(slots[0].start)

        let accumulatedDuration = 0
        let accumulatedSkaters = 0

        const inputSessions: ScheduleSession[] = []

        for (const unit of units) {
            if (currentSlotIndex >= slots.length) break

            // Generate sessions for the entire UNIT
            const rawSessions = this.generateSessionsForUnit(unit, currentTime, settings)

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
                    if (currentBlock && currentBlock.type === 'group' && s.groupId === currentGroupId) {
                        currentBlock.sessions.push(s)
                        currentBlock.totalDuration += s.duration
                    } else {
                        if (currentBlock) blocks.push(currentBlock)
                        currentBlock = { sessions: [s], totalDuration: s.duration, type: 'single' }
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
            for (const block of blocks) {
                // 1. Dynamic Lunch Check (Between Blocks)
                // We check if we should insert lunch BEFORE this block.

                const lunchTargetParts = (settings.lunchStartTime || '12:00').split(':').map(Number)
                const lunchTarget = new Date(currentTime)
                lunchTarget.setHours(lunchTargetParts[0], lunchTargetParts[1], 0, 0)

                const lunchLatest = new Date(currentTime)
                lunchLatest.setHours(14, 0, 0, 0) // Hard limit 14:00

                const currentDayStr = currentTime.toISOString().split('T')[0]
                const hasLunchToday = inputSessions.some(s =>
                    s.type === 'break' &&
                    s.name.toLowerCase().includes('lunch') &&
                    s.startTime.toISOString().startsWith(currentDayStr)
                )

                let lunchBlock: Block | null = null

                if (!hasLunchToday) {
                    const softLunchLimit = new Date(lunchTarget)
                    softLunchLimit.setHours(lunchTarget.getHours() + 1) // 13:00 preferred limit

                    const blockEnd = new Date(currentTime.getTime() + block.totalDuration * 1000)

                    // Logic:
                    // If we MUST take lunch (past limit OR block pushes past hard limit)
                    // OR if we SHOULD take lunch (past target AND block pushes past soft limit)
                    const mustTakeLunch = (currentTime >= softLunchLimit) || (blockEnd > lunchLatest)
                    const shouldTakeLunch = (currentTime >= lunchTarget) && (blockEnd > softLunchLimit)

                    if (mustTakeLunch || shouldTakeLunch) {
                        lunchBlock = {
                            type: 'single',
                            totalDuration: 60 * 60,
                            sessions: [{
                                id: uuidv4(), type: 'break',
                                startTime: new Date(currentTime),
                                endTime: new Date(currentTime),
                                duration: 60 * 60,
                                name: 'Lunch (Inkl. Isvård)',
                                classId: 'break'
                            }]
                        }
                    }
                }

                if (lunchBlock) {
                    let lPlaced = false
                    while (!lPlaced && currentSlotIndex < slots.length) {
                        const slot = slots[currentSlotIndex]

                        // Check fit in current slot
                        const lStart = new Date(currentTime)
                        const lEnd = new Date(lStart.getTime() + lunchBlock.totalDuration * 1000)

                        if (lEnd.getTime() <= slot.end.getTime()) {
                            inputSessions.push({
                                ...lunchBlock.sessions[0],
                                startTime: lStart,
                                endTime: lEnd
                            })
                            currentTime = lEnd
                            accumulatedDuration = 0
                            accumulatedSkaters = 0
                            lPlaced = true
                        } else {
                            currentSlotIndex++
                            if (currentSlotIndex < slots.length) {
                                currentTime = new Date(slots[currentSlotIndex].start)
                                accumulatedDuration = 0
                                accumulatedSkaters = 0
                                // Skip lunch for this day if we skipped the day?
                                // If we jump to next day (08:00), we don't need lunch immediately.
                                lPlaced = true
                            }
                        }
                    }
                }

                let placed = false
                while (!placed && currentSlotIndex < slots.length) {
                    const slot = slots[currentSlotIndex]
                    let simTime = new Date(currentTime)
                    let simAccumulatedDuration = accumulatedDuration
                    let simAccumulatedSkaters = accumulatedSkaters
                    const simSessions: ScheduleSession[] = []
                    let fits = true

                    for (const s of block.sessions) {
                        // 1. Check Dynamic Resurfacing (Rules)
                        if (s.type !== 'resurfacing' && s.type !== 'break') {
                            const primaryClass = unit.classes[0]
                            const rule = (this as any).getRuleForClass(primaryClass.name, settings.rules)
                            const limitSkaters = rule.maxSkatersBetweenResurfacing

                            let needResurface = false
                            if (simAccumulatedSkaters > 0 && s.skaterCount && (simAccumulatedSkaters + s.skaterCount) > limitSkaters) {
                                needResurface = true
                            }

                            if (needResurface) {
                                const resDuration = 15 * 60
                                const rEnd = new Date(simTime.getTime() + resDuration * 1000)

                                if (rEnd.getTime() <= slot.end.getTime()) {
                                    simSessions.push({
                                        id: uuidv4(), type: 'resurfacing',
                                        startTime: new Date(simTime), endTime: rEnd, duration: resDuration,
                                        classId: s.classId, name: 'Isvård'
                                    })
                                    simTime = rEnd
                                    simAccumulatedDuration = 0
                                    simAccumulatedSkaters = 0
                                } else {
                                    fits = false
                                    break
                                }
                            }
                        }

                        // 2. Place Session
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
                            simAccumulatedDuration = 0
                            simAccumulatedSkaters = 0
                        }
                    }

                    if (fits) {
                        simSessions.forEach(sess => inputSessions.push(sess))
                        currentTime = simTime
                        accumulatedDuration = simAccumulatedDuration
                        accumulatedSkaters = simAccumulatedSkaters
                        placed = true
                    } else {
                        currentSlotIndex++
                        if (currentSlotIndex < slots.length) {
                            currentTime = new Date(slots[currentSlotIndex].start)
                            accumulatedDuration = 0
                            accumulatedSkaters = 0
                        }
                    }
                }

                if (!placed) {
                    warnings.push(`Could not schedule block from class ${unit.classes.map(c => c.name).join(' & ')} - Schedule Full`)
                }
            }
        }

        // POST-PROCESSING: Compact schedule to remove gaps
        const sortedSessions = [...inputSessions].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        const sessionsByDay = new Map<string, ScheduleSession[]>()
        sortedSessions.forEach(session => {
            const start = new Date(session.startTime)
            const dateKey = start.toISOString().split('T')[0]
            if (!sessionsByDay.has(dateKey)) {
                sessionsByDay.set(dateKey, [])
            }
            sessionsByDay.get(dateKey)!.push(session)
        })

        const compactedSessions: ScheduleSession[] = []
        sessionsByDay.forEach((daySessions) => {
            if (daySessions.length === 0) return
            let currentTime = new Date(daySessions[0].startTime)
            daySessions.forEach((session) => {
                const duration = session.duration
                const newStart = new Date(currentTime)
                const newEnd = new Date(currentTime.getTime() + duration * 1000)
                compactedSessions.push({
                    ...session,
                    startTime: newStart,
                    endTime: newEnd
                })
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
                validationWarnings: warnings
            }
        }
    }

    private checkMergeCompatibility(unit: { classes: SkatingClass[], isMerged: boolean }, candidate: SkatingClass, settings: SchedulerSettings): boolean {
        // 0. Pre-check: Only merge "small" classes
        // According to rules.md: "Slå inte samman någon grupp som redan är så stor att den delats i flera
        // uppvärmningsgrupper. Dessa grupper räknas inte som 'små' och vi slår bara samman 'små' uppvärmningsgrupper."

        // Check if candidate is "small" (would fit in one group on its own)
        const candidateSkaters = this.getAllSkaters(candidate)
        const candidateRule = this.getRuleForClass(candidate.name, settings.rules)
        if (candidateSkaters.length > candidateRule.maxGroupSize) {
            // Candidate class is too large (would need multiple groups) - not eligible for merging
            return false
        }

        // Check if each class in the existing unit is "small"
        for (const existingClass of unit.classes) {
            const existingSkaters = this.getAllSkaters(existingClass)
            const existingRule = this.getRuleForClass(existingClass.name, settings.rules)
            if (existingSkaters.length > existingRule.maxGroupSize) {
                // Existing class is too large - unit not eligible for further merging
                return false
            }
        }

        // 1. Get Params
        const existingSkaters = unit.classes.flatMap(c => this.getAllSkaters(c))

        // 2. Max Group Size Check
        // Use strict check: Both primary class rule AND candidate class rule must be satisfied by the TOTAL size?
        // Or just one? The rule says "håller sig inom storleken för en enskild grupp".
        // Let's take the MIN of all involved limits to be safe.
        const rule1 = this.getRuleForClass(unit.classes[0].name, settings.rules)
        const rule2 = this.getRuleForClass(candidate.name, settings.rules)
        const limit = Math.min(rule1.maxGroupSize, rule2.maxGroupSize)

        const totalSkaters = existingSkaters.length + candidateSkaters.length

        if (totalSkaters > limit) return false

        // 3. Warmup Time Check
        // Check if warmup times match EXACTLY
        const isShort1 = unit.classes[0].type.toLowerCase().includes('short') || unit.classes[0].type.toLowerCase().includes('kort')
        const wu1 = isShort1 ? rule1.warmupTimeShort : rule1.warmupTimeFree

        const isShort2 = candidate.type.toLowerCase().includes('short') || candidate.type.toLowerCase().includes('kort')
        const wu2 = isShort2 ? rule2.warmupTimeShort : rule2.warmupTimeFree

        if (wu1 !== wu2) return false

        // 4. Category Safety Check
        // "Inte blanda små/stora åkare".
        // Heuristic: Don't merge if one says "Ungdom" and other "Senior"?
        // Or just let the user order them. Since they are adjacent in list due to Sort, they should be relatively close.
        // We assume Sort handles basic grouping.
        // But we can check for Type match (Short vs Short) just to be sure we aren't merging across segments crazily.
        if (isShort1 !== isShort2) return false

        return true
    }

    private generateSessionsForUnit(unit: { classes: SkatingClass[], isMerged: boolean }, startTime: Date, settings: SchedulerSettings): ScheduleSession[] {
        const sessions: ScheduleSession[] = []
        let currentTime = new Date(startTime)

        // If merged, we treat as one big group.
        // If not, it's just a normal class (one or more groups).

        // Aggregated Skaters
        // If merged, we want to maintain class order: Class A skaters, then Class B skaters.
        const allSkaters: Person[] = []
        unit.classes.forEach(c => allSkaters.push(...this.getAllSkaters(c)))

        // Get Rule (use first class as representative)
        const primaryClass = unit.classes[0]
        const rule = this.getRuleForClass(primaryClass.name, settings.rules)
        const isShort = primaryClass.type.toLowerCase().includes('short') || primaryClass.type.toLowerCase().includes('kort')

        // Grouping
        // If isMerged, we FORCE one group (we checked limits in checkMergeCompatibility).
        // If not merged, we calculate groups normally.
        let groups: Person[][] = []
        if (unit.isMerged) {
            groups = [allSkaters]
        } else {
            groups = this.calculateWarmupGroups(allSkaters, rule.maxGroupSize)
        }

        // Lunch Logic (Simplified pre-check)
        const lunchStartParts = (settings.lunchStartTime || '12:00').split(':').map(Number)
        const lunchStart = new Date(currentTime)
        lunchStart.setHours(lunchStartParts[0], lunchStartParts[1], 0, 0)
        if (currentTime.getDate() !== lunchStart.getDate()) {
            lunchStart.setFullYear(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate())
            lunchStart.setHours(lunchStartParts[0], lunchStartParts[1], 0, 0)
        }

        groups.forEach((groupSkaters, index) => {
            const groupIndex = index + 1
            const groupSize = groupSkaters.length

            // 1. Warmup
            const warmupDuration = isShort ? rule.warmupTimeShort : rule.warmupTimeFree
            const warmupEnd = new Date(currentTime.getTime() + warmupDuration * 1000)

            const displayText = unit.isMerged
                ? `Uppvärmning (Sammanslagning: ${unit.classes.map(c => c.name).join(', ')})`
                : unit.classes.length === 1
                    ? `Uppvärmning Grupp ${groupIndex}`
                    : `Uppvärmning`

            // Composite class ID for merged? Or just first?
            // Used for Validations.
            // Let's use first class ID but maybe allow multiple?
            // The type ScheduleSession has single classId.
            // Use Primary classId.

            sessions.push({
                id: uuidv4(),
                type: 'warmup',
                startTime: new Date(currentTime),
                endTime: warmupEnd,
                duration: warmupDuration,
                classId: primaryClass.id,
                className: unit.isMerged ? `Sammanslagen: ${unit.classes.map(c => c.name).join(' + ')}` : primaryClass.name,
                groupId: groupIndex,
                name: displayText,
                skaterCount: groupSize
            })

            currentTime = warmupEnd

            // 1b. Buffer/Prep
            if (rule.firstSkaterInWarmupGroup && rule.firstSkaterInWarmupGroup > 0) {
                const bufferDuration = rule.firstSkaterInWarmupGroup
                const bufferEnd = new Date(currentTime.getTime() + bufferDuration * 1000)

                sessions.push({
                    id: uuidv4(),
                    type: 'break',
                    startTime: new Date(currentTime),
                    endTime: bufferEnd,
                    duration: bufferDuration,
                    classId: primaryClass.id,
                    className: primaryClass.name,
                    name: '(Förb.)',
                    groupId: groupIndex
                })
                currentTime = bufferEnd
            }

            // 2. Performances
            // Need to know which class each skater belongs to for correct className/ID attribution
            groupSkaters.forEach(skater => {
                // Find source class
                const sourceClass = unit.classes.find(c => this.getAllSkaters(c).some(s => s.id === skater.id)) || primaryClass
                const sourceRule = this.getRuleForClass(sourceClass.name, settings.rules)
                const sourceIsShort = sourceClass.type.toLowerCase().includes('short') || sourceClass.type.toLowerCase().includes('kort')

                const judgingTime = sourceIsShort ? sourceRule.judgingTimeShort : sourceRule.judgingTimeFree
                const performanceTime = sourceIsShort ? sourceRule.performanceTimeShort : sourceRule.performanceTimeFree

                const duration = settings.introductionDuration + performanceTime + judgingTime
                const perfEnd = new Date(currentTime.getTime() + duration * 1000)

                sessions.push({
                    id: uuidv4(),
                    type: 'performance',
                    startTime: new Date(currentTime),
                    endTime: perfEnd,
                    duration: duration,
                    classId: sourceClass.id,
                    className: sourceClass.name,
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
