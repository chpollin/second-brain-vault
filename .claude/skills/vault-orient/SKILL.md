---
name: vault-orient
description: Opens the vault as a selectively read knowledge source for an instance started outside it, which has not loaded the vault configuration. Fires on "orient yourself in the vault", "vault-orient", "use the vault as a knowledge source", "what does the vault say about this", and whenever a repository session needs the conceptual or design knowledge of its project. Not inside a real vault session, where the vault configuration is loaded anyway. Not for a synthesis of vault content, which is vault-distill, not for maintaining knowledge documents, which is vault-knowledge, not for integrity findings, which is vault-audit, not for the operational state, which is active-work-report.
---

Makes the vault usable as a read-only knowledge source for a session started outside it.

## Reads

Read from the vault root in this order and only as far as the task requires.

1. `AGENTS.md` or `CLAUDE.md`, in particular governance and vault topography
2. `HOME.md` as the navigation entry
3. For a named project, its entry in `Vault Operations/Repo Directory.md` and the linked Project Overview. Otherwise, the relevant MOC or knowledge document for the concrete task
4. `Vault Operations/Conventions/Convention Knowledge Documents.md` when following a project into its repository or comparing projects

If a source cannot be read, report it and mark the result unverified.

## Procedure

1. Read selectively along the order above using the actual runtime's tools and access. Follow only links needed for the task. Never read the whole vault or all linked repositories without a concrete information need.
2. For project evidence, follow `Convention Knowledge Documents.md#Working from the knowledge base` through repository instructions and the knowledge entry to selected documents and relevant code or data. Apply its ownership, transfer and access rules. Report a missing source or unavailable access precisely and qualify only the affected claims. Preserve differences between intended and observed behaviour.
3. Where a vault change turns out to be needed, hand it over instead of making it. The handover names at least the goal, the affected paths, the substantive source, the intended effect and the evidence already checked. The vault task then reads its own local rules and decides on the implementation.

## Boundaries

- Outside a real vault session the entire vault is strictly read-only. No vault file is created, extended, rewritten, moved, renamed or deleted, and no control document, convention, knowledge document, project anchor or metadata is changed.
- This skill is the read-only entry point for an external session. Read the relevant rules before using another read-only procedure. Procedures that write vault files require a real vault session.
- A handover goes to a task started with the vault root as its working directory.
- This skill grants no write permission.

## Verification

Regression cases for skill maintenance stand in [evals/test-cases.md](evals/test-cases.md).

State which vault sources were read, which statements were checked against the repository or another source of truth, and what was not checked.

## Output

The conversation carries the sources read, the statement that holds for the current task, what was verified against the repository, and whether a vault change must be handed to a real vault task.
