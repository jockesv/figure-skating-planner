import { ScheduleSession } from '../types'

export const detectConflicts = (sessions: ScheduleSession[]): string[] => {
    if (!sessions || sessions.length < 2) return []

    // Sort by start time
    const sorted = [...sessions].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    const conflicts = new Set<string>()

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i]
        // Check subsequent sessions for overlap
        // We need to check more than just the immediate next one because a long session could overlap multiple short ones
        for (let j = i + 1; j < sorted.length; j++) {
            const next = sorted[j]

            // Optimization: If next starts after current ends, no overlap possible with this current, and since sorted, no further overlap with current
            if (new Date(next.startTime).getTime() >= new Date(current.endTime).getTime()) {
                break
            }

            // Overlap found
            conflicts.add(current.id)
            conflicts.add(next.id)
        }
    }

    return Array.from(conflicts)
}
