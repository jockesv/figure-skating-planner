import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WorkflowStep = 'import' | 'configure' | 'schedule' | 'export'

interface WorkflowState {
    currentStep: WorkflowStep
    completedSteps: WorkflowStep[]
    canProceed: boolean
}

const initialState: WorkflowState = {
    currentStep: 'import',
    completedSteps: [],
    canProceed: false,
}

const workflowSlice = createSlice({
    name: 'workflow',
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<WorkflowStep>) => {
            state.currentStep = action.payload
        },
        completeStep: (state, action: PayloadAction<WorkflowStep>) => {
            if (!state.completedSteps.includes(action.payload)) {
                state.completedSteps.push(action.payload)
            }
        },
        setCanProceed: (state, action: PayloadAction<boolean>) => {
            state.canProceed = action.payload
        },
        nextStep: (state) => {
            const steps: WorkflowStep[] = ['import', 'configure', 'schedule', 'export']
            const currentIndex = steps.indexOf(state.currentStep)
            if (currentIndex < steps.length - 1 && state.canProceed) {
                const nextStep = steps[currentIndex + 1]
                state.currentStep = nextStep
                state.canProceed = false // Reset until next step validates
            }
        },
        previousStep: (state) => {
            const steps: WorkflowStep[] = ['import', 'configure', 'schedule', 'export']
            const currentIndex = steps.indexOf(state.currentStep)
            if (currentIndex > 0) {
                state.currentStep = steps[currentIndex - 1]
            }
        },
        goToStep: (state, action: PayloadAction<WorkflowStep>) => {
            // Can only go to completed steps or current step
            const steps: WorkflowStep[] = ['import', 'configure', 'schedule', 'export']
            const targetIndex = steps.indexOf(action.payload)
            const currentIndex = steps.indexOf(state.currentStep)

            // Allow going back to any previous step, or staying on current
            if (targetIndex <= currentIndex || state.completedSteps.includes(action.payload)) {
                state.currentStep = action.payload
            }
        },
        resetWorkflow: (state) => {
            state.currentStep = 'import'
            state.completedSteps = []
            state.canProceed = false
        },
    },
})

export const {
    setCurrentStep,
    completeStep,
    setCanProceed,
    nextStep,
    previousStep,
    goToStep,
    resetWorkflow,
} = workflowSlice.actions

export default workflowSlice.reducer
