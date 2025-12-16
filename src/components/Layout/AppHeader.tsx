import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { DesignTokens } from '../../theme/DesignTokens'

interface AppHeaderProps {
    title?: string
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title = 'Figure Skating Planner' }) => {
    return (
        <Box
            className="no-print"
            sx={{
                background: 'rgba(33, 150, 243, 0.85)', // Primary color but translucent
                backdropFilter: 'blur(12px)',
                color: 'white',
                py: 3,
                px: 2,
                boxShadow: DesignTokens.shadows.lg,
                position: 'sticky',
                top: 0,
                zIndex: DesignTokens.zIndex.sticky,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Icon/Logo */}
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: DesignTokens.borderRadius.lg,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                        }}
                    >
                        ⛸️
                    </Box>

                    {/* Title */}
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.5px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: 'white', letterSpacing: '0.02em' }}>
                            Verktyg för Tävlingsplanering
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
