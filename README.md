# Second Brain Vault

This repository is a template for an Obsidian vault that you maintain together with an AI agent. A vault is a folder of linked Markdown notes that Obsidian displays as a connected knowledge base. An agent is a program such as Claude Code or Codex that reads the files in a folder, runs commands and edits files on your request. The template supplies the rules, conventions, procedures and checks that let the agent find earlier knowledge, propose changes with their reasons and keep the vault consistent while you decide what is accepted.

It is meant for researchers and other knowledge workers who know Git and Markdown and want to keep knowledge across projects in one maintained place. You need no prior knowledge of the author's own system. All notes in the template are synthetic examples that show the form. The author uses the same structure as a personal research environment connected to project repositories. That personal content is not part of this repository.

The [method page](https://chpollin.github.io/second-brain-vault/) explains the approach for readers without technical background, in English and in German with `?lang=de`. This README is the technical entry.

## What you can do with it

After the steps below you have a vault with these properties.

- An agent reads its rules at the start of every session, because `CLAUDE.md` and its generated twin `AGENTS.md` state the rules and the map of the vault.
- It checks itself. A script refuses a commit that breaks a hard rule and lists softer findings such as dead links as a work list.
- It carries written procedures, called skills, for recurring work such as adding and checking notes, auditing links or reporting the work state.
- It comes with a small set of deliberately faulty notes on which you can test whether an agent following a skill finds the known defects.
- It can hold an optional research profile of yourself that the agent uses for personal research work.

## Prerequisites

- [Obsidian](https://obsidian.md) to read and navigate the vault. It is free and needs no account.
- An agent that works in a folder and reads `CLAUDE.md` or `AGENTS.md`, for example [Claude Code](https://code.claude.com/docs/en/setup) or [Codex](https://learn.chatgpt.com/docs/codex/cli). Both need a paid plan or account with their provider, and both send your requests and the files they read to that provider.
- Git, because every change the agent makes is reviewed, committed and, if needed, undone through it.
- Python 3.11 or newer for the checks. They use only the standard library. The test suite additionally needs `pytest`.
- Node.js only if you change the method page under `docs/`.

The commands and the commit check call `python`. Where your system provides only `python3`, use that name for the commands and make `python` available as well, because otherwise the switched-on commit check refuses every commit. The vault itself works without Python, but then the checks do not run and the rule tiers described below are not enforced.

## Getting started

These steps take a few minutes and end with two visible results, a clean check report and the agent's own description of the vault.

1. Clone the template into the folder where your notes should live. The last command is optional. It only disconnects your copy from the template repository on GitHub, while the template's commit history stays in your copy.

   ```sh
   git clone https://github.com/chpollin/second-brain-vault.git my-vault
   cd my-vault
   git remote remove origin
   ```

2. Run the check.

   ```sh
   python scripts/check_vault.py
   ```

   It should end with `hard: 0` and `measured: 0`. If pytest is installed, run `python scripts/build_explorer.py` and then `python -m pytest -q` as well, because the privacy test reads the generated explorer data.

3. Switch on the commit check, so that a commit breaking a hard rule is refused.

   ```sh
   git config core.hooksPath scripts/hooks
   ```

4. Open the folder in Obsidian with "Open folder as vault" and start at `HOME.md`. Obsidian then creates a `.obsidian/` folder with its settings, which you may commit or add to `.gitignore`.

5. Start an agent session in the same folder. Claude Code reads `CLAUDE.md`, Codex reads `AGENTS.md`. Other agents need to be told to read one of the two files, which carry the same rules. Give it a first request.

   ```text
   Read HOME and CLAUDE and tell me in ten lines how this vault is organised.
   ```

The agent's answer shows whether it has picked up the rules. Everything after this point is your own work with the vault.

## Working with the vault

### Try the procedures

The following requests show the working mode. Reading and reporting can run against the template itself. For the repair trial, make a disposable copy with `git clone my-vault my-vault-trial`, start the agent session inside `my-vault-trial` and give the requests there in one session, so that the agent knows the numbered findings of the check.

```text
Run the skill vault-knowledge in mode check on the folder Vault Operations/Fixtures.
Report numbered findings and change nothing.

In the disposable copy, repair accepted findings 1 and 2 with mode refactor.
This explicitly authorises maintenance of the copied Vault Operations/Fixtures
corpus, whose expected defects are asserted by
tests/test_check_vault.py::test_fixtures_show_the_seeded_defects.
Keep that test unchanged as a record of the original defects. Show which
neighbouring documents changed and which seeded defects remain.

Use mode research to add a concept note on a topic of my field to Example Domain.
Open every source you cite.

Report the operational state with the skill active-work-report.
```

`Vault Operations/Fixtures/` is a small fictional cluster with seeded defects: a restatement left in an earlier state, an appended enrichment, a divergent citation, a dead anchor, a temporary note and an unregistered tag. `Vault Operations/Fixtures/Fixtures.md` lists which skill mode should find which defect. `python scripts/check_vault.py --fixtures` reports the machine-detectable ones on purpose. A repaired copy no longer satisfies the tests that expect those defects, which is why the repair trial belongs in a copy. `Fixtures.md` also describes repairing in place and restoring the folder afterwards with `git restore "Vault Operations/Fixtures"`.

### Make it your own

1. Replace `Example Domain/` by your own fields of knowledge and register one tag per field in `TAG-TAXONOMY.md`.
2. Replace the example project and its entry in `ACTIVE-WORK.md`, and record your repositories in `Vault Operations/Repo Directory.md`.
3. Adjust `CLAUDE.md` to your way of working, then run `python scripts/render_agents_md.py` so that `AGENTS.md` follows. The places you will most likely change are the working mode in the first paragraph, the session start, the topography table and the convention index.
4. Write your own prose rules into the skill `writing-style`. A style skill for another language needs contrast examples in that language.
5. Record every rule change with its reason in `Vault Operations/Decision Log.md`.
6. Adapt this README and the files under `knowledge/` to the purpose of your vault, or remove them once nothing refers to them any more.
7. Before you push a personal vault to GitHub, remove `docs/` and `.github/workflows/pages.yml` or leave GitHub Pages switched off. The workflow publishes the template's method page with its synthetic example, which describe the template rather than your vault.

In the template, operator means you, the person who owns the vault and decides its rules. Operator points are the questions the agent leaves for you in `ACTIVE-WORK.md`, each phrased so that you can answer it without opening another file.

### Build an optional research profile

The skill `persona-init` turns your research background, materials and working preferences into a personal profile that the agent can use for research conversations. Start it with this order:

```text
Read .claude/skills/persona-init/SKILL.md and initialise my research persona.
Use relevant notes and my answers. Ask at most three questions at a time,
and include the information I need to answer them. Show me the entire
profile as readable prose before asking for feedback. Save a draft with
sources and unresolved points, keeping the working agreement separate.
```

The profile is written to `.local/persona/Research Persona.md`, a folder that Git, the regular check and the public site exclude and Obsidian hides by default. It follows `Vault Operations/Templates/Template Research Persona.md`. Statements you make explicitly count as confirmed. Claims the agent infers stay open until you confirm them. A saved profile installs no tools and does not show that the persona works well. If you do not want the procedure, remove `.claude/skills/persona-init/`, the template, their rows in `VAULT-OPERATIONS.md`, the session-start item in `CLAUDE.md` and the link in the operations overview, then regenerate `AGENTS.md`.

### Start smaller

You can keep only the notes and skills you need, as long as their dependencies stay. The check script needs `scripts/check_vault.py` with `scripts/render_agents_md.py`, the rule sources `Convention Frontmatter Field Profiles` and `TAG-TAXONOMY.md`, `CLAUDE.md`, `HOME.md` and `VAULT-OPERATIONS.md`. It also compares the skills under `.claude/skills/` and the conventions under `Vault Operations/Conventions/` with their registers. Each skill names further conventions and templates in its `Reads` section.

Before removing a skill or convention, search the vault for its name, including `.claude/`, `scripts/` and `tests/`. Remove it together with its register entry, navigation links and dependent instructions, regenerate `AGENTS.md` after a change to `CLAUDE.md`, then run `python scripts/check_vault.py` and `python -m pytest -q`. Some tests describe the distributed template and need an explicit change when a named component goes, such as the known-file assertion for `Convention Skills` in `tests/test_build_site.py`. Keep the checks for broken links, required rule sources and stale generated files.

The skills `project-knowledge` and `vault-orient` matter only if you keep code repositories next to the vault. `active-work-report` matters only if you use `ACTIVE-WORK.md` as your board. `paper-develop` supports compact paper drafting and `workflow-design` the design of agentic workflows. The skill register in `VAULT-OPERATIONS.md` describes all skills.

## How the vault is governed

Each technique below is implemented in one place. Read that place and copy its form.

1. A short constitution is read at session start. `CLAUDE.md` and the generated `AGENTS.md` state the working mode, the folder map and the principle of one maintained place per statement. They index everything else together with the task that should trigger reading it, and they stay short because every session pays for their length.
2. Rules are selected by document path. The files under `.claude/rules/` carry a `paths:` header. Claude Code loads matching rules automatically, and other agents read them because the constitution tells them to. What must hold for every document stands there and never in a skill, because a skill only acts when it is called.
3. Conventions are read on demand. `Vault Operations/Conventions/` holds the detail rules, and each entry of the convention index in `CLAUDE.md` names the situation in which the agent reads it.
4. Skills share one structure. Each `SKILL.md` names its triggers, required reading, procedure, boundaries and verification. `Convention Skills` states the rules, and `vault-knowledge` is the fullest example. A skill reads knowledge from its maintained place and never copies it.
5. Every rule sits on one of three tiers. Hard rules make the commit check refuse a commit and exist only where the check is decidable without judgement and without false alarms. Measured rules produce a work list. Heuristic rules remain judgement during curation.
6. Rule values have one maintained place. The check script reads the required frontmatter fields from a YAML block in `Convention Frontmatter Field Profiles` and the tags from `TAG-TAXONOMY.md`. A missing rule source stops the check visibly and never counts as a pass.
7. `AGENTS.md` is generated. `scripts/render_agents_md.py` derives it from `CLAUDE.md`, and the commit check refuses a stale copy, so the instructions for different agents cannot drift apart.
8. A change propagates. When a statement changes, the agent walks the links pointing to it and decides for each place whether to update it, replace it by a link or leave it. `Convention Curation Round` names the errors this prevents.
9. Delegation stays bounded. Several agents may check the vault in parallel, but they only read. Their reports count as unverified until the findings have been compared with the files, and you decide which findings the agent working in the vault carries out.
10. Every deletion is preceded by a loss audit. Each statement of a document to be removed is located in its new place or dropped for a stated reason. A deletion that cannot be completed ends as blocked, with the decision that would release it.
11. Fixtures serve as a test field. Seeded defects with a register of expected findings let you test a skill with an agent that does not know the answers. `.claude/skills/vault-knowledge/evals/test-cases.md` states the expected behaviour.

## Layout

```text
second-brain-vault/
├── CLAUDE.md                  rules of the vault, read at session start by Claude Code
├── AGENTS.md                  generated from CLAUDE.md for other agents, never edited by hand
├── HOME.md                    navigation hub, every document is reachable from here
├── ACTIVE-WORK.md             current project state, next steps, open operator points
├── VAULT-OPERATIONS.md        task types, skill register, glossary, decisions in force
├── TAG-TAXONOMY.md            closed tag vocabulary
├── Example Domain/            one folder per field of knowledge, with concept notes and an overview page
├── Literature/                one note per read source
├── Projects/                  one folder per undertaking with a Project Overview as hub
├── Writing/                   your own texts, which agents comment on and do not rewrite
├── Vault Operations/          the vault's knowledge about itself
│   ├── Conventions/           detail rules, read on demand
│   ├── Templates/             concept note, literature note, Project Overview, research persona
│   ├── Fixtures/              synthetic documents with deliberate defects
│   ├── Decision Log.md        why each rule holds
│   ├── Done Log.md            finished work with its date
│   └── Repo Directory.md      which repository belongs to which project
├── .claude/rules/             rules selected by document path
├── .claude/skills/            procedures, registered in VAULT-OPERATIONS.md
├── scripts/                   check script, AGENTS.md generator, site builders, commit hook
├── tests/                     tests of the checks and the site builders
├── docs/                      method page and knowledge explorer, published through GitHub Pages
└── knowledge/                 purpose, requirements, design and history of this template
```

`knowledge/` documents the template itself following the [Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) convention for repository knowledge, starting at [knowledge/INDEX.md](knowledge/INDEX.md). It is not part of the vault you build and is never served on the site, which `tests/test_site_privacy.py` guards.

### Method page and knowledge explorer

`docs/` holds the method page and a knowledge explorer over the synthetic example notes in `docs/example/`. The page is static HTML. The explorer reads `docs/explorer.json`, which `scripts/build_explorer.py` generates and Git ignores. To preview it locally, run the builder and serve the folder.

```sh
python -m http.server --directory docs
```

Then open `http://localhost:8000`, `http://localhost:8000/?lang=de` and `http://localhost:8000/explorer.html`, the decision view of the example, with the note browser `notes.html`. The workflow `.github/workflows/pages.yml` builds the data, runs the checks and publishes `docs/` when `main` is pushed. It requires the repository's Pages source to be set to GitHub Actions. Removing the pages requires adapting their data checks, privacy test, navigation links and workflow before deleting the files.

## What is deliberately left out

- The author's research corpus, personal research profile, agent memory, voice-specific writing rules and business procedures. The template abstracts the structure of a personal vault and leaves its content behind.
- The author's private interface for the work state and a context exporter for conversations. Both are separate private projects, described in [knowledge/integration.md](knowledge/integration.md).
- Automatic retrieval across repositories. The agent follows explicit links and reads what the task needs, within the access its host grants.
- Installation of agents, tools or accounts. A skill is a written procedure, and what an agent can actually do depends on the host it runs in.
- Research Mission Control, the author's method for coordinating several agent sessions. The author's own vault runs it on top of this structure, with one coordinating agent session, a few project-bound agents that each keep a file of their own for strands of work over many sessions, and subagents for reading, building and checking. Nothing in the template depends on it. See [Related methods](#related-methods).
- Evidence of benefit. The checks show that the template is consistent, and the [skill trials](knowledge/skill-evaluation.md) cover bounded synthetic cases. Whether the approach helps in everyday research is the subject of a proposed study in the [manuscript](knowledge/paper.md) and the [evaluation procedure](knowledge/evaluation.md), which has not yet been carried out.

## Related methods

- [Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) connects maintained project knowledge with the iterative development of research artefacts. The template applies it through the skill `project-knowledge` and `Convention Knowledge Documents`.
- [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) adds a source-grounded chain from original documents to checked assertions, for claims that must be traceable to an exact passage.
- [Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) describes how a person directs several agents, checks their results and records accepted changes for later sessions.

Each keeps its own specification in its own repository, and none is installed by cloning this template.

## Licence and citation

Text and documentation are licensed under CC BY 4.0, code under MIT, as [LICENSE.md](LICENSE.md) states. The scripts and stylesheets of the method page are MIT as well. The shared DHCraft files under `docs/assets/dhcraft/`, copied from [brand-assets](https://github.com/DigitalHumanitiesCraft/brand-assets), carry their own licence file: MIT for stylesheets and script, the DHCraft logo excluded, the fonts under the SIL Open Font License.

To cite the template, name author, title, year and repository:

```text
Pollin, C. (2026). Second Brain Vault [Obsidian vault template]. https://github.com/chpollin/second-brain-vault
```
