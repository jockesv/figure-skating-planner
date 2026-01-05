import {
    CompetitionData,
    Event,
    CompetitionClass,
    SkatingClass,
    WarmupGroup,
    Person,
    Official,
    Program,
    MusicInfo,
    Organization,
    District
} from '../types'
// Removed uuidv4 as it is not currently used and package is missing

// Type definitions matching the JSON structure (Zod output)
// We can infer this from Zod, but for now defining it manually to map safely
interface JsonCompetitionData {
    ExportedAt: string
    ExportedBy: string
    Event: JsonEvent
}

interface JsonEvent {
    Id: string
    Name: string
    Organizer: JsonOrganization
    Location: string
    StartDate?: string
    EndDate?: string
    Competitions: JsonCompetitionClass[]
}

interface JsonOrganization {
    Id: string
    Name: string
}

interface JsonDistrict {
    Id: string
    Name: string
}

interface JsonCompetitionClass {
    Id: string
    Name: string
    Category: string
    StartDate?: string
    EndDate?: string
    Classes: JsonSkatingClass[]
    Officials?: JsonOfficial[]
    Reserves?: JsonPerson[]
}

interface JsonSkatingClass {
    Id: string
    Name: string
    Discipline: string
    Type: string
    Groups: JsonWarmupGroup[]
    Officials?: JsonOfficial[]
    Reserves?: JsonPerson[]
}

interface JsonWarmupGroup {
    Index: number
    Name: string
    Persons: JsonPerson[]
    Officials: JsonOfficial[]
}

interface JsonPerson {
    Id: string
    FirstName: string
    LastName: string
    BirthDate: string
    Sex: 'M' | 'F'
    Nationality: string
    Organization: JsonOrganization
    District: JsonDistrict
    EntryDate: string
    EntryId: string
    Ppcs: JsonProgram[]
}

interface JsonOfficial {
    Id: string
    FirstName: string
    LastName: string
    Role: string
    Sex: 'M' | 'F'
    Nationality: string
    Representing: string
    Organization: JsonOrganization
    District?: JsonDistrict
}

interface JsonProgram {
    Type: 'Kortprogram' | 'Friåkning'
    Discipline: string
    Ppc: string
    Coach: string
    Music: JsonMusicInfo
}

interface JsonMusicInfo {
    Title?: string
    Compositor?: string
}

export const transformCompetitionData = (data: JsonCompetitionData): CompetitionData => {
    return {
        exportedAt: new Date(data.ExportedAt),
        exportedBy: data.ExportedBy,
        event: transformEvent(data.Event)
    }
}

const transformEvent = (event: JsonEvent): Event => {
    return {
        id: event.Id,
        name: event.Name,
        organizer: transformOrganization(event.Organizer),
        location: event.Location,
        startDate: event.StartDate ? new Date(event.StartDate) : undefined,
        endDate: event.EndDate ? new Date(event.EndDate) : undefined,
        competitions: event.Competitions.map(transformCompetitionClass)
    }
}

const transformOrganization = (org: JsonOrganization): Organization => {
    return {
        id: org.Id,
        name: org.Name
    }
}

const transformDistrict = (dist: JsonDistrict): District => {
    return {
        id: dist.Id,
        name: dist.Name
    }
}

const transformCompetitionClass = (comp: JsonCompetitionClass): CompetitionClass => {
    // Split skating classes by program type if they have both Kortprogram and Friåkning
    const expandedClasses: SkatingClass[] = []

    comp.Classes.forEach(cls => {
        // Check if this class has skaters with multiple program types
        const allPersons = cls.Groups.flatMap(g => g.Persons)
        const programTypes = new Set<string>()
        allPersons.forEach(person => {
            person.Ppcs.forEach(ppc => programTypes.add(ppc.Type))
        })

        if (programTypes.size > 1) {
            // Has multiple program types - split into separate classes
            // Must follow order: Kortprogram FIRST, then Friåkning
            const orderedTypes = ['Kortprogram', 'Friåkning'].filter(t => programTypes.has(t))

            orderedTypes.forEach(programType => {
                // Create a new class for this program type
                const filteredGroups = cls.Groups.map(group => ({
                    ...group,
                    Persons: group.Persons.filter(person =>
                        person.Ppcs.some(ppc => ppc.Type === programType)
                    )
                })).filter(group => group.Persons.length > 0)

                if (filteredGroups.length > 0) {
                    expandedClasses.push(transformSkatingClass({
                        ...cls,
                        Id: `${cls.Id}-${programType}`,
                        Name: `${cls.Name} - ${programType}`,
                        Type: programType,
                        Groups: filteredGroups
                    }))
                }
            })
        } else {
            // Single program type - keep as is
            expandedClasses.push(transformSkatingClass(cls))
        }
    })

    return {
        id: comp.Id,
        name: comp.Name,
        category: comp.Category,
        discipline: comp.Classes[0]?.Discipline || 'Unknown',
        type: comp.Classes[0]?.Type || 'Unknown',
        startDate: comp.StartDate ? new Date(comp.StartDate) : undefined,
        endDate: comp.EndDate ? new Date(comp.EndDate) : undefined,
        classes: expandedClasses,
        officials: comp.Officials?.map(transformOfficial),
        reserves: comp.Reserves?.map(transformPerson)
    }
}


const transformSkatingClass = (cls: JsonSkatingClass): SkatingClass => {
    return {
        id: cls.Id,
        name: cls.Name,
        discipline: cls.Discipline,
        type: cls.Type,
        groups: cls.Groups.map(transformWarmupGroup),
        officials: cls.Officials?.map(transformOfficial),
        reserves: cls.Reserves?.map(transformPerson)
    }
}

const transformWarmupGroup = (group: JsonWarmupGroup): WarmupGroup => {
    return {
        index: group.Index,
        name: group.Name,
        persons: group.Persons.map(transformPerson),
        officials: group.Officials.map(transformOfficial)
    }
}

const transformPerson = (person: JsonPerson): Person => {
    return {
        id: person.Id,
        firstName: person.FirstName,
        lastName: person.LastName,
        birthDate: new Date(person.BirthDate),
        sex: person.Sex,
        nationality: person.Nationality,
        organization: transformOrganization(person.Organization),
        district: transformDistrict(person.District),
        entryDate: new Date(person.EntryDate),
        entryId: person.EntryId,
        ppcs: person.Ppcs.map(transformProgram)
    }
}

const transformOfficial = (official: JsonOfficial): Official => {
    return {
        id: official.Id,
        firstName: official.FirstName,
        lastName: official.LastName,
        role: official.Role,
        sex: official.Sex,
        nationality: official.Nationality,
        representing: official.Representing,
        organization: transformOrganization(official.Organization),
        district: official.District ? transformDistrict(official.District) : undefined
    }
}

const transformProgram = (program: JsonProgram): Program => {
    return {
        type: program.Type,
        discipline: program.Discipline,
        ppc: program.Ppc,
        coach: program.Coach,
        music: transformMusicInfo(program.Music)
    }
}

const transformMusicInfo = (music: JsonMusicInfo): MusicInfo => {
    return {
        title: music.Title,
        compositor: music.Compositor
    }
}
