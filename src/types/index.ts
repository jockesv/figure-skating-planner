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
  officials?: Official[]
  reserves?: Person[]
}

export interface CompetitionClass {
  id: string
  name: string
  category: string
  discipline: string
  type: string
  startDate?: Date
  endDate?: Date
  classes: SkatingClass[]
  officials?: Official[]
  reserves?: Person[]
}

export interface Event {
  id: string
  name: string
  organizer: Organization
  location: string
  startDate?: Date
  endDate?: Date
  competitions: CompetitionClass[]
}

export interface CompetitionData {
  exportedAt: Date
  exportedBy: string
  event: Event
}

export interface ScheduleSession {
  id: string
  type: 'warmup' | 'performance' | 'judging' | 'resurfacing' | 'break'
  startTime: Date
  endTime: Date
  duration: number // in seconds
  classId: string
  className?: string // For display
  name: string
  groupId?: number
  skaterCount?: number
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
    validationWarnings?: string[]
  }
}