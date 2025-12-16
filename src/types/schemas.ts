import { z } from 'zod'

// Basic schemas
const UUIDSchema = z.string().uuid()
const DateTimeSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid datetime"
})
const SexSchema = z.enum(['M', 'F'])
const ProgramTypeSchema = z.enum(['Kortprogram', 'Friåkning'])
const DisciplineSchema = z.enum([
  'Singelåkning',
  'Paråkning',
  'Isdans',
  'Soloisdans',
  'Synkroniserad konståkning'
])
const CompetitionTypeSchema = z.enum(['Singel', 'Par', 'Isdans', 'Synkroniserad'])
const CompetitionCategorySchema = z.enum([
  'Nationell serie',
  'System 3',
  'System 2',
  'System 1',
  'Förbundstävling'
])
const RepresentingSchema = z.enum(['Förbund', 'Klubb'])

// Nested schemas
const OrganizationSchema = z.object({
  Id: UUIDSchema,
  Name: z.string()
})

const DistrictSchema = z.object({
  Id: UUIDSchema,
  Name: z.string()
})

const MusicInfoSchema = z.object({
  Title: z.string().optional(),
  Compositor: z.string().optional()
}).strict()

const ProgramSchema = z.object({
  Type: ProgramTypeSchema,
  Discipline: DisciplineSchema,
  Ppc: z.string(),
  Coach: z.string(),
  Music: MusicInfoSchema
}).strict()

const PersonSchema = z.object({
  Id: UUIDSchema,
  FirstName: z.string(),
  LastName: z.string(),
  BirthDate: DateTimeSchema,
  Sex: SexSchema,
  Nationality: z.string(),
  Organization: OrganizationSchema,
  District: DistrictSchema,
  EntryDate: DateTimeSchema,
  EntryId: UUIDSchema,
  Ppcs: z.array(ProgramSchema)
}).strict()

const OfficialSchema = z.object({
  Id: UUIDSchema,
  FirstName: z.string(),
  LastName: z.string(),
  Role: z.string(),
  Sex: SexSchema,
  Nationality: z.string(),
  Representing: RepresentingSchema,
  Organization: OrganizationSchema,
  District: DistrictSchema
}).strict()

const WarmupGroupSchema = z.object({
  Index: z.number().min(0),
  Name: z.string(),
  Persons: z.array(PersonSchema),
  Officials: z.array(OfficialSchema)
}).strict()

const SkatingClassSchema = z.object({
  Id: UUIDSchema,
  Name: z.string(),
  Discipline: DisciplineSchema,
  Type: CompetitionTypeSchema,
  Groups: z.array(WarmupGroupSchema),
  Officials: z.array(OfficialSchema).optional(),
  Reserves: z.array(PersonSchema).optional()
}).strict()

const CompetitionClassSchema = z.object({
  Id: UUIDSchema,
  Name: z.string(),
  Category: CompetitionCategorySchema,
  StartDate: DateTimeSchema.optional(),
  EndDate: DateTimeSchema.optional(),
  Classes: z.array(SkatingClassSchema),
  Officials: z.array(OfficialSchema).optional(),
  Reserves: z.array(PersonSchema).optional()
}).strict()

const EventSchema = z.object({
  Id: UUIDSchema,
  Name: z.string(),
  Organizer: OrganizationSchema,
  Location: z.string(),
  StartDate: DateTimeSchema.optional(),
  EndDate: DateTimeSchema.optional(),
  Competitions: z.array(CompetitionClassSchema)
}).strict()

const CompetitionDataSchema = z.object({
  ExportedAt: DateTimeSchema,
  ExportedBy: UUIDSchema,
  Event: EventSchema
}).strict()

// Export schemas
export {
  UUIDSchema,
  DateTimeSchema,
  SexSchema,
  ProgramTypeSchema,
  DisciplineSchema,
  CompetitionTypeSchema,
  CompetitionCategorySchema,
  RepresentingSchema,
  OrganizationSchema,
  DistrictSchema,
  MusicInfoSchema,
  ProgramSchema,
  PersonSchema,
  OfficialSchema,
  WarmupGroupSchema,
  SkatingClassSchema,
  CompetitionClassSchema,
  EventSchema,
  CompetitionDataSchema
}

// Main validation function
export function validateCompetitionData(data: unknown): z.infer<typeof CompetitionDataSchema> {
  return CompetitionDataSchema.parse(data)
}

// Error handling type
export interface ValidationError {
  path: string[]
  message: string
}

export function formatZodError(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue: z.ZodIssue) => ({
    path: issue.path.map(p => String(p)),
    message: issue.message
  }))
}