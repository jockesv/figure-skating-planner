# Technical Specifications for Figure Skating Competition Planner

## Overview
This document provides the technical specifications needed for developers to implement the Figure Skating Competition Schedule Planner application.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Gantt Chart**: DHTMLX Gantt v8.0
- **Charts**: Recharts (for analytics)
- **Icons**: Material Icons

### Data Management
- **Storage**: Browser localStorage (primary)
- **Data Format**: JSON
- **Validation**: Zod schemas
- **Compression**: lz-string for localStorage optimization

### Build and Deployment
- **Package Manager**: npm
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/         # Shared components (Button, Input, etc.)
│   ├── gantt/          # Gantt chart components
│   ├── schedule/       # Schedule-specific components
│   └── forms/          # Form components
├── features/           # Feature-based modules
│   ├── data-import/    # Data import functionality
│   ├── scheduling/    # Schedule generation and management
│   ├── visualization/ # Chart and Gantt components
│   ├── configuration/  # Rule configuration
│   └── export/        # Export functionality
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── app/                # App configuration and routing
```

## Core Data Models

### TypeScript Interfaces

```typescript
// Core competition data
interface Competition {
  id: string;
  name: string;
  organizer: Organization;
  location: string;
  startDate: Date;
  endDate: Date;
  competitions: CompetitionClass[];
}

interface CompetitionClass {
  id: string;
  name: string;
  category: string;
  discipline: string;
  type: string;
  classes: SkatingClass[];
}

interface SkatingClass {
  id: string;
  name: string;
  discipline: string;
  type: string;
  groups: WarmupGroup[];
  reserves: Person[];
}

interface WarmupGroup {
  index: number;
  name: string;
  persons: Person[];
  officials: Official[];
}

// Schedule and timing
interface ScheduleSession {
  id: string;
  type: 'warmup' | 'performance' | 'judging' | 'resurfacing' | 'break';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  classId: string;
  groupId?: number;
  dependencies?: string[];
  conflicts?: string[];
}

interface Schedule {
  id: string;
  competitionId: string;
  sessions: ScheduleSession[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    totalDuration: number;
    efficiency: number;
  };
}

// Configuration
interface CompetitionConfig {
  id: string;
  name: string;
  timeSettings: TimeSettings;
  classSettings: Record<string, ClassPerformanceTimes>;
  resurfacingRules: ResurfacingRules;
  programOrdering: ProgramOrdering;
  groupFormation: GroupFormation;
  createdAt: Date;
  updatedAt: Date;
}
```

## State Management Structure

### Redux Store Structure

```typescript
interface RootState {
  competitions: CompetitionState;
  schedules: ScheduleState;
  configuration: ConfigurationState;
  ui: UIState;
}

interface CompetitionState {
  currentCompetition: Competition | null;
  competitions: Competition[];
  loading: boolean;
  error: string | null;
}

interface ScheduleState {
  currentSchedule: Schedule | null;
  schedules: Schedule[];
  generating: boolean;
  editing: boolean;
}

interface ConfigurationState {
  currentConfig: CompetitionConfig;
  configs: CompetitionConfig[];
  defaultConfig: CompetitionConfig;
}

interface UIState {
  theme: 'light' | 'dark';
  ganttView: {
    zoom: 'hour' | 'day' | 'week';
    selectedSession: string | null;
  };
  notifications: Notification[];
}
```

## API Service Layer

### Data Service

```typescript
class DataService {
  // LocalStorage operations
  async saveCompetition(competition: Competition): Promise<void>
  async loadCompetition(id: string): Promise<Competition>
  async getAllCompetitions(): Promise<Competition[]>
  
  // Import/Export
  async importFromJSON(file: File): Promise<Competition>
  async exportToJSON(competition: Competition): Promise<string>
  async exportToPDF(schedule: Schedule): Promise<Blob>
  async exportToCSV(schedule: Schedule): Promise<string>
}
```

### Scheduling Service

```typescript
class SchedulingService {
  // Schedule generation
  async generateSchedule(
    competition: Competition, 
    config: CompetitionConfig
  ): Promise<Schedule>
  
