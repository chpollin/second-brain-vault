# Specification

The template must support a person and an available AI agent in maintaining research knowledge, selecting context and reviewing proposed changes. Its reusable procedures read substantive knowledge at its maintained location. They do not carry copies of that knowledge in their instructions.

## Implemented components

| Component | Maintained implementation | Required behaviour |
|---|---|---|
| Session rules | `CLAUDE.md` and generated `AGENTS.md` | Route tasks to applicable rules and knowledge, with equivalent instructions for supported readers |
| Navigation and working state | `HOME.md`, `ACTIVE-WORK.md`, `VAULT-OPERATIONS.md`, `TAG-TAXONOMY.md` | Keep document navigation, current work, procedure registration and tag vocabulary in their responsible documents |
| Document conventions | `Vault Operations/Conventions/` | Define field profiles, project overviews, repository knowledge, skills and curation |
| Executable skills | `.claude/skills/` | Provide task-bounded procedures for knowledge maintenance, audit, synthesis, orientation, project knowledge, work reporting, writing and persona initialisation |
| Optional personal profile | Neutral persona template and `persona-init` | Derive an inspectable profile through source reading and dialogue, with personal claims distinguished from inference |
| Structural checks | `scripts/check_vault.py`, generator, commit hook and tests | Check decidable requirements and report measured findings for judgement |
| Synthetic test material | `Vault Operations/Fixtures/` and skill `evals/` | Preserve registered defects and expected behaviour for bounded trials |
| Public structure explorer | `docs/` and `scripts/build_site.py` | Derive displayed files, links and prescribed reading sequences from the template |
| Research procedure | [Evaluation](evaluation.md) and [episode template](episode-template.md) | Preserve the sources, interventions and outcomes of an observed episode, with missing stages explicit |

The repository distributes explorer source. Its generated `docs/data.json` is ignored and is built locally before checks or preview. The Pages workflow builds it from the published source, runs structural checks, Python tests, Ruff checks and Node.js link tests, then deploys `docs/` as an artifact. The generated data is never committed. Stale generated agent instructions still fail the checks.

Skills are executable procedures when an agent reads and follows them. A skill file alone installs no runtime, account connection or tool. The actual host determines which operations are available.

## Design constraints

- Each statement has one maintained location. Changes require inspection of inbound references and correction of stale restatements.
- Personal content stays outside the public template. Persona output defaults to `.local/`, excluded from Git and the explorer. The original personal Research Persona remains unpublished.
- The template uses English, including ACTIVE-WORK field names. Derivation from a differently named source schema requires explicit mapping.
- The checker reads rule values from their maintained documents and aborts when a required source is missing. Hard rules reject a commit, measured rules report findings, and heuristic rules require judgement.
- Fixtures stay outside regular checks and run explicitly. Their expected defects remain part of the test contract.
- Optional components can be removed only with their references and dependencies inspected. The [README](../README.md#start-smaller) gives the removal procedure. A separate core-and-packs architecture is unnecessary for the implemented template.
- Source-specific exclusions remain in the owner's rules. The public template does not reproduce the original owner's prohibition concerning a particular third-party website.

## Verification

Run the following after a template change:

```powershell
python scripts/render_agents_md.py
python scripts/build_site.py
python scripts/check_vault.py
python -m pytest -q
python -m ruff check .
python -m ruff format --check .
node --test tests/test_explorer_links.mjs
```

Explorer development requires Node.js for the link regression tests. The published explorer runs in the browser without Node.js.

Inspect measured findings even when the command exits successfully. The checker covers links, anchors and reachability, with no counterpart here to the larger audit engine of the personal source vault. Skill case results remain in [skill evaluation](skill-evaluation.md). These checks do not evaluate conversational quality or the scholarly validity of a new research claim.
