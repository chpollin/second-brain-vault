# Second Brain as a Personal Research Environment for Working with AI Agents

Dr. Christopher Pollin

## Abstract

Second Brain investigates the justified reuse of research knowledge across agent sessions and projects. The proposed personal research environment connects flexible document organization, source-bound claims and the development of digital research artefacts. Its process model joins two relationships. Examination of an artefact can revise the project knowledge that guided its development. Later inquiry can reuse that knowledge only after examining its grounds and conditions in the new task. Linked personal notes, project documentation and stricter claim-support records serve different purposes within this process. Written procedures specify selective reading, checking and authorized revision, while researchers remain responsible for substantive judgement. A public synthetic vault template makes parts of the design inspectable. Existing evidence consists of technical checks and bounded development observations, including failed instruction interpretation and inconsistent maintenance. A prospective episode study will examine recovery, transfer, artefact assessment, revision and later use, together with their review and maintenance costs. The contribution is a conceptual integration, an inspectable documentary design and an evaluation protocol. Effects on research practice remain untested.

## 1. Research projects and personal research environments

When research resumes after an interruption, the current document may preserve a decision without explaining why it was made. A correction may appear in a detailed note while an overview still repeats the earlier position. Working with AI agents raises a practical question about these relationships. Which material should an agent consult, and how can subsequent work retain the grounds and limits of a new contribution?

Second Brain investigates this question in a researcher's existing documentary environment. Its scope includes work that crosses project boundaries and continues across conversations. The following working definitions identify the objects of that investigation.

### Research project

A research project is a connected body of inquiry organized around a research purpose, material under investigation and methods for addressing that purpose. Its identity depends on the relationship between the question being pursued and what would count as a justified contribution. The question and methods can change as the material is examined.

For agent-assisted work, a project needs enough explicit context to establish what is being investigated and which evidence can support an answer. Recorded methodological decisions explain how the material is treated. Responsibilities identify who may revise it and who can assess the resulting claims. An output may be an interpretation, an edition or a research tool, but completing the output does not by itself establish its scholarly adequacy.

A project can span several repositories, and a shared tool can serve several projects. A teaching activity may use research knowledge without itself constituting a research project. Second Brain therefore accommodates a broader working portfolio while selecting research tasks for the proposed study according to their substantive questions and evidential demands.

### Personal research environment

A personal research environment is the maintained arrangement of knowledge resources, tools and working practices through which a researcher conducts inquiry across projects. It connects current work with relevant earlier sources and decisions, and provides ways to examine new contributions and preserve their consequences for later work.

The term *personal* identifies whose research context and judgement organize the environment. Collaboration can involve shared repositories and other researchers. In Second Brain, the personal collection is intended to preserve documentary continuity across projects, while each project's documentation preserves the conditions of its own work. Conversation allows the researcher to question a proposal and refine an interpretation. Written procedures govern how accepted changes enter the maintained record.

The central research question is under what conditions a researcher and agents can recover earlier reasoning, justify its transfer to another research situation, examine its consequences in an artefact and preserve the revised grounds for later use.

Second Brain proposes a process model connecting these transitions. It joins the return of artefact findings to maintained project knowledge with the later reuse of that knowledge across sessions and projects. Its contribution concerns the relationships among knowledge organization, investigation and attributable revision. Whether those relationships improve research practice, and at what maintenance cost, requires empirical examination.

## 2. AI agents and related approaches

### AI agent

