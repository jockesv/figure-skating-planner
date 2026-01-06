/**
 * Rules utility functions for figure skating scheduling
 * 
 * Uses the comprehensive class rules data from classRulesData.ts
 */

import { findMatchingRule, DEFAULT_RULE, ClassRuleDefinition } from '../data/classRulesData'

// Basic time constants in seconds
export const TIME_CONSTANTS = {
    INTRODUCTION: 30,
    ICE_RESURFACING: 15 * 60,
    LUNCH_BREAK: 60 * 60, // Default 60 min
}

// Judging times in seconds
export const JUDGING_TIMES = {
    SINGLE: {
        SHORT: 1 * 60 + 50, // 01:50
        FREE: 2 * 60 + 20,  // 02:20
    },
    ADULT: {
        SHORT: 1 * 60 + 50, // 01:50
        FREE: 2 * 60,       // 02:00
    },
    PAIR: {
        SHORT: 1 * 60 + 50, // 01:50
        FREE: 2 * 60 + 20,  // 02:20
    },
    ICE_DANCE: {
        SHORT: 1 * 60 + 50, // 01:50
        FREE: 2 * 60 + 20,  // 02:20
    },
    SOLO_DANCE: {
        FREE: 2 * 60 + 20,  // 02:20
    },
    SYNCHRONIZED: {
        SHORT: 1 * 60 + 50, // 01:50
        FREE: 2 * 60 + 20,  // 02:20
    },
}

export interface ClassRule {
    performanceTime: number // in seconds
    warmupTime: number // in seconds
    maxGroupSize: number
}

/**
 * Get class rule for a specific class and program type
 * Uses pattern matching from the comprehensive class rules data
 * 
 * @param className - The name of the class
 * @param type - The program type (e.g., 'Kortprogram', 'Friåkning', 'Short Program', 'Free Skating')
 * @returns ClassRule with performanceTime, warmupTime, and maxGroupSize
 */
export const getClassRule = (className: string, type: string): ClassRule => {
    const matchedRule = findMatchingRule(className)
    const isShort = type.toLowerCase().includes('short') || type.toLowerCase().includes('kort')

    return {
        performanceTime: isShort
            ? (matchedRule.performanceTimeShort ?? matchedRule.performanceTimeFree)
            : matchedRule.performanceTimeFree,
        warmupTime: isShort
            ? (matchedRule.warmupTimeShort ?? matchedRule.warmupTimeFree)
            : matchedRule.warmupTimeFree,
        maxGroupSize: matchedRule.maxGroupSize,
    }
}

/**
 * Get the full rule definition for a class name
 * Useful when you need all the detailed timing information
 * 
 * @param className - The name of the class
 * @returns The full ClassRuleDefinition
 */
export const getFullClassRule = (className: string): ClassRuleDefinition => {
    return findMatchingRule(className)
}

export { findMatchingRule, DEFAULT_RULE }
export type { ClassRuleDefinition }
export { CLASS_RULES, getAvailableClassPatterns } from '../data/classRulesData'
