import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { ScheduleSession } from '../../types'
import { DesignTokens } from '../../theme/DesignTokens'

interface SessionDetailsDialogProps {
    open: boolean
    onClose: () => void
    sessions: ScheduleSession[]
    className: string
    groupId?: number
}

export const SessionDetailsDialog: React.FC<SessionDetailsDialogProps> = ({
    open,
    onClose,
    sessions,
    className,
    groupId
}) => {
    // Separate warmup and performances
    const warmup = sessions.find(s => s.type === 'warmup')
    const performances = sessions.filter(s => s.type === 'performance')

    // Calculate total time range for this specific chunk of sessions
    const startTime = sessions.length > 0 ? new Date(sessions[0].startTime) : new Date()
    const endTime = sessions.length > 0 ? new Date(sessions[sessions.length - 1].endTime) : new Date()

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: DesignTokens.borderRadius.lg,
                    background: DesignTokens.colors.neutral.surfaceGlass,
                    backdropFilter: 'blur(12px)',
                    boxShadow: DesignTokens.shadows.xl,
                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tävlingsklass
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: DesignTokens.colors.text.primary }}>
                    {className}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                        label={`Grupp ${groupId}`}
                        size="small"
                        sx={{
                            background: DesignTokens.colors.primary.light,
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                            {formatTime(startTime)} - {formatTime(endTime)}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                {warmup && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🔥 Uppvärmning
                        </Typography>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: DesignTokens.borderRadius.md,
                                background: 'rgba(0,0,0,0.03)',
                                border: `1px solid ${DesignTokens.colors.neutral.border}`
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Längd:</strong> {Math.round(warmup.duration / 60)} min
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formatTime(new Date(warmup.startTime))} - {formatTime(new Date(warmup.endTime))}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⛸️ Åkare ({performances.length})
                </Typography>
                <List dense sx={{
                    background: 'white',
                    borderRadius: DesignTokens.borderRadius.md,
                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                    overflow: 'hidden',
                    mb: 1
                }}>
                    {performances.map((perf, index) => (
                        <React.Fragment key={perf.id}>
                            <ListItem>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <PersonIcon color="action" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight={600}>
                                            {perf.name}
                                        </Typography>
                                    }
                                    secondary={''} // Club data not available in session
                                />
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                    {formatTime(new Date(perf.startTime))} - {formatTime(new Date(perf.endTime))}
                                </Typography>
                            </ListItem>
                            {index < performances.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                    {performances.length === 0 && (
                        <ListItem>
                            <ListItemText secondary="Inga åk i detta block (Fortsätter annanstans?)" />
                        </ListItem>
                    )}
                </List>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, textAlign: 'right' }}>
                <Button onClick={onClose} variant="outlined" color="primary" sx={{ px: 3 }}>
                    Stäng
                </Button>
            </DialogActions>
        </Dialog>
    )
}
