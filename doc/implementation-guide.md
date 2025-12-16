# Implementation Guide for Figure Skating Competition Planner

This guide provides step-by-step instructions for developers to implement the Figure Skating Competition Schedule Planner application.

## Phase 1: Project Setup (Week 1)

### 1.1 Initialize Project

```bash
# Create React project with TypeScript
npm create vite@latest figure-skating-planner -- --template react-ts

# Navigate to project directory
cd figure-skating-planner

# Install dependencies
npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install dhtmlx-gantt
npm install zod
npm install recharts
npm install lz-string
npm install vitest @testing-library/react @testing-library/jest-dom
npm install eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
npm install prettier
npm install -D @types/node

# Initialize Git repository
git init
```

### 1.2 Configure Project Structure

Create the following directory structure:

```bash
mkdir -p src/{components/{common,gantt,schedule,forms},features/{data-import,scheduling,visualization,configuration,export},hooks,services,store,types,utils,app}
mkdir -p public/{assets,icons}
mkdir -p doc/{stories,technical}
```

### 1.3 Configure Build Tools

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

Create `.eslintrc.json`:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "react-hooks", "@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Phase 2: Core Infrastructure (Week 2)

### 2.1 Set Up Redux Store

Create `src/store/index.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import competitionsReducer from './features/competitions/competitionsSlice'
import schedulesReducer from './features/schedules/schedulesSlice'
import configurationReducer from './features/configuration/configurationSlice'

export const store = configureStore({
  reducer: {
    competitions: competitionsReducer,
    schedules: schedulesReducer,
    configuration: configurationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

Create `src/store/features/competitions/competitionsSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Competition } from '@/types'

interface CompetitionsState {
  currentCompetition: Competition | null
  competitions: Competition[]
  loading: boolean
  error: string | null
}

const initialState: CompetitionsState = {
  currentCompetition: null,
  competitions: [],
  loading: false,
  error: null,
}

