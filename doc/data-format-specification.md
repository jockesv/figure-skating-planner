# Data Format Specification for Figure Skating Competition Import

This document provides the complete JSON schema and data format specification for importing figure skating competition data.

## Overview

The application expects competition data in JSON format with a specific hierarchical structure. This specification details the exact format, field requirements, and data types for all entities.

## Complete JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Figure Skating Competition Data",
  "description": "Complete data structure for figure skating competitions",
  "type": "object",
  "required": ["ExportedAt", "ExportedBy", "Event"],
  "properties": {
    "ExportedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp when the data was exported"
    },
    "ExportedBy": {
      "type": "string",
      "description": "UUID of the user/system that exported the data"
    },
    "Event": {
      "$ref": "#/definitions/Event"
    }
  },
  "definitions": {
    "Event": {
      "type": "object",
      "required": ["Id", "Name", "Organizer", "Location", "Competitions"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the event"
        },
        "Name": {
          "type": "string",
          "description": "Name of the competition event"
        },
        "Organizer": {
          "$ref": "#/definitions/Organization"
        },
        "Location": {
          "type": "string",
          "description": "Physical address of the competition venue"
        },
        "StartDate": {
          "type": "string",
          "format": "date-time",
          "description": "Start date and time of the competition"
        },
        "EndDate": {
          "type": "string",
          "format": "date-time",
          "description": "End date and time of the competition"
        },
        "Competitions": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Competition"
          },
          "description": "List of competition classes"
        }
      }
    },
    "Organization": {
      "type": "object",
      "required": ["Id", "Name"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the organization"
        },
        "Name": {
          "type": "string",
          "description": "Name of the organization (club, federation, etc.)"
        }
      }
    },
    "District": {
      "type": "object",
      "required": ["Id", "Name"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the district"
        },
        "Name": {
          "type": "string",
          "description": "Name of the district/region"
        }
      }
    },
    "Competition": {
      "type": "object",
      "required": ["Id", "Name", "Category", "StartDate", "EndDate", "Classes"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the competition"
        },
        "Name": {
          "type": "string",
          "description": "Name of the competition (e.g., 'Nationella serien deltävling 1')"
        },
        "Category": {
          "type": "string",
          "enum": ["Nationell serie", "System 3", "System 2", "System 1", "Förbundstävling"],
          "description": "Category of the competition"
        },
        "StartDate": {
          "type": "string",
          "format": "date-time",
          "description": "Start date and time of this competition"
        },
        "EndDate": {
          "type": "string",
          "format": "date-time",
          "description": "End date and time of this competition"
        },
        "Classes": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SkatingClass"
          },
          "description": "List of skating classes in this competition"
        },
        "Officials": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Official"
          },
          "description": "List of officials assigned to this competition"
        },
        "Reserves": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Person"
          },
          "description": "List of reserve skaters"
        }
      }
    },
    "SkatingClass": {
      "type": "object",
      "required": ["Id", "Name", "Discipline", "Type", "Groups"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the skating class"
        },
        "Name": {
          "type": "string",
          "description": "Name of the skating class (e.g., 'Junior Damer')"
        },
        "Discipline": {
          "type": "string",
          "enum": ["Singelåkning", "Paråkning", "Isdans", "Soloisdans", "Synkroniserad konståkning"],
          "description": "Type of skating discipline"
        },
        "Type": {
          "type": "string",
          "enum": ["Singel", "Par", "Isdans", "Synkroniserad"],
          "description": "Competition type"
        },
        "Groups": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/WarmupGroup"
          },
          "description": "Warmup groups for this class"
        },
        "Officials": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Official"
          },
          "description": "Officials assigned to this class"
        },
        "Reserves": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Person"
          },
          "description": "Reserve skaters for this class"
        }
      }
    },
    "WarmupGroup": {
      "type": "object",
      "required": ["Index", "Name", "Persons"],
      "properties": {
        "Index": {
          "type": "integer",
          "minimum": 0,
          "description": "Index number of the group"
        },
        "Name": {
          "type": "string",
          "description": "Name of the warmup group"
        },
        "Persons": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Person"
          },
          "description": "List of persons in this group"
        },
        "Officials": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Official"
          },
          "description": "Officials assigned to this group"
        }
      }
    },
    "Person": {
      "type": "object",
      "required": ["Id", "FirstName", "LastName", "BirthDate", "Sex", "Nationality", "Organization", "District", "EntryDate", "EntryId", "Ppcs"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the person"
        },
        "FirstName": {
          "type": "string",
          "description": "First name of the person"
        },
        "LastName": {
          "type": "string",
          "description": "Last name of the person"
        },
        "BirthDate": {
          "type": "string",
          "format": "date-time",
          "description": "Date of birth"
        },
        "Sex": {
          "type": "string",
          "enum": ["M", "F"],
          "description": "Sex of the person"
        },
        "Nationality": {
          "type": "string",
          "description": "Nationality code (e.g., 'SWE')"
        },
        "Organization": {
          "$ref": "#/definitions/Organization"
        },
        "District": {
          "$ref": "#/definitions/District"
        },
        "EntryDate": {
          "type": "string",
          "format": "date-time",
          "description": "Date when the person was entered"
        },
        "EntryId": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the entry"
        },
        "Ppcs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Program"
          },
          "description": "List of programs the person is competing in"
        }
      }
    },
    "Official": {
      "type": "object",
      "required": ["Id", "FirstName", "LastName", "Role", "Sex", "Nationality", "Representing", "Organization", "District"],
      "properties": {
        "Id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique identifier for the official"
        },
        "FirstName": {
          "type": "string",
          "description": "First name of the official"
        },
        "LastName": {
          "type": "string",
          "description": "Last name of the official"
        },
        "Role": {
          "type": "string",
          "description": "Role of the official (e.g., 'Skiljedomare', 'Poängdomare')"
        },
        "Sex": {
          "type": "string",
          "enum": ["M", "F"],
          "description": "Sex of the official"
        },
        "Nationality": {
          "type": "string",
          "description": "Nationality code"
        },
        "Representing": {
          "type": "string",
          "enum": ["Förbund", "Klubb"],
          "description": "What the official is representing"
        },
        "Organization": {
          "$ref": "#/definitions/Organization"
        },
        "District": {
          "$ref": "#/definitions/District"
        }
      }
    },
    "Program": {
      "type": "object",
      "required": ["Type", "Discipline", "Ppc"],
      "properties": {
        "Type": {
          "type": "string",
          "enum": ["Kortprogram", "Friåkning"],
          "description": "Type of program"
        },
        "Discipline": {
          "type": "string",
          "enum": ["Singelåkning", "Paråkning", "Isdans", "Soloisdans", "Synkroniserad konståkning"],
          "description": "Discipline of the program"
        },
        "Ppc": {
          "type": "string",
          "description": "Program content code (jump sequences, elements, etc.)"
        },
        "Coach": {
          "type": "string",
          "description": "Name(s) of the coach(es)"
        },
        "Music": {
          "$ref": "#/definitions/MusicInfo"
        }
      }
    },
    "MusicInfo": {
      "type": "object",
      "properties": {
        "Title": {
          "type": "string",
          "description": "Title of the music"
        },
        "Compositor": {
          "type": "string",
          "description": "Composer of the music"
        }
      }
    }
  }
}
```

## Data Format Examples

### Complete Example Structure

```json
{
  "ExportedAt": "2025-08-30T16:32:48.9839182Z",
  "ExportedBy": "979fc569-46c1-48d9-f7f7-08ddadbcb982",
  "Event": {
    "Id": "00000ab1-f985-4259-952a-00bbb0aa0a22",
    "Name": "DEMO_Elitkristallen 2025",
    "Organizer": {
      "Id": "5562a7fc-841d-4edd-baa3-08dda4431f8e",
      "Name": "Borås Konståkningsklubb"
    },
    "Location": "DEMO_Elitkristallen Arena, Norrby Långgata 47, Borås",
    "StartDate": "2025-09-06T00:00:00+02:00",
    "EndDate": "2025-09-07T00:00:00+02:00",
    "Competitions": [
      {
        "Id": "00000cd2-7af8-428d-1d8f-00ddd0cc0d22",
        "Name": "Nationella serien deltävling 1",
        "Category": "Nationell serie",
        "StartDate": "2025-09-06T00:00:00+02:00",
        "EndDate": "2025-09-07T00:00:00+02:00",
        "Classes": [
          {
            "Id": "f99d0b24-3a41-460d-7744-08ddd9ac0a30",
            "Name": "Junior Damer",
            "Discipline": "Singelåkning",
            "Type": "Singel",
            "Groups": [
              {
                "Index": 0,
                "Name": "Junior Damer",
                "Persons": [
                  {
                    "Id": "0777cca4-d2e5-454f-5089-08dda44b62c5",
                    "FirstName": "Ella",
                    "LastName": "Fehn",
                    "BirthDate": "2008-01-20T00:00:00",
                    "Sex": "F",
                    "Nationality": "SWE",
                    "Organization": {
                      "Id": "caf43d5e-3968-4554-ba46-08dda4431f8e",
                      "Name": "Lerums Konståkningsklubb"
                    },
                    "District": {
                      "Id": "9dce6337-cb42-4042-ba3c-08dda4431f8e",
                      "Name": "Göteborgs Konståkningsförbund"
                    },
                    "EntryDate": "2025-08-13T11:32:18.339673+02:00",
                    "EntryId": "472069e0-7e60-496d-2e9a-08ddda4a8aa8",
                    "Ppcs": [
                      {
                        "Type": "Friåkning",
                        "Discipline": "Singelåkning",
                        "Ppc": "2A + 1Eu + 2F, 3S + 2T, 2F + 2T, FSSp, 3T, 2Lz, ChSq, 2Lz, CCoSp, 2F, LSp",
                        "Coach": "Girts Jekabsons",
                        "Music": {
                          "Title": "Bohemian Rhapsody"
                        }
                      },
                      {
                        "Type": "Kortprogram",
                        "Discipline": "Singelåkning",
                        "Ppc": "2A, 3S + 2T, FSSp, 3Lo, CCoSp, StSq, LSp",
                        "Coach": "Girts Jekabsons",
                        "Music": {
                          "Compositor": "Alicia Keys",
                          "Title": "Fallin'"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Field-by-Field Explanation

#### Root Level Fields
- **ExportedAt**: ISO 8601 timestamp when data was exported
- **ExportedBy**: UUID of the exporting system/user
- **Event**: Main event object containing all competition data

#### Event Object
- **Id**: UUID identifying the event
- **Name**: Human-readable event name
- **Organizer**: Organization object hosting the event
- **Location**: Full address of the venue
- **StartDate/EndDate**: Event date range in ISO 8601 format
- **Competitions**: Array of competition objects

#### Competition Object
- **Id**: UUID for this specific competition
- **Name**: Name of the competition (e.g., "Nationella serien deltävling 1")
- **Category**: Competition type/category
- **Classes**: Array of skating classes
- **Officials**: Array of officials assigned
- **Reserves**: Array of reserve skaters

#### SkatingClass Object
- **Id**: UUID for the class
- **Name**: Class name (e.g., "Junior Damer")
- **Discipline**: Type of skating (Singelåkning, Paråkning, etc.)
- **Type**: Competition format (Singel, Par, etc.)
- **Groups**: Warmup groups
- **Officials**: Officials for this class
- **Reserves**: Reserve skaters for this class

#### Person Object
- **Id**: UUID for the person
- **FirstName/LastName**: Person's name
- **BirthDate**: Date of birth in ISO 8601 format
- **Sex**: "M" or "F"
- **Nationality**: Country code (e.g., "SWE")
- **Organization**: Club/organization object
- **District**: District/region object
- **EntryDate**: When they were registered
- **EntryId**: UUID for their entry
- **Ppcs**: Array of programs they're competing in

#### Program Object
- **Type**: "Kortprogram" or "Friåkning"
- **Discipline**: Skating discipline
- **Ppc**: Program content code (technical elements)
- **Coach**: Coach name(s)
- **Music**: Music information (title, composer)

## Data Validation Rules

### Required Fields Validation
```typescript
const requiredFields = {
  Event: ['Id', 'Name', 'Organizer', 'Location', 'Competitions'],
  Competition: ['Id', 'Name', 'Category', 'StartDate', 'EndDate', 'Classes'],
  SkatingClass: ['Id', 'Name', 'Discipline', 'Type', 'Groups'],
  WarmupGroup: ['Index', 'Name', 'Persons'],
  Person: ['Id', 'FirstName', 'LastName', 'BirthDate', 'Sex', 'Nationality', 'Organization', 'District', 'EntryDate', 'EntryId', 'Ppcs'],
  Official: ['Id', 'FirstName', 'LastName', 'Role', 'Sex', 'Nationality', 'Representing', 'Organization', 'District'],
  Program: ['Type', 'Discipline', 'Ppc']
}
```

### Data Type Validation
- **UUID fields**: Must match UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- **DateTime fields**: Must be valid ISO 8601 format
- **Enum fields**: Must match predefined values
- **Numeric fields**: Must be valid numbers within expected ranges

### Business Logic Validation
1. **Date consistency**: Event dates must contain competition dates
2. **Unique IDs**: All IDs must be unique within the dataset
3. **Person uniqueness**: Same person should not appear multiple times in same class
4. **Program consistency**: Program type must match discipline
5. **Group size**: Groups should not exceed maximum size limits

## Import Implementation Example

```typescript
import { z } from 'zod'

// Define Zod schemas for validation
const MusicInfoSchema = z.object({
  title: z.string().optional(),
  compositor: z.string().optional()
})

const ProgramSchema = z.object({
  type: z.enum(['Kortprogram', 'Friåkning']),
  discipline: z.string(),
  ppc: z.string(),
  coach: z.string(),
  music: MusicInfoSchema.optional()
})

const PersonSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().datetime(),
  sex: z.enum(['M', 'F']),
  nationality: z.string(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string()
  }),
  district: z.object({
    id: z.string().uuid(),
    name: z.string()
  }),
  entryDate: z.string().datetime(),
  entryId: z.string().uuid(),
  ppcs: z.array(ProgramSchema)
})

// Complete schema
const CompetitionDataSchema = z.object({
  ExportedAt: z.string().datetime(),
  ExportedBy: z.string(),
  Event: z.object({
    Id: z.string().uuid(),
    Name: z.string(),
    Organizer: z.object({
      Id: z.string().uuid(),
      Name: z.string()
    }),
    Location: z.string(),
    StartDate: z.string().datetime(),
    EndDate: z.string().datetime(),
    Competitions: z.array(z.object({
      Id: z.string().uuid(),
      Name: z.string(),
      Category: z.string(),
      StartDate: z.string().datetime(),
      EndDate: z.string().datetime(),
      Classes: z.array(z.object({
        Id: z.string().uuid(),
        Name: z.string(),
        Discipline: z.string(),
        Type: z.string(),
        Groups: z.array(z.object({
          Index: z.number(),
          Name: z.string(),
          Persons: z.array(PersonSchema)
        }))
      }))
    }))
  })
})

// Usage in import function
async function importCompetitionData(jsonString: string): Promise<Competition> {
  try {
    const data = JSON.parse(jsonString)
    const validatedData = CompetitionDataSchema.parse(data)
    
    // Transform to application format
    return transformToCompetitionFormat(validatedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      throw new Error(`Data validation failed: ${errorMessages.join(', ')}`
    }
    throw new Error('Failed to parse competition data')
  }
}
```

## Common Import Issues and Solutions

### 1. **Date Format Issues**
- **Problem**: Non-ISO date formats
- **Solution**: Normalize all dates to ISO 8601 format during import

### 2. **Missing Required Fields**
- **Problem**: Optional fields marked as required in schema
- **Solution**: Use optional field validation with sensible defaults

### 3. **UUID Validation**
- **Problem**: Invalid UUID formats
- **Solution**: Use strict UUID validation and generate new UUIDs if needed

### 4. **Data Size Issues**
- **Problem**: Large datasets causing performance issues
- **Solution**: Implement chunked processing and progress indication

### 5. **Character Encoding**
- **Problem**: Special characters in names or locations
- **Solution**: Use UTF-8 encoding and proper string normalization

This comprehensive data format specification provides developers with everything needed to implement robust JSON import functionality.