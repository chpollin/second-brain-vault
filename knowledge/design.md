# Design

The public site at <https://chpollin.github.io/second-brain-vault/> explains Second Brain to readers without prior knowledge of Obsidian, Git or coding agents, in English by default and in German with `?lang=de`. It should let such a reader say what a vault is, start building one, and recognise how earlier knowledge is reused. It has three parts: the idea with a playable example, how to build one, and what is good to know, followed by a folded reference.

## Sections

| Section | Question it answers | Form |
|---|---|---|
| Hero | What is this, for whom, and how is it used? | Title, one sentence, the four parts of a vault as one line, audience line, two actions, and the knowledge graph that plays a seven-phase example with compact numbered steps |
| Build | How do I build my own? | Tool line, seven steps with one sentence and a prompt each, a graph that grows with the steps |
| Good to know | What leaves my computer, and what is maintenance? | Two columns of four sentences each, with source links |
| Reference | What exactly does the template contain? | Folded by default: one annotated file tree and three short paragraphs on governance, procedures and document types |

The example runs through seven phases: ask, find, propose, decide, file it, test the result, reuse later. The phase "decide" names the separate judgements of checking sources, checking the reasoning and accepting. The phase "file it" carries the principle of one place per statement. The phase "test the result" shows the return of an artefact finding to project knowledge, the first of the two relationships in the manuscript, and "reuse later" the second.

The seven build steps follow the operator's sequence of 2026-11-04: create a vault, bring sources into Markdown, think through the structure, talk it through with the assistant, let the assistant build it, work in knowledge, make it findable for the assistant. The template enters at step 5 as the model the assistant follows. Step 2 names the chain original, Docling, frozen Markdown, distillate, and points to [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) for statements that must be traceable to their source passage. Step 5 defines vault governance as the written rules that say how the vault is built, what goes where and how it may change.

## Graph

`scripts/build_graph.py` joins the template's system files from `docs/data.json` with the synthetic example domain under `docs/example/` and precomputes one layout, with knowledge clustered by domain inside and the system documents as an outer frame.

- Groups carry the DHCraft watercolour palette. Overview pages are drawn as the hexagon of the logo.
- States differ by outline, fill and stroke pattern as well as colour: found, read, draft or proposal (dashed), accepted, updated.
- Every node is focusable. Arrow keys move to a neighbour in that direction, Enter opens the file in the reading panel.
- In dense phases the label of the most important state stays, overlapping labels are hidden and reappear on hover or focus.
- In the build section the graph grows with the steps: empty vault, loose sources, a dashed draft of the structure, the system frame with CLAUDE.md lit, notes, then overview pages.

The example domain is a team's research data work: a photo archive project decides on the format of its archival masters, and an oral history project later checks whether the decision transfers to audio. It is synthetic. Its literature notes carry bibliographic entries only.

## Visual system

The site follows the DHCraft corporate design loosely. Tokens come from the dhcraft-site palette in OKLCH, the fonts Sora and Instrument Sans are vendored under `docs/assets/fonts/` with their licences, buttons and chips are pills, and the header carries the white DHCraft mark. Graph sections stand on a navy night ground with faint highlights, reading sections on paper. The page uses at most three text levels and draws borders only for interactive elements, prompts and the graph. Sections are separated by their ground, not by rules.

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

Five reader tests on 2026-11-04 used separate subagents in the role of a professional without Obsidian, Git or agent experience, given screenshots and the page text. They are model readers, not people.

- All readings understood the example and the principle of one place per statement, and the last one retold the seven phases correctly and called the page calm.
- The first three would have stopped at the first build step, skipped the reference as jargon and asked about their data. The page answered with an audience line, the tool line, the data sentences and the folded reference.
- The fourth missed the assistant's setup, Docling's installation and found the legend and the abbreviation MOC confusing. The first step now connects the assistant, the legend has one entry for the system frame, and overview pages are labelled by their field.
- The fifth asked when Git and Python are needed, where the skills come from, and found the reference to Luhmann and the phase name "test in the tool" unclear. These texts were changed.

Still open from these readings are a price and setup time, how a team shares a vault, and the jargon of the folded reference. A human reading and the operator's acceptance remain open.

## Decisions

- 2026-11-04: the method page replaced the structure explorer and the work and knowledge demo as the public site. The demo, its tooling and its contract were deleted.
- 2026-11-04: of three layout variants (guided story, workspace, build along) the operator chose build along. The rejected variants were removed.
- 2026-11-04: after operator review the separate sections on what a vault is, the example, data and maintenance were merged into the hero and one section of notes, and the reference became a single file tree, because the earlier page said the same things twice and stacked too many levels.
- 2026-11-04: recorded agent sessions were dropped from the site because they ran under the owner's personal configuration. New recordings require a neutral configuration.
