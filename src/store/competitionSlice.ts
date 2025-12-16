import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CompetitionData, Schedule, ScheduleSession } from '../types'
import { detectConflicts } from '../utils/schedulerUtils'

interface CompetitionState {
    data: CompetitionData | null
    schedule: Schedule | null
    loading: boolean
    error: string | null
    history: {
        past: Schedule[],
        future: Schedule[]
    }
    conflicts: string[]
    validationWarnings: string[]
    excludedClassIds: string[]
    scratchedSkaterIds: string[]
}

const initialState: CompetitionState = {
    data: null,
    schedule: null,
    loading: false,
    error: null,
    history: { past: [], future: [] },
    conflicts: [],
    validationWarnings: [],
    excludedClassIds: [],
    scratchedSkaterIds: []
}

const competitionSlice = createSlice({
    name: 'competition',
    initialState,
    reducers: {
        setCompetitionData: (state, action: PayloadAction<CompetitionData>) => {
            state.data = action.payload
            state.error = null
            state.loading = false
        },
        setSchedule: (state, action: PayloadAction<Schedule>) => {
            state.schedule = action.payload
            // Clear history when new schedule generated
            state.history = { past: [], future: [] }
        },
        setValidationWarnings: (state, action: PayloadAction<string[]>) => {
            state.validationWarnings = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        },
        clearData: (state) => {
            state.data = null
            state.schedule = null
            state.history = { past: [], future: [] }
            state.conflicts = []
            state.validationWarnings = []
            state.excludedClassIds = []
            state.scratchedSkaterIds = []
            state.error = null
        },
        toggleExcludedClass: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const index = state.excludedClassIds.indexOf(id)
            if (index > -1) {
                state.excludedClassIds.splice(index, 1)
            } else {
                state.excludedClassIds.push(id)
            }
        },
        toggleScratchedSkater: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const index = state.scratchedSkaterIds.indexOf(id)
            if (index > -1) {
                state.scratchedSkaterIds.splice(index, 1)
            } else {
                state.scratchedSkaterIds.push(id)
            }
        },

        // Editing Actions
        updateSession: (state, action: PayloadAction<ScheduleSession>) => {
            if (!state.schedule) return

            // Push to history
            state.history.past.push(JSON.parse(JSON.stringify(state.schedule)))
            state.history.future = [] // Clear future on new action

            // Update session
            const index = state.schedule.sessions.findIndex(s => s.id === action.payload.id)
            if (index !== -1) {
                state.schedule.sessions[index] = action.payload
                state.schedule.metadata.updatedAt = new Date()
            }

            // Check conflicts
            state.conflicts = detectConflicts(state.schedule.sessions)
        },
        addSession: (state, action: PayloadAction<ScheduleSession>) => {
            if (!state.schedule) return
            state.history.past.push(JSON.parse(JSON.stringify(state.schedule)))
            state.history.future = []

            state.schedule.sessions.push(action.payload)
            state.schedule.metadata.updatedAt = new Date()
            state.conflicts = detectConflicts(state.schedule.sessions)
        },
        removeSession: (state, action: PayloadAction<string>) => {
            if (!state.schedule) return
            state.history.past.push(JSON.parse(JSON.stringify(state.schedule)))
            state.history.future = []

            state.schedule.sessions = state.schedule.sessions.filter(s => s.id !== action.payload)
            state.schedule.metadata.updatedAt = new Date()
            state.conflicts = detectConflicts(state.schedule.sessions)
        },

        // Undo/Redo
        undo: (state) => {
            if (state.history.past.length === 0 || !state.schedule) return

            const previous = state.history.past.pop()
            if (previous) {
                state.history.future.push(JSON.parse(JSON.stringify(state.schedule)))
                state.schedule = previous
                state.conflicts = detectConflicts(previous.sessions)
            }
        },
        redo: (state) => {
            if (state.history.future.length === 0 || !state.schedule) return

            const next = state.history.future.pop()
            if (next) {
                state.history.past.push(JSON.parse(JSON.stringify(state.schedule)))
                state.schedule = next
                state.conflicts = detectConflicts(next.sessions)
            }
        }
    }
})

export const {
    setCompetitionData,
    setSchedule,
    setLoading,
    setError,
    updateSession,
    addSession,
    removeSession,
    undo,
    redo,
    setValidationWarnings,
    toggleExcludedClass,
    toggleScratchedSkater,
    clearData
} = competitionSlice.actions
export default competitionSlice.reducer

