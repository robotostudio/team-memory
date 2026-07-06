---
description: Background jobs must alert on first failure — a digest ran silently dead for two months
type: lesson
author: hrithik
date: 2026-06-12
---
A scheduled digest produced nothing for ~2 months: schedule-registration errors were swallowed ("saved successfully" with zero schedules created), failure alerts only fired in preview mode, the job library ran at silent log level, and a broken AI provider silently fell back to another. Make scheduled and background jobs fail loudly — never swallow registration errors, alert in production on first failure, always pass a logger, and never fall back silently to an alternate provider or synthetic data.
