import React, { useMemo, useState } from 'react'
import { Box, Typography, Tooltip, Paper } from '@mui/material'
import { ScheduleSession } from '../../types'
import { DesignTokens } from '../../theme/DesignTokens'
import { SessionDetailsDialog } from './SessionDetailsDialog'

interface TimelineProps {
    sessions: ScheduleSession[]
    zoomLevel: number // 1, 2, 3
    startTime?: Date
    filter?: string
    onSessionClick?: (session: ScheduleSession) => void
    conflicts?: string[]
}

// Simple Block Component for display
interface BlockProps {
    left: number
    width: number
    top?: number
    height?: number | string
    children: React.ReactNode
}

const SimpleBlock = ({ left, width, top = 0, height = '80px', children }: BlockProps) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: left,
        top: top,
        width: width,
        height: height,
        borderRadius: parseInt(DesignTokens.borderRadius.md),
    }

    return (
        <div style={style}>
            {children}
        </div>
    )
}

// Prepare Render Blocks Type
type RenderBlock =
    | { type: 'single'; session: ScheduleSession; id: string }
    | { type: 'group'; sessions: ScheduleSession[]; className: string; classId: string; startTime: Date; endTime: Date; id: string }

// Session type colors from design tokens
const getSessionColors = (type: string) => {
    switch (type) {
        case 'warmup':
            return {
                gradient: DesignTokens.colors.sessions.warmup.gradient,
                main: DesignTokens.colors.sessions.warmup.main,
                dark: DesignTokens.colors.sessions.warmup.dark,
            }
        case 'performance':
            return {
                gradient: DesignTokens.colors.sessions.performance.gradient,
                main: DesignTokens.colors.sessions.performance.main,
                dark: DesignTokens.colors.sessions.performance.dark,
            }
        case 'break':
            return {
                gradient: DesignTokens.colors.sessions.break.gradient,
                main: DesignTokens.colors.sessions.break.main,
                dark: DesignTokens.colors.sessions.break.dark,
            }
        case 'resurfacing':
            return {
                gradient: DesignTokens.colors.sessions.resurfacing.gradient,
                main: DesignTokens.colors.sessions.resurfacing.main,
                dark: DesignTokens.colors.sessions.resurfacing.dark,
            }
        default:
            return {
                gradient: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                main: '#e0e0e0',
                dark: '#bdbdbd',
            }
    }
}

