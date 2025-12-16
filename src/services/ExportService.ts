import { Schedule } from '../types'

export class ExportService {

    /**
     * Triggers a browser download for the given data/filename
     */
    private static triggerDownload(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    /**
     * Exports schedule as JSON
     */
    static exportToJSON(schedule: Schedule, filename: string = 'schedule.json') {
        const jsonStr = JSON.stringify(schedule, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        this.triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`)
    }

    /**
     * Exports schedule as CSV
     */
    static exportToCSV(schedule: Schedule, filename: string = 'schedule.csv') {
        // Headers
        const headers = ['Date', 'Start Time', 'End Time', 'Class', 'Type', 'Group', 'Name', 'Duration (min)']

        // Rows
        const rows = schedule.sessions.map(s => {
            const date = new Date(s.startTime).toLocaleDateString()
            const start = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const end = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const duration = Math.round(s.duration / 60)

            // CSV Safe strings (escape quotes)
            const safeName = `"${(s.name || '').replace(/"/g, '""')}"`
            const safeClass = `"${(s.className || '').replace(/"/g, '""')}"`

            return [
                date,
                start,
                end,
                safeClass,
                s.type,
                s.groupId || '',
                safeName,
                duration
            ].join(',')
        })

        const csvContent = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        this.triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
    }

    /**
     * Triggers the browser print dialog
     */
    static printSchedule() {
        window.print()
    }
}
