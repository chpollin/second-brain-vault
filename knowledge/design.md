# Design

The public site at <https://chpollin.github.io/second-brain-vault/> explains Second Brain to readers without prior knowledge of Obsidian, Git or coding agents, in English by default and in German with `?lang=de`. It should let such a reader say what a vault is, start building one, and recognise how earlier knowledge is reused. It has three parts: the idea with a playable example, how to build one, and what is good to know, followed by a folded reference.

## Sections

| Section | Question it answers | Form |
|---|---|---|
| Hero | What is this, for whom, and how is it used? | Title, one sentence, the four parts of a vault as one line, audience line with a link to the build section, then the example as a focus graph beside the note card and a named stepper |
| Build | How do I build my own? | Tool line, seven steps with one sentence and a prompt each, a graph that grows with the steps |
| Good to know | What leaves my computer, and what is maintenance? | Two columns of four sentences each, with source links |
| Reference | What exactly does the template contain? | Folded by default: one annotated file tree and three short paragraphs on governance, procedures and document types |

The example runs through seven phases: ask, find, propose, decide, file it, test the result, reuse later. The phase "decide" names the separate judgements of checking sources, checking the reasoning and accepting. The phase "file it" carries the principle of one place per statement. The phase "test the result" shows the return of an artefact finding to project knowledge, the first of the two relationships in the manuscript, and "reuse later" the second.

The seven build steps follow the operator's sequence of 2026-11-04: create a vault, bring sources into Markdown, think through the structure, talk it through with the assistant, let the assistant build it, work in knowledge, make it findable for the assistant. The template enters at step 5 as the model the assistant follows. Step 2 names the chain original, Docling, frozen Markdown, distillate, and points to [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) for statements that must be traceable to their source passage. Step 5 defines vault governance as the written rules that say how the vault is built, what goes where and how it may change.

## Hero example

The hero plays the example in three coordinated parts, specified in `docs/episode.json` and rendered by `docs/hero.js`.

- The focus graph shows only the notes of the episode on hand-placed positions, so labels stay readable and no link passes behind a note it does not connect. `tests/test_hero_layout.mjs` checks placement and links. Pills are sized from the rendered label. A note's state shows as outline colour, width and dash, the decision note names its state in text above it, and a one-line legend explains the code. Every pill opens its note.
- The note card shows what the decision note says in the current phase. Its wikilinks become note buttons, and the cited notes are those highlighted in the graph. German readers see a translation of the English example note from `docs/content.js`, marked as such. The decision step shows each ground with a check mark, filing shows the linking notes, the test shows the finding and where it was recorded, and reuse compares the conditions with the new question.
- The stepper names each phase and its actor. Done, current and next differ by mark (check, filled number, outlined number) and weight. Each step button carries its full state in its accessible name, and the caption is a live region.

On wide screens the graph and card share a stage of fixed height above the stepper, so the controls keep their position across phases and the example with its controls fits one 1440 by 900 screen in both languages. On narrow screens the stepper comes first with a status line for the current phase, the graph gives way to a list of the involved notes with their state, and the card follows at full height.

## Build graph

`scripts/build_graph.py` joins the template's system files from `docs/data.json` with the synthetic example domain under `docs/example/` and precomputes one layout, with knowledge clustered by domain inside and the system documents as an outer frame.

- Groups carry the DHCraft watercolour palette. Overview pages are drawn as the hexagon of the logo.
- Every node is focusable. Arrow keys move to a neighbour in that direction, Enter opens the file in the reading panel.
- Overlapping labels are hidden by priority and reappear on hover or focus.
- The graph grows with the build steps: empty vault, loose sources, a dashed draft of the structure, the system frame with CLAUDE.md lit, notes, then overview pages.

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

Still open from these readings is how a team shares a vault. Price and setup time stay out of the page, which names the paid plan and links the provider. Persona and parallel review agents each have one line in the reference. A human reading and the operator's acceptance remain open.

A second round on 2026-11-04 compared the former hero, a whole-vault graph with numbered steps, with three variants in a temporary lab: a focus graph of hand-placed notes, a decision note that grows step by step, and lanes for you, the assistant and the notes. All three shared a stepper with named phases and actors. Three model readers in the roles of project lead, librarian and researcher ranked the growing note first, then the focus graph, the former hero and the lanes. An independent model UI reviewer recommended combining the focus graph with the note card, so that the graph shows where the reasoning lives and the card what it says, and replacing the graph by a list of notes on phones. Their defects (colliding phone labels, an unreadable scaled graph, moving controls, empty reason headings, a link behind an unrelated note, an eyebrow line) shaped the current hero.

A fresh model reviewer then read the built hero in three reader roles and against the interface yardstick. Its findings led to a visible focus ring on highlighted notes, the stepper first in document order, a decision step that shows acceptance as the person's act, a legend that matches the drawn states, a reuse state that reads as differing conditions, the decision state inside its pill, a German rendering of the example note, scroll shadows on the card and smaller type on short wide screens such as a projector. Still open from that reading are the phone card moving with the length of the note list during play, and the generic caption of the test phase.

## Decisions

- 2026-11-04: the method page replaced the structure explorer and the work and knowledge demo as the public site. The demo, its tooling and its contract were deleted.
- 2026-11-04: of three layout variants (guided story, workspace, build along) the operator chose build along. The rejected variants were removed.
- 2026-11-04: after operator review the separate sections on what a vault is, the example, data and maintenance were merged into the hero and one section of notes, and the reference became a single file tree, because the earlier page said the same things twice and stacked too many levels.
- 2026-11-04: recorded agent sessions were dropped from the site because they ran under the owner's personal configuration. New recordings require a neutral configuration.
- 2026-11-04: on the operator's instruction the combined focus graph and note card replaced the whole-vault hero graph. The episode staging of the graph module, the old stepper and the lab variants were removed.
