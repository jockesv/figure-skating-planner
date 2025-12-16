import React from 'react'
import { Paper, Typography, Box, Alert, Grid, Card, CardContent } from '@mui/material'
import { CompetitionData, CompetitionClass } from '../../types'
import { DesignTokens } from '../../theme/DesignTokens'
import PeopleIcon from '@mui/icons-material/People'
import CategoryIcon from '@mui/icons-material/Category'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BusinessIcon from '@mui/icons-material/Business'

interface ImportSummaryProps {
    data: CompetitionData | null
    error: string | null
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({ data, error }) => {
    if (error) {
        return (
            <Alert
                severity="error"
                sx={{
                    mt: 3,
                    borderRadius: DesignTokens.borderRadius.lg,
                    boxShadow: DesignTokens.shadows.md,
                }}
            >
                {error}
            </Alert>
        )
    }

    if (!data) {
        return null
    }

    const { event } = data
    const totalCompetitions = event.competitions.length

    // Calculate totals
    let totalClasses = 0
    let totalSkaters = 0
    let totalOfficials = 0

    event.competitions.forEach((comp: CompetitionClass) => {
        totalClasses += comp.classes.length
        if (comp.officials) {
            totalOfficials += comp.officials.length
        }
        comp.classes.forEach(cls => {
            if (cls.groups) {
                cls.groups.forEach(group => {
                    totalSkaters += group.persons.length
                })
            }
            if (cls.reserves) {
                totalSkaters += cls.reserves.length
            }
        })
    })

    const stats = [
        { label: 'Totalt Antal Åkare', value: totalSkaters, icon: PeopleIcon, color: DesignTokens.colors.primary.main },
        { label: 'Klasser', value: totalClasses, icon: CategoryIcon, color: DesignTokens.colors.secondary.main },
        { label: 'Tävlingar', value: totalCompetitions, icon: EmojiEventsIcon, color: DesignTokens.colors.accent.main },
    ]

    return (
        <Box className="animate-slideIn" sx={{ mt: 4 }}>
            {/* Header Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: DesignTokens.borderRadius.xl,
                    background: DesignTokens.colors.neutral.surfaceGlass,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${DesignTokens.colors.neutral.border}`,
                    boxShadow: DesignTokens.shadows.lg,
                    mb: 3,
                }}
            >
                {/* Event Title */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: DesignTokens.borderRadius.lg,
                            background: DesignTokens.colors.primary.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <EmojiEventsIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            {event.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 18, color: DesignTokens.colors.text.secondary }} />
                                <Typography variant="body2" color="text.secondary">
                                    {event.location}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BusinessIcon sx={{ fontSize: 18, color: DesignTokens.colors.text.secondary }} />
                                <Typography variant="body2" color="text.secondary">
                                    {event.organizer.name}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <Grid item xs={12} sm={4} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        backdropFilter: 'blur(5px)',
                                        border: `1px solid ${DesignTokens.colors.neutral.borderLight}`,
                                        borderRadius: DesignTokens.borderRadius.lg,
                                        transition: DesignTokens.transitions.normal,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: DesignTokens.shadows.md,
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: DesignTokens.borderRadius.md,
                                                    background: `${stat.color}15`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Icon sx={{ fontSize: 24, color: stat.color }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h3" fontWeight={700} color={stat.color}>
                                                    {stat.value}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </Paper>

            {/* Success Alert */}
            <Alert
                severity="success"
                icon={false}
                sx={{
                    borderRadius: DesignTokens.borderRadius.lg,
                    background: `${DesignTokens.colors.semantic.success}15`,
                    border: `1px solid ${DesignTokens.colors.semantic.success}30`,
                    '& .MuiAlert-message': {
                        width: '100%',
                        textAlign: 'center',
                    }
                }}
            >
                <Typography variant="body1" fontWeight={600} color={DesignTokens.colors.semantic.success}>
                    ✓ Tävlingsdata importerad! Konfigurera inställningarna nedan för att fortsätta.
                </Typography>
            </Alert>
        </Box>
    )
}
