---
description: Typecheck, lint, build, and tests must pass with shown evidence before any change is done
type: standard
author: hrithik
date: 2026-06-12
---
A change is not done until typecheck, lint, build, and tests (where present) all pass — nothing ships on partial green. Show evidence before claiming done: test output, logs, or a behavior diff against main. When a test fails, fix the implementation, not the test, unless the test itself is provably wrong.
