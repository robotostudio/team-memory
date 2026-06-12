---
description: Minimal diffs, root causes, no speculative code — extract helpers only when they earn the indirection
type: standard
author: hrithik
date: 2026-06-12
---
Fix the root cause, never a band-aid, and build nothing speculative — delete code with no current caller, and hardcode values that never vary instead of parameterizing them. Extract a helper only when it owns I/O, error handling, or 10+ lines of cohesive logic; single expressions and one-off 2-3 line blocks stay inline. Break functions over ~50 lines into helpers that each own a meaningful step.
