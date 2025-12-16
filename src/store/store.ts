import { configureStore } from '@reduxjs/toolkit'
import competitionReducer from './competitionSlice'
import settingsReducer from './settingsSlice'
import workflowReducer from './workflowSlice'

export const store = configureStore({
    reducer: {
        competition: competitionReducer,
        settings: settingsReducer,
        workflow: workflowReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['competition/setCompetitionData', 'competition/setSchedule', 'workflow/setCanProceed', 'settings/updateGlobalSettings'],
                // Ignore these paths in the state - all Date fields
                ignoredPaths: [
                    'competition.data.exportedAt',
                    'competition.data.event.startDate',
                    'competition.data.event.endDate',
                    'competition.data.event.competitions',  // Contains nested dates
                    'competition.schedule.metadata.createdAt',
                    'competition.schedule.metadata.updatedAt',
                    'competition.schedule.sessions', // Contains startTime/endTime dates
                ],
                // Ignore Date instances completely
                ignoredActionPaths: ['payload'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
