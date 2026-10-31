---
type: knowledge
created: 2026-10-31
tags: [knowledge, workflow]
status: idea
query-topics: [convention-strand-notes, strand-note, argument-thread, structure-note, typed-relations, idea-lineage, authorship, zettelkasten]
---

# Convention Strand Notes

## Trigger

Consult when several notes are to be ordered into an argument that later writing will draw on, or when an agent proposes such an ordering. The convention is a proposal and therefore carries `status: idea`. The index of [[CLAUDE]] lists it as such. It comes into force through [[Convention Curation Round#Rule changes]], which also registers the tag `strand` in [[TAG-TAXONOMY]].

## Purpose

A MOC gives a domain its entry points and orders notes by topic. A strand note orders notes by argument. It records which idea leads to which, where two ideas conflict and which note resolves the conflict. Writing usually establishes such a line once and afterwards keeps it only in the finished prose, where a later revision can lose it without trace. The strand note keeps the line as a document of its own, so that it can be reused, questioned and revised. The form follows the structure notes of the paper slip box (Zettelkasten), in which the cross-references between cards carried the connections more than the card numbers did.

## Form

A strand note is a `knowledge` document with the tag `strand`. The existing class fits its purpose, so it introduces no new type. Its body has five sections in this order.

1. `## Claim` states in one to three sentences what the strand argues.
2. `## Strand` lists the steps in their order. Each step names its notes as wikilinks, the relation between them from the vocabulary below and one sentence giving the reason.
3. `## Open Points` names steps whose reason is missing or contested.
4. `## Sources` lists sources the strand uses beyond those of its notes.
5. `## Related` links the MOCs and documents that draw on the strand.

```markdown
## Strand

1. [[Note A]] leads to [[Note B]]. One sentence on why B follows from A.
2. [[Note C]] contradicts [[Note B]]. One sentence on the claim that cannot hold together.
3. [[Note D]] resolves step 2. One sentence on how the conflict is removed.
4. [[Note A]] and [[Note D]] combine into [[Note E]]. One sentence on what E adds.
```

A step without a reason is incomplete and belongs under Open Points. The relation stands in the step sentence. No frontmatter field carries it, because [[Convention Frontmatter Field Profiles]] admits no field without a reader, and the wikilinks in the steps already give the explorer and the agent the targets.

## Relation vocabulary

leads to
: The target follows from the source as consequence, application or next step of the argument.

continues
: The target elaborates the source within the same thought, as a follow-up card does in a paper slip box.

contradicts
: Two notes make claims that cannot both hold in the same scope. The relation concerns ideas and can be resolved by argument. Grounded Vault uses `contested-with` for a different case, a conflict between sources over an assertion that only human verification resolves, and the two are kept apart.

resolves
: A note removes a named contradiction, for instance by separating scopes or by naming the condition under which each claim holds.

combines
: Two or more notes jointly yield a new note. The step names all of them, which makes it the place where the lineage of an idea is recorded. A new note can therefore have several parents.

analogy
: A note transfers a structure from another domain. The transfer is marked as such and supplies no support for the claim it illustrates.

## Producer and acceptance

An agent may propose a strand note. A proposed strand keeps `status: idea`, and its first sentence under Claim names the producer, for instance an unrevised LLM agent. The operator alone raises the status towards a reviewed state, as for every other document. Accepting a strand means that its steps were read and their reasons judged. Accepting it does not turn the agent's formulation into the operator's own.

Whether the producer needs a field of its own is left open. An earlier method experiment specified the values `human`, `source-derived`, `agent-proposed` and `human-revised`, separate from the lifecycle in `status`. A provenance marker carries only when every document of its class sets it, because an absent marker reads ambiguously. The field is therefore added only when the test below shows that the sentence under Claim is not enough.

## Testing the convention

The convention is tested on a real writing task in two conditions. In the first, the writer works from the starting note alone. In the second, the writer also has the strand note. The comparison looks at traceability of each claim to its notes, change in the argument, unexpected but useful connections, unsupported inferences, the operator's control over what entered the text, and the amount of context read.

The convention fails, and is withdrawn or revised, when one of the following is observed.

- Strand notes list what a MOC already lists and add no relations.
- Proposed strands are accepted without their steps being read, so that acceptance becomes a formality.
- Steps lose their reasons and turn into link lists.
- Strands stop being maintained once the text they served exists.

## Related

- [[Convention Frontmatter Field Profiles]] — why the relation stays in the text
- [[Convention Curation Round]] — the procedure by which this proposal comes into force
- [[Example Domain MOC]] — the topic map that a strand note complements
