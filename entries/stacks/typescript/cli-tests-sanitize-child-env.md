---
description: Strip vitest env vars when spawning CLIs under test and assert on merged stdout+stderr
type: lesson
author: hrithik
date: 2026-06-12
---
citty/consola suppress all CLI output (even `--version`) when `NODE_ENV=test` or `TEST=true` — both set by vitest and inherited by spawned child processes — and consola prints version/usage to stderr, not stdout. When testing a CLI binary, strip test-env variables from the child process env and assert on merged stdout+stderr; otherwise tests pass and fail for the wrong reasons.
