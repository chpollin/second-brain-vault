---
type: knowledge
created: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-project-overview, project-hub, summary, project-type, agent-modus]
---

# Convention Project Overview

## Trigger

Consult before creating or updating the hub document of an undertaking under `Projects/`.

## Purpose

A Project Overview is the slow hub of a project in the vault. It states what the project is, where its source of truth lies and how it connects to the rest of the vault. The operational state lives in [[ACTIVE-WORK]], the project knowledge in the repository.

## Structure

1. `## Summary`, exactly two paragraphs. The first says what the project is and what it delivers. The second says which source of truth governs it, typically the `knowledge/` folder of its repository.
2. `## Workstreams`, a table of workstream, result with its check, and state, only where the project has several.
3. `## Sources`, links to the live artefact, the repository, the data and the documentation.
4. `## Related`, with [[HOME]] and the concept notes the project draws on.

## Frontmatter

`type: knowledge` with the tag `hub`. Two optional control fields tell an agent how to work. `project-type` names the kind of project. `agent-modus` says how far an agent may act on its own, `accompanied` when the operator decides every step, `autonomous` within the stated scope.

## What stays out

Next steps, dates, the current state, technical detail of the implementation, and anything the repository already records.

## Related

- [[Convention ACTIVE-WORK Fields]]
- [[Convention Knowledge Documents]]
- [[Repo Directory]]
