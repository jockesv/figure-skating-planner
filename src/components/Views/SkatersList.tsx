import React, { useMemo, useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import GroupsIcon from '@mui/icons-material/Groups'
import CakeIcon from '@mui/icons-material/Cake'
import BusinessIcon from '@mui/icons-material/Business'
import { CompetitionData, Person } from '../../types'
import { DesignTokens } from '../../theme/DesignTokens'

import { Tooltip, Switch, TableSortLabel } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { toggleExcludedClass, toggleScratchedSkater } from '../../store/competitionSlice'

interface SkatersListProps {
    data: CompetitionData | null
}

export const SkatersList: React.FC<SkatersListProps> = ({ data }) => {
    const dispatch = useAppDispatch()
    const { excludedClassIds, scratchedSkaterIds } = useAppSelector(state => state.competition)
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    // 1. Extract all classes and their skater counts
    const classes = useMemo(() => {
        if (!data) return []
        const list: { id: string; name: string; count: number; skaters: Person[] }[] = []

        data.event.competitions.forEach(comp => {
            comp.classes.forEach(cls => {
                // Skaters are nested in groups
                const skaters: Person[] = []
                cls.groups.forEach(g => {
                    skaters.push(...g.persons)
                })

                // Add class to list
                list.push({
                    id: cls.id,
                    name: cls.name,
                    count: skaters.length,
                    skaters: skaters
                })
            })
        })
        return list
    }, [data])

    // Select first class by default if none selected
    useMemo(() => {
        if (!selectedClassId && classes.length > 0) {
            setSelectedClassId(classes[0].id)
        }
    }, [classes, selectedClassId])

    const selectedClass = classes.find(c => c.id === selectedClassId)

    const calculateAge = (birthDate: Date | string) => {
        if (!birthDate) return 'N/A'
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedSkaters = useMemo(() => {
        if (!selectedClass) return []
        let skaters = [...selectedClass.skaters]
        if (sortConfig) {
            skaters.sort((a, b) => {
                let aValue: any = ''
                let bValue: any = ''

                if (sortConfig.key === 'name') {
                    aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
                    bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
                } else if (sortConfig.key === 'club') {
                    aValue = (a.organization?.name || '').toLowerCase()
                    bValue = (b.organization?.name || '').toLowerCase()
                } else if (sortConfig.key === 'age') {
                    aValue = calculateAge(a.birthDate)
                    bValue = calculateAge(b.birthDate)
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }
        return skaters
    }, [selectedClass, sortConfig])

    if (!data) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <GroupsIcon sx={{ fontSize: 64, color: DesignTokens.colors.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Ingen tävlingsdata tillgänglig
                </Typography>
            </Box>
        )
    }

    return (
        <Paper
            elevation={0}
            className="animate-fadeIn"
            sx={{
                display: 'flex',
                height: '700px',
                overflow: 'hidden',
                borderRadius: DesignTokens.borderRadius.xl,
                border: `1px solid ${DesignTokens.colors.neutral.border}`,
                boxShadow: DesignTokens.shadows.lg,
            }}
        >
            {/* Left Sidebar: Class List */}
            <Box sx={{
                width: '280px',
                borderRight: `1px solid ${DesignTokens.colors.neutral.border}`,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: DesignTokens.colors.neutral.background,
            }}>
                {/* Sidebar Header */}
                <Box sx={{
                    p: 2.5,
                    background: DesignTokens.colors.primary.gradient,
                    color: 'white',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <GroupsIcon sx={{ fontSize: 28 }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700}>
                                Åkare per Klass
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Lista över alla deltagare
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Class List */}
                <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                    {classes.map((cls) => {
                        const isExcluded = excludedClassIds.includes(cls.id)
                        return (
                            <ListItem
                                key={cls.id}
                                disablePadding
                                secondaryAction={
                                    <Tooltip title={isExcluded ? "Aktivera klass" : "Stryk klass"}>
                                        <Switch
                                            checked={!isExcluded}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                dispatch(toggleExcludedClass(cls.id))
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            size="small"
                                            color="primary"
                                        />
                                    </Tooltip>
                                }
                                sx={{ mb: 0.5 }}
                            >
                                <ListItemButton
                                    selected={selectedClassId === cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    sx={{
                                        pr: 8, // Increase padding to avoid overlap with switch and create gap
                                        borderRadius: DesignTokens.borderRadius.md,
                                        opacity: isExcluded ? 0.6 : 1, // Dim if excluded
                                        filter: isExcluded ? 'grayscale(100%)' : 'none',
                                        '&.Mui-selected': {
                                            background: DesignTokens.colors.primary.gradient,
                                            color: 'white',
                                            '&:hover': {
                                                background: DesignTokens.colors.primary.gradient,
                                                filter: 'brightness(1.1)',
                                            }
                                        },
                                        '&:hover': {
                                            bgcolor: DesignTokens.colors.neutral.border,
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} display="block">
                                                    {cls.name.split(' - ')[0]}
                                                </Typography>
                                                {cls.name.includes(' - ') && (
                                                    <Typography
                                                        variant="caption"
                                                        display="block"
                                                        sx={{
                                                            mt: 0,
                                                            color: selectedClassId === cls.id ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                                            lineHeight: 1.2
                                                        }}
                                                    >
                                                        {cls.name.split(' - ').slice(1).join(' - ')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <Chip
                                        label={cls.count}
                                        size="small"
                                        sx={{
                                            ml: 1,
                                            mr: 2, // Add gap between chip and switch
                                            minWidth: 40,
                                            fontWeight: 700,
                                            bgcolor: selectedClassId === cls.id ? 'rgba(255,255,255,0.2)' : DesignTokens.colors.primary.main + '20',
                                            color: selectedClassId === cls.id ? 'white' : DesignTokens.colors.primary.dark,
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Box>

            {/* Right Panel: Skater Details */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                {/* Header */}
                {selectedClass && (
                    <Box sx={{
                        p: 3,
                        borderBottom: `1px solid ${DesignTokens.colors.neutral.border}`,
                        background: `linear-gradient(135deg, ${DesignTokens.colors.neutral.background} 0%, white 100%)`,
                    }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {selectedClass.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Chip
                                icon={<PersonIcon />}
                                label={`${selectedClass.count} Åkare`}
                                sx={{
                                    fontWeight: 600,
                                    background: DesignTokens.colors.primary.gradient,
                                    color: 'white',
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Table */}
                <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                    {selectedClass && (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {/* Name Column */}
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: DesignTokens.colors.neutral.background,
                                            borderBottom: `2px solid ${DesignTokens.colors.primary.main}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSort('name')}
                                    >
                                        <TableSortLabel
                                            active={sortConfig?.key === 'name'}
                                            direction={sortConfig?.key === 'name' ? sortConfig.direction : 'asc'}
                                        >
                                            Namn
                                        </TableSortLabel>
                                    </TableCell>

                                    {/* Club Column */}
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: DesignTokens.colors.neutral.background,
                                            borderBottom: `2px solid ${DesignTokens.colors.primary.main}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSort('club')}
                                    >
                                        <TableSortLabel
                                            active={sortConfig?.key === 'club'}
                                            direction={sortConfig?.key === 'club' ? sortConfig.direction : 'asc'}
                                        >
                                            Förening
                                        </TableSortLabel>
                                    </TableCell>

                                    {/* Age Column */}
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: DesignTokens.colors.neutral.background,
                                            borderBottom: `2px solid ${DesignTokens.colors.primary.main}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSort('age')}
                                    >
                                        <TableSortLabel
                                            active={sortConfig?.key === 'age'}
                                            direction={sortConfig?.key === 'age' ? sortConfig.direction : 'asc'}
                                        >
                                            Ålder
                                        </TableSortLabel>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedSkaters.map((skater, index) => {
                                    const isScratched = scratchedSkaterIds.includes(skater.id)
                                    return (
                                        <TableRow
                                            key={`${skater.id}-${index}`}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: DesignTokens.colors.neutral.background,
                                                },
                                                transition: DesignTokens.transitions.fast,
                                                opacity: isScratched ? 0.5 : 1,
                                                bgcolor: isScratched ? 'rgba(0,0,0,0.02)' : 'inherit'
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon sx={{ color: isScratched ? DesignTokens.colors.text.disabled : DesignTokens.colors.text.secondary, fontSize: 20 }} />
                                                    <Typography fontWeight={600} sx={{ textDecoration: isScratched ? 'line-through' : 'none' }}>
                                                        {skater.firstName} {skater.lastName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <BusinessIcon sx={{ color: DesignTokens.colors.text.secondary, fontSize: 18 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {skater.organization?.name || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Chip
                                                        icon={<CakeIcon />}
                                                        label={calculateAge(skater.birthDate)}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            bgcolor: DesignTokens.colors.accent.main + '20',
                                                            color: DesignTokens.colors.accent.dark,
                                                            minWidth: '60px',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                    />
                                                    <Tooltip title={isScratched ? "Aktivera åkare" : "Stryk åkare"}>
                                                        <Switch
                                                            checked={!isScratched}
                                                            onChange={() => dispatch(toggleScratchedSkater(skater.id))}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Empty State */}
                {!selectedClass && (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        p: 4,
                    }}>
                        <Box>
                            <GroupsIcon sx={{ fontSize: 64, color: DesignTokens.colors.text.disabled, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Ingen klass vald
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Välj en klass från listan för att se åkare
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}
