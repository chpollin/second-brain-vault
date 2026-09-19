# Second Brain Vault

A template for a personal research vault that you maintain together with LLM-based agents such as Claude Code. Open the folder in Obsidian, start an agent session in it, and replace the placeholders with your own domains, projects and notes. Every document in it is synthetic and shows a form.

Browse the structure before you download anything, at https://chpollin.github.io/second-brain-vault/. The page shows every file by the way it reaches an agent and traces which files an agent loads for a task.

The template models one idea. Every statement and every rule has one maintained place, and whoever changes that place brings the documents that restate it into step. The rules, the skills and the checks all serve that idea, and each of them is written so that you can lift it into a vault or repository of your own.

## What you need

- Obsidian, to read and navigate the vault
- an agent that works in a folder and reads `CLAUDE.md` or `AGENTS.md`, for example Claude Code
- Git, because the agent's changes are reviewed and undone through it
- Python 3.11 or newer for the checks, standard library only, with pytest for the tests

The vault is usable without Python. The checks then do not run, and the rule tiers described below lose their enforcement.

## Open it

1. Put the folder where your notes live and run `git init` in it if it did not arrive as a repository.
2. Open the folder as a vault in Obsidian.
3. Start an agent session in the folder. Claude Code loads `CLAUDE.md`, other agents load `AGENTS.md`, and both carry the same rules.
4. Run the checks once to see that the copy is intact.

```powershell
python scripts/check_vault.py
python -m pytest -q
```

## First session

These five orders show the working mode. Type them to the agent one after the other.

```text
Read HOME and CLAUDE and tell me in ten lines how this vault is organised.

Run the skill vault-knowledge in mode check on the folder Vault Operations/Fixtures.
Report numbered findings and change nothing.

I accept findings 1 and 2. Repair them with mode refactor and show me which
other documents you brought into step.

Use mode research to add a concept note on a topic of my field to Example Domain.
Open every source you cite.

Report the operational state with the skill active-work-report.
```

The fixture folder holds a small fictional cluster with seeded defects, a restatement in an earlier state, an appended enrichment, a divergent citation, a dead anchor and a temporary note. `Vault Operations/Fixtures/Fixtures.md` lists which skill mode is expected to find which defect. After the trial restore the seeded state, because a repaired fixture makes the test of the check script fail.

```powershell
python scripts/check_vault.py --fixtures
git restore "Vault Operations/Fixtures"
```

## The techniques and where they live

Each technique is implemented in one place. Read that place, then copy the form.

1. A short constitution that is always loaded. `CLAUDE.md` states the working mode, the topography and the one idea, and indexes everything else with the task that triggers reading it. It stays short because every session pays for its length.
2. Rules that load by path. The files under `.claude/rules/` carry a `paths:` header and load when a matching file is touched. What must hold for every document stands there and never in a skill, because a skill only runs when it is called.
3. Conventions that load on demand. `Vault Operations/Conventions/` holds the detail, and each entry of the convention index in `CLAUDE.md` names the situation in which the agent reads it.
4. Skills with one skeleton. Every `SKILL.md` has a description that names its triggers and the cases it is not for, then the sections Reads, Procedure, Invariants, Boundaries, Verification and Output. Modes of one skill are reference files one level below it. `Convention Skills` states the rules, and `vault-knowledge` is the fullest example.
5. A skill reads knowledge and never copies it. A pointer replaces a rule copy only when the rule really stands at the target, which the decision log records as a lesson from rewriting the skills.
6. Rule tiers. A rule is hard, measured or heuristic. Hard rules block a commit and exist only where the check is decidable without judgement and without false alarms. Measured rules produce a work list. Heuristic rules stay judgement in curation.
7. Rule values with one maintained place. The check script reads the required frontmatter core from a YAML block in `Convention Frontmatter Field Profiles` and the tags from `TAG-TAXONOMY.md`. A missing rule source aborts the check visibly and never counts as a pass.
8. A generated `AGENTS.md`. `scripts/render_agents_md.py` derives it from `CLAUDE.md`, and the commit check rejects a stale copy, so two agent families never drift apart.
9. Propagation after a change. After any changed statement the agent walks the inbound links, reads each location and decides per location whether to update it, replace it by a link or leave it. `Convention Curation Round` names the error classes this prevents.
10. Reading agents and one write gate. Subagents read and return numbered findings, the operator accepts them by number, and only the vault session writes. An agent's report about its own work counts as unverified until checked against the files.
11. A loss audit before every deletion. Each statement of the source is located in the target or dropped for a stated reason, and a deletion that cannot be completed ends as blocked with the decision that would release it.
12. Operator points. An open question to you stands in `ACTIVE-WORK.md` as exactly one question that you can answer without opening another file.
13. Fixtures as a test field for skills. Seeded defects with a register of expected findings let you test a skill with an agent that does not know the answers. `.claude/skills/vault-knowledge/evals/test-cases.md` states the expected behaviour.
14. A style skill with contrast examples and a self-check. `writing-style` states prose rules by description and shows a contrast pair where a rule resists description.

