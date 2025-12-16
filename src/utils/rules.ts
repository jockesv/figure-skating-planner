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
    // Add others as needed
}

export interface ClassRule {
    performanceTime: number // in seconds
    warmupTime: number // in seconds
    maxGroupSize: number
}

// Map class names/patterns to rules
// Using a simple meaningful string match or generic defaults for now based on rules.md
export const getClassRule = (className: string, type: string): ClassRule => {
    const name = className.toLowerCase()
    const isShort = type.toLowerCase().includes('short') || type.toLowerCase().includes('kort')

    // Defaults
    let rule: ClassRule = {
        performanceTime: 3 * 60,
        warmupTime: 4 * 60,
        maxGroupSize: 8
    }

    // Exact matches from table would go here
    if (name.includes('senior') || name.includes('junior')) {
        rule.maxGroupSize = 6
        rule.warmupTime = 6 * 60

        if (name.includes('senior')) {
            rule.performanceTime = isShort ? 2 * 60 + 40 : 4 * 60
        } else { // Junior
            rule.performanceTime = isShort ? 2 * 60 + 40 : 3 * 60 + 30
        }
    } else if (name.includes('ungdom 15') || name.includes('ungdom 13')) { // Adjusted for common cases
        rule.maxGroupSize = 8
        rule.warmupTime = isShort ? 4 * 60 : 5 * 60
        rule.performanceTime = isShort ? 2 * 60 + 20 : 3 * 60
    }

    // Specific color groups (System 2/1?)
    if (name.includes('vit')) { rule.performanceTime = 2 * 60 + 15; rule.maxGroupSize = 8 }
    if (name.includes('gul')) { rule.performanceTime = 2 * 60 + 40; rule.maxGroupSize = 8 }
    if (name.includes('grön')) { rule.performanceTime = 2 * 60 + 40; rule.maxGroupSize = 8 }
    if (name.includes('blå')) { rule.performanceTime = 2 * 60 + 50; rule.maxGroupSize = 8 }
    if (name.includes('röd')) { rule.performanceTime = 3 * 60; rule.warmupTime = 5 * 60; rule.maxGroupSize = 8 }
    if (name.includes('grå')) { rule.performanceTime = 3 * 60 + 30; rule.warmupTime = 6 * 60; rule.maxGroupSize = 6 }
    if (name.includes('svart')) { rule.performanceTime = 4 * 60; rule.warmupTime = 6 * 60; rule.maxGroupSize = 6 }

    return rule
}
