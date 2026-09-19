---
type: knowledge
created: 2026-09-19
tags: [knowledge, workflow]
status: draft
query-topics: [convention-knowledge-documents, project-knowledge-base, knowledge-folder, action-layer, journal, handoff, promptotyping]
---

# Convention Knowledge Documents

## Trigger

Consult before creating or refactoring documents in the `knowledge/` folder of a repository, and before writing the action layer of a repository.

## Terms

Project knowledge base
: The `knowledge/` folder of a repository together with its action layer. Every project carries one, whatever its method.

Action layer
: `CLAUDE.md` and `AGENTS.md` in the repository root. It routes into the knowledge base and holds no project knowledge, no volatile quantities and no file tree.

Promptotyping
: A method that builds on the knowledge base, the recurrent work of Preparation, Exploration, Distillation and Implementation with the aim of an accepted promptotype.

Promptotype
: An iteration accepted for a stated purpose, the identifiable relation among project knowledge, a referenced data state, the artefact and the documented grounds of acceptance. A runnable artefact is not one, and an agent never declares one, because acceptance belongs to the accountable expert.

## Document functions

| Function | Holds | Typical files |
|---|---|---|
| Declarative Documents | what is known about the subject, the data and the intended artefact | `project.md`, `specification.md`, `data.md`, `architecture.md`, `design.md` |
| Process Documents | how the understanding developed and what arrived from outside | `journal.md`, `handoff.md`, `plan.md` |
| Action Documents | how agents and people work here | the action layer, `governance.md` |
| Entry points | where to start | `README.md`, `INDEX.md` |

Documents are created by function, not from a fixed checklist. Every knowledge base carries `project.md`, `specification.md`, `journal.md`, `handoff.md` and an action layer. `INDEX.md` is added once the base holds more than three documents. Knowledge documents are written in English.

## Working from the knowledge base

1. Read the action layer, then `INDEX.md`, then `handoff.md`, then only the documents the task touches. Read `journal.md` only when the ground of a decision is needed.
2. Verify what you read against code and data, because knowledge can be stale.
3. Write back. A durable finding goes into the document responsible for it, the documents that restate it are brought into step, and the session gets one short journal entry.

## Journal and handoff

`journal.md` is the work diary, one short entry per substantive session that records what changed, what was decided and what stays open. `handoff.md` holds open received input only. A point is checked, integrated or rejected with a reason, recorded in the journal and then removed. The empty state reads `No open handoff points.`.

## Pattern of an action layer

```markdown
# <Repository>

<one sentence, what this repository is and for whom>

## Read first
1. `knowledge/INDEX.md`
2. `knowledge/handoff.md`
3. by task, <question> → `knowledge/<document>.md`

## Rules of this project
<only what departs from the general rules, each with its reason>

## Boundaries
<what is never touched, what stays with the operator>
```

## Bridge to the vault

The vault holds the conceptual knowledge and the Project Overview, the repository holds the project knowledge. [[Repo Directory]] maps one to the other. Neither copies the other.

## Related

- [[Convention Project Overview]]
- [[Convention Curation Round]]
