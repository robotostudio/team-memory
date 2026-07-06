---
description: Never collapse authorization failures into empty states — probe per-resource access at credential save
type: lesson
author: hrithik
date: 2026-06-12
---
A GitHub fine-grained PAT scoped to the wrong owner returns 404 (not 403) on private repos, so a pipeline reported ok with zero results and told the user "no activity" instead of "re-authorize your token". Never collapse per-resource authorization failures into a benign empty state: surface them as actionable user-facing errors, and probe access to each tracked resource at credential-save time so broken scopes are caught immediately.
