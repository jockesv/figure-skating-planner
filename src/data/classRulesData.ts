/**
 * Class Rules Data - Complete definitions from doc/rules.md
 * 
 * This file contains all class rule definitions for figure skating scheduling.
 * Times are in seconds, using System 1 values where applicable.
 */

export interface ClassRuleDefinition {
    /** Pattern to match class name (case-insensitive) */
    pattern: string
    /** Performance time for Short Program (seconds), null if not applicable */
    performanceTimeShort: number | null
    /** Performance time for Free Skating (seconds) */
    performanceTimeFree: number
    /** Warmup time for Short Program (seconds), null if not applicable */
    warmupTimeShort: number | null
    /** Warmup time for Free Skating (seconds) */
    warmupTimeFree: number
    /** Maximum skaters in one warmup group */
    maxGroupSize: number
    /** Maximum skaters between resurfacing (System 1 values) */
    maxSkatersBetweenResurfacing: number
    /** Judging time for Short Program (seconds) */
    judgingTimeShort: number
    /** Judging time for Free Skating (seconds) */
    judgingTimeFree: number
}

// Time helper: convert "MM:SS" to seconds
const toSeconds = (time: string): number => {
    const [min, sec] = time.split(':').map(Number)
    return min * 60 + sec
}

/**
 * Complete class rules from doc/rules.md
 * Order matters - more specific patterns should come first
 */
export const CLASS_RULES: ClassRuleDefinition[] = [
    // ============ Color Classes (System 1 resurfacing values) ============
    {
        pattern: 'vit',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:15'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 28,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'gul',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:40'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 28,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'grön',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:40'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 28,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'blå',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:50'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 24,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'röd',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 24,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'grå',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'svart',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('04:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },

    // ============ Ungdom Classes ============
    {
        pattern: 'ungdom 13',
        performanceTimeShort: toSeconds('02:20'),
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: toSeconds('04:00'),
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'ungdom 16',
        performanceTimeShort: toSeconds('02:20'),
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: toSeconds('04:00'),
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },

    // ============ Junior Classes ============
    {
        pattern: 'juniorer damer',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'juniorer herrar',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    // Generic junior pattern (matches "junior" without gender)
    {
        pattern: 'junior',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },

    // ============ Senior Classes ============
    {
        pattern: 'seniorer nationell damer',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'seniorer nationell herrar',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'seniorer damer',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('04:00'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'seniorer herrar',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('04:00'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    // Generic senior pattern
    {
        pattern: 'senior',
        performanceTimeShort: toSeconds('02:40'),
        performanceTimeFree: toSeconds('04:00'),
        warmupTimeShort: toSeconds('06:00'),
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },

    // ============ Adults Classes ============
    {
        pattern: 'adults bronze artistisk',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('01:30'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults silver artistisk',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('01:30'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults gold artistisk',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('01:30'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults master artistisk',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('04:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults bronze',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('01:40'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults silver',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults gold',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:50'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    {
        pattern: 'adults master',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('06:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },
    // Generic adult pattern
    {
        pattern: 'adult',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('02:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('05:00'),
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:00'),
    },

    // ============ Synchronized Skating Classes ============
    {
        pattern: 'synkroniserad senior',
        performanceTimeShort: toSeconds('02:50'),
        performanceTimeFree: toSeconds('04:00'),
        warmupTimeShort: 0, // No warmup for short
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2, // Essentially after each team
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad junior',
        performanceTimeShort: toSeconds('02:50'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: 0,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad advanced novice',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad basic novice',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad juvenile',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad pre-juvenile',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad adult',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad mixed',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    {
        pattern: 'synkroniserad open',
        performanceTimeShort: null,
        performanceTimeFree: toSeconds('03:00'),
        warmupTimeShort: null,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
    // Generic synchronized pattern
    {
        pattern: 'synkroniserad',
        performanceTimeShort: toSeconds('02:50'),
        performanceTimeFree: toSeconds('03:30'),
        warmupTimeShort: 0,
        warmupTimeFree: toSeconds('01:00'),
        maxGroupSize: 1,
        maxSkatersBetweenResurfacing: 2,
        judgingTimeShort: toSeconds('01:50'),
        judgingTimeFree: toSeconds('02:20'),
    },
]

/**
 * Default rule used when no pattern matches
 */
export const DEFAULT_RULE: ClassRuleDefinition = {
    pattern: 'default',
    performanceTimeShort: toSeconds('02:30'),
    performanceTimeFree: toSeconds('03:00'),
    warmupTimeShort: toSeconds('04:00'),
    warmupTimeFree: toSeconds('04:00'),
    maxGroupSize: 8,
    maxSkatersBetweenResurfacing: 24,
    judgingTimeShort: toSeconds('01:50'),
    judgingTimeFree: toSeconds('02:20'),
}

/**
 * Find the best matching rule for a given class name
 * @param className - The name of the class to find a rule for
 * @returns The matching ClassRuleDefinition, or DEFAULT_RULE if no match
 */
export function findMatchingRule(className: string): ClassRuleDefinition {
    const normalizedName = className.toLowerCase()

    // Find the first matching rule (more specific patterns come first in array)
    const matchedRule = CLASS_RULES.find(rule =>
        normalizedName.includes(rule.pattern.toLowerCase())
    )

    return matchedRule || DEFAULT_RULE
}

/**
 * Get all available class patterns for UI display
 */
export function getAvailableClassPatterns(): string[] {
    return CLASS_RULES.map(rule => rule.pattern)
}