## Layout

```text
second-brain-vault/
├── CLAUDE.md                  rules of the vault, always loaded, kept short
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
│   ├── Templates/             concept note, literature note, Project Overview
│   ├── Fixtures/              synthetic documents with deliberate defects, the test field
│   ├── Decision Log.md        why a rule holds
│   ├── Done Log.md            finished work with its date
│   └── Repo Directory.md      which repository belongs to which project
│
├── .claude/
│   ├── rules/                 rules that load by path
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
└── knowledge/template.md      scope, derivation and design decisions of this template
```

The skills and what each is for stand in the skill register of `VAULT-OPERATIONS.md`, the conventions in the convention index of `CLAUDE.md`. The check script reports a skill or a convention that exists on disk and is missing from its register.

`docs/` is a page that shows the file tree by the way each file reaches an agent, renders any file, and traces for a chosen task which files an agent loads and why. It reads `docs/data.json`, which `scripts/build_site.py` derives from the real files. Every change to the vault makes that file stale, and the check reports a stale `docs/data.json` as a hard finding, as it does for a stale `AGENTS.md`. Run `python scripts/build_site.py` before committing, or delete `docs/` and its generator together with this README when the vault is yours. To look at the page, serve the folder, for example with `python -m http.server` from `docs/`, because a module script does not load from `file://`.

## Make it your own

1. Replace `Example Domain/` by your domains and register one tag per domain in `TAG-TAXONOMY.md`.
2. Replace the example project and its entry in `ACTIVE-WORK.md`, and fill `Vault Operations/Repo Directory.md`.
3. Adjust `CLAUDE.md` to your way of working and run `python scripts/render_agents_md.py`.
4. Enable the commit check with `git config core.hooksPath scripts/hooks`.
5. Write your prose rules into `writing-style`. A style skill for another language needs contrast examples in that language.
6. Record every rule change with its reason in `Vault Operations/Decision Log.md`.
7. Delete `knowledge/` and this README once the vault is yours.

## Start smaller

The core is `CLAUDE.md`, the two rule files, the skill `vault-knowledge`, the convention on the curation round and the check script. Everything else can go without breaking the core. To remove a skill, delete its folder and its rows in `VAULT-OPERATIONS.md`. To remove a convention, delete the file and its line in the convention index of `CLAUDE.md`, then regenerate `AGENTS.md`. Run the check afterwards, it lists every link that now points nowhere. The skills `project-knowledge` and `vault-orient` only matter when you keep code repositories next to the vault, and `active-work-report` only when you use `ACTIVE-WORK.md` as your board.

## Licence

Text and documentation CC BY 4.0, code MIT, see [LICENSE.md](LICENSE.md).
