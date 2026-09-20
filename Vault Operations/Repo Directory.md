---
type: vault-organisation
created: 2026-09-19
tags: [workflow, hub]
query-topics: [repo-directory, repository-mapping, local-path]
---
# Repo Directory

The source of truth for which repository belongs to which project. When a task names a repository, look it up here instead of searching the file system. Resolve its checkout from the operator's machine-local configuration and verify that the mapping matches the repository. Update the table when the maintained entry changes.

| Project | Vault document | Repository | Knowledge entry |
|---|---|---|---|
| Example Project | [[Project Overview Example Project]] | placeholder, owner and name of the repository | `knowledge/INDEX.md` |

The example row is synthetic and supplies no local checkout. Keep private local paths and credentials outside the public template. A repository URL is a reference and does not authorise cloning or network access. Report an unresolved location and continue with the sources that are available.

Read the linked Project Overview for the task's conceptual context, then the target repository's applicable instructions and knowledge entry. Follow selected documents to their code, data or decision evidence under [[Convention Knowledge Documents#Working from the knowledge base]]. This directory owns the mapping. Project claims and relations stay at their maintained locations under [[Convention Knowledge Documents#Ownership and transfer]].

## Related

- [[Convention Knowledge Documents#Bridge to the vault]]