// Get consistent color for a class based on class name
// Color-named classes (vit, gul, grön, blå, röd, grå, svart) get their actual colors
// Same base class (e.g., "Junior Damer") gets same color for both programs
const getClassColor = (className: string): { gradient: string; main: string; dark: string; textColor?: string } => {
    // Remove program type suffix to get base class name
    const baseClassName = className
        .replace(/ - Kortprogram$/i, '')
        .replace(/ - Friåkning$/i, '')
        .replace(/ - Short Program$/i, '')
        .replace(/ - Free Skating$/i, '')

    const lowerName = baseClassName.toLowerCase()

    // Color-named classes get their actual colors
    // Check for exact color matches first
    if (lowerName.includes('vit')) {
        return {
            main: '#F5F5F5',
            dark: '#E0E0E0',
            gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
            textColor: '#424242' // Dark text for light background
        }
    }
    if (lowerName.includes('gul')) {
        return {
            main: '#FFEB3B',
            dark: '#FBC02D',
            gradient: 'linear-gradient(135deg, #FFEB3B 0%, #FDD835 100%)',
            textColor: '#424242' // Dark text for yellow
        }
    }
    if (lowerName.includes('grön')) {
        return {
            main: '#4CAF50',
            dark: '#388E3C',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
        }
    }
    if (lowerName.includes('blå')) {
        return {
            main: '#2196F3',
            dark: '#1976D2',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
        }
    }
    if (lowerName.includes('röd')) {
        return {
            main: '#F44336',
            dark: '#D32F2F',
            gradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)'
        }
    }
    if (lowerName.includes('grå')) {
        return {
            main: '#9E9E9E',
            dark: '#757575',
            gradient: 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)'
        }
    }
    if (lowerName.includes('svart')) {
        return {
            main: '#424242',
            dark: '#212121',
            gradient: 'linear-gradient(135deg, #424242 0%, #616161 100%)'
        }
    }

    // Color palette for non-color-named classes
    // Avoid colors already used by color classes (yellow, green, blue, red, gray, black, white)
    const colorPalette = [
        { main: '#9C27B0', dark: '#7B1FA2', gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)' }, // Purple
        { main: '#FF9800', dark: '#F57C00', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' }, // Orange
        { main: '#00BCD4', dark: '#0097A7', gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)' }, // Cyan
        { main: '#E91E63', dark: '#C2185B', gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)' }, // Pink
        { main: '#3F51B5', dark: '#303F9F', gradient: 'linear-gradient(135deg, #3F51B5 0%, #7986CB 100%)' }, // Indigo
        { main: '#009688', dark: '#00796B', gradient: 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)' }, // Teal
        { main: '#FF5722', dark: '#E64A19', gradient: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)' }, // Deep Orange
        { main: '#795548', dark: '#5D4037', gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)' }, // Brown
        { main: '#673AB7', dark: '#512DA8', gradient: 'linear-gradient(135deg, #673AB7 0%, #9575CD 100%)' }, // Deep Purple
        { main: '#03A9F4', dark: '#0288D1', gradient: 'linear-gradient(135deg, #03A9F4 0%, #4FC3F7 100%)' }, // Light Blue
        { main: '#8BC34A', dark: '#689F38', gradient: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)' }, // Light Green
        { main: '#FFC107', dark: '#FFA000', gradient: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)' }, // Amber
    ]

    // Simple hash function to generate consistent index
    let hash = 0
    for (let i = 0; i < baseClassName.length; i++) {
        hash = ((hash << 5) - hash) + baseClassName.charCodeAt(i)
        hash = hash & hash // Convert to 32bit integer
    }

    const index = Math.abs(hash) % colorPalette.length
    return colorPalette[index]
}