Here, an AI agent based on a large language model (LLM) pursues a goal through a sequence of actions using tools and adapts its subsequent steps to intermediate results. In research work, it can inspect project resources, act on them and evaluate the resulting output before continuing. ([Sapkota, Roumeliotis and Karkee, 2026](https://doi.org/10.1016/j.inffus.2025.103599), [Weng, 2023](https://lilianweng.github.io/posts/2023-06-23-agent/))

The agent environment supplies access to files and tools and determines which operations are permitted. Its instructions and available knowledge influence the actions the LLM selects. Research evaluation consequently concerns the configured working system, including the evidence it actually receives and the changes it makes. The ability to inspect an intermediate result does not establish that the agent assesses it correctly.

A-MEM constructs linked memory notes and revises their descriptions as new information arrives. Its evaluation concerns questions about extended conversations. This makes linked and evolving notes an established point of comparison for Second Brain, whose proposed study concerns reviewed research knowledge and its subsequent application. ([Xu et al., 2025](https://arxiv.org/html/2502.12110v11)) Agentic Context Engineering similarly develops reusable context through incremental updates, with evaluations on agent tasks and domain-specific benchmarks. Its findings motivate examining what is preserved or lost when knowledge is repeatedly revised. ([Zhang et al., 2026](https://arxiv.org/html/2510.04618v3))

LongMemEval examines memory across sessions, including changes to previously recorded information. Its analysis distinguishes failure to retrieve evidence from failure to use retrieved evidence correctly. This distinction informs the proposed evaluation of Second Brain, where locating a decision and applying its reasoning are separate achievements. ([Wu et al., 2025](https://arxiv.org/html/2410.10813v2)) Co-STORM addresses participation in conversations among agents during exploratory information seeking. Its interactive mind map provides a related approach to helping people follow and steer an investigation. Reported limitations concern adaptation to the user's prior knowledge and the degree of control over the conversation, both relevant to collaboration informed by a personal research environment. ([Jiang et al., 2024](https://aclanthology.org/2024.emnlp-main.554/))

The design also draws on the author's methodological projects. Knowledge Structures distinguishes the kind of knowledge recorded, the pattern organizing it and the purpose of the resulting collection. Its local manuscript is a conceptual simulation and supplies no empirical case evidence for this paper. [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault) supplies a stricter profile for inspectable claim-support relationships. [Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) connects maintained project knowledge with the development and examination of research artefacts. These inputs motivate the integrated process developed below. Their individual contributions and effectiveness remain separate questions.

[Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) addresses the coordination of research work. It can specify assignments and verification responsibilities within an episode, but its coordination method is outside this paper's contribution. Promptotyping remains a separate ZfdG paper project. The integration uses its maintained method specification without replacing its manuscript or treating its project cases as Second Brain results.

## 3. Organizing knowledge and examining its grounds

A personal research environment holds several forms of knowledge. Concepts and source readings describe a subject. Procedures explain how to investigate it. Decision records preserve why a choice was made, while requirements state what an artefact should realize. Work records describe current activity. These functions can coexist in one collection without being reduced to one document form.

The organization of a collection concerns relationships among its documents. A concept network supports association, a case library supports comparison and a chronicle preserves temporal order. A claim-support structure makes evidential relationships inspectable. A project can combine these patterns according to its material and purpose. The relevant distinction is among what is recorded, how it is organized and what the collection is meant to enable. This adapts the organizing distinction of Knowledge Structures without requiring its complete typology or excluding databases and other documentary systems by format.

Second Brain uses a personal vault, a collection of linked notes maintained in Obsidian, to hold conceptual knowledge and readings that may matter across projects. Project-specific documentation resides with the material whose interpretation or implementation it governs. A repository stores such files together with their recorded revisions. Its `knowledge/` folder explains the project's purpose and the decisions that shape its data and tools. A directory links the personal overview to the relevant repository, allowing a reader to move from the broader research context to the detailed project record.

The guiding maintenance rule assigns a designated document to each durable finding or rule. Other documents link to that location or summarize it within a stated scope. When the finding changes, those summaries require inspection. The development record describes a failure in which a corrected knowledge document coexisted with an outdated overview despite an existing rule requiring consistent maintenance. Revision history preserves what changed, while the maintained text identifies the position that currently governs the work. This authority concerns the working record. A current personal decision can still rest on an inadequate scholarly account. The [knowledge-document convention](https://github.com/chpollin/second-brain-vault/blob/main/Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md) specifies how these relationships are handled.

The document network provides routes for selective reading. A link to another repository does not establish access to it. The active agent environment must permit the read, and the source must actually be inspected. The same distinction applies to interpretation. A note relevant to one project can suggest a method for another, but the transfer requires checking the new material and research purpose against the conditions of the earlier finding.

Grounded Vault provides a more demanding profile where a contribution needs an inspectable path through intermediate formulations to supporting material. Its layer chain distinguishes sources, preserved representations, distillates, assertions and output. A resolvable anchor identifies a location. Substantive review examines whether the material at that location supports the statement and whether the statement stays within its scope. In Grounded Vault's terminology, evidence is a grounding relation that has passed human verification. This paper retains that restriction when discussing its status labels. Ordinary source links in the personal environment carry no automatic human-verification status.

The integrated design treats traceability, support and factual correctness as separate questions. A faithfully represented source can itself be mistaken. Likewise, a technically valid claim-support record may preserve an inadequate inference. The stricter profile can be selected for claims whose inspection warrants its maintenance work. It is not a required architecture for every concept note or project document.

Written procedures, called *skills*, tell an agent how to carry out recurring work. A procedure identifies relevant sources and the permitted operations, then specifies how the result should be checked. The substantive knowledge remains in the documents it refers to. Reading a procedure supplies instructions. The ability to execute them depends on available tools and permissions.

Context selection starts with the current question. The agent uses the project overview and its links to identify relevant knowledge, then checks claims about current software behaviour against code or data when necessary. Disagreement between the documentation and the implementation becomes a question to investigate. The record preserves both accounts until their relationship has been checked.

## 4. Research artefacts and accountable revision

A digital research artefact makes selected interpretations operational for a scholarly purpose. A transformation, analytical interface or edition realizes decisions about categories, relations and uncertainty in research data. The data provide the material on which the artefact operates. Project knowledge records how that material is understood and what the artefact should enable. Derived summaries and implementation plans help conduct the work without becoming interchangeable with either the data or the research artefact.

Promptotyping organizes this development through recurrent Preparation, Exploration, Distillation and Implementation. These are forms of work that can recur as a question develops. Examining an implementation can reveal an omitted distinction, an unsupported assumption or a requirement that the available data cannot satisfy. A technically conforming artefact can therefore prompt revision of the specification itself. Findings return to the maintained project knowledge when they change the understanding of the material or the intended operation. In Promptotyping, an accepted promptotype connects an identifiable knowledge state, research-data state, resulting artefact and documented grounds of acceptance for a defined purpose.

Second Brain extends the inquiry to what happens when this revised understanding is needed again. A method adequate for one collection may depend on distinctions absent from another. Proposed reuse must examine those conditions rather than carry the earlier acceptance forward unchanged. Artefact examination and later reuse thus provide two connected occasions for revising the knowledge that guides inquiry.

The researcher and the agent begin by identifying the question to be answered and the evidence that would make a contribution useful. A task can remain within one conversation. Additional agents become relevant when a defined inquiry can proceed independently, such as examining another project's assumptions while the main conversation considers whether a method can be transferred.

Each delegated inquiry specifies its question, sources and permitted changes. The coordinating agent checks returned claims against the cited material before incorporating them into its response. Results can return independently, and conflicting findings remain explicit. Cemri et al. identify failures involving system design, inter-agent coordination and task verification. These findings motivate checking returned contributions against their sources and substantive requirements. In the proposed design, agreement among agents supplies no independent verification. ([Cemri et al., 2025](https://arxiv.org/html/2503.13657v3))

```text
Current question <---------------- Maintained research knowledge
       |
       v
Recover earlier reasoning and examine transfer conditions
       |
       v
Investigate sources / optionally develop and examine an artefact
       |
       +---- Optional bounded delegated inquiries
       |
       v
Contribution, supporting material and observed behaviour
       |
       v
Technical checks, source review and scholarly judgement
       |
       +---- Further inquiry / rejection / no durable change
       |
       v
Authorized revision of knowledge and, where needed, artefact
       |
       v
Check affected summaries and preserve grounds and limits
       |
       v
Later question: recover and examine the revised account
```

Figure 1. The proposed connection between artefact examination, knowledge revision and later reuse. An episode can follow only part of the process. The arrows specify relationships to observe rather than an automatically executed workflow.

Human involvement has distinct objects. A contributor can authorize an edit, inspect a source, assess an inference, validate an artefact's scholarly suitability or accept a result for use. Each action needs its actual grounds and responsible role. Acceptance by the researcher establishes no independent validation. A technical correction within an existing authorization can be implemented and checked directly. A new scholarly interpretation requires assessment of its grounds. A statement about the researcher's own position also requires confirmation that the attribution is appropriate. When a contribution warrants a durable revision, the authorized session changes its designated document and inspects affected summaries. Consequences for pending work enter the corresponding work record.

Conversation permits detailed argument and correction. The work interface should make it possible to identify the project, inspect the relevant contribution and follow a recorded response to its actual incorporation. A saved response and an updated knowledge document are distinct states. Making that distinction visible is a design requirement for assessing whether an intervention changed subsequent work.

An optional [Research Persona procedure](https://github.com/chpollin/second-brain-vault/tree/main/.claude/skills/persona-init) develops a confirmed research profile and an agreement about dialogue. The profile can guide the selection of relevant earlier work and the presentation of a contribution. Its account distinguishes the researcher's statements from source evidence and generated interpretation. Simulated answers remain unconfirmed until reviewed, and feedback on one answer becomes a general preference only when the researcher makes that scope explicit. These distinctions allow personal relevance to be examined separately from evidential correctness.

## 5. Implementation and available evidence

The public [Second Brain repository](https://github.com/chpollin/second-brain-vault) provides a reusable vault template with synthetic content, written procedures and checks on document structure. Its browser-based explorer displays the template and the reading sequences specified by its rules. A public work-and-knowledge demo uses generic template content. These sequences describe intended behaviour. They do not record an agent's actual reading or execution.

The author's working environment also contains a separate interface over personal work records and an exporter that prepares explicitly selected documents for use in a conversation. The exporter records its selection. Access to material in other repositories requires additional reads or separately supplied context. The public template contains neither the private research corpus nor a service that automatically retrieves knowledge across repositories. Its [integration specification](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/integration.md) describes these component boundaries.

The repository contains automated tests for document requirements, links and generated views. Its development journal records dated test and browser checks of selected navigation and rendering behaviour. These records concern the properties examined in those runs. The [development record](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/skill-evaluation.md) also describes synthetic maintenance and synthesis trials, together with profile initialization. Their complete local transcripts are not publicly available. The persona baseline reported no failure, so that comparison supports no improvement claim. Further cross-repository cases specify expected behaviour without establishing its reliability in use.

A workflow-design trial provides a negative finding. An evaluator inferred that acceptance had to precede a merge, although the supplied instruction required acceptance without specifying that order. A revised instruction and a follow-up distinguished this case from a rule that explicitly required prior acceptance. This supports a bounded correction for the supplied cases. It also shows that a review procedure can introduce an unsupported constraint. The maintenance failure described above likewise occurred despite an existing maintenance rule. Neither observation establishes that the revised instructions prevent recurrence.

A separate documentation-recovery check used a fresh agent context to identify the public repository's scope. Its answer correctly distinguished the template from the external interface and exporter, and the coordinating agent checked these claims against repository files. The record lacks a complete execution trace, a comparison condition and a later reuse attempt. It therefore supports a bounded observation about recovering the repository's documented scope. Effects on research quality or human effort remain untested.

## 6. Studying research episodes

The proposed study examines a research episode, understood as work on a substantive question together with the resulting contribution and any observed subsequent use. Selection depends on the knowledge or judgement the task requires. The portfolio's categories provide possible settings, but selecting one commissioned project, one independent project and one teaching activity would not by itself explain what is being tested.

An episode might resume an earlier methodological decision or assess whether a procedure can be used with different material. Such work can expose a conflict between a source, its interpretation and the implemented behaviour. A correction may follow, and a later task may provide an opportunity to examine whether the revised account remains usable. Which of these relationships occurs depends on the task. The [evaluation protocol](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/evaluation.md) and [episode record](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/episode-template.md) specify the proposed observations.

The record begins with the question and the grounds on which a contribution would be judged. It preserves the source revisions so that later changes do not alter the evidence retrospectively. Available documents are distinguished from passages actually supplied to or read by the agent. For an episode involving artefact development, the record connects the research requirement, data state, actual artefact revision and behaviour examined. Assessment distinguishes a defect in implementation from an inadequate requirement. A passing technical check supports the properties it tests. Scholarly assessment asks whether those properties and the underlying representations are adequate for the research purpose. An observation changes maintained knowledge only when its interpretation and actual incorporation are documented.

The record identifies the LLM and its available settings alongside the active instructions and tool access, because these affect the contribution. Delegated work and researcher interventions remain attributable to their respective roles. Missing logs are identified as gaps, and retrospective recollection remains distinguishable from contemporaneous evidence.

Assessment examines each claim needed to support the contribution against its cited passage, data or observed behaviour. It also considers whether an inference follows from the evidence and whether its conditions hold in the present task. For a transfer, review compares the original finding's assumptions with the new material and purpose. Correct retrieval followed by inapplicable reuse remains a failure of application. Scholarly judgement concerns whether the contribution answers the research question. The researcher separately assesses its usefulness and the work required to make it usable. Where feasible, a qualified reader who did not develop the contribution assesses its central claims independently. Personal acceptance records a decision to use the result and does not establish independent scholarly validation.

For an accepted revision, a later research task can test whether the finding remains available and is applied correctly. That attempt uses a fresh session with the ordinary permitted entry points. Any remaining conversation history or other hints are documented. An assessment record prepared beforehand preserves the expected reasoning and its conditions without supplying the answer to the agent. A failed attempt and an absent follow-up are recorded differently. Rejected, unresolved and interrupted episodes remain part of the analysis, and an accepted contribution can be useful without requiring a write to the knowledge base.

An initial observational study can establish how the arrangement behaves in the recorded cases. Attributing a difference to a particular component requires a separate comparison. Source material, tasks, agent configuration, available tools and assessment criteria should remain equivalent while one component changes. For example, ordinary agent-led browsing can be compared with explicit documentary navigation. Providing the relevant passages directly in a further condition would help distinguish difficulties in finding evidence from difficulties in applying it.

Delegation requires its own comparison, because additional agents also add processing. A comparison with one agent should use a comparable total processing allowance and record actual calls and available token measurements across the team. The Research Persona should be varied separately. Task order and the researcher's prior familiarity must also be recorded, since repeating a solved task changes the conditions. Elapsed time and human review and maintenance effort belong in the analysis wherever they can be observed by a stated method. Unavailable measurements remain unrecorded.

## 7. Scope and limitations

The design has developed within one researcher's documentary practices. Its use elsewhere depends on whether relevant project knowledge is available and maintained. Assigning a finding to a designated document helps locate the current account, but establishes no guarantee of truth. Several consistent documents can reproduce the same error. Selective reading can also miss evidence that would change the judgement. The literature comparison is bounded to the sources discussed here and establishes no exhaustive claim of methodological novelty.

The proposed study must make enough material available for its central claims to be inspected. Private research sources and correspondence may restrict publication. Any released episode therefore requires an explicit publication scope and an account of omitted evidence. Removing identifying material must preserve the relationship between a claim and its support. If that relationship cannot be inspected publicly, the limitation belongs with the affected finding.

Maintenance has a cost of its own. Preserving supporting material, inspecting summaries and resolving conflicting versions can require substantial work. More detailed provenance can make a relationship inspectable without making the contribution useful. The proposed study must retain cases where review effort outweighs the benefit, where the maintained account was wrong and where no revision was needed.

The public template demonstrates a documentary arrangement with synthetic content. It does not reproduce the author's private research environment or establish independent transfer to another researcher. The current Promptotyping manuscript is maintained separately and was unavailable for this integration. The maintained method specification supplies its conceptual contribution here. Comparing the integrated account against that manuscript remains necessary before publication.

## 8. Conclusion

Second Brain proposes a personal research environment in which earlier reasoning can guide inquiry and be revised through its consequences. Flexible knowledge organization provides routes to relevant material. Source review examines its support and transfer conditions. Artefact examination can revise the project knowledge on which subsequent work draws. The contribution lies in connecting these relationships across sessions and projects while keeping their evidence and responsibilities inspectable.

The public synthetic template provides an implementation reference for parts of the documentary design. The prospective episode study examines whether revised findings and their conditions are recovered and used, including failed transfers and the work needed for review and maintenance. Existing development observations establish neither improved research quality nor reduced effort. Those effects remain questions for the proposed study.

## References

Cemri, Mert, et al. 2025. [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657v3) arXiv:2503.13657, version 3.

Jiang, Yucheng, et al. 2024. [Into the Unknown Unknowns: Engaged Human Learning through Participation in Language Model Agent Conversations](https://aclanthology.org/2024.emnlp-main.554/). Proceedings of EMNLP 2024, 9917–9955.

Sapkota, Ranjan, Konstantinos I. Roumeliotis, and Manoj Karkee. 2026. [AI Agents vs. Agentic AI: A Conceptual Taxonomy, Applications and Challenges](https://doi.org/10.1016/j.inffus.2025.103599). Information Fusion 126, 103599. [Accessible article](https://arxiv.org/pdf/2505.10468v5).

Weng, Lilian. 2023. [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/). Lil'Log, 23 June.

Wu, Di, et al. 2025. [LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory](https://arxiv.org/abs/2410.10813v2). ICLR 2025.

Xu, Wujiang, et al. 2025. [A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110v11). NeurIPS 2025.

Zhang, Qizheng, et al. 2026. [Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models](https://arxiv.org/abs/2510.04618v3). ICLR 2026.

Text licensed under CC BY 4.0. Code in the Second Brain repository is licensed under MIT. Linked third-party materials retain their own terms.
