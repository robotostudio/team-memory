---
description: No `console.*` in production code — structured logger internally, generic messages to clients
type: standard
author: hrithik
date: 2026-06-12
---
Log internals with a structured logger (pino/winston or the project's choice), never `console.*`. Never expose internal error messages to clients — map to generic user-facing messages at the boundary. Use the project's response helpers, not raw framework response constructors.
