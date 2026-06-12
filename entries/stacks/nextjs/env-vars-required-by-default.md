---
description: Feature-critical env vars are required in the env schema — crash at startup, never degrade silently
type: standard
author: hrithik
date: 2026-06-12
---
Declare feature-critical env vars as required in the env schema (`z.string().min(1)` in t3-env) so the app crashes loudly at startup instead of degrading silently — optional vars with runtime null-check fallbacks let a rate limiter return success while its Redis vars were missing. Reserve `.optional()` for genuinely optional features, and delete runtime null checks the schema already guarantees.
