import React, { useEffect } from 'react'
import { Container, Typography, Box, Button } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCompetitionData, setLoading, setError, setValidationWarnings } from '../../store/competitionSlice'
import { generateRulesForClasses } from '../../store/settingsSlice'
import { FileUploader } from '../../components/Import/FileUploader'
import { ImportSummary } from '../../components/Import/ImportSummary'
import { validateCompetitionData, formatZodError } from '../../types/schemas'
import { ZodError } from 'zod'
import { transformCompetitionData } from '../../utils/transformers'
import { AppHeader } from '../../components/Layout/AppHeader'
import { ProgressStepper } from '../../components/Layout/ProgressStepper'

import { ScheduleView } from '../scheduling/ScheduleView'
import { ScheduleService } from '../../services/ScheduleService'
import { setSchedule } from '../../store/competitionSlice'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import { UnifiedSettingsPanel } from '../settings/UnifiedSettingsPanel'
import { DesignTokens } from '../../theme/DesignTokens'
import { ExportService } from '../../services/ExportService'
import { completeStep, setCanProceed, nextStep, previousStep, goToStep } from '../../store/workflowSlice'

export const ImportView: React.FC = (): React.ReactElement => {
    const dispatch = useAppDispatch()
    const { data, schedule, loading, error } = useAppSelector((state) => state.competition)
    const settings = useAppSelector((state) => state.settings)
    const { currentStep, completedSteps } = useAppSelector((state) => state.workflow)

    // Update workflow based on state changes
    useEffect(() => {
        // Mark import step as complete when data is loaded
        if (data && !completedSteps.includes('import')) {
            dispatch(completeStep('import'))
            dispatch(setCanProceed(true))
        }
    }, [data, completedSteps, dispatch])

    useEffect(() => {
        // Mark configure step as complete when settings are valid
        const hasValidSettings = settings.availability && settings.availability.length > 0
        if (hasValidSettings && data && !completedSteps.includes('configure')) {
            dispatch(completeStep('configure'))
        }
        // Allow proceeding from configure step if settings are valid
        if (currentStep === 'configure') {
            dispatch(setCanProceed(!!hasValidSettings))
        }
    }, [settings, currentStep, completedSteps, data, dispatch])

    useEffect(() => {
        // Mark schedule step as complete when schedule is generated
        if (schedule && !completedSteps.includes('schedule')) {
            dispatch(completeStep('schedule'))
        }
        // Allow proceeding from schedule step if schedule exists
        if (currentStep === 'schedule' && schedule) {
            dispatch(setCanProceed(true))
        }
    }, [schedule, completedSteps, currentStep, dispatch])

    const handleGenerateSchedule = (): void => {
        if (!data) return

        try {
            const service = new ScheduleService()
            const newSchedule = service.generateSchedule(data, settings)
            const validationErrors = service.validateSchedule(newSchedule)
            const generationWarnings = newSchedule.metadata.validationWarnings || []
            const allWarnings = [...generationWarnings, ...validationErrors]

            dispatch(setSchedule(newSchedule))
            dispatch(setValidationWarnings(allWarnings))
            dispatch(completeStep('schedule'))
            dispatch(setCanProceed(true))
        } catch (err) {
            console.error(err)
            dispatch(setError('Failed to generate schedule'))
        }
    }

    const handleFileUpload = async (file: File): Promise<void> => {
        dispatch(setLoading(true))

        const reader = new FileReader()

        reader.onload = (e): void => {
            try {
                const text = e.target?.result as string
                const jsonData = JSON.parse(text)

                // Validate data
                try {
                    // Validate structure with Zod (returns the typed JSON structure)
                    const validatedJson = validateCompetitionData(jsonData)

                    // Transform to application internal types
                    // We need to cast validatedJson because validateCompetitionData returns inferred Zod type
                    // which matches JsonCompetitionData interface structure we defined in transformers
                    const appData = transformCompetitionData(validatedJson as any)

                    dispatch(setCompetitionData(appData))

                    // Extract unique class names and generate rules for them
                    const classNames = appData.event.competitions.flatMap(comp =>
                        comp.classes.map(cls => cls.name)
                    )
                    const uniqueClassNames = [...new Set(classNames)]
                    dispatch(generateRulesForClasses(uniqueClassNames))
                } catch (validationError) {
                    console.error('Validation error:', validationError)
                    if (validationError instanceof ZodError) {
                        const formattedErrors = formatZodError(validationError)
                        dispatch(setError(`Validation failed: ${formattedErrors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`))
                    } else {
                        dispatch(setError('Data validation failed. Unknown error.'))
                    }
                }
            } catch (parseError) {
                console.error('Parse error:', parseError)
                dispatch(setError('Failed to parse JSON file. Please ensure it is valid JSON.'))
            }
        }

        reader.onerror = (): void => {
            dispatch(setError('Failed to read file.'))
        }

        reader.readAsText(file)
    }

    const handleNextStep = () => {
        dispatch(nextStep())
    }

    const handlePreviousStep = () => {
        dispatch(previousStep())
    }

    const handleStepClick = (step: string) => {
        dispatch(goToStep(step as any))
    }

    return (
        <>
            <AppHeader />

            <Container maxWidth="lg" sx={{ py: 6, '@media print': { maxWidth: 'none', py: 0 } }}>
                {/* Progress Stepper */}
                <ProgressStepper
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={handleStepClick}
                />

                <Box className="no-print">
                    {/* STEP 1: IMPORT */}
                    {currentStep === 'import' && (
                        <>
                            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                                <FileUploader
                                    onFileUpload={handleFileUpload}
                                    isLoading={loading}
                                />
                            </Box>

                            <ImportSummary data={data} error={error} />

                            {data && (
                                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={handleNextStep}
                                        sx={{
                                            px: 6,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            borderRadius: DesignTokens.borderRadius.lg,
                                            background: DesignTokens.colors.primary.gradient,
                                            boxShadow: DesignTokens.shadows.lg,
                                            '&:hover': {
                                                background: DesignTokens.colors.primary.gradient,
                                                filter: 'brightness(1.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: DesignTokens.shadows.xl,
                                            }
                                        }}
                                    >
                                        Nästa: Konfigurera Tävling
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}

                    {/* STEP 2: CONFIGURE */}
                    {currentStep === 'configure' && data && (
                        <>
                            <UnifiedSettingsPanel />

                            <Box
                                sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={handlePreviousStep}
                                    sx={{
                                        px: 4,
                                        py: 2, // Match Next button height
                                        fontSize: '1rem',
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        borderColor: 'rgba(0,0,0,0.2)',
                                        color: DesignTokens.colors.text.secondary,
                                        '&:hover': {
                                            borderColor: DesignTokens.colors.primary.main,
                                            color: DesignTokens.colors.primary.main,
                                            background: 'rgba(33, 150, 243, 0.05)',
                                        }
                                    }}
                                >
                                    Tillbaka
                                </Button>

                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={handleNextStep}
                                    disabled={!settings.availability || settings.availability.length === 0}
                                    sx={{
                                        px: 6,
                                        py: 2,
                                        fontSize: '1.1rem',
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        background: DesignTokens.colors.primary.gradient,
                                        boxShadow: DesignTokens.shadows.lg,
                                        '&:hover': {
                                            background: DesignTokens.colors.primary.gradient,
                                            filter: 'brightness(1.1)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: DesignTokens.shadows.xl,
                                        },
                                        '&:disabled': {
                                            background: DesignTokens.colors.neutral.border,
                                        }
                                    }}
                                >
                                    Nästa: Generera Schema
                                </Button>
                            </Box>

                            {(!settings.availability || settings.availability.length === 0) && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        background: `${DesignTokens.colors.semantic.warning}15`,
                                        border: `1px solid ${DesignTokens.colors.semantic.warning}30`,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography color="warning.main" fontWeight={600}>
                                        ⚠️ Lägg till minst en tävlingsdag i inställningarna ovan för att fortsätta.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}

                    {/* STEP 3: SCHEDULE */}
                    {currentStep === 'schedule' && data && (
                        <>
                            {!schedule && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h5" gutterBottom fontWeight={600}>
                                        Redo att Generera Schema
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                        Klicka på knappen nedan för att skapa det optimerade tävlingsschemat
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={handleGenerateSchedule}
                                        sx={{
                                            px: 6,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            borderRadius: DesignTokens.borderRadius.lg,
                                            background: DesignTokens.colors.secondary.gradient,
                                            boxShadow: DesignTokens.shadows.lg,
                                            '&:hover': {
                                                background: DesignTokens.colors.secondary.gradient,
                                                filter: 'brightness(1.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: DesignTokens.shadows.xl,
                                            }
                                        }}
                                    >
                                        Generera Schema
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                {/* Schedule View (shown when schedule exists) */}
                {schedule && currentStep === 'schedule' && (
                    <>
                        <ScheduleView sessions={schedule.sessions} />

                        <Box className="no-print" sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<ArrowBackIcon />}
                                onClick={handlePreviousStep}
                                sx={{
                                    px: 4,
                                    py: 2,
                                    fontSize: '1rem',
                                    borderRadius: DesignTokens.borderRadius.lg,
                                    borderColor: 'rgba(0,0,0,0.2)',
                                    color: DesignTokens.colors.text.secondary,
                                    '&:hover': {
                                        borderColor: DesignTokens.colors.primary.main,
                                        color: DesignTokens.colors.primary.main,
                                        background: 'rgba(33, 150, 243, 0.05)',
                                    }
                                }}
                            >
                                Tillbaka
                            </Button>

                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleNextStep}
                                sx={{
                                    px: 6,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    borderRadius: DesignTokens.borderRadius.lg,
                                    background: DesignTokens.colors.primary.gradient,
                                    boxShadow: DesignTokens.shadows.lg,
                                    '&:hover': {
                                        background: DesignTokens.colors.primary.gradient,
                                        filter: 'brightness(1.1)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: DesignTokens.shadows.xl,
                                    }
                                }}
                            >
                                Nästa: Exportera Schema
                            </Button>
                        </Box>
                    </>
                )}

                {/* STEP 4: EXPORT */}
                {currentStep === 'export' && schedule && (
                    <Box className="no-print" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center', mb: 6 }}>
                            <Typography variant="h4" gutterBottom fontWeight={700}>
                                Exportera ditt schema
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Ditt schema är klart! Välj exportformat nedan.
                            </Typography>
                        </Box>

                        {/* Export Options Grid */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                gap: 3,
                                maxWidth: 900,
                                mx: 'auto',
                                mb: 6
                            }}
                        >
                            {/* Print / PDF */}
                            <Box
                                className="glass-card"
                                sx={{
                                    p: 4,
                                    borderRadius: DesignTokens.borderRadius.xl,
                                    textAlign: 'center',
                                    transition: DesignTokens.transitions.normal,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: DesignTokens.shadows.xl,
                                    }
                                }}
                            >
                                <PrintIcon sx={{ fontSize: 48, color: DesignTokens.colors.primary.main, mb: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Skriv ut / PDF
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Skriv ut schemat direkt eller spara som PDF via utskriftsdialogen.
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PrintIcon />}
                                    onClick={() => {
                                        ExportService.printSchedule()
                                    }}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        background: DesignTokens.colors.primary.gradient,
                                        boxShadow: DesignTokens.shadows.md,
                                        '&:hover': {
                                            background: DesignTokens.colors.primary.gradient,
                                            filter: 'brightness(1.1)',
                                        }
                                    }}
                                >
                                    Skriv ut
                                </Button>
                            </Box>

                            {/* CSV Export */}
                            <Box
                                className="glass-card"
                                sx={{
                                    p: 4,
                                    borderRadius: DesignTokens.borderRadius.xl,
                                    textAlign: 'center',
                                    transition: DesignTokens.transitions.normal,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: DesignTokens.shadows.xl,
                                    }
                                }}
                            >
                                <DownloadIcon sx={{ fontSize: 48, color: DesignTokens.colors.secondary.main, mb: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    CSV (Kalkylblad)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Exportera för Excel, Google Sheets eller andra kalkylprogram.
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => {
                                        ExportService.exportToCSV(schedule, 'competition-schedule')
                                    }}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        background: DesignTokens.colors.secondary.gradient,
                                        boxShadow: DesignTokens.shadows.md,
                                        '&:hover': {
                                            background: DesignTokens.colors.secondary.gradient,
                                            filter: 'brightness(1.1)',
                                        }
                                    }}
                                >
                                    Ladda ner CSV
                                </Button>
                            </Box>

                            {/* JSON Export */}
                            <Box
                                className="glass-card"
                                sx={{
                                    p: 4,
                                    borderRadius: DesignTokens.borderRadius.xl,
                                    textAlign: 'center',
                                    transition: DesignTokens.transitions.normal,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: DesignTokens.shadows.xl,
                                    }
                                }}
                            >
                                <DownloadIcon sx={{ fontSize: 48, color: DesignTokens.colors.text.secondary, mb: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    JSON (Backup)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Spara schemat i JSON-format för säkerhetskopiering eller vidare bearbetning.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => {
                                        ExportService.exportToJSON(schedule, 'competition-schedule')
                                    }}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        borderColor: DesignTokens.colors.neutral.border,
                                        color: DesignTokens.colors.text.primary,
                                        '&:hover': {
                                            borderColor: DesignTokens.colors.primary.main,
                                            background: 'rgba(33, 150, 243, 0.05)',
                                        }
                                    }}
                                >
                                    Ladda ner JSON
                                </Button>
                            </Box>
                        </Box>

                        {/* Back Button */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<ArrowBackIcon />}
                                onClick={handlePreviousStep}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: DesignTokens.borderRadius.lg,
                                    borderColor: 'rgba(0,0,0,0.2)',
                                    color: DesignTokens.colors.text.secondary,
                                    '&:hover': {
                                        borderColor: DesignTokens.colors.primary.main,
                                        color: DesignTokens.colors.primary.main,
                                        background: 'rgba(33, 150, 243, 0.05)',
                                    }
                                }}
                            >
                                Tillbaka till Schema
                            </Button>
                        </Box>
                    </Box>
                )}
            </Container>
        </>
    )
}
