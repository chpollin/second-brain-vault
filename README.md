# Second Brain as a Personal Research Environment for Working with AI Agents

Second Brain connects a maintained personal research vault with the knowledge held in project repositories and the procedures that AI agents use to work with it. The vault holds developed ideas, source readings and cross-project relations. Each repository keeps its requirements, decisions and domain knowledge in a `knowledge/` folder. Conversation gives the person and agent a place to examine this material and develop new contributions. Accepted findings return to their responsible documents through authorized maintenance.

This repository provides a reusable Obsidian vault template for that arrangement. It contains synthetic example notes, executable skills, document conventions and structural checks. Open it in Obsidian and adapt it to your own domains and projects. The source owner's research corpus and personal Research Persona remain unpublished.

The [structure explorer](https://chpollin.github.io/second-brain-vault/) lets you inspect the template and trace which files an agent reads for a task. It is generated from this repository. It is distinct from the operational interface used with the personal research vault.

## Knowledge, procedures and dialogue

| Part of the environment | Role | What this repository supplies |
|---|---|---|
| Personal research vault | Maintained conceptual knowledge and relations across projects | Reusable note structure, navigation and conventions with synthetic content |
| Project repositories | Substantive project knowledge beside data and implementation | A repository directory, Project Overview convention and `project-knowledge` procedure |
| Executable skills | Procedures that select, inspect and maintain relevant knowledge | Skills under `.claude/skills/`, registered in `VAULT-OPERATIONS.md` |
| Conversation | A question, source-based reasoning, proposed changes and personal feedback | Rules for agent work and optional persona initialisation, used in an available agent host |
| User interfaces | Inspectable views of selected documents or results | A static explorer of the public template |

The vault and repository knowledge form a linked documentary structure. Agents follow explicit references and read the sources needed for the question. The template implements no automatic retrieval across repositories. A skill describes how to act and reads substantive knowledge from its maintained location. Its execution depends on the tools and access available in the actual agent host.

The real ACTIVE-WORK interface is maintained separately in a private repository. A separate context exporter prepares explicitly selected vault files for a conversation and records their provenance. It does not automatically retrieve the contents of linked repositories. These boundaries are specified in [integration](knowledge/integration.md).

## Related methods and research scope

[Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) connects maintained project knowledge with the iterative development of research artefacts. The template applies this through its `project-knowledge` skill. [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) addresses source-grounded knowledge work, while [Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) addresses research coordination. Their specifications remain in their own repositories.

Second Brain brings these concerns into a personal research environment. The [manuscript](knowledge/paper.md), *Second Brain as a Personal Research Environment for Working with AI Agents*, presents the design and a proposed empirical study. The [evaluation procedure](knowledge/evaluation.md) and [episode template](knowledge/episode-template.md) support recording real research episodes, including rejected and unresolved contributions. The [recorded skill trials](knowledge/skill-evaluation.md) cover bounded synthetic cases and do not establish a general benefit or scholarly validation. The [project knowledge](knowledge/INDEX.md) states the purpose, implemented requirements and component boundaries.

## What you need

- Obsidian, to read and navigate the vault
- an agent that works in a folder and reads `CLAUDE.md` or `AGENTS.md`, for example Claude Code or Codex
- Git, because the agent's changes are reviewed and undone through it
- Python 3.11 or newer for the checks, standard library only, with pytest for the tests

The vault is usable without Python. The checks then do not run, and the rule tiers described below lose their enforcement.

## Open it

1. Put the folder where your notes live and run `git init` in it if it did not arrive as a repository.
2. Open the folder as a vault in Obsidian.
3. Start an agent session in the folder. Claude Code reads `CLAUDE.md` and Codex reads `AGENTS.md`. Configure other agents to read one of these files. Both files carry the same rules, including explicit reading instructions for runtimes that do not discover the rule files or skills automatically.
4. Run the checks once to see that the copy is intact.

```powershell
python scripts/build_site.py
python scripts/check_vault.py
python -m pytest -q
```

## Build your research persona

This optional initialisation turns your research background, materials and working preferences into a personal profile. The template contains no ready-made identity. Start an agent session in your copy and give this instruction:

```text
Read .claude/skills/persona-init/SKILL.md and initialise my research persona.
Use relevant notes and my answers. Ask at most three questions at a time,
and include the information I need to answer them. Show me the entire
profile as readable prose before asking for feedback. Save a draft with
sources and unresolved points, keeping the working agreement separate.
```

You can start without existing notes. The agent asks about your research and materials,
the support you want, and a concrete task or preference. With a populated vault it reads
selected sources first, including foundational research such as a dissertation when relevant.
Explicit statements remain confirmed within their scope. Inferred personal claims stay open.

The procedure uses [Template Research Persona](Vault%20Operations/Templates/Template%20Research%20Persona.md).
The default output is `.local/persona/Research Persona.md`. It contains a readable profile,
the co-researcher and interview modes, source provenance and remaining questions. `.local/`
is excluded from Git, the regular vault check and the public explorer. The agent checks the
saved profile separately. Obsidian normally hides dot-folders. In a private working vault
you can ask the agent to move it to a visible note and add navigation. Do not do this in a
copy used to publish the explorer, which includes ordinary vault notes.

For a first trial, provide an actual question and say:

```text
Use .local/persona/Research Persona.md in co-researcher mode.
Answer my research question using the relevant source notes and show
which evidence supports your conclusion.
```

The session-start rule makes the local profile discoverable for relevant work. For a
simulated interview, explicitly request interview mode. Ask for an update when your
profile changes. The procedure preserves earlier evidence and confirmations. A saved
profile does not install tools, connect a model or establish that the persona works well.

## First session

These orders show the working mode. Reading and reporting can run against the template. For a repair trial, use a disposable copy and name the copied fixtures explicitly. Keep the source template unchanged.

```text
Read HOME and CLAUDE and tell me in ten lines how this vault is organised.

Run the skill vault-knowledge in mode check on the folder Vault Operations/Fixtures.
Report numbered findings and change nothing.

In the disposable copy, repair accepted findings 1 and 2 with mode refactor.
This explicitly authorises maintenance of the copied Vault Operations/Fixtures
corpus, whose expected defects are asserted by
tests/test_check_vault.py::test_fixtures_show_the_seeded_defects.
Keep that test unchanged as a record of the original defects. Show which
neighbouring documents changed and which seeded defects remain. Preserve
the source template.

Use mode research to add a concept note on a topic of my field to Example Domain.
Open every source you cite.

Report the operational state with the skill active-work-report.
```

The fixture folder holds a small fictional cluster with seeded defects, a restatement in an earlier state, an appended enrichment, a divergent citation, a dead anchor and a temporary note. `Vault Operations/Fixtures/Fixtures.md` lists which skill mode is expected to find which defect. The command below intentionally reports defects in the unchanged corpus. Repaired copies no longer satisfy tests that expect those defects. Positive deletion trials use renamed working notes outside the registered corpus, as described in `.claude/skills/vault-knowledge/evals/test-cases.md`.

```powershell
python scripts/check_vault.py --fixtures
```

## The techniques and where they live

Each technique is implemented in one place. Read that place, then copy the form.

1. A short constitution read at session start. `CLAUDE.md` and its generated `AGENTS.md` state the working mode, the topography and the one idea, and index everything else with the task that triggers reading it. They stay short because every session pays for their length.
2. Rules selected by document path. The files under `.claude/rules/` carry a `paths:` header. Claude Code loads matching rules automatically. Other agents read the applicable files explicitly as directed by the constitution. What must hold for every document stands there and never in a skill, because a skill only runs when it is called.
3. Conventions that load on demand. `Vault Operations/Conventions/` holds the detail, and each entry of the convention index in `CLAUDE.md` names the situation in which the agent reads it.
4. Skills with a common structure. Each `SKILL.md` identifies its triggers, required reading, procedure, boundaries and verification. Additional invariants and references serve the individual task. Modes of one skill are reference files one level below it. `Convention Skills` states the rules, and `vault-knowledge` is the fullest example.
5. A skill reads knowledge and never copies it. A pointer replaces a rule copy only when the rule really stands at the target, which the decision log records as a lesson from rewriting the skills.
6. Rule tiers. A rule is hard, measured or heuristic. Hard rules block a commit and exist only where the check is decidable without judgement and without false alarms. Measured rules produce a work list. Heuristic rules stay judgement in curation.
7. Rule values with one maintained place. The check script reads the required frontmatter core from a YAML block in `Convention Frontmatter Field Profiles` and the tags from `TAG-TAXONOMY.md`. A missing rule source aborts the check visibly and never counts as a pass.
8. A generated `AGENTS.md`. `scripts/render_agents_md.py` derives it from `CLAUDE.md`, and the commit check rejects a stale copy, so two agent families never drift apart.
9. Propagation after a change. After any changed statement the agent walks the inbound links, reads each location and decides per location whether to update it, replace it by a link or leave it. `Convention Curation Round` names the error classes this prevents.
10. Bounded delegation and explicit write authority. The curation convention defines the default use of reading agents and acceptance of findings. The current assignment and repository rules determine authorized writes. An agent's report about its own work counts as unverified until checked against the files.
11. A loss audit before every deletion. Each statement of the source is located in the target or dropped for a stated reason, and a deletion that cannot be completed ends as blocked with the decision that would release it.
12. Operator points. An open question to you stands in `ACTIVE-WORK.md` as exactly one question that you can answer without opening another file.
13. Fixtures as a test field for skills. Seeded defects with a register of expected findings let you test a skill with an agent that does not know the answers. `.claude/skills/vault-knowledge/evals/test-cases.md` states the expected behaviour.
14. A style skill with contrast examples and a self-check. `writing-style` states prose rules by description and shows a contrast pair where a rule resists description.

## Layout

```text
second-brain-vault/
├── CLAUDE.md                  rules of the vault, read at session start in Claude Code
├── AGENTS.md                  generated from CLAUDE.md, never edited by hand
├── HOME.md                    navigation hub, every document is reachable from here
├── ACTIVE-WORK.md             present project state, next steps, open operator points
├── VAULT-OPERATIONS.md        task types, skill register, roles, glossary, decisions in force
├── TAG-TAXONOMY.md            closed tag vocabulary
│
├── Example Domain/            one folder per knowledge domain, concept notes and the domain MOC
├── Literature/                one note per read source
├── Projects/                  one subfolder per undertaking with a Project Overview as hub
├── Writing/                   your own texts, agents report and do not edit prose
│
├── Vault Operations/          the vault's knowledge about itself
│   ├── Conventions/           detail rules, read on demand
│   ├── Templates/             concept note, literature note, Project Overview, research persona
│   ├── Fixtures/              synthetic documents with deliberate defects, the test field
│   ├── Decision Log.md        why a rule holds
│   ├── Done Log.md            finished work with its date
│   └── Repo Directory.md      which repository belongs to which project
│
├── .claude/
│   ├── rules/                 rules selected by path, explicitly read where needed
│   └── skills/                executable procedures, registered in VAULT-OPERATIONS.md
│
├── scripts/
│   ├── check_vault.py         hard and measured rules
│   ├── render_agents_md.py    generates AGENTS.md
│   ├── build_site.py          generates docs/data.json for the explorer
│   └── hooks/pre-commit       rejects a commit that violates a hard rule
│
├── docs/                      static explorer of this folder, servable by GitHub Pages
├── tests/                     tests of the check script and of the generator
└── knowledge/                purpose, requirements, integration and maintenance history
```

The skills and what each is for stand in the skill register of `VAULT-OPERATIONS.md`, the conventions in the convention index of `CLAUDE.md`. The check script reports a skill or a convention that exists on disk and is missing from its register.

`docs/` shows the file tree by the way each file reaches an agent, renders files and traces which files a task requires. It reads `docs/data.json`, which `scripts/build_site.py` derives from the real files. This generated file is ignored by Git. Run `python scripts/build_site.py` after a template change and before checks, a commit or local preview. The checker reports missing or stale explorer data as a hard finding, as it does for stale generated `AGENTS.md` instructions.

The repository distributes the explorer source. `.github/workflows/pages.yml` builds its data, runs the checks and deploys `docs/` as a Pages artifact on pushes to `main` and manual runs. Set the repository's Pages source to GitHub Actions to use this workflow. Deployment does not commit the generated data.

For local preview, build first and run `python -m http.server --directory docs` from the repository root, then open `http://localhost:8000`. Browser modules require HTTP rather than `file://`. To remove the explorer, follow the dependency checks in [Start smaller](#start-smaller).

## Make it your own

1. Replace `Example Domain/` by your domains and register one tag per domain in `TAG-TAXONOMY.md`.
2. Replace the example project and its entry in `ACTIVE-WORK.md`, and fill `Vault Operations/Repo Directory.md`.
3. Adjust `CLAUDE.md` to your way of working and run `python scripts/render_agents_md.py`.
4. Enable the commit check with `git config core.hooksPath scripts/hooks`. It runs the hard checks only. Run `python scripts/check_vault.py` separately for measured findings, which need judgement and do not block a commit.
5. Write your prose rules into `writing-style`. A style skill for another language needs contrast examples in that language.
6. Record every rule change with its reason in `Vault Operations/Decision Log.md`.
7. Adapt this README and the template knowledge to the purpose of your own vault. Remove template-specific documentation only after redirecting its references and retaining any decisions your instance still needs.

The persona procedure is optional. Keep `.claude/skills/persona-init/` and
`Vault Operations/Templates/Template Research Persona.md` if you use it. If you remove it,
also remove its task and skill rows from `VAULT-OPERATIONS.md`, the session-start instruction
from `CLAUDE.md`, and its template link from the operations MOC, then regenerate `AGENTS.md`.

## Start smaller

Begin with the notes and skills you need while keeping their dependencies. The checker requires `Convention Frontmatter Field Profiles`, `TAG-TAXONOMY.md`, `CLAUDE.md`, `HOME.md`, `VAULT-OPERATIONS.md` and all modules in `scripts/`. The generated-file check also requires a locally built `docs/data.json`. Skills read additional conventions and templates named in their `Reads` sections.

To remove a skill or convention, first inspect references to its name across the vault, including `.claude/`, `scripts/` and `tests/`. Preserve any rule source that a remaining procedure or check needs. Remove the optional file or folder together with its register entry, navigation links and dependent instructions. Regenerate `AGENTS.md` after a constitution change and `docs/data.json` after any template change, then run both `python scripts/check_vault.py` and `python -m pytest -q`. A successful commit establishes only that the hard rules passed. Read the measured findings as well.

The tests describe the distributed template. Removing a named component can require an explicit test change to match the smaller vault, such as the known-file assertion for `Convention Skills` in `tests/test_build_site.py`. Preserve the checks for broken links, required rule sources and stale generated files. Removing the explorer requires adapting its import and currency check in `scripts/check_vault.py` and its tests before deleting `docs/` or `scripts/build_site.py`.

The skills `project-knowledge` and `vault-orient` apply when you keep code repositories next to the vault. `active-work-report` applies when you use `ACTIVE-WORK.md` as your board.

## Licence

Text and documentation CC BY 4.0, code MIT, see [LICENSE.md](LICENSE.md).
