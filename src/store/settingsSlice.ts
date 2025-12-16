import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

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
}

const defaultRules: RuleConfig[] = [
    {
        id: uuidv4(),
        namePattern: 'senior',
        performanceTimeShort: 160,
        performanceTimeFree: 240,
        warmupTimeShort: 360,
        warmupTimeFree: 360,
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: 110,
        judgingTimeFree: 140,
        firstSkaterInWarmupGroup: 30
    },
    {
        id: uuidv4(),
        namePattern: 'junior',
        performanceTimeShort: 160,
        performanceTimeFree: 210,
        warmupTimeShort: 360,
        warmupTimeFree: 360,
        maxGroupSize: 6,
        maxSkatersBetweenResurfacing: 12,
        judgingTimeShort: 110,
        judgingTimeFree: 140,
        firstSkaterInWarmupGroup: 30
    },
    {
        id: uuidv4(),
        namePattern: 'ungdom',
        performanceTimeShort: 140,
        performanceTimeFree: 180,
        warmupTimeShort: 240,
        warmupTimeFree: 300,
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: 110,
        judgingTimeFree: 140,
        firstSkaterInWarmupGroup: 30
    },
    {
        id: uuidv4(),
        namePattern: 'minior',
        performanceTimeShort: 140,
        performanceTimeFree: 180,
        warmupTimeShort: 240,
        warmupTimeFree: 240,
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 16,
        judgingTimeShort: 110,
        judgingTimeFree: 140,
        firstSkaterInWarmupGroup: 30
    },
    // Default/Catch-all
    {
        id: uuidv4(),
        namePattern: 'default',
        performanceTimeShort: 150,
        performanceTimeFree: 180,
        warmupTimeShort: 240,
        warmupTimeFree: 240,
        maxGroupSize: 8,
        maxSkatersBetweenResurfacing: 24, // Fallback high
        judgingTimeShort: 110,
        judgingTimeFree: 140,
        firstSkaterInWarmupGroup: 30
    }
]

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
    availability: []
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
        resetSettings: () => initialState
    }
})

export const { updateGlobalSettings, updateRule, addRule, removeRule, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
