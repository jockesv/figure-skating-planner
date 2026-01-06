/**
 * AdvancedOptimizer - Simulated Annealing based schedule optimizer
 * 
 * Uses Simulated Annealing to find a better class ordering that minimizes:
 * 1. Total schedule duration
 * 2. Soft rule violations (young skaters on Friday evening, non-local on Sunday)
 */

import { CompetitionData, SkatingClass, Person } from '../types'
import { SchedulerSettings, SoftScheduleRules } from '../store/settingsSlice'
import { ScheduleService } from './ScheduleService'

export interface OptimizationResult {
    classOrder: string[]  // Optimized order of class IDs
    totalDuration: number // Total schedule duration in seconds
    softViolations: number // Count of soft rule violations
    iterations: number
    improved: boolean
}

export class AdvancedOptimizer {
    private scheduleService: ScheduleService

    constructor() {
        this.scheduleService = new ScheduleService()
    }

    /**
     * Run Simulated Annealing optimization to find better class ordering
     */
    public optimize(
        data: CompetitionData,
        settings: SchedulerSettings,
        localSkaterIds: string[],
        maxIterations: number = 1000,
        onProgress?: (progress: number) => void
    ): OptimizationResult {
        // 1. Get initial class order
        const allClasses = this.getAllClasses(data)
        if (allClasses.length <= 1) {
            return {
                classOrder: allClasses.map(c => c.id),
                totalDuration: 0,
                softViolations: 0,
                iterations: 0,
                improved: false
            }
        }

        // 2. Initial solution: current order
        let currentOrder = allClasses.map(c => c.id)
        let currentCost = this.evaluateSolution(currentOrder, data, settings, localSkaterIds)

        let bestOrder = [...currentOrder]
        let bestCost = currentCost

        // 3. Simulated Annealing parameters
        let temperature = 1000
        const coolingRate = 0.995
        const minTemperature = 1

        // 4. Main loop
        let iteration = 0
        while (temperature > minTemperature && iteration < maxIterations) {
            // Generate neighbor by swapping two random classes
            const neighbor = this.generateNeighbor(currentOrder)
            const neighborCost = this.evaluateSolution(neighbor, data, settings, localSkaterIds)

            // Accept if better, or probabilistically if worse
            const delta = neighborCost - currentCost
            if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
                currentOrder = neighbor
                currentCost = neighborCost

                // Update best if this is the best so far
                if (currentCost < bestCost) {
                    bestOrder = [...currentOrder]
                    bestCost = currentCost
                }
            }

            // Cool down
            temperature *= coolingRate
            iteration++

            // Report progress
            if (onProgress && iteration % 50 === 0) {
                onProgress(iteration / maxIterations)
            }
        }

        // 5. Return result
        const initialCost = this.evaluateSolution(allClasses.map(c => c.id), data, settings, localSkaterIds)

