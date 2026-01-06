import React, { useState } from 'react'
import {
    Paper,
    Typography,
    Box,
    Button,
    Stack,
    Tabs,
    Tab,
    Alert,
    AlertTitle
} from '@mui/material'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import DownloadIcon from '@mui/icons-material/Download'

import { ScheduleSession } from '../../types'
import { Timeline } from '../../components/Timeline/Timeline'
import { TimelineControls } from '../../components/Timeline/TimelineControls'
import { SessionEditDialog } from './SessionEditDialog'
import { ExportDialog } from '../../components/Export/ExportDialog'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateSession, removeSession, undo, redo, setSchedule, setValidationWarnings } from '../../store/competitionSlice'
import { ScheduleService } from '../../services/ScheduleService'
import { AdvancedOptimizer } from '../../services/AdvancedOptimizer'
import { updateGlobalSettings } from '../../store/settingsSlice'

import { UnifiedSettingsPanel } from '../../features/settings/UnifiedSettingsPanel'
import { DesignTokens } from '../../theme/DesignTokens'
import { SkatersList } from '../../components/Views/SkatersList'
import { ScheduleOverview } from '../../components/Views/ScheduleOverview'

interface ScheduleViewProps {
    sessions: ScheduleSession[]
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ sessions }): React.ReactElement | null => {
    const dispatch = useAppDispatch()
    const { history, conflicts, schedule, validationWarnings, data, excludedClassIds, scratchedSkaterIds, localSkaterIds } = useAppSelector(state => state.competition)
    const settings = useAppSelector(state => state.settings)

    // State
    const [currentTab, setCurrentTab] = useState<'gantt' | 'skaters' | 'overview'>('gantt')
    const [zoomLevel, setZoomLevel] = useState<number>(4) // Default 4px per min
    // Removed local filterClasses state
    const [editingSession, setEditingSession] = useState<ScheduleSession | null>(null)
    const [exportOpen, setExportOpen] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [optimizationProgress, setOptimizationProgress] = useState(0)

    // Derived Data: Source of truth is 'data' (uploaded file), NOT 'sessions' (generated output)




    // Main Regeneration Logic
    const regenerateSchedule = React.useCallback(() => {
        if (!data) return

        // Create a filtered copy of the data based on Redux state
        const filteredData = {
            ...data,
            event: {
                ...data.event,
                competitions: data.event.competitions.map(comp => ({
                    ...comp,
                    classes: comp.classes
                        .filter(c => !excludedClassIds.includes(c.id))
                        .map(cls => ({
                            ...cls,
                            groups: cls.groups.map(g => ({
                                ...g,
                                persons: g.persons.filter(p => !scratchedSkaterIds.includes(p.id))
                            })).filter(g => g.persons.length > 0) // Remove group if no skaters remain
                        }))
                        .filter(cls => cls.groups.length > 0) // Remove classes if all groups are empty (after skater filtering)
                })).filter(comp => comp.classes.length > 0)
            }
        }

        const service = new ScheduleService()
        const newSchedule = service.generateSchedule(filteredData, settings)

        const validationErrors = service.validateSchedule(newSchedule)
        const generationWarnings = newSchedule.metadata.validationWarnings || []
        const allWarnings = [...generationWarnings, ...validationErrors]

        dispatch(setSchedule(newSchedule))
        dispatch(setValidationWarnings(allWarnings))
    }, [data, settings, excludedClassIds, scratchedSkaterIds, dispatch])

    // Auto-regenerate on changes
    React.useEffect(() => {
        if (data) {
            // Debounce could be added here if performance becomes an issue
            regenerateSchedule()
        }
    }, [regenerateSchedule])

    // Full Optimization handler
    const runFullOptimization = React.useCallback(async () => {
        if (!data) return

        setIsOptimizing(true)
        setOptimizationProgress(0)

        // Run optimization in a setTimeout to allow UI to update
        setTimeout(() => {
            const optimizer = new AdvancedOptimizer()
            const result = optimizer.optimize(
                data,
                settings,
                localSkaterIds,
                500, // iterations
                (progress) => setOptimizationProgress(progress)
            )

            if (result.improved) {
                // Update settings with optimized class order
                dispatch(updateGlobalSettings({ customClassOrder: result.classOrder }))
            }

            setIsOptimizing(false)
            setOptimizationProgress(1)
        }, 100)
    }, [data, settings, localSkaterIds, dispatch])

    // Handlers
    // Removed handleFilterChange

    const handleUndo = () => dispatch(undo())
    const handleRedo = () => dispatch(redo())

    const handleSessionClick = (session: ScheduleSession) => {
        setEditingSession(session)
    }

    const handleSaveSession = (updatedSession: ScheduleSession) => {
        dispatch(updateSession(updatedSession))
    }

    const handleDeleteSession = (id: string) => {
        dispatch(removeSession(id))
    }

    if (!sessions || sessions.length === 0) {
        return (
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                Inget schema genererat ännu.
            </Typography>
        )
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} className="no-print">
                <Typography variant="h5">
                    Genererat Schema
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        startIcon={<UndoIcon />}
                        onClick={handleUndo}
                        disabled={history.past.length === 0}
                        title="Ångra"
                    >
                        Ångra
                    </Button>
                    <Button
                        startIcon={<RedoIcon />}
                        onClick={handleRedo}
                        disabled={history.future.length === 0}
                        title="Gör om"
                    >
                        Gör om
                    </Button>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => setExportOpen(true)}
                        variant="contained"
                        sx={{
                            background: DesignTokens.colors.primary.gradient,
                            boxShadow: DesignTokens.shadows.md,
                            borderRadius: DesignTokens.borderRadius.md,
                            textTransform: 'none',
                        }}
                        size="small"
                    >
                        Exportera
                    </Button>
                </Stack>
            </Stack>

            <Box className="no-print">
                <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                    <Button
                        variant="text"
                        onClick={() => setShowSettings(!showSettings)}
                        size="small"
                        sx={{
                            color: DesignTokens.colors.text.secondary,
                            '&:hover': { color: DesignTokens.colors.primary.main, background: 'transparent' }
                        }}
                    >
                        {showSettings ? "Dölj Inställningar" : "Visa Inställningar"}
                    </Button>
                    {/* Re-generate button in case settings changed without auto-regen (UnifiedPanel updates store directly) */}
                    <Button
                        variant="outlined"
                        onClick={regenerateSchedule}
                        size="small"
                        color="primary"
                        sx={{
                            borderRadius: DesignTokens.borderRadius.md,
                            textTransform: 'none',
                        }}
                    >
                        Generera om schema
                    </Button>
                    <Button
                        variant="contained"
                        onClick={runFullOptimization}
                        disabled={isOptimizing}
                        size="small"
                        color="secondary"
                        sx={{
                            borderRadius: DesignTokens.borderRadius.md,
                            textTransform: 'none',
                            background: isOptimizing ? undefined : DesignTokens.colors.secondary.gradient,
                        }}
                    >
                        {isOptimizing ? `Optimerar... ${Math.round(optimizationProgress * 100)}%` : 'Full optimering'}
                    </Button>
                </Stack>

                {showSettings && (
                    <Box sx={{ mb: 3 }}>
                        <UnifiedSettingsPanel />
                    </Box>
                )}
            </Box>

            {/* View Tabs & Zoom Controls */}
            <Paper className="glass-card" sx={{ mb: 3, borderRadius: '12px !important', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={(_, val) => setCurrentTab(val)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="standard"
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem' }
                    }}
                >
                    <Tab label="Tidsschema (Gantt)" value="gantt" />
                    <Tab label="Tävlande" value="skaters" />
                    <Tab label="Översikt" value="overview" />
                </Tabs>

                {currentTab === 'gantt' && (
                    <TimelineControls
                        zoomLevel={zoomLevel}
                        onZoomChange={setZoomLevel}
                    />
                )}
            </Paper>

            {/* Critical Scheduling Errors */}
            {validationWarnings.some(w => w.includes('Schedule Full')) && (
                <Alert
                    severity="error"
                    className="no-print glass-card"
                    sx={{
                        mb: 2,
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        background: 'rgba(254, 226, 226, 0.7)',
                        color: '#991b1b',
                        backdropFilter: 'blur(8px)',
                        '& .MuiAlert-icon': { color: '#ef4444' }
                    }}
                >
                    <AlertTitle sx={{ fontWeight: 700 }}>Tiden räckte inte till</AlertTitle>
                    <Typography variant="body2" paragraph sx={{ color: '#991b1b' }}>
                        Alla åkare fick inte plats i schemat baserat på nuvarande inställningar.
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#991b1b' }}>
                        Förslag på åtgärder:
                    </Typography>
                    <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                        <li>
                            <Typography variant="body2" sx={{ color: '#991b1b' }}>Gå till <strong>Inställningar</strong> och lägg till mer tid (fler dagar eller längre pass).</Typography>
                        </li>
                        <li>
                            <Typography variant="body2" sx={{ color: '#991b1b' }}>Inaktivera vissa klasser i fliken "Tävlande" och regenerera.</Typography>
                        </li>
                        <li>
                            <Typography variant="body2" sx={{ color: '#991b1b' }}>Justera klassregler (t.ex. kortare uppvärmning eller färre spolningar).</Typography>
                        </li>
                    </ul>
                </Alert>
            )}

            {/* Validation Warnings (Non-critical) */}
            {validationWarnings && validationWarnings.length > 0 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }} className="no-print">
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                        Varningar / Noteringar:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validationWarnings.map((warning, index) => (
                            <li key={index}>
                                <Typography variant="body2" color="warning.dark">
                                    {warning}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Paper>
            )}

            {/* Views */}
            <Box>
                {currentTab === 'gantt' && (
                    <>

                        {conflicts.length > 0 && (
                            <Typography color="error" variant="caption" display="block" sx={{ mb: 1 }}>
                                Warning: {conflicts.length} overlapping sessions detected.
                            </Typography>
                        )}
                        <Timeline
                            sessions={sessions}
                            zoomLevel={zoomLevel}
                            onSessionClick={handleSessionClick}
                            conflicts={conflicts}
                        />
                    </>
                )}

                {currentTab === 'skaters' && (
                    <SkatersList data={data} />
                )}

                {currentTab === 'overview' && (
                    <ScheduleOverview sessions={sessions} />
                )}
            </Box>

            <SessionEditDialog
                open={!!editingSession}
                session={editingSession}
                onClose={() => setEditingSession(null)}
                onSave={handleSaveSession}
                onDelete={handleDeleteSession}
            />

            <ExportDialog
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                schedule={{ ...schedule!, sessions: sessions }}
            />
        </Box>
    )
}
