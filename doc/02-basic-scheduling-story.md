# User Story 2: Basic Scheduling

## Description
As a competition organizer, I want the system to automatically generate a basic competition schedule so that I have a starting point for my competition planning.

## Acceptance Criteria
- **Given** I have imported competition data
- **When** I click "Generate Schedule" button
- **Then** The system creates a basic schedule with:
  - Warmup groups formed evenly
  - Performance times assigned based on class rules
  - Basic ice resurfacing sessions included
- **And** The schedule displays in a simple timeline view
- **And** No overlapping sessions for same ice rink

## Definition of Done
- [ ] Basic schedule generation algorithm implemented
- [ ] Warmup group formation logic (even distribution)
- [ ] Performance time assignment based on class type
- [ ] Simple timeline display (basic list or table)
- [ ] No overlap detection and prevention
- [ ] Generate button and basic UI feedback

## KISS/YAGNI Notes
- Use simple list/table view instead of complex Gantt chart initially
- Only implement essential Swedish rules (no advanced optimization)
- Fixed ice resurfacing schedule (every 2 groups)
- No drag-and-drop editing yet
- Focus on getting a valid schedule first
- Don't implement complex constraint validation
- Use default time settings only (no configuration yet)

## Implementation References

For detailed implementation guidance, see:
- **[Technical Specifications](technical-specifications.md)** - Scheduling service architecture and algorithms
- **[Implementation Guide](implementation-guide.md)** - Schedule generator implementation (Phase 3, Section 3.2)
- **[Data Format Specification](data-format-specification.md)** - Competition data structure for scheduling