---
name: vault-orient
description: Opens the vault as a selectively read knowledge source for an instance started outside it, which has not loaded the vault configuration. Fires on "orient yourself in the vault", "vault-orient", "use the vault as a knowledge source", "what does the vault say about this", and whenever a repository session needs the conceptual or design knowledge of its project. Not inside a real vault session, where the vault configuration is loaded anyway. Not for a synthesis of vault content, which is vault-distill, not for maintaining knowledge documents, which is vault-knowledge, not for integrity findings, which is vault-audit, not for the operational state, which is active-work-report.
---

Makes the vault usable as a read-only knowledge source for a session started outside it.

## Reads

Read from the vault root in this order and only as far as the task requires.

1. `AGENTS.md` or `CLAUDE.md`, in particular governance and vault topography
2. `HOME.md` as the navigation entry
3. The relevant MOC, Project Overview or knowledge document for the concrete task
4. For substantial work in a project repository, the entry in `Vault Operations/Repo Directory.md` and the Project Overview linked there

If a source cannot be read, report it and mark the result unverified.

## Procedure

1. Read selectively along the order above. Follow the link graph for meaning. Never read the whole vault without a concrete information need.
2. Check every mutable project statement against the real repository. The vault can be stale, and the repository decides on local facts.
3. Where a vault change turns out to be needed, hand it over instead of making it. The handover names at least the goal, the affected paths, the substantive source, the intended effect and the evidence already checked. The vault task then reads its own local rules and decides on the implementation.

## Boundaries

- Outside a real vault session the entire vault is strictly read-only. No vault file is created, extended, rewritten, moved, renamed or deleted, and no control document, convention, knowledge document, project anchor or metadata is changed.
- No vault skill is invoked from an environment in which its configuration and rules are not loaded.
- A handover goes to a task started with the vault root as its working directory.
- This skill grants no write permission.

## Verification

State which vault sources were read, which statements were checked against the repository or another source of truth, and what was not checked.

## Output

The conversation carries the sources read, the statement that holds for the current task, what was verified against the repository, and whether a vault change must be handed to a real vault task.
