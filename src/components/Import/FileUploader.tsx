import React, { useRef, useState } from 'react'
import { Button, Box, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { DesignTokens } from '../../theme/DesignTokens'

interface FileUploaderProps {
    onFileUpload: (file: File) => void
    isLoading?: boolean
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0]
        if (file) {
            onFileUpload(file)
            setUploadSuccess(true)
            setTimeout(() => setUploadSuccess(false), 2000)
        }
        if (event.target.value) {
            event.target.value = ''
        }
    }

    const handleButtonClick = (): void => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type === 'application/json') {
            onFileUpload(file)
            setUploadSuccess(true)
            setTimeout(() => setUploadSuccess(false), 2000)
        }
    }

    return (
        <Box
            className="animate-fadeIn glass-card"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                p: 6,
                border: isDragging
                    ? `3px dashed ${DesignTokens.colors.primary.main}`
                    : `1px solid rgba(255, 255, 255, 0.6)`,
                borderRadius: DesignTokens.borderRadius.xl,
                // Background handled by glass-card, but added overlap for drag state
                background: isDragging
                    ? 'rgba(33, 150, 243, 0.05)'
                    : undefined,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    borderColor: DesignTokens.colors.primary.light,
                    transform: 'translateY(-4px)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
        >
            <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Animated Icon */}
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: uploadSuccess
                        ? DesignTokens.colors.semantic.success
                        : DesignTokens.colors.primary.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: DesignTokens.shadows.lg,
                    transition: DesignTokens.transitions.normal,
                    animation: isLoading ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
                className={isDragging ? 'animate-pulse' : ''}
            >
                {uploadSuccess ? (
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
                ) : (
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'white' }} />
                )}
            </Box>

            {/* Text Content */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    {uploadSuccess ? 'Uppladdning Lyckades!' : 'Ladda upp Tävlingsdata'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {isDragging ? 'Släpp filen här' : 'Dra och släpp din JSON-fil här'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    eller klicka för att bläddra
                </Typography>
            </Box>

            {/* Upload Button */}
            {!isLoading && !uploadSuccess && (
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                        borderRadius: DesignTokens.borderRadius.md,
                        px: 4,
                        py: 1.5,
                        background: DesignTokens.colors.primary.gradient,
                        '&:hover': {
                            background: DesignTokens.colors.primary.gradient,
                            filter: 'brightness(1.1)',
                        }
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleButtonClick()
                    }}
                >
                    Välj fil
                </Button>
            )}

            {isLoading && (
                <Typography variant="body2" color="primary" fontWeight={500}>
                    Bearbetar fil...
                </Typography>
            )}

            {/* File Type Hint */}
            <Typography variant="caption" color="text.disabled">
                Format som stöds: .json
            </Typography>
        </Box>
    )
}