export const Timeline: React.FC<TimelineProps> = ({
    sessions,
    zoomLevel,
}): React.ReactElement | null => {
    // Popup State
    const [selectedBlock, setSelectedBlock] = useState<{
        sessions: ScheduleSession[],
        className: string,
        groupId?: number
    } | null>(null)

    // 1. Group sessions by Day
    const sessionsByDay = useMemo(() => {
        const map = new Map<string, ScheduleSession[]>()

        sessions.forEach(s => {
            if (!s.startTime) return
            const start = s.startTime instanceof Date ? s.startTime : new Date(s.startTime)
            // Use local time for date string to prevent timezone offsets shifting early sessions to previous day
            const year = start.getFullYear()
            const month = String(start.getMonth() + 1).padStart(2, '0')
            const day = String(start.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`

            if (!map.has(dateStr)) map.set(dateStr, [])
            map.get(dateStr)!.push(s)
        })

        // Sort keys
        const sortedKeys = Array.from(map.keys()).sort()
        return sortedKeys.map(k => {
            const daySessions = map.get(k)!
            daySessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            return { date: k, sessions: daySessions }
        })
    }, [sessions])

    // 2. Determine Time Bounds per Day
    const dayBounds = useMemo(() => {
        if (sessions.length === 0) return { startHour: 8, endHour: 20 }
        let minHour = 8
        let maxHour = 20

        sessions.forEach(s => {
            const start = new Date(s.startTime)
            const end = new Date(s.endTime)
            if (start.getHours() < minHour) minHour = start.getHours()
            if (end.getHours() >= maxHour) maxHour = end.getHours() + 1
        })

        return { startHour: minHour, endHour: maxHour }
    }, [sessions])

    // Calculate total minutes in the view with proper scaling
    const totalMinutes = (dayBounds.endHour - dayBounds.startHour) * 60
    // Much wider pixels per minute for better zoom
    const pixelsPerMinute = zoomLevel // zoomLevel directly maps to pixels per minute (2-20)
    const containerWidth = totalMinutes * pixelsPerMinute

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    }

    // Helper to get position relative to Day Start
    const getPosition = (time: Date) => {
        const hour = time.getHours()
        const minute = time.getMinutes()
        const totalMin = (hour - dayBounds.startHour) * 60 + minute
        return totalMin * pixelsPerMinute
    }

    // We need to compute blocks for ALL days to build the sortable list
    const dayRenderBlocks = useMemo(() => {
        const dayRenderBlocks: Record<string, RenderBlock[]> = {}

        sessionsByDay.forEach(dayGroup => {
            const blocks: RenderBlock[] = []
            // Explicitly define type to avoid 'never' inference
            type GroupAccumulator = { sessions: ScheduleSession[]; className: string; classId: string }
            let currentGroup: GroupAccumulator | null = null

            const getGroupBounds = (sessions: ScheduleSession[]) => {
                let min = new Date(sessions[0].startTime).getTime()
                let max = new Date(sessions[0].endTime).getTime()
                sessions.forEach(s => {
                    const start = new Date(s.startTime).getTime()
                    const end = new Date(s.endTime).getTime()
                    if (start < min) min = start
                    if (end > max) max = end
                })
                return { start: new Date(min), end: new Date(max) }
            }

            dayGroup.sessions.forEach((session) => {
                const isGroupable = session.type === 'warmup' ||
                    session.type === 'performance' ||
                    (session.type === 'break' && session.name === '(Förb.)')

                if (isGroupable) {
                    if (currentGroup && currentGroup.classId === session.classId) {
                        currentGroup.sessions.push(session)
                    } else {
                        if (currentGroup) {
                            const group = currentGroup as GroupAccumulator
                            const { start, end } = getGroupBounds(group.sessions)
                            const blockId = `group-${group.classId}-${start.getTime()}`
                            blocks.push({
                                type: 'group',
                                sessions: group.sessions,
                                className: group.className,
                                classId: group.classId,
                                startTime: start,
                                endTime: end,
                                id: blockId
                            })
                        }
                        currentGroup = { sessions: [session], className: session.className || 'Unknown', classId: session.classId }
                    }
                } else {
                    if (currentGroup) {
                        const group = currentGroup as GroupAccumulator
                        const { start, end } = getGroupBounds(group.sessions)
                        const blockId = `group-${group.classId}-${start.getTime()}`
                        blocks.push({ type: 'group', sessions: group.sessions, className: group.className, classId: group.classId, startTime: start, endTime: end, id: blockId })
                        currentGroup = null
                    }
                    blocks.push({ type: 'single', session, id: session.id })
                    // Single items (Resurfacing) are NOT added to sortableItems to keep them fixed
                }
            })

            if (currentGroup) {
                const group = currentGroup as GroupAccumulator
                const { start, end } = getGroupBounds(group.sessions)
                const blockId = `group-${group.classId}-${start.getTime()}`
                blocks.push({ type: 'group', sessions: group.sessions, className: group.className, classId: group.classId, startTime: start, endTime: end, id: blockId })
            }
            dayRenderBlocks[dayGroup.date] = blocks
        })

        return dayRenderBlocks
    }, [sessionsByDay])

    // Helper Component for Rendering a Block (used in list and overlay)
    const renderBlockContent = (block: RenderBlock) => {
        if (block.type === 'single') return null // Single blocks rendered manually

        const start = block.startTime

        // Group sessions by warmup group
        const warmupGroups = new Map<number | undefined, ScheduleSession[]>()
        block.sessions.forEach(session => {
            if (!warmupGroups.has(session.groupId)) {
                warmupGroups.set(session.groupId, [])
            }
            warmupGroups.get(session.groupId)!.push(session)
        })

        return (
            <>
                {Array.from(warmupGroups.entries()).map(([groupId, allGroupSessions]) => {
                    // Filter out prep sessions for rendering
                    const visibleSessions = allGroupSessions.filter(s => s.name !== '(Förb.)')
                    if (visibleSessions.length === 0) return null

                    // Split into chunks based on time continuity
                    const chunks: ScheduleSession[][] = []
                    let currentChunk: ScheduleSession[] = [visibleSessions[0]]

                    for (let i = 1; i < visibleSessions.length; i++) {
                        const prev = visibleSessions[i - 1]
                        const curr = visibleSessions[i]
                        // Allow tolerance for continuity (e.g. 30s buffer). 
                        // If gap is small (e.g. < 5 mins), treat as one block.
                        if (Math.abs(curr.startTime.getTime() - prev.endTime.getTime()) < 300000) {
                            currentChunk.push(curr)
                        } else {
                            chunks.push(currentChunk)
                            currentChunk = [curr]
                        }
                    }
                    chunks.push(currentChunk)

                    return chunks.map((chunk, chunkIndex) => {
                        // Determine Start/End of this specific visual chunk
                        const chunkStart = new Date(chunk[0].startTime)
                        const lastSession = chunk[chunk.length - 1]
                        const chunkEnd = new Date(lastSession.endTime)

                        const gLeft = (chunkStart.getTime() - start.getTime()) / 60000 * pixelsPerMinute
                        const gDuration = (chunkEnd.getTime() - chunkStart.getTime()) / 60000
                        const gWidth = gDuration * pixelsPerMinute

                        const classColors = getClassColor(block.className)

                        // Truncate class name if needed
                        const displayClassName = block.className.length > 20
                            ? block.className.substring(0, 18) + '...'
                            : block.className

                        return (
                            <Box
                                key={`group-${groupId}-${chunkIndex}-${chunkStart.getTime()}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Make sure to pass ALL sessions for the group (including Prep) to popup
                                    setSelectedBlock({
                                        sessions: allGroupSessions,
                                        className: block.className,
                                        groupId: groupId
                                    })
                                }}
                                sx={{
                                    position: 'absolute',
                                    left: gLeft,
                                    width: Math.max(gWidth, 30),
                                    top: 0,
                                    height: '80px',
                                    background: classColors.gradient,
                                    border: `1px solid ${classColors.dark}30`,
                                    borderRadius: DesignTokens.borderRadius.sm,
                                    overflow: 'hidden',
                                    px: 0.8,
                                    py: 0.5,
                                    boxShadow: DesignTokens.shadows.sm,
                                    transition: DesignTokens.transitions.fast,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: DesignTokens.shadows.lg,
                                        transform: 'scale(1.02)',
                                        zIndex: 10,
                                        filter: 'brightness(1.05)'
                                    }
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        fontWeight: 700,
                                        fontSize: '0.65rem',
                                        color: classColors.textColor || 'white',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        mb: 0.2
                                    }}
                                >
                                    {displayClassName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        fontSize: '0.65rem',
                                        lineHeight: 1.1,
                                        color: classColors.textColor ? `${classColors.textColor}E6` : 'rgba(255,255,255,0.9)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {/* Show (Cont.) if it's the second chunk or later, OR if it's not the first part of a larger group set? 
                                        Actually, "Group X" is fine for both parts if they are distinct. 
                                        But distinguishing is nice. 
                                        If it's the Warmup chunk, just Group X.
                                        If it's the Skaters chunk, maybe Group X (Skaters)? 
                                        User liked "Group X" and "Group X (Cont.)".
                                        Let's use (Cont.) for chunkIndex > 0.
                                    */}
                                    {chunkIndex === 0 ? `Grupp ${groupId}` : `Grupp ${groupId} (Forts.)`}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        fontSize: '0.6rem',
                                        color: classColors.textColor ? `${classColors.textColor}CC` : 'rgba(255,255,255,0.8)',
                                        fontFamily: DesignTokens.typography.fontFamily.mono,
                                        mt: 'auto'
                                    }}
                                >
                                    {formatTime(chunkStart)} - {formatTime(chunkEnd)}
                                </Typography>
                            </Box>
                        )
                    })
                })}
            </>
        )
    }

    if (sessions.length === 0) return null

    return (
        <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Box sx={{ minWidth: containerWidth + 100, position: 'relative' }}>
                {sessionsByDay.map((dayGroup) => (
                    <Paper
                        key={dayGroup.date}
                        elevation={0}
                        className="animate-fadeIn"
                        sx={{
                            mb: 3,
                            p: 2,
                            position: 'relative',
                            minHeight: '120px',
                            borderRadius: DesignTokens.borderRadius.lg,
                            border: `1px solid ${DesignTokens.colors.neutral.border}`,
                            boxShadow: DesignTokens.shadows.md,
                            bgcolor: 'background.paper',
                        }}
                    >
                        {/* Day Header */}
                        <Box
                            sx={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 10,
                                mb: 3,
                                px: 1,
                                py: 1,
                                borderBottom: `2px solid ${DesignTokens.colors.primary.light}`,
                                display: 'inline-block',
                                background: 'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: DesignTokens.borderRadius.sm,
                                pl: '20px' // Add padding to align with timeline
                            }}
                        >
                            <Typography variant="h5" fontWeight={700} color="primary">
                                {(() => {
                                    const dateStr = new Date(dayGroup.date).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                                })()}
                            </Typography>
                        </Box>

                        {/* Time Ticks */}
                        <Box sx={{ position: 'relative', height: '32px', borderBottom: `2px solid ${DesignTokens.colors.neutral.border}`, mb: 2, ml: '20px' }}>
                            {Array.from({ length: dayBounds.endHour - dayBounds.startHour + 1 }).map((_, i) => {
                                const hour = dayBounds.startHour + i
                                const left = i * 60 * pixelsPerMinute
                                return (
                                    <Box
                                        key={hour}
                                        sx={{
                                            position: 'absolute',
                                            left: left,
                                            transform: 'translateX(-50%)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 600,
                                                color: DesignTokens.colors.text.secondary,
                                                fontFamily: DesignTokens.typography.fontFamily.mono,
                                            }}
                                        >
                                            {hour.toString().padStart(2, '0')}:00
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: '1px',
                                                height: '8px',
                                                bgcolor: DesignTokens.colors.neutral.border,
                                                mx: 'auto',
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )
                            })}
                        </Box>

                        {/* Session Blocks */}
                        <Box sx={{ position: 'relative', height: '100px', ml: '20px' }}>
                            {(dayRenderBlocks[dayGroup.date] || []).map((block) => {
                                if (block.type === 'single') {
                                    // Non-draggable Single Block (Resurfacing/Break)
                                    const session = block.session
                                    const start = new Date(session.startTime)
                                    const end = new Date(session.endTime)
                                    const left = getPosition(start)
                                    const width = (session.duration / 60) * pixelsPerMinute

                                    const colors = getSessionColors(session.type)

                                    return (
                                        <Tooltip
                                            key={block.id}
                                            title={`${session.name} (${formatTime(start)} - ${formatTime(end)})`}
                                        >
                                            <Box sx={{
                                                position: 'absolute',
                                                left: left,
                                                width: Math.max(width, 2),
                                                top: 0,
                                                height: '80px',
                                                background: colors.gradient,
                                                border: `1px solid ${colors.dark}`,
                                                boxSizing: 'border-box',
                                                borderRadius: DesignTokens.borderRadius.sm,
                                                overflow: 'hidden',
                                                px: 1,
                                                py: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: DesignTokens.shadows.sm,
                                                transition: DesignTokens.transitions.normal,
                                                cursor: 'pointer',
                                                zIndex: 5,
                                                '&:hover': {
                                                    boxShadow: DesignTokens.shadows.lg,
                                                    transform: 'scale(1.02)',
                                                    zIndex: 15,
                                                }
                                            }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        textAlign: 'center',
                                                        lineHeight: 1.1,
                                                        color: DesignTokens.colors.text.primary,
                                                        textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                                                    }}
                                                >
                                                    {session.name}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )
                                } else {
                                    // Draggable Group Block
                                    const start = block.startTime
                                    const left = getPosition(start)
                                    const durationMin = (block.endTime.getTime() - block.startTime.getTime()) / 60000
                                    const width = durationMin * pixelsPerMinute

                                    return (
                                        <SimpleBlock
                                            key={block.id}
                                            left={left}
                                            width={width}
                                        >
                                            {renderBlockContent(block)}
                                        </SimpleBlock>
                                    )
                                }
                            })}
                        </Box>
                    </Paper>
                ))}
            </Box>
            {/* Session Details Popup */}
            {selectedBlock && (
                <SessionDetailsDialog
                    open={!!selectedBlock}
                    onClose={() => setSelectedBlock(null)}
                    sessions={selectedBlock.sessions}
                    className={selectedBlock.className}
                    groupId={selectedBlock.groupId}
                />
            )}
        </Box>
    )
}
