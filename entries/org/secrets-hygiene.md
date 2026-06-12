---
description: Secrets live in env vars or the team secret manager — never hardcoded, committed, printed, or real in demos
type: standard
author: hrithik
date: 2026-06-12
---
Never hardcode secrets or commit .env files — load them from env vars or the team secret manager, and keep production environments protected from direct pushes. Inspect env files by key name only, never print values, and rotate any secret that may have been exposed. Demos, fixtures, and recordings use only documented, obviously-fake example credentials.