        return {
            classOrder: bestOrder,
            totalDuration: Math.floor(bestCost / 1000), // Rough estimate
            softViolations: 0,
            iterations: iteration,
            improved: bestCost < initialCost
        }
    }

    /**
     * Extract all skating classes from competition data
     */
    private getAllClasses(data: CompetitionData): SkatingClass[] {
        return data.event.competitions.flatMap(comp => comp.classes)
    }

    /**
     * Generate a neighbor solution by swapping two random classes
     */
    private generateNeighbor(order: string[]): string[] {
        const newOrder = [...order]
        const i = Math.floor(Math.random() * order.length)
        let j = Math.floor(Math.random() * order.length)
        while (j === i) {
            j = Math.floor(Math.random() * order.length)
        }
        // Swap
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]]
        return newOrder
    }

    /**
     * Evaluate a solution's cost (lower is better)
     */
    private evaluateSolution(
        classOrder: string[],
        data: CompetitionData,
        settings: SchedulerSettings,
        localSkaterIds: string[]
    ): number {
        // Create modified settings with the custom class order
        const modifiedSettings: SchedulerSettings = {
            ...settings,
            customClassOrder: classOrder
        }

        // Generate schedule
        const schedule = this.scheduleService.generateSchedule(data, modifiedSettings)

        // Base cost: total duration
        let cost = 0
        if (schedule.sessions.length > 0) {
            const firstStart = Math.min(...schedule.sessions.map(s => s.startTime.getTime()))
            const lastEnd = Math.max(...schedule.sessions.map(s => s.endTime.getTime()))
            cost = lastEnd - firstStart
        }

        // Add penalties for soft rule violations
        if (settings.softRules.avoidYoungOnLateSlots || settings.softRules.preferLocalOnSundayAfternoon) {
            cost += this.calculateSoftRulePenalties(schedule.sessions, data, settings.softRules, localSkaterIds)
        }

        // Add HARD constraint penalties (Short before Free, 4h gap)
        cost += this.calculateHardConstraintPenalties(schedule.sessions)

        return cost
    }

    /**
     * Calculate penalty for hard constraints (Short before Free, 4h gap)
     */
    private calculateHardConstraintPenalties(
        sessions: { startTime: Date; endTime: Date; className?: string; name: string; type: string }[]
    ): number {
        let penalty = 0
        const HARD_VIOLATION_PENALTY = 24 * 60 * 60 * 1000 // 24 hours - massive penalty to avoid these

        // Build map of skater -> {short time, free time}
        const skaterTimes = new Map<string, { short?: Date; free?: Date }>()

        for (const session of sessions) {
            if (session.type !== 'performance') continue
            if (!session.className) continue

            const skaterName = session.name
            const className = session.className.toLowerCase()
            const isShort = className.includes('short') || className.includes('kort')
            const isFree = className.includes('free') || className.includes('fri') || className.includes('lång')

            if (!skaterTimes.has(skaterName)) {
                skaterTimes.set(skaterName, {})
            }

            const times = skaterTimes.get(skaterName)!
            if (isShort) {
                times.short = new Date(session.startTime)
            } else if (isFree) {
                times.free = new Date(session.startTime)
            }
        }

        // Check constraints for each skater
        skaterTimes.forEach((times, _skaterName) => {
            if (times.short && times.free) {
                // Constraint 1: Free before Short is a violation
                if (times.free < times.short) {
                    penalty += HARD_VIOLATION_PENALTY
                }

                // Constraint 2: Less than 4h gap on same day is a violation
                if (times.short.getDate() === times.free.getDate()) {
                    const gapHours = (times.free.getTime() - times.short.getTime()) / (1000 * 60 * 60)
                    if (gapHours < 4) {
                        penalty += HARD_VIOLATION_PENALTY * (4 - gapHours) / 4 // Proportional penalty
                    }
                }
            }
        })

        return penalty
    }

    /**
     * Calculate penalty points for soft rule violations
     */
    private calculateSoftRulePenalties(
        sessions: { startTime: Date; className?: string; name: string; type: string }[],
        data: CompetitionData,
        softRules: SoftScheduleRules,
        localSkaterIds: string[]
    ): number {
        let penalty = 0
        const VIOLATION_PENALTY = 30 * 60 * 1000 // 30 minutes worth of penalty per violation

        // Build skater lookup
        const skaterMap = new Map<string, Person>()
        data.event.competitions.forEach(comp => {
            comp.classes.forEach(cls => {
                cls.groups.forEach(g => {
                    g.persons.forEach(p => {
                        skaterMap.set(`${p.firstName} ${p.lastName}`, p)
                    })
                })
            })
        })

        for (const session of sessions) {
            if (session.type !== 'performance') continue

            const sessionDate = new Date(session.startTime)
            const dayOfWeek = sessionDate.getDay() // 0 = Sunday, 5 = Friday
            const timeStr = sessionDate.toTimeString().slice(0, 5) // "HH:MM"

            // Find skater
            const skater = skaterMap.get(session.name)
            if (!skater) continue

            // Rule 1: Young skaters on late slots (any day)
            if (softRules.avoidYoungOnLateSlots) {
                if (timeStr >= softRules.youngLatestTime) {
                    const age = this.calculateAge(skater.birthDate)
                    if (age <= softRules.youngMaxAge) {
                        penalty += VIOLATION_PENALTY
                    }
                }
            }

            // Rule 2: Non-local skaters on Sunday afternoon
            if (softRules.preferLocalOnSundayAfternoon && dayOfWeek === 0) {
                if (timeStr >= softRules.sundayLocalAfterTime) {
                    const isLocal = localSkaterIds.includes(skater.id)
                    if (!isLocal) {
                        penalty += VIOLATION_PENALTY
                    }
                }
            }
        }

        return penalty
    }

    /**
     * Calculate age from birth date
     */
    private calculateAge(birthDate: Date | string): number {
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }
}
