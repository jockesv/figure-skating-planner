import React, { useEffect, useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    Slider,
    TextField,
    Stack,
    Divider,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { SchedulerSettings, AvailabilityBlock } from '../../store/settingsSlice'
import { v4 as uuidv4 } from 'uuid'

interface OptimizationControlsProps {
    settings: SchedulerSettings
    onSettingsChange: (newSettings: Partial<SchedulerSettings>) => void
}

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({
    settings,
    onSettingsChange
}) => {
    // Local state for performant sliders, only commit on change committed
    const [localSettings, setLocalSettings] = useState<SchedulerSettings>(settings)

    // Local state for new block input
    const [newBlockDate, setNewBlockDate] = useState(new Date().toISOString().split('T')[0])
    const [newBlockStart, setNewBlockStart] = useState('08:00')
    const [newBlockEnd, setNewBlockEnd] = useState('18:00')

    useEffect(() => {
        setLocalSettings(settings)
    }, [settings])

    const handleChange = (field: keyof SchedulerSettings, value: any) => {
        const updated = { ...localSettings, [field]: value }
        setLocalSettings(updated)
        onSettingsChange({ [field]: value })
    }

    const handleSliderChange = (field: keyof SchedulerSettings) => (_event: Event, newValue: number | number[]) => {
        setLocalSettings({ ...localSettings, [field]: newValue as number })
    }

    const handleSliderCommit = (field: keyof SchedulerSettings) => (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
        onSettingsChange({ [field]: newValue as number })
    }

    const handleAddBlock = () => {
        const newBlock: AvailabilityBlock = {
            id: uuidv4(),
            date: newBlockDate,
            startTime: newBlockStart,
            endTime: newBlockEnd
        }
        const updatedBlocks = [...(localSettings.availability || []), newBlock]
        // Sort blocks by date and time
        updatedBlocks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`)
            const dateB = new Date(`${b.date}T${b.startTime}`)
            return dateA.getTime() - dateB.getTime()
        })

        handleChange('availability', updatedBlocks)
    }

    const handleRemoveBlock = (id: string) => {
        const updatedBlocks = (localSettings.availability || []).filter(b => b.id !== id)
        handleChange('availability', updatedBlocks)
    }

    return (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }} elevation={0} variant="outlined">
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Competition Schedule
            </Typography>

            {/* Availability Blocks (Mandatory) */}
            <Box sx={{ mb: 2 }}>
                {/* List Existing */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                    {(localSettings.availability || []).map(block => (
                        <Paper key={block.id} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{block.date}</Typography>
                                <Typography variant="caption">{block.startTime} - {block.endTime}</Typography>
                            </Box>
                            <IconButton size="small" onClick={() => handleRemoveBlock(block.id)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    ))}
                    {(localSettings.availability || []).length === 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1 }}>
                            No schedule defined. Please add competition days.
                        </Typography>
                    )}
                </Stack>

                {/* Add New */}
                <Typography variant="caption" display="block" mb={1} fontWeight="bold">Add Day/Time:</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                        type="date"
                        size="small"
                        value={newBlockDate}
                        onChange={e => setNewBlockDate(e.target.value)}
                        sx={{ width: 140 }}
                    />
                    <TextField
                        type="time"
                        size="small"
                        value={newBlockStart}
                        onChange={e => setNewBlockStart(e.target.value)}
                        sx={{ width: 90 }}
                    />
                    <Typography variant="caption">-</Typography>
                    <TextField
                        type="time"
                        size="small"
                        value={newBlockEnd}
                        onChange={e => setNewBlockEnd(e.target.value)}
                        sx={{ width: 90 }}
                    />
                    <IconButton size="small" color="primary" onClick={handleAddBlock} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                        <AddIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Advanced Settings (Collapsible) */}
            <Accordion variant="outlined" sx={{ bgcolor: '#fff' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Advanced Settings (Lunch, Ice, Rules)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={3}>

                        {/* Lunch */}
                        <Box>
                            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>Lunch Configuration</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    label="Lunch Start"
                                    type="time"
                                    value={localSettings.lunchStartTime}
                                    onChange={(e) => handleChange('lunchStartTime', e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: 130 }}
                                />
                                <TextField
                                    label="Duration (min)"
                                    type="number"
                                    value={localSettings.lunchDuration}
                                    onChange={(e) => handleChange('lunchDuration', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                />
                            </Stack>
                        </Box>

                        {/* Ice Maintenance */}
                        <Box>
                            <Typography variant="caption" fontWeight="bold" display="block" mb={1}>Ice Maintenance</Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        label="Max Ice Time (min)"
                                        type="number"
                                        value={localSettings.maxIceTimeBetweenResurfacing || 0}
                                        onChange={(e) => handleChange('maxIceTimeBetweenResurfacing', Number(e.target.value))}
                                        size="small"
                                        helperText="Force resurface after"
                                    />
                                    <TextField
                                        label="Resurface Duration"
                                        type="number"
                                        value={(localSettings.iceResurfacingDuration || 900) / 60}
                                        onChange={(e) => handleChange('iceResurfacingDuration', Number(e.target.value) * 60)}
                                        size="small"
                                        sx={{ width: 150 }}
                                        InputProps={{ endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>min</Typography> }}
                                    />
                                </Stack>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Fallback Group Interval: {localSettings.iceResurfacingInterval} groups
                                    </Typography>
                                    <Slider
                                        value={localSettings.iceResurfacingInterval}
                                        min={1}
                                        max={5}
                                        step={1}
                                        marks
                                        onChange={handleSliderChange('iceResurfacingInterval')}
                                        onChangeCommitted={handleSliderCommit('iceResurfacingInterval')}
                                        size="small"
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        {/* Fallback Legacy Settings (Only if no blocks) - Hidden in Advanced */}
                        {(!localSettings.availability || localSettings.availability.length === 0) && (
                            <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Legacy Fallback (deprecated):
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Start Hour: {localSettings.startHour}:00</Typography>
                                    <Slider
                                        value={localSettings.startHour}
                                        min={6}
                                        max={12}
                                        step={1}
                                        marks
                                        onChange={handleSliderChange('startHour')}
                                        onChangeCommitted={handleSliderCommit('startHour')}
                                        size="small"
                                        sx={{ width: 150 }}
                                    />
                                </Stack>
                            </Box>
                        )}

                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Paper>
    )
}