  // Schedule optimization
  async optimizeSchedule(
    schedule: Schedule,
    config: CompetitionConfig,
    options: OptimizationOptions
  ): Promise<Schedule>
  
  // Validation
  async validateSchedule(schedule: Schedule): Promise<ValidationResult>
}
```

## Component Architecture

### High-Level Components

```typescript
// Main App Layout
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/competitions" element={<CompetitionList />} />
            <Route path="/competitions/:id" element={<CompetitionDetail />} />
            <Route path="/schedule/:id" element={<ScheduleView />} />
            <Route path="/config" element={<Configuration />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

// Schedule View Component
const ScheduleView: React.FC = () => {
  return (
    <div className="schedule-view">
      <ScheduleToolbar />
      <GanttChart 
        data={scheduleData}
        onSessionChange={handleSessionChange}
        zoom={zoomLevel}
      />
      <ScheduleDetailsPanel />
    </div>
  );
};
```

## Gantt Chart Integration

### DHTMLX Gantt Configuration

```typescript
import gantt from 'dhtmlx-gantt';

const initGantt = () => {
  gantt.config.date_format = '%Y-%m-%d %H:%i';
  gantt.config.scale_unit = 'hour';
  gantt.config.scale_height = 60;
  gantt.config.min_column_width = 60;
  
  // Custom task types
  gantt.config.types = {
    warmup: { name: 'Warmup' },
    performance: { name: 'Performance' },
    judging: { name: 'Judging' },
    resurfacing: { name: 'Ice Resurfacing' },
    break: { name: 'Break' }
  };
  
  // Custom columns
  gantt.config.columns = [
    { name: 'text', label: 'Session', width: 200 },
    { name: 'start_date', label: 'Start', align: 'center' },
    { name: 'duration', label: 'Duration', align: 'center' },
    { name: 'type', label: 'Type', align: 'center' }
  ];
  
  // Event handlers
  gantt.attachEvent('onBeforeTaskDrag', (id, task, mode) => {
    return validateTaskMove(task, mode);
  });
  
  gantt.attachEvent('onTaskChanged', (id, task) => {
    handleTaskChange(task);
  });
};
```

## Scheduling Algorithm Implementation

### Core Scheduling Logic

```typescript
class ScheduleGenerator {
  constructor(private config: CompetitionConfig) {}
  
  generateSchedule(competition: Competition): Schedule {
    const sessions: ScheduleSession[] = [];
    const sessionMap = new Map<string, ScheduleSession>();
    
    // Generate warmup groups
    const warmupSessions = this.generateWarmupGroups(competition);
    sessions.push(...warmupSessions);
    
    // Generate performance sessions
    const performanceSessions = this.generatePerformanceSessions(competition);
    sessions.push(...performanceSessions);
    
    // Generate ice resurfacing sessions
    const resurfacingSessions = this.generateResurfacingSessions(sessions);
    sessions.push(...resurfacingSessions);
    
    // Apply dependencies and constraints
    this.applyDependencies(sessions);
    this.applyConstraints(sessions);
    
    return {
      id: generateId(),
      competitionId: competition.id,
      sessions,
      metadata: this.calculateMetadata(sessions)
    };
  }
  
  private generateWarmupGroups(competition: Competition): ScheduleSession[] {
    const sessions: ScheduleSession[] = [];
    
    for (const compClass of competition.competitions) {
      for (const skatingClass of compClass.classes) {
        const groups = this.formWarmupGroups(skatingClass);
        
        for (const group of groups) {
          const session: ScheduleSession = {
            id: generateId(),
            type: 'warmup',
            startTime: this.calculateStartTime(sessions),
            endTime: this.calculateEndTime('warmup', group.persons.length),
            duration: this.config.classSettings[skatingClass.name]?.warmupTime || 60,
            classId: skatingClass.id,
            groupId: group.index
          };
          
          sessions.push(session);
        }
      }
    }
    
    return sessions;
  }
  
  private generatePerformanceSessions(competition: Competition): ScheduleSession[] {
    const sessions: ScheduleSession[] = [];
    
    for (const compClass of competition.competitions) {
      for (const skatingClass of compClass.classes) {
        // Short program
        if (this.hasShortProgram(skatingClass)) {
          const session: ScheduleSession = {
            id: generateId(),
            type: 'performance',
            startTime: this.calculateStartTime(sessions),
            endTime: this.calculateEndTime('performance', skatingClass.groups[0]?.persons.length || 0),
            duration: this.config.classSettings[skatingClass.name]?.shortProgram || 180,
            classId: skatingClass.id
          };
          
          sessions.push(session);
        }
        
        // Free skating
        const freeSkateSession: ScheduleSession = {
          id: generateId(),
          type: 'performance',
          startTime: this.calculateStartTime(sessions),
          endTime: this.calculateEndTime('performance', skatingClass.groups[0]?.persons.length || 0),
          duration: this.config.classSettings[skatingClass.name]?.freeSkate || 210,
          classId: skatingClass.id
        };
        
        sessions.push(freeSkateSession);
      }
    }
    
    return sessions;
  }
}
```

## Configuration Management

### Configuration Schema

```typescript
import { z } from 'zod';

const TimeSettingsSchema = z.object({
  introductionPerformance: z.string(),
  judgingTimes: z.object({
    shortProgram: z.string(),
    freeSkate: z.string()
  }),
  iceResurfacing: z.string(),
  lunchBreak: z.object({
    minimum: z.string(),
    recommended: z.string()
  })
});

const CompetitionConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeSettings: TimeSettingsSchema,
  classSettings: z.record(z.string(), z.object({
    shortProgram: z.string().optional(),
    freeSkate: z.string(),
    warmupTime: z.string(),
    maxGroupSize: z.number()
  })),
  resurfacingRules: z.object({
    sessionsPerDay: z.number(),
    maxSkatersBetweenResurfacing: z.record(z.string(), z.number())
  }),
  programOrdering: z.object({
    minGapBetweenPrograms: z.string(),
    optimalGapBetweenPrograms: z.string()
  }),
  groupFormation: z.object({
    allowMixedClasses: z.boolean(),
    maxSpeedDifference: z.number()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});
```

## Testing Strategy

### Unit Tests

```typescript
// DataService.test.ts
describe('DataService', () => {
  let dataService: DataService;
  
  beforeEach(() => {
    dataService = new DataService();
    localStorage.clear();
  });
  
  test('should save and load competition', async () => {
    const competition = mockCompetition();
    await dataService.saveCompetition(competition);
    
    const loaded = await dataService.loadCompetition(competition.id);
    expect(loaded).toEqual(competition);
  });
});
```

### Integration Tests

```typescript
// SchedulingService.test.ts
describe('SchedulingService', () => {
  test('should generate valid schedule', async () => {
    const competition = mockCompetition();
    const config = mockConfig();
    
    const schedule = await schedulingService.generateSchedule(competition, config);
    
    expect(schedule.sessions).toBeDefined();
    expect(schedule.sessions.length).toBeGreaterThan(0);
    expect(schedule.metadata.efficiency).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Virtual Scrolling**: For large competition lists
2. **Memoization**: React.memo for expensive components
3. **Web Workers**: For heavy scheduling calculations
4. **Lazy Loading**: Components and data
5. **Data Compression**: localStorage optimization

### Memory Management

```typescript
// Use weak references for large datasets
const competitionCache = new WeakMap<Competition, Schedule>();

// Clean up unused data
const cleanupOldData = () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('competition_')) {
      const data = JSON.parse(localStorage.getItem(key)!);
      if (new Date(data.createdAt) < oneWeekAgo) {
        localStorage.removeItem(key);
      }
    }
  });
};
```

## Security Considerations

### Data Validation

```typescript
// Input validation
const validateCompetitionData = (data: unknown): Competition => {
  try {
    return CompetitionSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid competition data: ' + error.message);
  }
};
```

### XSS Prevention

```typescript
// Sanitize user inputs
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};
```

## Deployment Configuration

### Environment Variables

```env
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:3001
VITE_GANTT_LICENSE_KEY=your-license-key
```

### Build Scripts

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
    "type-check": "tsc --noEmit"
  }
}
```

This technical specification provides the detailed information developers need to implement the application successfully.