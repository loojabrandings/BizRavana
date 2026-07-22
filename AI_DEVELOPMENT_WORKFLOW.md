# AI Development Workflow

This document defines how the AI agent should manage the project during development.

These rules are mandatory.

---

# 1. Read Before Starting

Before performing any development task, always read the following files in this order:

1. CORE_DEVELOPMENT_GUIDELINES.md
2. DEVELOPMENT_LOG.md
3. TASKS.md
4. KNOWN_ISSUES.md (if available)

Never begin coding without understanding the current project state.

---

# 2. Development Log

Maintain a file named:

DEVELOPMENT_LOG.md

Purpose:

- Track completed work
- Prevent duplicate work
- Preserve project history
- Allow future AI sessions to continue seamlessly

Update this file after every completed development task.

Each entry should include:

- Date & Time
- Task Name
- Summary
- Files Created
- Files Modified
- Database Changes
- Notes
- Next Steps

Never remove previous entries.

---

# 3. Task Management

Maintain:

TASKS.md

Organize tasks into:

## Todo

Tasks not started.

## In Progress

Currently being implemented.

## Completed

Finished tasks.

Whenever a task is completed:

- Move it to Completed.
- Add the completion date.

---

# 4. Changelog

Maintain:

CHANGELOG.md

Record all user-visible changes.

Example:

## Version 0.1.0

### Added

- Orders Module
- Customer Module

### Changed

- Improved Mobile Navigation

### Fixed

- Order Calculation Bug

---

# 5. Known Issues

Maintain:

KNOWN_ISSUES.md

Include:

- Bugs
- Temporary limitations
- Technical debt
- Future improvements

Whenever an issue is fixed:

Remove it from this file.

---

# 6. Database Documentation

Whenever the database changes:

Update:

DATABASE_SCHEMA.md

Include:

- Tables
- Columns
- Relationships
- Constraints
- Indexes
- RLS Policies

Never allow the schema documentation to become outdated.

---

# 7. Component Documentation

Whenever a reusable component is created:

Update:

COMPONENTS.md

Document:

- Component Name
- Purpose
- Props
- Example Usage

---

# 8. API Documentation

Whenever an API endpoint is created or modified:

Update:

API.md

Include:

- Endpoint
- Method
- Parameters
- Response
- Authentication
- Example Request

---

# 9. Before Every Commit

Before considering a task complete:

- Update DEVELOPMENT_LOG.md
- Update TASKS.md
- Update CHANGELOG.md
- Update DATABASE_SCHEMA.md (if needed)
- Update COMPONENTS.md (if needed)
- Update API.md (if needed)

---

# 10. Never Forget Context

The AI agent should always preserve project context.

Do not:

- Rebuild completed features.
- Rename files without reason.
- Duplicate components.
- Duplicate business logic.

Always reuse existing code whenever possible.

---

# 11. Development Philosophy

Every implementation must be:

- Production-ready
- Reusable
- Scalable
- Modular
- Well documented
- Mobile-first
- Performance optimized

---

# 12. Important Rule

Every development session must end with updated documentation.

No feature is considered complete until all documentation has been updated.
