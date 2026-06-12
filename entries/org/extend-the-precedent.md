---
description: Extend the codebase's established pattern instead of adding a parallel one-off
type: standard
author: hrithik
date: 2026-06-12
---
Before adding a new route, component, or config pattern, find the existing precedent and extend it — a standalone duplicate of an established mechanism is a bug in review. Repeated cross-cutting setup (providers, hydration boundaries) belongs at the root, not copy-pasted per page.
