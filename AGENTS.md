# AGENTS.md

## Purpose

This file defines behavioral rules for AI coding agents working on the project.

## Primary Rule

Do not redesign architecture independently.

Follow:

- CLAUDE.md
- DESIGN.md
- ARCHITECTURE.md
- DATABASE.md
- SEO.md

When instructions conflict, prioritize:

```text
1. Explicit current user instruction
2. CLAUDE.md
3. ARCHITECTURE.md
4. DATABASE.md
5. DESIGN.md
6. SEO.md
```

## Before Coding

Always inspect:

- existing routes
- models
- migrations
- components
- related modules

before generating duplicate structures.

Do not recreate functionality that already exists.

## Implementation Workflow

For each feature:

```text
Understand requirement
↓
Check existing architecture
↓
Plan affected files
↓
Implement backend
↓
Implement frontend
↓
Validation
↓
Authorization
↓
Error states
↓
Tests
↓
Review
```

## Refactoring

Refactor only when:

- current implementation blocks requested work
- duplication is significant
- architecture becomes inconsistent
- explicit instruction requests refactor

Avoid unrelated cleanup during feature work.

## Dependencies

Do not add packages simply because they are convenient.

Before adding dependency, verify:

1. Native Laravel/React cannot handle it reasonably.
2. Existing project does not already include equivalent functionality.
3. Dependency is maintained.
4. Dependency does not introduce unnecessary complexity.

## Database

Never:

- rename existing production columns casually
- drop tables without explicit requirement
- destroy user-generated data
- create duplicate entities

Use migrations for schema changes.

## Frontend

Reuse existing:

- design tokens
- UI components
- layout components
- form components

Do not hardcode arbitrary colors or spacing when design tokens exist.

## Quality

Before completion check:

```text
npm run build

php artisan test
```

and resolve relevant failures.

Do not claim completion when the project does not compile.
