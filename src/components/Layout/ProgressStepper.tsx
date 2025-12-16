import React from 'react'
import { Box, Typography, Step, StepLabel, Stepper, StepConnector, stepConnectorClasses, styled } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import { DesignTokens } from '../../theme/DesignTokens'
import { WorkflowStep } from '../../store/workflowSlice'

interface ProgressStepperProps {
    currentStep: WorkflowStep
    completedSteps: WorkflowStep[]
    onStepClick?: (step: WorkflowStep) => void
}

const steps: { id: WorkflowStep; label: string; icon: React.ReactNode }[] = [
    { id: 'import', label: 'Importera', icon: <UploadFileIcon /> },
    { id: 'configure', label: 'Konfigurera', icon: <SettingsIcon /> },
    { id: 'schedule', label: 'Schema', icon: <CalendarMonthIcon /> },
    { id: 'export', label: 'Exportera', icon: <DownloadIcon /> },
]

// Custom connector with gradient
const GradientConnector = styled(StepConnector)(() => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            background: DesignTokens.colors.primary.gradient,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            background: DesignTokens.colors.primary.gradient,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: DesignTokens.colors.neutral.border,
        borderRadius: 1,
    },
}))

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
    currentStep,
    completedSteps,
    onStepClick,
}) => {
    const activeStepIndex = steps.findIndex(s => s.id === currentStep)

    return (
        <Box
            className="no-print animate-fadeIn glass-card"
            sx={{
                width: '100%',
                py: 4,
                px: 3,
                borderRadius: DesignTokens.borderRadius.xl,
                mb: 4,
            }}
        >
            <Stepper
                activeStep={activeStepIndex}
                alternativeLabel
                connector={<GradientConnector />}
            >
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id)
                    const isActive = step.id === currentStep
                    const isClickable = isCompleted || isActive || index < activeStepIndex

                    return (
                        <Step
                            key={step.id}
                            completed={isCompleted}
                            sx={{
                                cursor: isClickable && onStepClick ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                                if (isClickable && onStepClick) {
                                    onStepClick(step.id)
                                }
                            }}
                        >
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isCompleted
                                                ? DesignTokens.colors.semantic.success
                                                : isActive
                                                    ? DesignTokens.colors.primary.gradient
                                                    : DesignTokens.colors.neutral.border,
                                            color: isCompleted || isActive ? 'white' : DesignTokens.colors.text.disabled,
                                            boxShadow: isActive ? DesignTokens.shadows.lg : DesignTokens.shadows.sm,
                                            transition: DesignTokens.transitions.normal,
                                            position: 'relative',
                                            '&:hover': isClickable ? {
                                                transform: 'scale(1.1)',
                                                boxShadow: DesignTokens.shadows.xl,
                                            } : {},
                                        }}
                                    >
                                        {isCompleted ? <CheckCircleIcon /> : step.icon}
                                    </Box>
                                )}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive
                                            ? DesignTokens.colors.text.primary
                                            : isCompleted
                                                ? DesignTokens.colors.semantic.success
                                                : DesignTokens.colors.text.secondary,
                                        fontSize: isActive ? '1rem' : '0.875rem',
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
        </Box>
    )
}
