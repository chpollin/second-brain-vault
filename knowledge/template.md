# Template

## Purpose

The directory is a vault template that a reader clones and opens. It is a model and
abstraction of a maintained personal research vault, stated without any of that vault's
content. A rule that can be stated without the projects and names of the source vault is
architecture and belongs here. Everything else is content and stays out.

## Scope

| Layer | In the template | Source of the form |
|---|---|---|
| Rules | `CLAUDE.md`, generated `AGENTS.md`, two path-bound rule files | rule layers of the source vault |
| Control documents | HOME, ACTIVE-WORK, VAULT-OPERATIONS, TAG-TAXONOMY | the five control documents |
| Conventions | field profiles, ACTIVE-WORK fields, Project Overview, knowledge documents, skills, curation round | the detail conventions |
| Skills | vault-knowledge, vault-audit, vault-distill, vault-orient, project-knowledge, active-work-report, writing-style | the portable layer of the skill set |
| Checks | `scripts/check_vault.py`, `scripts/render_agents_md.py`, commit hook, tests | the rule tiers |
| Test field | `Vault Operations/Fixtures/` with seeded defects | error classes of the curation convention |

Personal layers stay out, meaning text-type modes of the style skill in the operator's voice,
the persona profile, memory, and every business procedure.

## Derivation

The source vault remains the place where rules are tried in daily work. The template is
derived from it. The first derivation of 2026-09-19 was written by hand. Whether later
derivations run through an export script, or whether the template becomes the master and the
source vault an instance of it, is an open operator decision.

## Audience and distribution

The readers are people who want to reuse the prompting and steering techniques of the source
vault with their own notes. They know Obsidian and have worked with a coding agent, and they do
not know the source vault. The README therefore names each technique with the place that
implements it and gives orders for a first session. The folder is self-contained, carries its
own licence file and can be handed on as an archive or split into a repository of its own. How
and where it is distributed is the operator's decision.

A research prototype that shared the working directory until 2026-09-19 lives elsewhere.
Nothing in the template depends on it.

The public repository is derived from the working folder as a snapshot without history, and
the working folder stays the place of maintenance. The page under `docs/` is served by GitHub
Pages at https://chpollin.github.io/second-brain-vault/.

## Decisions taken in the first derivation

- The language of the template is English, including the inline field names of ACTIVE-WORK
  (`category`, `state`, `goals`, `waiting-on-operator`). The source vault keeps German
  identifiers because its generators and views read them, so a derivation maps the names.
- The skill for repository knowledge is named `project-knowledge` after its object. The method
  Promptotyping is defined inside it and in the convention on knowledge documents.
- The check script reads every rule value from its place of maintenance and aborts when a
  source is missing.
- Fixtures are excluded from the regular check and checked on request, and a test asserts that
  the machine-decidable defects are found.
- One operator rule of the source vault names a specific website that is never used as a
  source. It is not carried into the template, because a template does not make statements
  about third parties. A vault owner adds such a rule to `CLAUDE.md`.

## Open

- The skill `vault-knowledge` was run twice against scratch copies of the fixtures on 2026-09-19 by agents that did not know the expected findings. All seeded defects were found. The critique of the skill as an instrument was worked into the skill, first in the source vault and from there into the template. The other skills have not been run.
- A design with a core and optional packs was considered and dropped. The README names the core
  and how to remove the rest, and the check script reports a skill or convention that is
  missing from its register, which keeps the enumerations in step without an install step.
- The template has no counterpart to the larger audit engine of the source vault. The check
  script covers links, anchors and reachability.
