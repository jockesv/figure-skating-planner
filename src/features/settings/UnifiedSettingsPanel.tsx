import React, { useState } from 'react'
import {
    Paper,
    Typography,
    TextField,
    Grid,
    Button,
    Box,
    IconButton,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ShieldIcon from '@mui/icons-material/Shield'
import DeleteIcon from '@mui/icons-material/Delete'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import AddIcon from '@mui/icons-material/Add'
import TuneIcon from '@mui/icons-material/Tune'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    updateGlobalSettings,
    updateRule,
    addRule,
    removeRule,
    resetSettings,
    RuleConfig,
    AvailabilityBlock
} from '../../store/settingsSlice'
import { v4 as uuidv4 } from 'uuid'
import { DesignTokens } from '../../theme/DesignTokens'
import { TimelineBuilder } from '../../components/Settings/TimelineBuilder'

export const UnifiedSettingsPanel: React.FC = (): React.ReactElement => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(state => state.settings)

    // UI state
    const [activeTab, setActiveTab] = useState<number>(0)

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    // Availability Handlers
    const handleAddBlock = (block: AvailabilityBlock) => {
        const updatedBlocks = [...(settings.availability || []), block]
        // Sort blocks by date and time
        updatedBlocks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`)
            const dateB = new Date(`${b.date}T${b.startTime}`)
            return dateA.getTime() - dateB.getTime()
        })
        dispatch(updateGlobalSettings({ availability: updatedBlocks }))
    }

    const handleRemoveBlock = (id: string) => {
        const updatedBlocks = (settings.availability || []).filter(b => b.id !== id)
        dispatch(updateGlobalSettings({ availability: updatedBlocks }))
    }

    const handleUpdateBlock = (oldId: string, newBlock: AvailabilityBlock) => {
        const updatedBlocks = (settings.availability || []).map(b =>
            b.id === oldId ? newBlock : b
        )
        // Re-sort after update
        updatedBlocks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`)
            const dateB = new Date(`${b.date}T${b.startTime}`)
            return dateA.getTime() - dateB.getTime()
        })
        dispatch(updateGlobalSettings({ availability: updatedBlocks }))
    }


    // Rule Handlers
    const handleRuleChange = (ruleId: string, field: keyof RuleConfig, value: string | number) => {
        const rule = settings.rules.find(r => r.id === ruleId)
        if (rule) {
            dispatch(updateRule({
                ...rule,
                [field]: field === 'namePattern' ? value : Number(value)
            }))
        }
    }

    const handleAddRule = () => {
        const newRule: RuleConfig = {
            id: uuidv4(),
            namePattern: '',
            performanceTimeShort: 150,
            performanceTimeFree: 180,
            warmupTimeShort: 240,
            warmupTimeFree: 240,
            maxGroupSize: 8,
            maxSkatersBetweenResurfacing: 16,
            judgingTimeShort: 110,
            judgingTimeFree: 140,
            firstSkaterInWarmupGroup: 30
        }
        dispatch(addRule(newRule))
    }

    const handleRemoveRule = (ruleId: string) => {
        dispatch(removeRule(ruleId))
    }

    const handleResetSettings = () => {
        if (confirm('Är du säker på att du vill återställa alla inställningar till standard?')) {
            dispatch(resetSettings())
        }
    }

    return (
        <Paper
            elevation={0}
            className="animate-fadeIn glass-card"
            sx={{
                mt: 4,
                p: 0,
                borderRadius: DesignTokens.borderRadius.xl,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 3,
                background: DesignTokens.colors.primary.gradient,
                color: 'white',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SettingsIcon sx={{ fontSize: 28 }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Tävlingsinställningar
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Konfigurera tävlingstider och klassregler
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={handleResetSettings}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                borderColor: 'white',
                                background: 'rgba(255,255,255,0.1)',
                            }
                        }}
                    >
                        Återställ
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${DesignTokens.colors.neutral.border}` }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            minHeight: 56,
                            '&.Mui-selected': {
                                color: DesignTokens.colors.primary.main,
                            }
                        },
                        '& .MuiTabs-indicator': {
                            background: DesignTokens.colors.primary.gradient,
                            height: 3,
                        }
                    }}
                >
                    <Tab
                        icon={<CalendarTodayIcon />}
                        iconPosition="start"
                        label="Tävlingstider"
                    />
                    <Tab
                        icon={<ShieldIcon />}
                        iconPosition="start"
                        label="Klassregler"
                    />
                    <Tab
                        icon={<TuneIcon />}
                        iconPosition="start"
                        label="Optimeringsinställningar"
                    />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ p: 4 }}>
                {/* PANEL 1: Competition Times (Availability) */}
                {activeTab === 0 && (
                    <Box className="animate-fadeIn">
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Ange när tävlingshallen är tillgänglig. Lägg till varje tävlingsdag med start- och sluttider.
                        </Typography>

                        <TimelineBuilder
                            availabilityBlocks={settings.availability || []}
                            onAdd={handleAddBlock}
                            onRemove={handleRemoveBlock}
                            onUpdate={handleUpdateBlock}
                        />
                    </Box>
                )}

                {/* PANEL 2: Class Rules */}
                {activeTab === 1 && (
                    <Box className="animate-fadeIn">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                                Definiera tids- och grupperingsregler för specifika klasser. Regler matchas med namn.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddRule}
                                sx={{ minWidth: 120 }}
                            >
                                Lägg till regel
                            </Button>
                        </Box>

                        {settings.rules.map((rule, index) => (
                            <Paper
                                key={rule.id}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 2,
                                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                    borderRadius: DesignTokens.borderRadius.lg,
                                    '&:hover': {
                                        boxShadow: DesignTokens.shadows.md,
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                                        Regel #{index + 1}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveRule(rule.id)}
                                        color="error"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Klassnamnsmönster (t.ex. 'senior', 'junior')"
                                            value={rule.namePattern}
                                            onChange={e => handleRuleChange(rule.id, 'namePattern', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Kortprogram (s)"
                                            value={rule.performanceTimeShort}
                                            onChange={e => handleRuleChange(rule.id, 'performanceTimeShort', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Friåkning (s)"
                                            value={rule.performanceTimeFree}
                                            onChange={e => handleRuleChange(rule.id, 'performanceTimeFree', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Uppvärmning Kort (s)"
                                            value={rule.warmupTimeShort}
                                            onChange={e => handleRuleChange(rule.id, 'warmupTimeShort', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Uppvärmning Fri (s)"
                                            value={rule.warmupTimeFree}
                                            onChange={e => handleRuleChange(rule.id, 'warmupTimeFree', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Max gruppstorlek"
                                            value={rule.maxGroupSize}
                                            onChange={e => handleRuleChange(rule.id, 'maxGroupSize', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Max åkare/ispreparering"
                                            value={rule.maxSkatersBetweenResurfacing}
                                            onChange={e => handleRuleChange(rule.id, 'maxSkatersBetweenResurfacing', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Bedömning Kort"
                                            value={rule.judgingTimeShort}
                                            onChange={e => handleRuleChange(rule.id, 'judgingTimeShort', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Bedömning Fri"
                                            value={rule.judgingTimeFree}
                                            onChange={e => handleRuleChange(rule.id, 'judgingTimeFree', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Första åkare i uppvärmning (s)"
                                            value={rule.firstSkaterInWarmupGroup}
                                            onChange={e => handleRuleChange(rule.id, 'firstSkaterInWarmupGroup', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}

                        {settings.rules.length === 0 && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 6,
                                    px: 3,
                                    borderRadius: DesignTokens.borderRadius.lg,
                                    border: `2px dashed ${DesignTokens.colors.neutral.border}`,
                                    background: DesignTokens.colors.neutral.background,
                                }}
                            >
                                <ShieldIcon sx={{ fontSize: 48, color: DesignTokens.colors.text.disabled, mb: 2 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    Inga anpassade regler definierade
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Lägg till regler för att anpassa tider för specifika klasser
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* PANEL 3: Soft Scheduling Rules */}
                {activeTab === 2 && (
                    <Box className="animate-fadeIn">
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Konfigurera mjuka regler för optimerad schemaläggning. Dessa regler används av "Full optimering".
                        </Typography>

                        {/* Young Skaters Late Slots Rule */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 2,
                                border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                borderRadius: DesignTokens.borderRadius.lg,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.softRules.avoidYoungOnLateSlots}
                                        onChange={(e) => dispatch(updateGlobalSettings({
                                            softRules: {
                                                ...settings.softRules,
                                                avoidYoungOnLateSlots: e.target.checked
                                            }
                                        }))}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography fontWeight={600}>Undvik unga åkare på sena pass</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Unga åkare schemaläggs tidigare på dagen för att kunna sova ordentligt
                                        </Typography>
                                    </Box>
                                }
                            />
                            {settings.softRules.avoidYoungOnLateSlots && (
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Maxålder för 'ung' åkare"
                                            value={settings.softRules.youngMaxAge}
                                            onChange={(e) => dispatch(updateGlobalSettings({
                                                softRules: {
                                                    ...settings.softRules,
                                                    youngMaxAge: Number(e.target.value)
                                                }
                                            }))}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="time"
                                            label="Senaste tid för unga åkare"
                                            value={settings.softRules.youngLatestTime}
                                            onChange={(e) => dispatch(updateGlobalSettings({
                                                softRules: {
                                                    ...settings.softRules,
                                                    youngLatestTime: e.target.value
                                                }
                                            }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>

                        {/* Sunday Afternoon Rule */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 2,
                                border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                borderRadius: DesignTokens.borderRadius.lg,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.softRules.preferLocalOnSundayAfternoon}
                                        onChange={(e) => dispatch(updateGlobalSettings({
                                            softRules: {
                                                ...settings.softRules,
                                                preferLocalOnSundayAfternoon: e.target.checked
                                            }
                                        }))}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography fontWeight={600}>Föredra lokala åkare på söndagseftermiddag</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Åkare som bor nära tävlingen får sena pass på söndag så långväga åkare kan åka hem tidigare
                                        </Typography>
                                    </Box>
                                }
                            />
                            {settings.softRules.preferLocalOnSundayAfternoon && (
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="time"
                                            label="Tid fr.o.m. på söndag"
                                            value={settings.softRules.sundayLocalAfterTime}
                                            onChange={(e) => dispatch(updateGlobalSettings({
                                                softRules: {
                                                    ...settings.softRules,
                                                    sundayLocalAfterTime: e.target.value
                                                }
                                            }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ pt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                💡 Tagga åkare som lokala i "Tävlande"-vyn
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}