const competitionsSlice = createSlice({
  name: 'competitions',
  initialState,
  reducers: {
    setCompetition: (state, action: PayloadAction<Competition>) => {
      state.currentCompetition = action.payload
    },
    addCompetition: (state, action: PayloadAction<Competition>) => {
      state.competitions.push(action.payload)
    },
    updateCompetition: (state, action: PayloadAction<Competition>) => {
      const index = state.competitions.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.competitions[index] = action.payload
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setCompetition, addCompetition, updateCompetition, setLoading, setError } = competitionsSlice.actions
export default competitionsSlice.reducer
```

### 2.2 Define TypeScript Types

Create `src/types/index.ts`:

```typescript
export interface Organization {
  id: string
  name: string
}

export interface District {
  id: string
  name: string
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  birthDate: Date
  sex: 'M' | 'F'
  nationality: string
  organization: Organization
  district: District
  entryDate: Date
  entryId: string
  ppcs: Program[]
}

export interface Program {
  type: 'Kortprogram' | 'Friåkning'
  discipline: string
  ppc: string
  coach: string
  music: MusicInfo
}

export interface MusicInfo {
  title?: string
  compositor?: string
}

export interface Official {
  id: string
  firstName: string
  lastName: string
  role: string
  sex: 'M' | 'F'
  nationality: string
  representing: string
  organization: Organization
  district: District
}

export interface WarmupGroup {
  index: number
  name: string
  persons: Person[]
  officials: Official[]
}

export interface SkatingClass {
  id: string
  name: string
  discipline: string
  type: string
  groups: WarmupGroup[]
  reserves: Person[]
}

export interface CompetitionClass {
  id: string
  name: string
  category: string
  discipline: string
  type: string
  classes: SkatingClass[]
  officials: Official[]
  reserves: Person[]
}

export interface Competition {
  id: string
  name: string
  organizer: Organization
  location: string
  startDate: Date
  endDate: Date
  competitions: CompetitionClass[]
}

export interface ScheduleSession {
  id: string
  type: 'warmup' | 'performance' | 'judging' | 'resurfacing' | 'break'
  startTime: Date
  endTime: Date
  duration: number
  classId: string
  groupId?: number
  dependencies?: string[]
  conflicts?: string[]
}

export interface Schedule {
  id: string
  competitionId: string
  sessions: ScheduleSession[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    totalDuration: number
    efficiency: number
  }
}
```

### 2.3 Create Data Service

Create `src/services/DataService.ts`:

```typescript
import { Competition, Schedule } from '@/types'
import { z } from 'zod'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'

const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  organizer: z.object({
    id: z.string(),
    name: z.string(),
  }),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  competitions: z.array(z.any()),
})

export class DataService {
  private readonly STORAGE_PREFIX = 'figure_skating_'

  async saveCompetition(competition: Competition): Promise<void> {
    try {
      const validated = CompetitionSchema.parse(competition)
      const compressed = compressToUTF16(JSON.stringify(validated))
      localStorage.setItem(
        `${this.STORAGE_PREFIX}competition_${competition.id}`,
        compressed
      )
    } catch (error) {
      console.error('Failed to save competition:', error)
      throw new Error('Invalid competition data')
    }
  }

  async loadCompetition(id: string): Promise<Competition> {
    try {
      const compressed = localStorage.getItem(`${this.STORAGE_PREFIX}competition_${id}`)
      if (!compressed) {
        throw new Error('Competition not found')
      }
      
      const json = decompressFromUTF16(compressed)
      const data = JSON.parse(json)
      return CompetitionSchema.parse(data)
    } catch (error) {
      console.error('Failed to load competition:', error)
      throw new Error('Failed to load competition data')
    }
  }

  async getAllCompetitions(): Promise<Competition[]> {
    const competitions: Competition[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${this.STORAGE_PREFIX}competition_`)) {
        const id = key.replace(`${this.STORAGE_PREFIX}competition_`, '')
        try {
          const competition = await this.loadCompetition(id)
          competitions.push(competition)
        } catch (error) {
          console.error(`Failed to load competition ${id}:`, error)
        }
      }
    }
    
    return competitions.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  }

  async exportToJSON(competition: Competition): Promise<string> {
    return JSON.stringify(competition, null, 2)
  }

  async importFromJSON(jsonString: string): Promise<Competition> {
    try {
      const data = JSON.parse(jsonString)
      return CompetitionSchema.parse(data)
    } catch (error) {
      console.error('Failed to import competition:', error)
      throw new Error('Invalid JSON data')
    }
  }
}
```

## Phase 3: Implement User Stories (Weeks 3-6)

### 3.1 Story 1: Data Import

Create `src/features/data-import/DataImportComponent.tsx`:

```typescript
import React, { useState } from 'react'
import { Button, TextField, Alert, CircularProgress } from '@mui/material'
import { DataService } from '@/services/DataService'
import { Competition } from '@/types'

interface DataImportProps {
  onImportComplete: (competition: Competition) => void
}

export const DataImportComponent: React.FC<DataImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    } else {
      setError('Please select a valid JSON file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const dataService = new DataService()
      const text = await file.text()
      const competition = await dataService.importFromJSON(text)
      onImportComplete(competition)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="data-import">
      <h2>Import Competition Data</h2>
      
      <TextField
        type="file"
        accept=".json"
        onChange={handleFileChange}
        fullWidth
        margin="normal"
        variant="outlined"
      />

      <Button
        onClick={handleImport}
        disabled={!file || loading}
        variant="contained"
        color="primary"
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Import Competition'}
      </Button>

      {error && (
        <Alert severity="error" style={{ marginTop: 16 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" style={{ marginTop: 16 }}>
          Competition imported successfully!
        </Alert>
      )}
    </div>
  )
}
```

### 3.2 Story 2: Basic Scheduling

Create `src/features/scheduling/ScheduleGenerator.ts`:

```typescript
import { Competition, Schedule, ScheduleSession, CompetitionConfig } from '@/types'

export class ScheduleGenerator {
  constructor(private config: CompetitionConfig) {}

  generateSchedule(competition: Competition): Schedule {
    const sessions: ScheduleSession[] = []
    let currentTime = new Date(competition.startDate)

    // Generate warmup sessions
    const warmupSessions = this.generateWarmupGroups(competition, currentTime)
    sessions.push(...warmupSessions)
    currentTime = this.findLatestTime(sessions)

    // Generate performance sessions
    const performanceSessions = this.generatePerformanceSessions(competition, currentTime)
    sessions.push(...performanceSessions)
    currentTime = this.findLatestTime(sessions)

    // Generate ice resurfacing sessions
    const resurfacingSessions = this.generateResurfacingSessions(sessions, currentTime)
    sessions.push(...resurfacingSessions)

    return {
      id: this.generateId(),
      competitionId: competition.id,
      sessions,
      metadata: this.calculateMetadata(sessions)
    }
  }

  private generateWarmupGroups(competition: Competition, startTime: Date): ScheduleSession[] {
    const sessions: ScheduleSession[] = []
    
    for (const compClass of competition.competitions) {
      for (const skatingClass of compClass.classes) {
        const warmupTime = this.config.classSettings[skatingClass.name]?.warmupTime || 60
        const maxGroupSize = this.config.classSettings[skatingClass.name]?.maxGroupSize || 8
        
        // Form groups
        const groups = this.formGroups(skatingClass.persons, maxGroupSize)
        
        for (const group of groups) {
          const session: ScheduleSession = {
            id: this.generateId(),
            type: 'warmup',
            startTime: new Date(startTime),
            endTime: new Date(startTime.getTime() + warmupTime * 60000),
            duration: warmupTime,
            classId: skatingClass.id,
            groupId: group.index
          }
          
          sessions.push(session)
          startTime = new Date(session.endTime)
        }
      }
    }
    
    return sessions
  }

  private generatePerformanceSessions(competition: Competition, startTime: Date): ScheduleSession[] {
    const sessions: ScheduleSession[] = []
    
    for (const compClass of competition.competitions) {
      for (const skatingClass of compClass.classes) {
        // Short program
        if (this.hasShortProgram(skatingClass)) {
          const shortProgramTime = this.config.classSettings[skatingClass.name]?.shortProgram || 180
          
          const session: ScheduleSession = {
            id: this.generateId(),
            type: 'performance',
            startTime: new Date(startTime),
            endTime: new Date(startTime.getTime() + shortProgramTime * 60000),
            duration: shortProgramTime,
            classId: skatingClass.id
          }
          
          sessions.push(session)
          startTime = new Date(session.endTime)
        }
        
        // Free skating
        const freeSkateTime = this.config.classSettings[skatingClass.name]?.freeSkate || 210
        
        const session: ScheduleSession = {
          id: this.generateId(),
          type: 'performance',
          startTime: new Date(startTime),
          endTime: new Date(startTime.getTime() + freeSkateTime * 60000),
          duration: freeSkateTime,
          classId: skatingClass.id
        }
        
        sessions.push(session)
        startTime = new Date(session.endTime)
      }
    }
    
    return sessions
  }

  private generateResurfacingSessions(sessions: ScheduleSession[], startTime: Date): ScheduleSession[] {
    const resurfacingSessions: ScheduleSession[] = []
    const resurfacingTime = this.config.timeSettings.iceResurfacing
    
    // Add resurfacing after every 2 warmup groups
    let groupCount = 0
    for (const session of sessions) {
      if (session.type === 'warmup') {
        groupCount++
        if (groupCount % 2 === 0) {
          const resurfacingSession: ScheduleSession = {
            id: this.generateId(),
            type: 'resurfacing',
            startTime: new Date(startTime),
            endTime: new Date(startTime.getTime() + resurfacingTime * 60000),
            duration: resurfacingTime,
            classId: 'resurfacing'
          }
          
          resurfacingSessions.push(resurfacingSession)
          startTime = new Date(resurfacingSession.endTime)
        }
      }
    }
    
    return resurfacingSessions
  }

  private formGroups(persons: any[], maxGroupSize: number): any[] {
    const groups = []
    let groupIndex = 0
    
    for (let i = 0; i < persons.length; i += maxGroupSize) {
      const group = {
        index: groupIndex++,
        persons: persons.slice(i, i + maxGroupSize)
      }
      groups.push(group)
    }
    
    return groups
  }

  private hasShortProgram(skatingClass: any): boolean {
    return skatingClass.groups.some((group: any) => 
      group.persons.some((person: any) => 
        person.ppcs.some((ppc: any) => ppc.type === 'Kortprogram')
      )
    )
  }

  private findLatestTime(sessions: ScheduleSession[]): Date {
    return sessions.reduce((latest, session) => 
      session.endTime > latest ? session.endTime : latest,
      new Date(0)
    )
  }

  private calculateMetadata(sessions: ScheduleSession[]) {
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0)
    const efficiency = this.calculateEfficiency(sessions)
    
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      totalDuration,
      efficiency
    }
  }

  private calculateEfficiency(sessions: ScheduleSession[]): number {
    // Simple efficiency calculation based on utilization
    const totalScheduledTime = sessions.reduce((sum, session) => sum + session.duration, 0)
    const totalAvailableTime = 24 * 60 // 24 hours in minutes
    return Math.min(100, (totalScheduledTime / totalAvailableTime) * 100)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
```

### 3.3 Story 3: Schedule View

Create `src/features/visualization/GanttChartComponent.tsx`:

```typescript
import React, { useEffect, useRef } from 'react'
import { gantt } from 'dhtmlx-gantt'
import { Schedule, ScheduleSession } from '@/types'
import { Box } from '@mui/material'

interface GanttChartProps {
  schedule: Schedule
  onSessionChange?: (session: ScheduleSession) => void
  zoom?: 'hour' | 'day' | 'week'
}

export const GanttChartComponent: React.FC<GanttChartProps> = ({
  schedule,
  onSessionChange,
  zoom = 'hour'
}) => {
  const ganttContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ganttContainer.current) return

    // Initialize Gantt chart
    gantt.init(ganttContainer.current.current)

    // Configure Gantt
    gantt.config.date_format = '%Y-%m-%d %H:%i'
    gantt.config.scale_unit = zoom
    gantt.config.scale_height = 60
    gantt.config.min_column_width = 60
    gantt.config.duration_unit = 'minute'

    // Custom task types
    gantt.config.types = {
      warmup: { name: 'Warmup' },
      performance: { name: 'Performance' },
      judging: { name: 'Judging' },
      resurfacing: { name: 'Ice Resurfacing' },
      break: { name: 'Break' }
    }

    // Custom columns
    gantt.config.columns = [
      { name: 'text', label: 'Session', width: 200, tree: true },
      { name: 'start_date', label: 'Start', align: 'center' },
      { name: 'duration', label: 'Duration', align: 'center' },
      { name: 'type', label: 'Type', align: 'center' }
    ]

    // Task colors
    gantt.config.lightbox.sections = [
      { name: 'description', height: 70, map_to: 'text', type: 'textarea', focus: true },
      { name: 'type', height: 22, map_to: 'type', type: 'select', options: [
        { key: 'warmup', label: 'Warmup' },
        { key: 'performance', label: 'Performance' },
        { key: 'judging', label: 'Judging' },
        { key: 'resurfacing', label: 'Ice Resurfacing' },
        { key: 'break', label: 'Break' }
      ]},
      { name: 'time', height: 72, type: 'duration', map_to: 'auto' }
    ]

    // Event handlers
    gantt.attachEvent('onBeforeTaskDrag', (id, task, mode) => {
      return validateTaskMove(task, mode)
    })

    gantt.attachEvent('onTaskChanged', (id, task) => {
      if (onSessionChange) {
        onSessionChange(task as ScheduleSession)
      }
    })

    // Load data
    const ganttData = schedule.sessions.map(session => ({
      id: session.id,
      text: `${session.type} - ${session.classId}`,
      start_date: session.startTime,
      duration: session.duration,
      type: session.type,
      classId: session.classId,
      groupId: session.groupId
    }))

    gantt.parse({ data: ganttData })

    // Cleanup
    return () => {
      gantt.clearAll()
    }
  }, [schedule, onSessionChange, zoom])

  const validateTaskMove = (task: any, mode: string): boolean => {
    // Basic validation - prevent overlapping sessions
    const allTasks = gantt.getTaskByTime(task.start_date, task.start_date + task.duration)
    return allTasks.length <= 1 // Allow only the current task
  }

  return (
    <Box ref={ganttContainer} sx={{ width: '100%', height: '600px' }}>
      {/* Gantt chart will be initialized here */}
    </Box>
  )
}
```

## Phase 4: Advanced Features (Weeks 7-8)

### 4.1 Story 7: Advanced Scheduling Rules

Create `src/features/scheduling/AdvancedRuleEngine.ts`:

```typescript
import { Competition, Schedule, ScheduleSession, CompetitionConfig } from '@/types'

export class AdvancedRuleEngine {
  constructor(private config: CompetitionConfig) {}

  validateSchedule(schedule: Schedule): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check program ordering
    this.validateProgramOrder(schedule, errors)
    
    // Check recovery time
    this.validateRecoveryTime(schedule, errors)
    
    // Check ice resurfacing timing
    this.validateResurfacing(schedule, errors)
    
    // Check lunch break
    this.validateLunchBreak(schedule, errors)

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private validateProgramOrder(schedule: Schedule, errors: string[]): void {
    const performanceSessions = schedule.sessions.filter(s => s.type === 'performance')
    const classSessions = new Map<string, { short: ScheduleSession | null; free: ScheduleSession | null }>()

    // Group sessions by class
    performanceSessions.forEach(session => {
      if (!classSessions.has(session.classId)) {
        classSessions.set(session.classId, { short: null, free: null })
      }
      
      const classSession = classSessions.get(session.classId)!
      if (session.duration === (this.config.classSettings[schedule.sessions.find(s => s.id === session.classId)?.classId || '']?.shortProgram || 180)) {
        classSession.short = session
      } else {
        classSession.free = session
      }
    })

    // Check short program comes before free skating
    classSessions.forEach((sessions, classId) => {
      if (sessions.short && sessions.free) {
        if (sessions.short.startTime > sessions.free.startTime) {
          errors.push(`Class ${classId}: Short program must come before free skating`)
        }
      }
    })
  }

  private validateRecoveryTime(schedule: Schedule, errors: string[]): void {
    const performanceSessions = schedule.sessions.filter(s => s.type === 'performance')
    const classSessions = new Map<string, ScheduleSession[]>()

    // Group sessions by class
    performanceSessions.forEach(session => {
      if (!classSessions.has(session.classId)) {
        classSessions.set(session.classId, [])
      }
      classSessions.get(session.classId)!.push(session)
    })

    // Check minimum 4-hour gap between programs
    classSessions.forEach((sessions, classId) => {
      sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      
      for (let i = 0; i < sessions.length - 1; i++) {
        const gap = sessions[i + 1].startTime.getTime() - sessions[i].endTime.getTime()
        const minGap = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
        
        if (gap < minGap) {
          errors.push(`Class ${classId}: Minimum 4-hour gap required between programs`)
          break
        }
      }
    })
  }

  private validateResurfacing(schedule: Schedule, errors: string[]): void {
    const resurfacingSessions = schedule.sessions.filter(s => s.type === 'resurfacing')
    const warmupSessions = schedule.sessions.filter(s => s.type === 'warmup')
    
    // Check resurfacing occurs after every 2 warmup groups
    let groupCount = 0
    let lastResurfacing: ScheduleSession | null = null
    
    warmupSessions.forEach(session => {
      groupCount++
      
      if (groupCount % 2 === 0) {
        // Should have resurfacing after this group
        const nextSession = schedule.sessions.find(s => 
          s.startTime > session.endTime && 
          s.type !== 'warmup'
        )
        
        if (nextSession && !resurfacingSessions.some(r => 
          r.startTime >= session.endTime && 
          r.startTime <= nextSession.startTime
        )) {
          errors.push(`Missing resurfacing session after warmup group ${groupCount}`)
        }
      }
    })
  }

  private validateLunchBreak(schedule: Schedule, errors: string[]): void {
    const sessions = schedule.sessions
    const lunchBreakMin = this.config.timeSettings.lunchBreak.minimum
    const lunchBreakRec = this.config.timeSettings.lunchBreak.recommended
    
    // Find natural break point (between 11:30-14:00)
    const naturalBreakStart = new Date(schedule.sessions[0].startTime)
    naturalBreakStart.setHours(11, 30, 0, 0)
    
    const naturalBreakEnd = new Date(naturalBreakStart)
    naturalBreakEnd.setHours(14, 0, 0, 0)
    
    // Check if there's a break in this range
    const hasLunchBreak = sessions.some(session => 
      session.type === 'break' &&
      session.startTime >= naturalBreakStart &&
      session.endTime <= naturalBreakEnd
    )
    
    if (!hasLunchBreak) {
      errors.push('Missing mandatory lunch break with resurfacing (11:30-14:00)')
    }
  }

  optimizeSchedule(schedule: Schedule): Schedule {
    const optimizedSchedule = { ...schedule }
    
    // Apply optimizations
    this.optimizeIceResurfacing(optimizedSchedule)
    this.optimizeSessionOrder(optimizedSchedule)
    this.optimizeBreaks(optimizedSchedule)
    
    return optimizedSchedule
  }

  private optimizeIceResurfacing(schedule: Schedule): void {
    // Optimize resurfacing timing based on skater count
    const resurfacingSessions = schedule.sessions.filter(s => s.type === 'resurfacing')
    
    resurfacingSessions.forEach(session => {
      // Move resurfacing to start of break period
      const precedingSessions = schedule.sessions.filter(s => 
        s.endTime <= session.startTime && 
        s.type !== 'resurfacing'
      )
      
      if (precedingSessions.length > 0) {
        const lastSession = precedingSessions[precedingSessions.length - 1]
        const optimalStartTime = new Date(lastSession.endTime)
        
        // Add small buffer
        optimalStartTime.setMinutes(optimalStartTime.getMinutes() + 5)
        
        if (optimalStartTime < session.startTime) {
          session.startTime = optimalStartTime
          session.endTime = new Date(session.startTime.getTime() + session.duration * 60000)
        }
      }
    })
  }

  private optimizeSessionOrder(schedule: Schedule): void {
    // Sort sessions by type and time
    schedule.sessions.sort((a, b) => {
      // Priority: warmup -> performance -> judging -> resurfacing -> break
      const typePriority = {
        warmup: 1,
        performance: 2,
        judging: 3,
        resurfacing: 4,
        break: 5
      }
      
      if (typePriority[a.type] !== typePriority[b.type]) {
        return typePriority[a.type] - typePriority[b.type]
      }
      
      return a.startTime.getTime() - b.startTime.getTime()
    })
  }

  private optimizeBreaks(schedule: Schedule): void {
    // Add breaks between long sessions
    const performanceSessions = schedule.sessions.filter(s => s.type === 'performance')
    
    for (let i = 0; i < performanceSessions.length - 1; i++) {
      const current = performanceSessions[i]
      const next = performanceSessions[i + 1]
      
      const gap = next.startTime.getTime() - current.endTime.getTime()
      const minBreak = 15 * 60 * 1000 // 15 minutes
      
      if (gap > minBreak * 2) {
        // Add a break in the middle
        const breakStartTime = new Date(current.endTime.getTime() + minBreak)
        const breakEndTime = new Date(breakStartTime.getTime() + minBreak)
        
        const breakSession: ScheduleSession = {
          id: this.generateId(),
          type: 'break',
          startTime: breakStartTime,
          endTime: breakEndTime,
          duration: minBreak / 60000,
          classId: 'break'
        }
        
        schedule.sessions.push(breakSession)
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
```

## Phase 5: Testing and Deployment (Week 9)

### 5.1 Set Up Testing

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock dhtmlx-gantt
jest.mock('dhtmlx-gantt', () => ({
  config: {},
  init: jest.fn(),
  clearAll: jest.fn(),
  getTaskByTime: jest.fn(),
  parse: jest.fn(),
  attachEvent: jest.fn(),
}))
```

Create `src/features/data-import/DataImportComponent.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataImportComponent } from './DataImportComponent'
import { DataService } from '@/services/DataService'

// Mock DataService
jest.mock('@/services/DataService')

const mockDataService = DataService as jest.MockedClass<typeof DataService>

describe('DataImportComponent', () => {
  const mockOnImportComplete = jest.fn()
  const mockCompetition = {
    id: 'test-id',
    name: 'Test Competition',
    organizer: { id: 'org-id', name: 'Test Organization' },
    location: 'Test Location',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-02T00:00:00Z',
    competitions: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDataService.prototype.importFromJSON.mockResolvedValue(mockCompetition)
  })

  test('renders file input and import button', () => {
    render(<DataImportComponent onImportComplete={mockOnImportComplete} />)
    
    expect(screen.getByText('Import Competition Data')).toBeInTheDocument()
    expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import competition/i })).toBeInTheDocument()
  })

  test('handles file selection', () => {
    render(<DataImportComponent onImportComplete={mockOnImportComplete} />)
    
    const fileInput = screen.getByLabelText(/choose file/i)
    const file = new File(['test'], 'test.json', { type: 'application/json' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(fileInput.files?.[0]).toBe(file)
  })

  test('shows error for invalid file type', () => {
    render(<DataImportComponent onImportComplete={mockOnImportComplete} />)
    
    const fileInput = screen.getByLabelText(/choose file/i)
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    expect(screen.getByText('Please select a valid JSON file')).toBeInTheDocument()
  })

  test('imports competition successfully', async () => {
    render(<DataImportComponent onImportComplete={mockOnImportComplete} />)
    
    const fileInput = screen.getByLabelText(/choose file/i)
    const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /import competition/i }))
    
    await waitFor(() => {
      expect(mockDataService.prototype.importFromJSON).toHaveBeenCalledWith('{"test": "data"}')
      expect(mockOnImportComplete).toHaveBeenCalledWith(mockCompetition)
      expect(screen.getByText('Competition imported successfully!')).toBeInTheDocument()
    })
  })

  test('handles import error', async () => {
    mockDataService.prototype.importFromJSON.mockRejectedValue(new Error('Import failed'))
    
    render(<DataImportComponent onImportComplete={mockOnImportComplete} />)
    
    const fileInput = screen.getByLabelText(/choose file/i)
    const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /import competition/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Import failed')).toBeInTheDocument()
    })
  })
})
```

### 5.2 Deployment Configuration

Create `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src/**/*.{ts,tsx}",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@types/node": "^16.18.38",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3",
    "prettier": "^2.8.8",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.1"
  }
}
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Create `.lintstagedrc`:

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## Final Checklist

### Development Complete
- [ ] All user stories implemented
- [ ] Technical specifications followed
- [ ] Tests passing
- [ ] Code linted and formatted
- [ ] Documentation complete

### Deployment Ready
- [ ] Build process working
- [ ] Performance optimized
- [ ] Error handling implemented
- [ ] User experience polished
- [ ] Documentation accessible

This implementation guide provides everything developers need to successfully build the Figure Skating Competition Schedule Planner application.