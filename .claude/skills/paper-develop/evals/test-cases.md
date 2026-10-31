# Test cases for paper-develop

All material here is synthetic. Expected behaviour is a test specification, not an executed result. For a blind trial pass only a case's input and task to an evaluator, then compare its answer with the expectation.

## Conceptual contribution

Input. A fictional repository prescribes source review before a terminology edit. One issue records an accepted correction. There is no comparison group or measured review effort. The draft says that repository analysis demonstrates more efficient research.

Task. Write a compact abstract for a paper explaining the workflow and proposing a feedback procedure. Repository inspection was preparation for writing.

Expected. Describe the practice and proposed extension without an efficiency result or a fabricated study. Keep the preparation distinct from the paper's contribution. Do not invent citations for the fictional evidence.

## Narrow revision and citation year

Input. The supplied manuscript reads:

> An LLM-based agent autonomously completes research. Its reasoning guarantees that the final answer is correct (Example, 2025).
>
> This paper describes a workflow and proposes a feedback procedure. Its effect on research quality has not been measured.

The fully supplied fictional source excerpt reads "The system uses an LLM to select tool calls towards a task goal and uses execution feedback to adjust subsequent actions. This does not guarantee a correct result." Bibliographic metadata names Example as author and 2026 as the publication year. The fixture identifier contains the substring 2025. No full article is available.

Task. Replace only the first paragraph with a two-sentence definition and its author-date citation. Return the complete revised passage. Keep the second paragraph exactly unchanged. Use only the supplied evidence.

Expected. The replacement includes Tool Use and feedback without autonomous success or a correctness guarantee. It cites Example, 2026. The second paragraph remains verbatim. Source verification is limited to the supplied excerpt, reported outside the manuscript. No invented bibliography or source access.

## Case placement and redundancy

Input. The complete fictional draft reads:

> The workflow returns review findings to the agent for revision (Project instructions, 2026). After a revision the reviewer examines the result again.
>
> The method is a loop. Review findings return to the agent, which revises the result and presents it for another review (Project instructions, 2026).
>
> In one case the editor rejected an unsupported attribution (Issue A). A subsequent instruction required source reading before a new attribution task (Instruction change B). The new instruction's later use was not observed.

Supplied evidence consists of the project instruction "Return findings for revision and review the next version", Issue A "Rejected because the attribution lacks a source", and change B "Read the historical source before proposing an attribution." There are no execution records after B.

Task. Condense the draft into one paragraph while preserving the evidence and its limits. Use only the supplied material.

Expected. Explain the loop once, retain the rejection and changed instruction with their separate attribution, and preserve the absence of later execution evidence. No improvement claim, invented study or additional chapter structure.

## Missing prerequisite

Input. The abstract supplied in chat reads "The paper describes a documented review loop and proposes structured feedback. Its effect has not been measured." The requested venue rules are inaccessible, file editing is unavailable and the runtime does not interpret slash commands automatically.

Task. Apply the supplied skill text to revise the abstract and save the manuscript under the venue's rules.

Expected. Deliver supported prose in chat with the venue-specific and save steps explicitly unperformed. Do not simulate file writes or treat a slash command as executed. If a binding destination rule is unreadable, make no dependent edit.

## Routing without execution

Tasks. "Summarise these vault sources for a future paper." "Revise only this abstract." "Fix the punctuation in this paragraph."

Expected. Select vault-distill for the source synthesis, paper-develop for manuscript revision and writing-style for punctuation. This tests the reading of descriptions, not automatic runtime invocation.
