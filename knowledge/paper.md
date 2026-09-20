# Second Brain as a Personal Research Environment for Working with AI Agents

Dr. Christopher Pollin

## Abstract

Second Brain addresses the reuse of research decisions and their supporting evidence across agent sessions and projects. It organizes a personal collection of research notes alongside project documentation, with explicit links between them. Written procedures specify how agents locate relevant material, examine contributions and incorporate authorized revisions into maintained documents. Researchers assess substantive interpretations and can work with a single agent or delegate defined inquiries to additional agents. The public implementation provides a reusable vault template with synthetic examples and structural checks. Agents carry out its procedures using the tools and permissions available in their working environment. A proposed observational study follows real research tasks to examine whether earlier reasoning can be recovered and revised findings applied within their documented conditions. It also records unsuccessful contributions and the effort required for review and knowledge maintenance. The contribution is an inspectable design and an evaluation protocol. Current evidence concerns technical checks and bounded development trials, while effects on research practice remain to be evaluated.

## 1. Research projects and personal research environments

When research resumes after an interruption, the current document may preserve a decision without explaining why it was made. A correction may appear in a detailed note while an overview still repeats the earlier position. Working with AI agents raises a practical question about these relationships. Which material should an agent consult, and how can subsequent work retain the grounds and limits of a new contribution?

Second Brain investigates this question in a researcher's existing documentary environment. Its scope includes work that crosses project boundaries and continues across conversations. The following working definitions identify the objects of that investigation.

### Research project

A research project is a connected body of inquiry organized around a research purpose, material under investigation and methods for addressing that purpose. Its identity depends on the relationship between the question being pursued and what would count as a justified contribution. The question and methods can change as the material is examined.

For agent-assisted work, a project needs enough explicit context to establish what is being investigated and which evidence can support an answer. Recorded methodological decisions explain how the material is treated. Responsibilities identify who may revise it and who can assess the resulting claims. An output may be an interpretation, an edition or a research tool, but completing the output does not by itself establish its scholarly adequacy.

A project can span several repositories, and a shared tool can serve several projects. A teaching activity may use research knowledge without itself constituting a research project. Second Brain therefore accommodates a broader working portfolio while selecting research tasks for the proposed study according to their substantive questions and evidential demands.

### Personal research environment

A personal research environment is the maintained arrangement of knowledge resources, tools and working practices through which a researcher conducts inquiry across projects. It connects current work with relevant earlier sources and decisions, and provides ways to examine new contributions and preserve their consequences for later work.

The term *personal* identifies whose research context and judgement organize the environment. Collaboration can involve shared repositories and other researchers. In Second Brain, the personal collection provides continuity across projects, while each project's documentation preserves the conditions of its own work. Conversation allows the researcher to question a proposal and refine an interpretation. Written procedures govern how accepted changes enter the maintained record.

The central research question is under what conditions this arrangement helps later agent sessions recover and apply justified findings, including the work needed to keep those findings usable.

## 2. AI agents and related approaches

### AI agent

