---
name: project-knowledge
description: Orients, distils, implements, hands off and compacts work in a repository whose maintained project knowledge in a knowledge folder guides agentic implementation. Fires on "Promptotyping", "set up the knowledge base", "refactor the knowledge folder", "work in the handoff", "journal entry", and in any repository with an action layer and a knowledge folder. Not as generic project management for unrelated repositories, not for vault knowledge documents, which is vault-knowledge, not for the operational state, which is active-work-report, not for prose rules, which is writing-style.
---

Develops an inspectable research artefact from maintained project knowledge through Preparation, Exploration, Distillation and Implementation, which recur rather than run once.

Promptotyping is the method, the recurrent work of Preparation, Exploration, Distillation and Implementation that aims at an accepted promptotype. A promptotype is an iteration accepted for a stated purpose, the identifiable relation among project knowledge, a referenced data state, the artefact and the documented grounds of acceptance. A runnable artefact is not one. This skill reports a runnable artefact and never declares a promptotype, because acceptance belongs to the accountable expert. The project knowledge base is the `knowledge/` folder together with the action layer in the repository root.

## Reads

- The repository action layer, usually `AGENTS.md` or `CLAUDE.md`, which precedes the generic method specification
- `knowledge/INDEX.md`, `knowledge/handoff.md`, and the Declarative and Action Documents relevant to the task
- `knowledge/governance.md` when authority, evidence status, rights, publication or escalation affects the work
- `knowledge/journal.md` only when provenance or the ground of a decision is needed
- `Vault Operations/Conventions/Convention Knowledge Documents.md` for structure, routing, function triggers, templates and frontmatter vocabulary

If a source cannot be read, report it and mark the result unverified.

## Procedure

1. Orient. Read the sources above in that order, inspect the actual repository state, and verify that cited sources and targets still exist. An open handoff point is an input awaiting checking, integration or rejection, so verify its source and current target before relying on it.
2. Distil, to establish or revise the knowledge base. Inspect the source basis, the research purpose, the existing project knowledge and the repository state. Evaluate the function triggers of the convention and create documents by function rather than from a fixed checklist. Every such repository carries `project.md`, `specification.md`, `journal.md`, `handoff.md` and an action layer, while `INDEX.md` is added once the base exceeds three documents or carries several constitutive terms. Create `handoff.md` with `status: active` and the exclusive empty state `No open handoff points.` where no open input exists. Keep each document bounded by one routing question and link related documents instead of duplicating their current content. Derive the action layer after the knowledge documents exist, because it routes into the knowledge base and translates the relevant project rules into operational instructions.
3. Implement and write back. Select a bounded task from the maintained project state, examine data and artefacts with deterministic tools where the operation can be formalised, and develop inspectable versioned increments compared against the relevant Knowledge Documents. Interpret findings at the level where the underlying issue arose and write durable corrections into the responsible Declarative or Action Document. After a durable finding has gone into the responsible document, bring the documents that restate it into step. Record one concise Journal entry after a substantively coherent transition has been integrated, rejected or corrected.
4. Process a handoff point in this order. Verify source and current target, integrate durable content into the responsible document or record a reasoned rejection, add a concise Journal record naming subject, source, target and result, and remove the point completely and restore the empty state when the inbox becomes empty. Each point carries Received, Source, Target and Context, and carries Evidence, Next action, Blocker or Operator point only where the field has content. Accepted future work belongs in `plan.md`, durable cross-project contracts in an Integration Document.
5. Compact a Process Document only when it no longer performs its routing or provenance function, starting from a clean Git baseline so every substantive statement stays traceable. Move current factual or operational content to its responsible document, keep accepted future work in `plan.md` and open received deltas in `handoff.md`, preserve in `journal.md` only the transitions needed to explain the current state, and use Git history for earlier wording.

## Boundaries

- The user's task scope and the repository's permission boundaries hold. A rule in a project's CLAUDE.md precedes this skill.
- Scholarly validation and acceptance are reserved for the accountable Critical Expert. Agents assemble evidence, execute checks and record provisional assessments. An artefact becomes a promptotype only when responsible contributors accept a coherent and identifiable relation among maintained project knowledge, a referenced research-data state, the resulting artefact and documented grounds of acceptance.
- Source material and research data stay accessible for inspection, and only task-relevant selections go into a model context.
- No archive document is created during semantic compaction.
- Do not commit, delete, publish or expand permissions unless the user has authorised that action.
- Write boundaries per `Vault Operations/Conventions/Convention Curation Round.md#Write boundaries`, whose `knowledge/` clause routes to `Vault Operations/Conventions/Convention Knowledge Documents.md`.

## Verification

Inspect the real repository state rather than the documents' claims about it, and run the checks the project's own quality gates define. State the actual end state, what was verified, what remains uncertain, and which decision needs accountable human authority. A self-report is input to verification, not verification. Distinguish a runnable implementation from an accepted promptotype.

## Output

The conversation carries the files actually realised, the checks run, deviations and unresolved findings. Durable content goes into the responsible knowledge document, one concise Journal entry per substantively coherent transition, no separate report document unless the project asks for one.
