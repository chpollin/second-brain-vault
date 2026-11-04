# Design

The public site at <https://chpollin.github.io/second-brain-vault/> explains Second Brain to readers without prior knowledge of Obsidian, Git or coding agents, in English by default and in German with `?lang=de`. It should let such a reader say what a vault is, start building one, and recognise how earlier knowledge is reused. It reads like a paper: what it is, how to build one, how it is used, data handling, maintenance, reference.

## Sections

| Section | Question it answers | Form |
|---|---|---|
| Hero | What is this, and for whom? | Title, one sentence, audience line, two actions, the knowledge graph |
| What it is | What does a vault consist of? | Four stations in a row (text files, Obsidian, AI assistant, you) and the principle of one place per statement |
| Build | How do I build my own? | Tool line, seven steps with one sentence and a prompt each, a graph that grows with the steps |
| In use | How is earlier knowledge reused? | A six-phase episode with stepper and graph |
| Your data | What leaves my computer? | Four rows with provider links |
| Keep it alive | What is maintenance? | Four rows with the procedure or command |
| Reference | What exactly does the template contain? | Folded by default: folders, vault governance, control documents, document types, procedures, Zettelkasten comparison |

The seven build steps follow the operator's sequence of 2026-11-04: create a vault, bring sources into Markdown, think through the structure, talk it through with the assistant, let the assistant build it, work in knowledge, make it findable for agents. The template enters at step 5 as the model the assistant follows. Step 2 names the chain original, Docling, frozen Markdown, distillate, and points to [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) for statements that must be traceable to their source passage. Step 5 defines vault governance as the written rules that say how the vault is built, what goes where and how it may change.

## Graph

`scripts/build_graph.py` joins the template's system files from `docs/data.json` with the synthetic example domain under `docs/example/` and precomputes two layouts. The site uses the person's view, with knowledge clustered by domain inside and the system documents as an outer frame. The agent's view, rings by the moment a file reaches the agent, stays in the data for a later use.

- Groups carry the DHCraft watercolour palette. Overview pages are drawn as the hexagon of the logo.
- States differ by outline, fill and stroke pattern as well as colour: found, read, draft or proposal (dashed), accepted, updated.
- Every node is focusable. Arrow keys move to a neighbour in that direction, Enter opens the file in the reading panel.
- In the build section the graph grows with the steps: empty vault, loose sources, a dashed draft of the structure, the system frame with CLAUDE.md lit, notes, then overview pages.

The example domain is a team's research data work: a photo archive project decides on the format of its archival masters, and an oral history project later checks whether the decision transfers to audio. It is synthetic. Its literature notes carry bibliographic entries only.

## Visual system

The site follows the DHCraft corporate design loosely. Tokens come from the dhcraft-site palette in OKLCH, the fonts Sora and Instrument Sans are vendored under `docs/assets/fonts/` with their licences, buttons and chips are pills, and the header carries the white DHCraft mark. Graph sections stand on a navy night ground with faint highlights, reading sections on paper. The page uses at most three text levels and draws borders only for interactive elements, prompts and the graph.

## Terms

| English | German |
|---|---|
| vault | Vault |
| overview page, map of content | Übersichtsseite, Map of Content |
| AI assistant | KI-Assistent |
| control document | Steuerdokument |
| procedure (skill) | Ablauf (Skill) |
| vault governance | Vault-Governance |
| outdated copy (restatement) | veraltete Kopie |
| source converted to Markdown | in Markdown umgewandelte Quelle |

## Data and publication boundary

The site serves the template files and the synthetic example only. `scripts/build_site.py` excludes `knowledge/`, and `tests/test_site_privacy.py` fails when served files contain a `knowledge/` path, a local home path, the names of the owner's private working repositories or an email address in the example data. Statements about tools, costs and data handling follow the providers' pages linked in `docs/content.js`, read on 2026-11-04.

## Evidence

Three reader tests on 2026-11-04 used separate subagents in the role of a professional without Obsidian, Git or agent experience, given screenshots and the page text. They are model readers, not people. All three understood the episode and the principle of one place per statement. All three would have stopped at the first build step because tools, costs and Git were unexplained, skipped the reference as jargon, and asked what happens with their data. The current page answers these findings with the audience line, the tool line with costs, the data section, the folded reference and the plain station row. A fourth model reading of the simplified page understood the idea and the data section, and found that the assistant's setup was missing before the first prompt, that Docling's installation was unexplained and that the legend and the abbreviation MOC confused. The first build step now installs and connects the assistant, step 2 says the assistant can install Docling, the legend shows one entry for the system frame, and overview pages are labelled by their field. Still open from that reading are a rough price and setup time, how a team shares a vault, and how to undo a wrong change. A human reading and the operator's acceptance remain open.

## Decisions

- 2026-11-04: the method page replaced the structure explorer and the work and knowledge demo as the public site. The demo, its tooling and its contract were deleted.
- 2026-11-04: of three layout variants (guided story, workspace, build along) the operator chose build along. The rejected variants were removed.
- 2026-11-04: recorded agent sessions were dropped from the site because they ran under the owner's personal configuration. New recordings require a neutral configuration.
