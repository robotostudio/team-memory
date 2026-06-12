---
description: Fallible operations return discriminated unions keyed on `ok`, not throws or optional fields
type: standard
author: hrithik
date: 2026-06-12
---
Functions that can fail return `{ ok: true; ... } | { ok: false; reason/error }` so the type system narrows for callers — no nested guard ladders, no optional-chained maybes. Expected errors return unions; only unexpected errors throw. Never pass UI setters into utilities: return data, let callers handle side effects.
