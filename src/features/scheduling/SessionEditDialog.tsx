import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem
} from '@mui/material'
import { ScheduleSession } from '../../types'

interface SessionEditDialogProps {
    open: boolean
    session: ScheduleSession | null
    onClose: () => void
    onSave: (session: ScheduleSession) => void
    onDelete: (id: string) => void
}

export const SessionEditDialog: React.FC<SessionEditDialogProps> = ({
    open,
    session,
    onClose,
    onSave,
    onDelete
}) => {
    // Local state for editing
    const [startTime, setStartTime] = useState<string>('')
    const [durationMinutes, setDurationMinutes] = useState<number>(0)
    const [type, setType] = useState<string>('')

    useEffect(() => {
        if (session) {
            // Format start time as HH:mm
            const date = new Date(session.startTime)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            setStartTime(`${hours}:${minutes}`)

            setDurationMinutes(Math.round(session.duration / 60))
            setType(session.type)
        }
    }, [session])

    const handleSave = () => {
        if (!session) return

        // Parse new start time
        const [hours, mins] = startTime.split(':').map(Number)
        const newStart = new Date(session.startTime)
        newStart.setHours(hours, mins, 0, 0)

        // Calculate new end time
        const newDuration = durationMinutes * 60
        const newEnd = new Date(newStart.getTime() + newDuration * 1000)

        const updatedSession: ScheduleSession = {
            ...session,
            startTime: newStart,
            endTime: newEnd,
            duration: newDuration,
            type: type as any
        }

        onSave(updatedSession)
        onClose()
    }

    const handleDelete = () => {
        if (session) {
            onDelete(session.id)
            onClose()
        }
    }

    if (!session) return null

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Type"
                        select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="warmup">Warmup</MenuItem>
                        <MenuItem value="performance">Performance</MenuItem>
                        <MenuItem value="resurfacing">Resurfacing</MenuItem>
                        <MenuItem value="break">Break</MenuItem>
                        <MenuItem value="judging">Judging</MenuItem>
                    </TextField>

                    <TextField
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }} // 5 min steps
                        fullWidth
                    />

                    <TextField
                        label="Duration (minutes)"
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        fullWidth
                    />

                    <TextField
                        label="Name"
                        value={session.name || ''}
                        disabled
                        helperText="Name cannot be changed directly here"
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                {/* Only allow deleting if it's a break or resurfacing, potentially? 
                    The story says "Add or remove short breaks". 
                    Removing actual performances might be risky, but let's allow it with caution or just for breaks.
                    For simplicity, allow all, user can Undo.
                */}
                <Button onClick={handleDelete} color="error" sx={{ mr: 'auto' }}>
                    Delete
                </Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}
