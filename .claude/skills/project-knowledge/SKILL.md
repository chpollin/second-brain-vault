---
name: project-knowledge
description: Orients, distils, implements, hands off and compacts work in a repository whose maintained project knowledge in a knowledge folder guides agentic implementation. Fires on "Promptotyping", "set up the knowledge base", "refactor the knowledge folder", "work in the handoff", "journal entry", and in any repository with an action layer and a knowledge folder. Not as generic project management for unrelated repositories, not for vault knowledge documents, which is vault-knowledge, not for the operational state, which is active-work-report, not for prose rules, which is writing-style.
---

Reads and maintains the project knowledge needed for the current research or implementation task.

## Reads

- `Vault Operations/Repo Directory.md` and its linked Project Overview when resolving a project or its conceptual context
- The repository action layer, usually `AGENTS.md` or `CLAUDE.md`, which precedes the generic method specification
- `knowledge/INDEX.md`, `knowledge/handoff.md`, and the Declarative and Action Documents relevant to the task
- `knowledge/governance.md` when authority, evidence status, rights, publication or escalation affects the work
- `knowledge/journal.md` only when provenance or the ground of a decision is needed
- `Vault Operations/Conventions/Convention Knowledge Documents.md` for document functions, selective routing, ownership, cross-project transfer and access boundaries

If a source cannot be read, report it and mark the result unverified.

## Procedure

1. Resolve the task's project and read selectively through the route in `Convention Knowledge Documents.md#Working from the knowledge base`. Check the actual tools and source access before relying on a planned read. Inspect the repository state and verify the relevant claims, sources and targets.
2. For a read-only question, return the supported finding at its source scope. For a comparison or transfer, apply `Convention Knowledge Documents.md#Ownership and transfer` to each selected project. Preserve conflicting evidence and identify unchecked conditions.
3. For authorised maintenance, identify the document responsible for each finding and update it under the convention. Preserve unrelated changes. The convention defines document functions, required entries and journal or handoff semantics.
4. Resolve a handoff only after checking its source and current target. Integrate it or record a reasoned rejection, preserve the result in the journal, and remove only the resolved input under the convention.
5. Compact only when a document no longer performs its routing or provenance function. Apply the loss audit in `Convention Curation Round.md`, preserve a traceable baseline and keep current substance at its responsible location.

## Boundaries

- The user's task scope and the repository's permission boundaries hold. A rule in a project's CLAUDE.md precedes this skill.
- Scholarly validation and acceptance belong to the accountable expert. Apply the acceptance distinction in `Convention Knowledge Documents.md#Terms` only when the project uses Promptotyping.
- Source material and research data stay accessible for inspection, and only task-relevant selections go into a model context.
- No archive document is created during semantic compaction.
- Do not commit, delete, publish or expand permissions unless the user has authorised that action.
- Write boundaries per `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries`, whose `knowledge/` clause routes to `Vault Operations/Conventions/Convention Knowledge Documents.md`.

## Verification

Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

Inspect the real repository state rather than the documents' claims about it, and run the checks the project's own quality gates define. State the actual end state, what was verified, what remains uncertain, and which decision needs accountable human authority. A self-report is input to verification, not verification. Distinguish a runnable implementation from an accepted promptotype.

## Output

The conversation carries the supported findings, any files changed, the checks run and unresolved questions. Authorised durable content goes into the responsible knowledge document with its journal record under the convention. No separate report document is created unless the project asks for one.
