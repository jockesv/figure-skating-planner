import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { findMatchingRule, DEFAULT_RULE } from '../data/classRulesData'

// Define the shape of a rule configuration
export interface RuleConfig {
    id: string
    namePattern: string  // Regex or string to match class name
    performanceTimeShort: number // seconds
    performanceTimeFree: number // seconds
    warmupTimeShort: number
    warmupTimeFree: number
    maxGroupSize: number
    maxSkatersBetweenResurfacing: number
    judgingTimeShort: number
    judgingTimeFree: number
    firstSkaterInWarmupGroup: number
}

// Availability configuration
export interface AvailabilityBlock {
    id: string
    date: string // YYYY-MM-DD
    startTime: string // HH:MM
    endTime: string // HH:MM
}

// Soft scheduling rules (preferences, not hard constraints)
export interface SoftScheduleRules {
    avoidYoungOnLateSlots: boolean
    youngMaxAge: number // Skaters at or below this age are considered "young"
    youngLatestTime: string // e.g., "19:00" - young skaters should finish before this time
    preferLocalOnSundayAfternoon: boolean
    sundayLocalAfterTime: string // e.g., "15:00" - prefer local skaters after this time on Sundays
}

// Global settings
export interface SchedulerSettings {
    startHour: number
    endHour: number
    startDate: string // ISO Date string YYYY-MM-DD
    lunchStartTime: string // "HH:MM"
    lunchDuration: number // minutes
    iceResurfacingInterval: number // groups (Fallback)
    maxIceTimeBetweenResurfacing: number // minutes (New CONSTRAINT)
    iceResurfacingDuration: number // seconds
    introductionDuration: number // seconds
    rules: RuleConfig[]
    customClassOrder?: string[] // Array of Class IDs
    availability?: AvailabilityBlock[] // Explicit available time slots
    softRules: SoftScheduleRules // Soft scheduling preferences
}

/**
 * Helper function to create a RuleConfig from a class name using the class rules data
 */
function createRuleConfigFromClassName(className: string): RuleConfig {
    const matchedRule = findMatchingRule(className)

    return {
        id: uuidv4(),
        namePattern: className.toLowerCase(),
        performanceTimeShort: matchedRule.performanceTimeShort ?? matchedRule.performanceTimeFree,
        performanceTimeFree: matchedRule.performanceTimeFree,
        warmupTimeShort: matchedRule.warmupTimeShort ?? matchedRule.warmupTimeFree,
        warmupTimeFree: matchedRule.warmupTimeFree,
        maxGroupSize: matchedRule.maxGroupSize,
        maxSkatersBetweenResurfacing: matchedRule.maxSkatersBetweenResurfacing,
        judgingTimeShort: matchedRule.judgingTimeShort,
        judgingTimeFree: matchedRule.judgingTimeFree,
        firstSkaterInWarmupGroup: 30, // Default introduction time
    }
}

// Create default rule from the DEFAULT_RULE constant
const createDefaultRule = (): RuleConfig => ({
    id: uuidv4(),
    namePattern: 'default',
    performanceTimeShort: DEFAULT_RULE.performanceTimeShort ?? DEFAULT_RULE.performanceTimeFree,
    performanceTimeFree: DEFAULT_RULE.performanceTimeFree,
    warmupTimeShort: DEFAULT_RULE.warmupTimeShort ?? DEFAULT_RULE.warmupTimeFree,
    warmupTimeFree: DEFAULT_RULE.warmupTimeFree,
    maxGroupSize: DEFAULT_RULE.maxGroupSize,
    maxSkatersBetweenResurfacing: DEFAULT_RULE.maxSkatersBetweenResurfacing,
    judgingTimeShort: DEFAULT_RULE.judgingTimeShort,
    judgingTimeFree: DEFAULT_RULE.judgingTimeFree,
    firstSkaterInWarmupGroup: 30,
})

// Start with just the default rule - specific rules will be auto-generated on import
const defaultRules: RuleConfig[] = [createDefaultRule()]

const initialState: SchedulerSettings = {
    startHour: 8,
    endHour: 19,
    startDate: new Date().toISOString().split('T')[0], // Today
    lunchStartTime: '12:00',
    lunchDuration: 60,
    iceResurfacingInterval: 2,
    maxIceTimeBetweenResurfacing: 90, // Default 90 minutes
    iceResurfacingDuration: 15 * 60,
    introductionDuration: 30,
    rules: defaultRules,
    customClassOrder: [],
    availability: [],
    softRules: {
        avoidYoungOnLateSlots: false,
        youngMaxAge: 12,
        youngLatestTime: '19:00',
        preferLocalOnSundayAfternoon: false,
        sundayLocalAfterTime: '15:00'
    }
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateGlobalSettings: (state, action: PayloadAction<Partial<SchedulerSettings>>) => {
            return { ...state, ...action.payload }
        },
        updateRule: (state, action: PayloadAction<RuleConfig>) => {
            const index = state.rules.findIndex(r => r.id === action.payload.id)
            if (index !== -1) {
                state.rules[index] = action.payload
            }
        },
        addRule: (state, action: PayloadAction<RuleConfig>) => {
            state.rules.unshift(action.payload) // Add to top to match first
        },
        removeRule: (state, action: PayloadAction<string>) => {
            state.rules = state.rules.filter(r => r.id !== action.payload)
        },
        /**
         * Generate rules for a list of class names from imported competition data.
         * This adds rules for any class that doesn't already have a matching rule.
         * The rules are inserted before the default rule.
         */
        generateRulesForClasses: (state, action: PayloadAction<string[]>) => {
            const classNames = action.payload

            // Get existing patterns (lowercase for comparison)
            const existingPatterns = new Set(
                state.rules.map(r => r.namePattern.toLowerCase())
            )

            // Find unique class names that don't already have rules
            const newClassNames = classNames.filter(name => {
                const lowerName = name.toLowerCase()
                // Check if any existing pattern matches this class name
                return !Array.from(existingPatterns).some(pattern =>
                    lowerName.includes(pattern) || pattern.includes(lowerName)
                )
            })

            // Create rules for new classes
            const newRules = newClassNames.map(className =>
                createRuleConfigFromClassName(className)
            )

            if (newRules.length > 0) {
                // Find the index of the default rule (should be at the end)
                const defaultIndex = state.rules.findIndex(r => r.namePattern === 'default')

                if (defaultIndex !== -1) {
                    // Insert new rules before the default rule
                    state.rules.splice(defaultIndex, 0, ...newRules)
                } else {
                    // No default rule found, add to the end
                    state.rules.push(...newRules)
                }
            }
        },
        resetSettings: () => initialState
    }
})

export const {
    updateGlobalSettings,
    updateRule,
    addRule,
    removeRule,
    generateRulesForClasses,
    resetSettings
} = settingsSlice.actions
export default settingsSlice.reducer
