import React, { useMemo } from 'react'
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import GroupsIcon from '@mui/icons-material/Groups'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import { ScheduleSession } from '../../types'
import { DesignTokens } from '../../theme/DesignTokens'

interface ScheduleOverviewProps {
    sessions: ScheduleSession[]
}

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({ sessions }) => {

    // Process Data
    const { rows } = useMemo(() => {
        const sorted = [...sessions].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

        // 1. Group by Day
        const daysMap = new Map<string, ScheduleSession[]>()
        sorted.forEach(s => {
            const dayKey = s.startTime.toLocaleDateString('sv-SE')
            if (!daysMap.has(dayKey)) daysMap.set(dayKey, [])
            daysMap.get(dayKey)?.push(s)
        })

        // 2. Pre-calculate Class Stats per Day
        const classStats = new Map<string, { start: Date; end: Date; count: number; name: string }>()

        sorted.forEach(s => {
            if (s.classId && s.type !== 'resurfacing' && s.type !== 'break') {
                const key = `${s.startTime.toLocaleDateString('sv-SE')}_${s.classId}`
                if (!classStats.has(key)) {
                    classStats.set(key, {
                        start: s.startTime,
                        end: s.endTime,
                        count: 0,
                        name: s.className || 'Unknown'
                    })
                }
                const stat = classStats.get(key)!
                if (s.endTime > stat.end) stat.end = s.endTime
                if (s.startTime < stat.start) stat.start = s.startTime
                if (s.type === 'performance') stat.count++
            }
        })

        // 3. Build Rows
        const resultRows: any[] = []

        for (const [day, daySessions] of daysMap.entries()) {
            resultRows.push({ type: 'day-header', date: day })

            for (let i = 0; i < daySessions.length; i++) {
                const s = daySessions[i]

                // Skip Prep (invisible buffer) details in overview
                if (s.name === '(Förb.)') continue

                // Handle Breaks
                if (s.type === 'resurfacing' || s.type === 'break') {
                    resultRows.push({
                        type: 'break',
                        startTime: s.startTime,
                        endTime: s.endTime,
                        name: s.name || (s.type === 'resurfacing' ? 'Ice Resurfacing' : 'Break'),
                        sessionType: s.type,
                    })
                    continue
                }

                // Handle Class Groups
                if (s.type === 'warmup') {
                    const classKey = `${day}_${s.classId}`
                    const stats = classStats.get(classKey)

                    if (stats && s.startTime.getTime() === stats.start.getTime()) {
                        resultRows.push({
                            type: 'class-header',
                            startTime: stats.start,
                            endTime: stats.end,
                            count: stats.count,
                            name: stats.name
                        })
                    }

                    // Count skaters in this specific group
                    let groupCount = 0
                    for (let j = i + 1; j < daySessions.length; j++) {
                        const next = daySessions[j]
                        if (next.type === 'performance' && next.groupId === s.groupId && next.classId === s.classId) {
                            groupCount++
                        }
                        if (next.type === 'warmup' || next.type === 'resurfacing') break
                        if (next.type === 'break' && next.groupId !== s.groupId) break
                    }

                    resultRows.push({
                        type: 'group',
                        startTime: s.startTime,
                        count: groupCount,
                        name: s.name || `Warmup Group - ${s.groupId}`
                    })
                }
            }
        }

        return { rows: resultRows, days: Array.from(daysMap.keys()) }

    }, [sessions])

    if (sessions.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <CalendarMonthIcon sx={{ fontSize: 64, color: DesignTokens.colors.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Ingen schemadata tillgänglig
                </Typography>
            </Box>
        )
    }

    return (
        <Paper
            elevation={0}
            className="animate-fadeIn"
            sx={{
                borderRadius: DesignTokens.borderRadius.xl,
                border: `1px solid ${DesignTokens.colors.neutral.border}`,
                boxShadow: DesignTokens.shadows.lg,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 3,
                background: DesignTokens.colors.primary.gradient,
                color: 'white',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: 28 }} />
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Översikt
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Detaljerad tidslinje för alla sessioner
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer>
                <Table size="medium">
                    <TableHead>
                        <TableRow sx={{ bgcolor: DesignTokens.colors.neutral.background }}>
                            <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${DesignTokens.colors.primary.main}` }}>
                                Start
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${DesignTokens.colors.primary.main}` }}>
                                Slut
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${DesignTokens.colors.primary.main}` }}>
                                Antal
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, borderBottom: `2px solid ${DesignTokens.colors.primary.main}` }}>
                                Beskrivning
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => {
                            if (row.type === 'day-header') {
                                return (
                                    <TableRow key={idx}>
                                        <TableCell
                                            colSpan={4}
                                            sx={{
                                                py: 2.5,
                                                background: `linear-gradient(135deg, ${DesignTokens.colors.neutral.background} 0%, white 100%)`,
                                                borderTop: `3px solid ${DesignTokens.colors.primary.main}`,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarMonthIcon sx={{ color: DesignTokens.colors.primary.main }} />
                                                <Typography variant="h6" fontWeight={700}>
                                                    {(() => {
                                                        const dateStr = new Date(row.date).toLocaleDateString('sv-SE', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        });
                                                        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                                                    })()}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            if (row.type === 'class-header') {
                                return (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            bgcolor: DesignTokens.colors.primary.main + '10',
                                            '&:hover': {
                                                bgcolor: DesignTokens.colors.primary.main + '20',
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon sx={{ fontSize: 18, color: DesignTokens.colors.primary.dark }} />
                                                <Typography fontWeight={700} fontFamily={DesignTokens.typography.fontFamily.mono}>
                                                    {formatTime(row.startTime)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={700} fontFamily={DesignTokens.typography.fontFamily.mono}>
                                                {formatTime(row.endTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.count}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    minWidth: 40,
                                                    background: DesignTokens.colors.primary.gradient,
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <GroupsIcon sx={{ color: DesignTokens.colors.primary.dark }} />
                                                <Typography fontWeight={700} color="primary">
                                                    {row.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            if (row.type === 'group') {
                                return (
                                    <TableRow
                                        key={idx}
                                        hover
                                        sx={{
                                            transition: DesignTokens.transitions.fast,
                                            '&:hover': {
                                                bgcolor: DesignTokens.colors.neutral.background,
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ pl: 5 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontFamily={DesignTokens.typography.fontFamily.mono}
                                            >
                                                {formatTime(row.startTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.count}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600,
                                                    minWidth: 40,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.name}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            if (row.type === 'break') {
                                const isResurfacing = row.sessionType === 'resurfacing'
                                const bgColor = isResurfacing
                                    ? DesignTokens.colors.sessions.resurfacing.main + '30'
                                    : DesignTokens.colors.sessions.break.main + '30'
                                const textColor = isResurfacing
                                    ? DesignTokens.colors.sessions.resurfacing.dark
                                    : DesignTokens.colors.sessions.break.dark
                                const Icon = isResurfacing ? CleaningServicesIcon : LocalCafeIcon

                                return (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            bgcolor: bgColor,
                                            '&:hover': {
                                                filter: 'brightness(0.95)',
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography
                                                fontWeight={600}
                                                fontFamily={DesignTokens.typography.fontFamily.mono}
                                                sx={{ color: textColor }}
                                            >
                                                {formatTime(row.startTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                fontWeight={600}
                                                fontFamily={DesignTokens.typography.fontFamily.mono}
                                                sx={{ color: textColor }}
                                            >
                                                {formatTime(row.endTime)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Icon sx={{ color: textColor }} />
                                                <Typography fontWeight={600} sx={{ color: textColor }}>
                                                    {row.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            return null
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}
