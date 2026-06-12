---
description: AI agents never commit, push, tag, or open PRs without explicit, fresh, per-action approval
type: standard
author: hrithik
date: 2026-06-12
---
Never let an agent run `git commit`, `git push`, `git tag`, or open/merge a PR without an explicit human instruction, and treat each approval as single-use — a prior "ship" does not authorize follow-up commits. "Fix X" or "apply the suggestion" is not commit permission: do the edit, run type-check and lint, summarize, then stop and ask. If a tool or skill auto-commits as a side effect, abort it and report.