An AI agent based on a Large Language Model (LLM) pursues a goal through a sequence of actions using tools and adapts its subsequent steps to intermediate results. In research work, it can inspect project resources, act on them and evaluate the resulting output before continuing. ([Sapkota, Roumeliotis and Karkee, 2026](https://doi.org/10.1016/j.inffus.2025.103599), [Weng, 2023](https://lilianweng.github.io/posts/2023-06-23-agent/))

The agent environment supplies access to files and tools and determines which operations are permitted. Its instructions and available knowledge influence the actions the LLM selects. Research evaluation consequently concerns the configured working system, including the evidence it actually receives and the changes it makes. The ability to inspect an intermediate result does not establish that the agent assesses it correctly.

A-MEM constructs linked memory notes and revises their descriptions as new information arrives. Its evaluation concerns questions about extended conversations. This makes linked and evolving notes an established point of comparison for Second Brain, whose proposed study concerns reviewed research knowledge and its subsequent application. ([Xu et al., 2025](https://arxiv.org/html/2502.12110v11)) Agentic Context Engineering similarly develops reusable context through incremental updates, with evaluations on agent tasks and domain-specific benchmarks. Its findings motivate examining what is preserved or lost when knowledge is repeatedly revised. ([Zhang et al., 2026](https://arxiv.org/html/2510.04618v3))

LongMemEval examines memory across sessions, including changes to previously recorded information. Its analysis distinguishes failure to retrieve evidence from failure to use retrieved evidence correctly. This distinction informs the proposed evaluation of Second Brain, where locating a decision and applying its reasoning are separate achievements. ([Wu et al., 2025](https://arxiv.org/html/2410.10813v2)) Co-STORM addresses participation in conversations among agents during exploratory information seeking. Its interactive mind map provides a related approach to helping people follow and steer an investigation. Reported limitations concern adaptation to the user's prior knowledge and the degree of control over the conversation, both relevant to collaboration informed by a personal research environment. ([Jiang et al., 2024](https://aclanthology.org/2024.emnlp-main.554/))

Second Brain also develops ideas from the author's methodological projects. [Promptotyping](https://github.com/DigitalHumanitiesCraft/Promptotyping) places maintained project knowledge within the development and examination of research artefacts. The need to check the resulting claims connects this practice to [Grounded Vault](https://github.com/DigitalHumanitiesCraft/grounded-vault), which links statements to supporting material. When investigations proceed in parallel, [Research Mission Control](https://github.com/DigitalHumanitiesCraft/research-mission-control) supplies procedures for assigning work and checking returned results. These projects provide design inputs and implementation references. Their combination still requires evaluation in the research setting considered here.

## 3. Maintaining knowledge across projects

Second Brain uses a personal vault, a collection of linked notes maintained in Obsidian, to hold conceptual knowledge and readings that may matter across projects. Project-specific documentation resides with the material whose interpretation or implementation it governs. A repository stores such files together with their recorded revisions. Its `knowledge/` folder explains the project's purpose and the decisions that shape its data and tools. A directory links the personal overview to the relevant repository, allowing a reader to move from the broader research context to the detailed project record.

The guiding maintenance rule assigns a designated document to each durable finding or rule. Other documents link to that location or summarize it within a stated scope. When the finding changes, those summaries require inspection. This addresses a concrete failure described in the development record, where a corrected knowledge document coexisted with an outdated overview. Revision history preserves what changed, while the maintained text identifies the position that currently governs the work. The [knowledge-document convention](https://github.com/chpollin/second-brain-vault/blob/main/Vault%20Operations/Conventions/Convention%20Knowledge%20Documents.md) specifies how these relationships are handled.

The document network provides routes for selective reading. A link to another repository does not establish access to it. The active agent environment must permit the read, and the source must actually be inspected. The same distinction applies to interpretation. A note relevant to one project can suggest a method for another, but the transfer requires checking the new material and research purpose against the conditions of the earlier finding.

Written procedures, called *skills*, tell an agent how to carry out recurring work. A procedure identifies relevant sources and the permitted operations, then specifies how the result should be checked. The substantive knowledge remains in the documents it refers to. Reading a procedure supplies instructions. The ability to execute them depends on available tools and permissions.

Context selection starts with the current question. The agent uses the project overview and its links to identify relevant knowledge, then checks claims about current software behaviour against code or data when necessary. Disagreement between the documentation and the implementation becomes a question to investigate. The record preserves both accounts until their relationship has been checked.

## 4. Collaborative inquiry and revision

The researcher and the agent begin by identifying the question to be answered and the evidence that would make a contribution useful. A task can remain within one conversation. Additional agents become relevant when a defined inquiry can proceed independently, such as examining another project's assumptions while the main conversation considers whether a method can be transferred.

Each delegated inquiry specifies its question, sources and permitted changes. The coordinating agent checks returned claims against the cited material before incorporating them into its response. Results can return independently, and conflicting findings remain explicit. This requirement addresses a documented difficulty in multi-agent systems, where failures can arise from task specification, communication and verification. Agreement among agents is therefore insufficient evidence of correctness. ([Cemri et al., 2025](https://arxiv.org/html/2503.13657v3))

```text
Researcher and coordinating agent
              |
              v
Current question <---------- Maintained research knowledge
              |
              v
Source selection and inquiry
              |
              +---- Optional delegated inquiries
              |                 |
              v                 v
        Contribution with evidence
              |
              v
   Verification and scholarly judgement
          /                       \
         v                         v
Further inquiry           Authorized revision
                                   |
                                   v
                        Maintained research knowledge
                                   |
                                   v
                          Later research question
```

Figure 1. The proposed relationship between a current inquiry and later use of its findings. The branches describe possible continuations. A useful contribution may require no document change.

Human involvement follows the substance of the work. A technical correction within an existing authorization can be implemented and checked directly. A new scholarly interpretation requires assessment of its grounds. A statement about the researcher's own position also requires confirmation that the attribution is appropriate. When a contribution warrants a durable revision, the authorized session changes its designated document and inspects affected summaries. Consequences for pending work enter the corresponding work record.

Conversation permits detailed argument and correction. The work interface should make it possible to identify the project, inspect the relevant contribution and follow a recorded response to its actual incorporation. A saved response and an updated knowledge document are distinct states. Making that distinction visible is a design requirement for assessing whether an intervention changed subsequent work.

An optional [Research Persona procedure](https://github.com/chpollin/second-brain-vault/tree/main/.claude/skills/persona-init) develops a confirmed research profile and an agreement about dialogue. The profile can guide the selection of relevant earlier work and the presentation of a contribution. Its account distinguishes the researcher's statements from source evidence and generated interpretation. Simulated answers remain unconfirmed until reviewed, and feedback on one answer becomes a general preference only when the researcher makes that scope explicit. These distinctions allow personal relevance to be examined separately from evidential correctness.

## 5. Implementation and available evidence

The public [Second Brain repository](https://github.com/chpollin/second-brain-vault) provides a reusable vault template with synthetic content, written procedures and checks on document structure. Its browser-based explorer displays the template and the reading sequences specified by its rules. These sequences describe intended behaviour. They do not record an agent's actual reading or execution.

The author's working environment also contains a separate interface over personal work records and an exporter that prepares explicitly selected documents for use in a conversation. The exporter records its selection. Access to material in other repositories requires additional reads or separately supplied context. The public template contains neither the private research corpus nor a service that automatically retrieves knowledge across repositories. Its [integration specification](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/integration.md) describes these component boundaries.

Automated tests examine document requirements, links and generated views. Browser inspection examines selected navigation and rendering behaviour. The [development record](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/skill-evaluation.md) also describes synthetic maintenance and synthesis trials, together with profile initialization. Their complete local transcripts are not publicly available. The persona baseline reported no failure, so that comparison supports no improvement claim. Further cross-repository cases specify expected behaviour without establishing its reliability in use.

A separate documentation-recovery check used a fresh agent context to identify the public repository's scope. Its answer correctly distinguished the template from the external interface and exporter, and the coordinating agent checked these claims against repository files. The record lacks a complete execution trace, a comparison condition and a later reuse attempt. It therefore supports a bounded observation about recovering the repository's documented scope. Effects on research quality or human effort remain untested.

## 6. Studying research episodes

The proposed study examines a research episode, understood as work on a substantive question together with the resulting contribution and any observed subsequent use. Selection depends on the knowledge or judgement the task requires. The portfolio's categories provide possible settings, but selecting one commissioned project, one independent project and one teaching activity would not by itself explain what is being tested.

An episode might resume an earlier methodological decision or assess whether a procedure can be used with different material. Such work can expose a conflict between a source, its interpretation and the implemented behaviour. A correction may follow, and a later task may provide an opportunity to examine whether the revised account remains usable. Which of these relationships occurs depends on the task. The [evaluation protocol](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/evaluation.md) and [episode record](https://github.com/chpollin/second-brain-vault/blob/main/knowledge/episode-template.md) specify the proposed observations.

The record begins with the question and the grounds on which a contribution would be judged. It preserves the source revisions so that later changes do not alter the evidence retrospectively. Available documents are distinguished from passages actually supplied to or read by the agent. The record identifies the LLM and its available settings alongside the active instructions and tool access, because these affect the contribution. Delegated work and researcher interventions remain attributable to their respective roles. Missing logs are identified as gaps, and retrospective recollection remains distinguishable from contemporaneous evidence.

Assessment examines each claim needed to support the contribution against its cited passage, data or observed behaviour. It also considers whether an inference follows from the evidence and whether its conditions hold in the present task. Scholarly judgement concerns whether the contribution answers the research question. The researcher separately assesses its usefulness and the work required to make it usable. Where feasible, a qualified reader who did not develop the contribution assesses its central claims independently. Personal acceptance records a decision to use the result and does not establish independent scholarly validation.

For an accepted revision, a later research task can test whether the finding remains available and is applied correctly. That attempt uses a fresh session with the ordinary permitted entry points. Any remaining conversation history or other hints are documented. An assessment record prepared beforehand preserves the expected reasoning and its conditions without supplying the answer to the agent. A failed attempt and an absent follow-up are recorded differently. Rejected, unresolved and interrupted episodes remain part of the analysis, and an accepted contribution can be useful without requiring a write to the knowledge base.

An initial observational study can establish how the arrangement behaves in the recorded cases. Attributing a difference to a particular component requires a separate comparison. Source material, tasks, agent configuration, available tools and assessment criteria should remain equivalent while one component changes. For example, ordinary agent-led browsing can be compared with explicit documentary navigation. Providing the relevant passages directly in a further condition would help distinguish difficulties in finding evidence from difficulties in applying it.

Delegation requires its own comparison, because additional agents also add processing. A comparison with one agent should use a comparable total processing allowance and record actual calls and available token measurements across the team. The Research Persona should be varied separately. Task order and the researcher's prior familiarity must also be recorded, since repeating a solved task changes the conditions. Elapsed time and human review and maintenance effort belong in the analysis wherever they can be observed by a stated method. Unavailable measurements remain unrecorded.

## 7. Scope and limitations

The design has developed within one researcher's documentary practices. Its use elsewhere depends on whether relevant project knowledge is available and maintained. Assigning a finding to a designated document helps locate the current account, but establishes no guarantee of truth. Several consistent documents can reproduce the same error. Selective reading can also miss evidence that would change the judgement.

The proposed study must make enough material available for its central claims to be inspected. Private research sources and correspondence may restrict publication. Any released episode therefore requires an explicit publication scope and an account of omitted evidence. Removing identifying material must preserve the relationship between a claim and its support. If that relationship cannot be inspected publicly, the limitation belongs with the affected finding.

Larger agent organizations remain a possible extension. A team can pursue a shared task, while an organization may coordinate teams with distinct responsibilities. A civilization metaphor raises further questions about enduring institutions and shared knowledge. An ant-colony analogy suggests coordination through local interactions in a shared environment. These are prospective design questions. The current study concerns a researcher working with a single agent or a small team, and must first examine whether that arrangement makes the work easier to understand and assess.

## 8. Conclusion

Second Brain provides a way to organize the relationship between research knowledge, agent contributions and authorized revision. Its proposed evaluation follows what happens when a finding is needed again, including whether its evidence and conditions remain available and what further correction is required. The public template makes the documentary design inspectable. Establishing its practical value requires observed research episodes and a comparison of the benefits with the work needed to maintain them.

## References

Cemri, Mert, et al. 2025. [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657v3) arXiv:2503.13657, version 3.

Jiang, Yucheng, et al. 2024. [Into the Unknown Unknowns: Engaged Human Learning through Participation in Language Model Agent Conversations](https://aclanthology.org/2024.emnlp-main.554/). Proceedings of EMNLP 2024, 9917–9955.

Sapkota, Ranjan, Konstantinos I. Roumeliotis, and Manoj Karkee. 2026. [AI Agents vs. Agentic AI: A Conceptual Taxonomy, Applications and Challenges](https://doi.org/10.1016/j.inffus.2025.103599). Information Fusion 126, 103599. [Accessible article](https://arxiv.org/pdf/2505.10468v5).

Weng, Lilian. 2023. [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/). Lil'Log, 23 June.

Wu, Di, et al. 2025. [LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory](https://arxiv.org/abs/2410.10813v2). ICLR 2025.

Xu, Wujiang, et al. 2025. [A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110v11). NeurIPS 2025.

Zhang, Qizheng, et al. 2026. [Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models](https://arxiv.org/abs/2510.04618v3). ICLR 2026.

Text licensed under CC BY 4.0. Code in the Second Brain repository is licensed under MIT. Linked third-party materials retain their own terms.
