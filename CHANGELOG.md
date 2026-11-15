# Changelog

The template follows semantic versioning for the parts it declares stable below. A change that breaks one of them raises the major version. Each version also names its review state. `built` means that agents built it and the executable checks pass, `reviewed` that an independent agent with fresh context found no substantial issue, and `validated` that the owner accepted it for its stated purpose.

## 1.0.0 (2026-11-15), reviewed

First declared release. The template has been developed in this repository since 2026-09-19, and the history before this version is in Git and in `knowledge/journal.md`.

### Stable

- The rule contract in `CLAUDE.md`, meaning the control documents, the four axes, one place per statement, the rule tiers and the convention index, with `AGENTS.md` generated from it by `scripts/render_agents_md.py`.
- The command line of `scripts/check_vault.py` with the options `--hard`, `--integrity`, `--fixtures` and `--json`, of which `--hard` and `--integrity` exclude each other, and its exit codes, 0 for no hard finding, 1 for a hard finding and 2 for a missing or unreadable rule source or a usage error. `--integrity` runs no hard check and therefore always ends with 0 or 2.
- The frontmatter vocabularies of `type` and `status` and the field profiles, maintained in the YAML block of `Vault Operations/Conventions/Convention Frontmatter Field Profiles.md`, and the tag vocabulary in `TAG-TAXONOMY.md`.
- The ACTIVE-WORK field names in `Vault Operations/Conventions/Convention ACTIVE-WORK Fields.md`.

Skills, conventions, the method page and the knowledge explorer may change in minor versions as long as the stable parts keep working.

### Review

- Executable checks: `check_vault.py`, `build_explorer.py --check`, the Python test suite, ruff, the Node tests of the method page and `node --check` on every page script, all passing, and the Pages workflow passing on the pushed state.
- A fresh-context agent cloned the template and followed Getting started steps 1 to 3, including a refused commit with a faulty note.
- A second fresh-context agent read the rule sources against each other and against the check script.
- A third compared the published method page with the repository and read the whole release diff, with no substantial finding left.
- Not checked: opening the vault in Obsidian and a real working session with an agent. The owner's acceptance, which would make this version `validated`, is pending together with the tag.

### Supported

- Python 3.11 or newer for the checks, standard library only, with `pytest` for the test suite.
- Node.js only for changing the method page under `docs/` and running its tests.
- Agents that read `CLAUDE.md` or `AGENTS.md` in the working folder. The template is written for and used with Claude Code and Codex.
