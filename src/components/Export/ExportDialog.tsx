import React, { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Box,
    Typography
} from '@mui/material'
import { Schedule } from '../../types'
import { ExportService } from '../../services/ExportService'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'

interface ExportDialogProps {
    open: boolean
    onClose: () => void
    schedule: Schedule | null
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, schedule }) => {
    const [format, setFormat] = useState<'json' | 'csv' | 'print'>('csv')
    const [filename, setFilename] = useState<string>('competition-schedule')

    const handleExport = () => {
        if (!schedule) return

        if (format === 'json') {
            ExportService.exportToJSON(schedule, filename)
        } else if (format === 'csv') {
            ExportService.exportToCSV(schedule, filename)
        } else if (format === 'print') {
            onClose() // Close dialog before printing so overlay doesn't show
            // Wait for dialog close animation 
            setTimeout(() => {
                ExportService.printSchedule()
            }, 300)
            return
        }

        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Export Schedule</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <TextField
                        label="Filename"
                        fullWidth
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        sx={{ mb: 3 }}
                        disabled={format === 'print'}
                    />

                    <Typography variant="subtitle2" gutterBottom>
                        Format
                    </Typography>
                    <RadioGroup
                        value={format}
                        onChange={(e) => setFormat(e.target.value as any)}
                    >
                        <FormControlLabel
                            value="csv"
                            control={<Radio />}
                            label="CSV (Spreadsheet)"
                        />
                        <FormControlLabel
                            value="json"
                            control={<Radio />}
                            label="JSON (Backup)"
                        />
                        <FormControlLabel
                            value="print"
                            control={<Radio />}
                            label={
                                <Box display="flex" alignItems="center">
                                    <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                                    Print / PDF
                                </Box>
                            }
                        />
                    </RadioGroup>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    startIcon={format === 'print' ? <PrintIcon /> : <DownloadIcon />}
                >
                    {format === 'print' ? 'Print' : 'Download'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
