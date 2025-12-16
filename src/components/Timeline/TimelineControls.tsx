import React from 'react'
import {
    Box,
    IconButton,
    Typography,
    ButtonGroup,
    Button,
} from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import { DesignTokens } from '../../theme/DesignTokens'

interface TimelineControlsProps {
    zoomLevel: number
    onZoomChange: (newZoom: number) => void
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
    zoomLevel,
    onZoomChange,
}): React.ReactElement => {

    const handleZoomIn = () => onZoomChange(Math.min(zoomLevel + 2, 20))
    const handleZoomOut = () => onZoomChange(Math.max(zoomLevel - 2, 2))

    return (
        <Box
            className="animate-fadeIn"
            sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                borderRadius: DesignTokens.borderRadius.xl,
                background: DesignTokens.colors.neutral.surfaceGlass,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${DesignTokens.colors.neutral.border}`,
                boxShadow: DesignTokens.shadows.lg,
                mb: 3,
                flexWrap: 'wrap',
            }}
        >
            {/* Zoom Controls */}
            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mb: 1,
                        fontWeight: 600,
                        color: DesignTokens.colors.text.secondary,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                    }}
                >
                    Zoom
                </Typography>
                <ButtonGroup
                    variant="outlined"
                    size="small"
                    sx={{
                        '& .MuiButton-root': {
                            borderColor: DesignTokens.colors.neutral.border,
                            transition: DesignTokens.transitions.normal,
                            '&:hover': {
                                background: DesignTokens.colors.primary.main + '15',
                                borderColor: DesignTokens.colors.primary.main,
                            }
                        }
                    }}
                >
                    <IconButton
                        onClick={handleZoomOut}
                        size="small"
                        disabled={zoomLevel <= 2}
                        sx={{ borderRadius: 0 }}
                    >
                        <ZoomOutIcon />
                    </IconButton>
                    <Button
                        disabled
                        sx={{
                            minWidth: 60,
                            fontFamily: DesignTokens.typography.fontFamily.mono,
                            fontWeight: 600,
                        }}
                    >
                        {zoomLevel}x
                    </Button>
                    <IconButton
                        onClick={handleZoomIn}
                        size="small"
                        disabled={zoomLevel >= 20}
                        sx={{ borderRadius: 0 }}
                    >
                        <ZoomInIcon />
                    </IconButton>
                </ButtonGroup>
            </Box>

        </Box>
    )
}
