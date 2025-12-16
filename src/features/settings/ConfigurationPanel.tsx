import React, { useState } from 'react'
import {
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Grid,
    Button,
    Box,
    IconButton
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    updateGlobalSettings,
    updateRule,
    addRule,
    removeRule,
    resetSettings,
    RuleConfig
} from '../../store/settingsSlice'
import { v4 as uuidv4 } from 'uuid'

export const ConfigurationPanel: React.FC = (): React.ReactElement => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(state => state.settings)

    // UI state
    const [expanded, setExpanded] = useState<string | false>('global')

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    const handleGlobalChange = (field: keyof typeof settings, value: string) => {
        dispatch(updateGlobalSettings({ [field]: Number(value) }))
    }

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
        dispatch(addRule({
            id: uuidv4(),
            namePattern: 'new rule',
            performanceTimeShort: 150,
            performanceTimeFree: 180,
            warmupTimeShort: 240,
            warmupTimeFree: 240,
            maxGroupSize: 8,
            maxSkatersBetweenResurfacing: 16,
            judgingTimeShort: 110,
            judgingTimeFree: 140
        }))
        setExpanded('rules')
    }

    return (
        <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <SettingsIcon sx={{ mr: 1 }} /> Configuration
            </Typography>

            <Accordion expanded={expanded === 'global'} onChange={handleChange('global')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Global Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Lunch Start Time (HH:MM)"
                                fullWidth
                                value={settings.lunchStartTime}
                                onChange={(e) => handleGlobalChange('lunchStartTime', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Lunch Duration (min)"
                                type="number"
                                fullWidth
                                value={settings.lunchDuration}
                                onChange={(e) => handleGlobalChange('lunchDuration', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Start Date (YYYY-MM-DD)"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={settings.startDate}
                                onChange={(e) => handleGlobalChange('startDate', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                label="Start Hour (0-23)"
                                type="number"
                                fullWidth
                                value={settings.startHour}
                                onChange={(e) => handleGlobalChange('startHour', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField
                                label="End Hour (0-23)"
                                type="number"
                                fullWidth
                                value={settings.endHour}
                                onChange={(e) => handleGlobalChange('endHour', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Ice Resurfacing Interval (Groups)"
                                type="number"
                                fullWidth
                                value={settings.iceResurfacingInterval}
                                onChange={(e) => handleGlobalChange('iceResurfacingInterval', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Resurfacing Duration (sec)"
                                type="number"
                                fullWidth
                                value={settings.iceResurfacingDuration}
                                onChange={(e) => handleGlobalChange('iceResurfacingDuration', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button variant="outlined" color="warning" onClick={() => dispatch(resetSettings())}>
                                Reset to Defaults
                            </Button>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Accordion expanded={expanded === 'rules'} onChange={handleChange('rules')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Class Rules</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                        <Button startIcon={<AddIcon />} size="small" onClick={handleAddRule}>
                            Add Rule
                        </Button>
                    </Box>
                    {settings.rules.map((rule) => (
                        <Paper key={rule.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={10}>
                                    <TextField
                                        label="Name Pattern (contains)"
                                        size="small"
                                        fullWidth
                                        value={rule.namePattern}
                                        onChange={(e) => handleRuleChange(rule.id, 'namePattern', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2} textAlign="right">
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => dispatch(removeRule(rule.id))}
                                        disabled={rule.namePattern === 'default'}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Perf Time Short (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.performanceTimeShort}
                                        onChange={(e) => handleRuleChange(rule.id, 'performanceTimeShort', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Perf Time Free (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.performanceTimeFree}
                                        onChange={(e) => handleRuleChange(rule.id, 'performanceTimeFree', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Judging Short (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.judgingTimeShort}
                                        onChange={(e) => handleRuleChange(rule.id, 'judgingTimeShort', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Judging Free (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.judgingTimeFree}
                                        onChange={(e) => handleRuleChange(rule.id, 'judgingTimeFree', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        label="Warmup Short (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.warmupTimeShort}
                                        onChange={(e) => handleRuleChange(rule.id, 'warmupTimeShort', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <TextField
                                        label="Warmup Free (s)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.warmupTimeFree}
                                        onChange={(e) => handleRuleChange(rule.id, 'warmupTimeFree', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Max Group Size"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.maxGroupSize}
                                        onChange={(e) => handleRuleChange(rule.id, 'maxGroupSize', e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        label="Max Skaters/Resurface"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={rule.maxSkatersBetweenResurfacing || 0}
                                        onChange={(e) => handleRuleChange(rule.id, 'maxSkatersBetweenResurfacing', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}
