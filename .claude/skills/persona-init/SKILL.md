---
name: persona-init
description: Builds or revises a source-grounded personal research persona through selective vault reading and a short dialogue. Fires on "initialise my persona", "build my research persona", "Persona aufbauen" or "Persona initialisieren". Produces a readable profile, a separate working agreement and claim provenance. Does not simulate an interview merely because a profile is being edited. General knowledge maintenance belongs to vault-knowledge.
---

Builds a personal research profile from evidence and the owner's statements without importing a fictional identity from the template.

## Reads

- `CLAUDE.md`, `HOME.md` and `.claude/rules/documents.md` for the local rules and navigation
- `Vault Operations/Templates/Template Research Persona.md` for the output structure
- `Vault Operations/Conventions/Convention Frontmatter Field Profiles.md` and `TAG-TAXONOMY.md` for the saved note
- An existing `.local/persona/Research Persona.md`, when present, or the owner's explicitly designated profile
- A small selection of source notes relevant to the owner's purpose, including foundational research when supplied

If a source cannot be read, report the specific gap. A path or citation in a note is not proof that its contents were read. Examples and fixtures establish no personal facts.

## Procedure

1. Check the current task and existing profile. Initialisation, profile revision and interview simulation are different requests. Reuse the existing profile and its confirmations. Show a focused revision instead of restarting the interview. If this is a shared distribution copy, make no personal edits to its tracked files.
2. Read the available evidence selectively. Separate the owner's statements, source-backed facts, interpretations and generated simulations. For a claimed original concept, inspect the relevant passage and its attribution before describing it as the owner's contribution. Do not infer psychological traits from writing style, photographs or topic frequency.
3. Ask only what the available context leaves open, in batches of at most three questions. For an empty vault ask about the research purpose and material, the support desired, and a concrete research task or collaboration preference. Include a short draft or the passages being discussed with each feedback request. Never expect the owner to have read an unseen file. The owner may answer in free prose or ask to hear the full draft first. An unanswered question remains open, while independent work may continue.
4. Adapt the template into connected prose in the owner's language. Present the complete profile in the conversation, followed by the short working agreement and only the material gaps. Preserve already explicit confirmations. Ask about new inferences that would become personal claims, without requiring repeated approval for statements the owner has supplied. Keep the provenance table in the saved document, so that the spoken profile remains easy to follow.
5. A request to build or update the persona authorises saving a draft. By default write `.local/persona/Research Persona.md`, create only its required parent directory and read the result back. Keep unconfirmed claims pending or outside the profile narrative. A discussion-only request produces a draft in the conversation without edits. Never replace the distributable template with a personal profile. Update the existing profile in place without discarding evidence or resetting confirmations. If the owner wants the note visible inside Obsidian, use an agreed location in their private vault and its normal navigation. Keep it outside a public explorer or distribution copy.
6. Explain how to use the saved profile. The local session-start rule makes the default profile discoverable for relevant tasks. For another environment, provide the profile and selected source documents explicitly. This procedure installs no model, connector, runtime or external skill. Offer one concrete trial with a research question and named sources, keeping observed results separate from expected behaviour.

## Boundaries

- Apply the vault's existing write boundaries and authorisation. Initialisation grants no publication or action on behalf of the owner.
- A persona is a profile and working agreement. The actual agent environment provides skills and tools. Read `VAULT-OPERATIONS.md` before naming available skills and describe their actual scope.
- Keep facts, personal confirmation and technical verification separate. A positive model judgement cannot confirm an unconfirmed simulation.
- Store general research knowledge in its existing concept or project note. Keep only personal relevance and links in the profile.
- Do not scan the whole vault, copy private source collections or publish generated personal output. `.local/` is excluded from Git and from the template's explorer. It does not prevent an explicitly configured external model from receiving selected context.

## Verification

Read the saved file back. Check source locations, explicit confirmation and the retained working agreement. Confirm that an update preserved previously accepted statements and did not turn a local correction into a general preference. Report draft, saved, loaded and behaviourally tried as separate states.

The default local output is excluded from the public template checks. Inspect its frontmatter and title against the linked convention. If a visible vault note was explicitly commissioned, also run:

```powershell
python scripts/check_vault.py
```

Do not regenerate or publish a public explorer containing personal material. The reusable behavioural cases are in [evals/test-cases.md](evals/test-cases.md). Expected outcomes are not test results.

## Output

The whole readable profile in the conversation, the saved path when a write occurred, a concise account of what is confirmed and still open, and one immediately usable activation instruction. Never end with a questionnaire alone when the owner has asked for a full text.
