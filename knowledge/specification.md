# Specification

The template supports bringing together, organizing and connecting knowledge held by a person, knowledge about a person or knowledge within a domain. Its use with an available AI agent includes selecting context and reviewing proposed changes. The intended output is determined by the task, and more explicit knowledge models develop from needs observed in use. Its reusable procedures read substantive knowledge at its maintained location. They do not carry copies of that knowledge in their instructions.

## Implemented components

| Component | Maintained implementation | Required behaviour |
|---|---|---|
| Session rules | `CLAUDE.md` and generated `AGENTS.md` | Route tasks to applicable rules and knowledge, with equivalent instructions for supported readers |
| Navigation and working state | `HOME.md`, `ACTIVE-WORK.md`, `VAULT-OPERATIONS.md`, `TAG-TAXONOMY.md` | Keep document navigation, current work, procedure registration and tag vocabulary in their responsible documents |
| Document conventions | `Vault Operations/Conventions/` | Define field profiles, project overviews, repository knowledge, skills and curation |
| Executable skills | `.claude/skills/` | Provide task-bounded procedures for knowledge maintenance, audit, synthesis, orientation, project knowledge, work reporting, prose style, compact paper development, agentic workflow design and persona initialisation |
| Optional personal profile | Neutral persona template and `persona-init` | Derive an inspectable profile through source reading and dialogue, with personal claims distinguished from inference |
| Structural checks | `scripts/check_vault.py`, generator, commit hook and tests | Check decidable requirements and report measured findings for judgement |
| Synthetic test material | `Vault Operations/Fixtures/` and skill `evals/` | Preserve registered defects and expected behaviour for bounded trials |
| Public method page | `docs/index.html`, `docs/content.js`, `docs/site.css`, `docs/assets/dhcraft/` and `scripts/build_site.py` | One static page after the Promptotyping start page, opening light, with a standalone SVG main figure in `docs/images/`, in English and German, readable without JavaScript, with a prompt demo on the synthetic example domain, without serving `knowledge/` |
| Knowledge explorer | `docs/explorer.html`, `docs/decision.js`, `docs/decision.css` | Follow the curated visual grounds, derivation and scope of the photo-format decision; select an object to read its original evidence in place. The generic note browser remains at `docs/notes.html` |
| Research procedure | [Evaluation](evaluation.md) and [episode template](episode-template.md) | Preserve the sources, interventions and outcomes of an observed episode, with missing stages explicit |

The repository distributes the method page and synthetic knowledge explorer. Its generated `docs/data.json` and `docs/explorer.json` are ignored and are built locally before checks or preview. The Pages workflow builds them from the published source, runs structural checks, Python tests including the site privacy test, Ruff checks, the Node.js link, explorer route and page text tests and a syntax check of every page script, then deploys `docs/` as an artifact. The generated data is never committed. Stale generated agent instructions still fail the checks.

Skills are executable procedures when an agent reads and follows them. A skill file alone installs no runtime, account connection or tool. The actual host determines which operations are available.

## Design constraints

- Each statement has one maintained location. Changes require inspection of inbound references and correction of stale restatements.
- Personal content stays outside the public template. Persona output defaults to `.local/`, excluded from Git and the site. The original personal Research Persona remains unpublished.
- The template uses English, including ACTIVE-WORK field names. Derivation from a differently named source schema requires explicit mapping.
- The checker reads rule values from their maintained documents and aborts when a required source is missing. Hard rules reject a commit, measured rules report findings, and heuristic rules require judgement.
- Fixtures stay outside regular checks and run explicitly. Their expected defects remain part of the test contract.
- Optional components can be removed only with their references and dependencies inspected. The [README](../README.md#start-smaller) gives the removal procedure. A separate core-and-packs architecture is unnecessary for the implemented template.
- The template carries no source-specific exclusion of particular websites. Source rules require reading a source's full text before citing it.
- The template names the steering person the operator and the LLM-driven program the agent, following the source owner's terminology of 2026-11-10. Technical keys such as operator points keep their names.

## Explorer requirements

The explorer reads only `docs/example/`. Each resolved reference retains its direction, literal occurrence, source line and excerpt. Unresolved references preserve their reason, including references outside the example boundary, so they can be distinguished from missing notes. Connected components and isolated notes are structural review candidates. The interface follows the [task and interaction contract](design.md#knowledge-explorer), and the [review tasks](evaluation.md#knowledge-explorer-review) keep observed usability separate from technical correctness and operator acceptance.

## Verification

Run the following after a template change:

```powershell
python scripts/render_agents_md.py
python scripts/build_site.py
python scripts/build_explorer.py
python scripts/build_explorer.py --check
python scripts/check_vault.py
python -m pytest -q
python -m ruff check .
python -m ruff format --check .
node --test tests/test_markdown_links.mjs tests/test_explorer_route.mjs tests/test_page_text.mjs
Get-ChildItem docs/*.js, docs/assets/dhcraft/*.js | ForEach-Object { node --check $_.FullName }
```

Page development requires Node.js for the link, route and page text tests and the syntax check. The published page runs in the browser without Node.js.

Inspect measured findings even when the command exits successfully. The checker covers links, anchors and reachability, with no counterpart here to the larger audit engine of the personal source vault. Skill case results remain in [skill evaluation](skill-evaluation.md). These checks do not evaluate conversational quality or the scholarly validity of a new research claim.
