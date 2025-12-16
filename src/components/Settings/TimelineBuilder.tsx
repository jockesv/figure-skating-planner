import React, { useState, useRef } from 'react'
import { Box, Typography, Button, Paper, IconButton, Chip, Snackbar, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { DesignTokens } from '../../theme/DesignTokens'
import { AvailabilityBlock } from '../../store/settingsSlice'

interface TimelineBuilderProps {
    availabilityBlocks: AvailabilityBlock[]
    onAdd: (block: AvailabilityBlock) => void
    onRemove: (id: string) => void
    onUpdate?: (id: string, block: AvailabilityBlock) => void
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
    availabilityBlocks,
    onAdd,
    onRemove,
    onUpdate,
}) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState<string>('08:00')
    const [endTime, setEndTime] = useState<string>('18:00')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<{ startTime: string; endTime: string } | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const listRef = useRef<HTMLDivElement>(null)
    const newestItemRef = useRef<HTMLDivElement>(null)

    const handleQuickPreset = (start: string, end: string) => {
        setStartTime(start)
        setEndTime(end)
    }

    const handleAddBlock = () => {
        onAdd({
            id: `${selectedDate}-${startTime}-${endTime}`,
            date: selectedDate,
            startTime,
            endTime,
        })
        // Reset to next day
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)
        setSelectedDate(nextDay.toISOString().split('T')[0])

        // Show success message
        setShowSuccess(true)

        // Scroll to the newly added item after a brief delay
        setTimeout(() => {
            if (newestItemRef.current) {
                newestItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
        }, 100)
    }

    const handleStartEdit = (block: AvailabilityBlock) => {
        setEditingId(block.id)
        setEditData({ startTime: block.startTime, endTime: block.endTime })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditData(null)
    }

    const handleSaveEdit = (blockId: string, date: string) => {
        if (editData && onUpdate) {
            onUpdate(blockId, {
                id: `${date}-${editData.startTime}-${editData.endTime}`,
                date,
                startTime: editData.startTime,
                endTime: editData.endTime,
            })
        }
        setEditingId(null)
        setEditData(null)
    }

    const formatDuration = (start: string, end: string): string => {
        const [startHour, startMin] = start.split(':').map(Number)
        const [endHour, endMin] = end.split(':').map(Number)
        const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }

    const getTotalHours = (): number => {
        return availabilityBlocks.reduce((total, block) => {
            const [startHour, startMin] = block.startTime.split(':').map(Number)
            const [endHour, endMin] = block.endTime.split(':').map(Number)
            const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
            return total + minutes / 60
        }, 0)
    }

    // Sort blocks by date
    const sortedBlocks = [...availabilityBlocks].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return (
        <Box>
            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowSuccess(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Competition day added successfully!
                </Alert>
            </Snackbar>

            {/* Summary Stats */}
            {availabilityBlocks.length > 0 && (
                <Box
                    sx={{
                        mb: 3,
                        p: 3,
                        borderRadius: DesignTokens.borderRadius.lg,
                        background: DesignTokens.colors.primary.main + '10',
                        border: `1px solid ${DesignTokens.colors.primary.main}30`,
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Antal Dagar
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="primary">
                                {availabilityBlocks.length}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Antal Timmar
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="primary">
                                {getTotalHours().toFixed(1)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Add New Day Form */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: DesignTokens.borderRadius.lg,
                    background: DesignTokens.colors.neutral.surfaceGlass,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                }}
            >
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 20 }} />
                    Lägg till Tävlingsdag
                </Typography>

                {/* Date Picker */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                        Välj Datum
                    </Typography>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: DesignTokens.borderRadius.md,
                            border: `1px solid ${DesignTokens.colors.neutral.border}`,
                            fontSize: '1rem',
                            fontFamily: DesignTokens.typography.fontFamily.primary,
                            width: '100%',
                            maxWidth: '300px',
                        }}
                    />
                </Box>

                {/* Time Range Selectors */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: DesignTokens.colors.text.secondary }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Tävlingstid
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                Starttid
                            </Typography>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: DesignTokens.borderRadius.md,
                                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                    fontSize: '1rem',
                                    fontFamily: DesignTokens.typography.fontFamily.mono,
                                    width: '140px',
                                }}
                            />
                        </Box>

                        <Typography sx={{ mt: 3, fontWeight: 600, color: DesignTokens.colors.text.secondary }}>
                            till
                        </Typography>

                        <Box>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                Sluttid
                            </Typography>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: DesignTokens.borderRadius.md,
                                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                    fontSize: '1rem',
                                    fontFamily: DesignTokens.typography.fontFamily.mono,
                                    width: '140px',
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Chip
                                label={`Längd: ${formatDuration(startTime, endTime)}`}
                                sx={{
                                    fontFamily: DesignTokens.typography.fontFamily.mono,
                                    fontWeight: 600,
                                    background: DesignTokens.colors.accent.main + '20',
                                    color: DesignTokens.colors.accent.dark,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Quick Presets */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Snabbval
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickPreset('08:00', '18:00')}
                            sx={{ textTransform: 'none' }}
                        >
                            8:00 - 18:00 (10h)
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickPreset('09:00', '17:00')}
                            sx={{ textTransform: 'none' }}
                        >
                            9:00 - 17:00 (8h)
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickPreset('10:00', '20:00')}
                            sx={{ textTransform: 'none' }}
                        >
                            10:00 - 20:00 (10h)
                        </Button>
                    </Box>
                </Box>

                {/* Add Button */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddBlock}
                    disabled={!selectedDate || !startTime || !endTime}
                    sx={{
                        background: DesignTokens.colors.primary.gradient,
                        '&:hover': {
                            background: DesignTokens.colors.primary.gradient,
                            filter: 'brightness(1.1)',
                        }
                    }}
                >
                    Lägg till Tävlingsdag
                </Button>
            </Paper>

            {/* List of Added Days */}
            {sortedBlocks.length > 0 && (
                <Box ref={listRef}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Konfigurerade Dagar ({sortedBlocks.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {sortedBlocks.map((block, index) => {
                            const isEditing = editingId === block.id
                            const isNewest = index === sortedBlocks.length - 1

                            return (
                                <Paper
                                    key={block.id}
                                    ref={isNewest ? newestItemRef : null}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: DesignTokens.borderRadius.md,
                                        border: `1px solid ${isEditing ? DesignTokens.colors.primary.main : DesignTokens.colors.neutral.border}`,
                                        transition: DesignTokens.transitions.normal,
                                        '&:hover': {
                                            boxShadow: DesignTokens.shadows.md,
                                            borderColor: DesignTokens.colors.primary.light,
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: DesignTokens.borderRadius.md,
                                                background: DesignTokens.colors.primary.gradient,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                                                {new Date(block.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1 }}>
                                                {new Date(block.date).getDate()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={600}>
                                                {(() => {
                                                    const dateStr = new Date(block.date).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                                    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                                                })()}
                                            </Typography>

                                            {isEditing && editData ? (
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                                                    <input
                                                        type="time"
                                                        value={editData.startTime}
                                                        onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: DesignTokens.borderRadius.sm,
                                                            border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                                            fontSize: '0.875rem',
                                                            fontFamily: DesignTokens.typography.fontFamily.mono,
                                                        }}
                                                    />
                                                    <Typography variant="caption">till</Typography>
                                                    <input
                                                        type="time"
                                                        value={editData.endTime}
                                                        onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: DesignTokens.borderRadius.sm,
                                                            border: `1px solid ${DesignTokens.colors.neutral.border}`,
                                                            fontSize: '0.875rem',
                                                            fontFamily: DesignTokens.typography.fontFamily.mono,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={formatDuration(editData.startTime, editData.endTime)}
                                                        size="small"
                                                        sx={{
                                                            background: DesignTokens.colors.accent.main + '20',
                                                            color: DesignTokens.colors.accent.dark,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Chip
                                                        icon={<AccessTimeIcon />}
                                                        label={`${block.startTime} - ${block.endTime}`}
                                                        size="small"
                                                        sx={{
                                                            fontFamily: DesignTokens.typography.fontFamily.mono,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={formatDuration(block.startTime, block.endTime)}
                                                        size="small"
                                                        sx={{
                                                            background: DesignTokens.colors.semantic.success + '20',
                                                            color: DesignTokens.colors.semantic.success,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {isEditing ? (
                                            <>
                                                <IconButton
                                                    onClick={() => handleSaveEdit(block.id, block.date)}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            background: DesignTokens.colors.primary.main + '15',
                                                        }
                                                    }}
                                                >
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={handleCancelEdit}
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            background: DesignTokens.colors.neutral.border,
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    onClick={() => handleStartEdit(block)}
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            background: DesignTokens.colors.primary.main + '15',
                                                        }
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => onRemove(block.id)}
                                                    color="error"
                                                    size="small"
                                                    sx={{
                                                        '&:hover': {
                                                            background: DesignTokens.colors.semantic.error + '15',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </Paper>
                            )
                        })}
                    </Box>
                </Box>
            )}

            {/* Empty State */}
            {sortedBlocks.length === 0 && (
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
                    <CalendarTodayIcon sx={{ fontSize: 48, color: DesignTokens.colors.text.disabled, mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Inga tävlingsdagar konfigurerade än
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        Lägg till din första tävlingsdag med formuläret ovan
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
