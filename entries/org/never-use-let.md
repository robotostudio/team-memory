---
description: Never use `let` or `var` in TS/JS — `const` everything, restructure instead
type: standard
author: hrithik
date: 2026-06-12
---
Default to `const` for every binding in every TS/JS file. If you reach for `let`, restructure: early returns, ternaries, `??`/`?.`/short-circuit, `map`/`filter`/`reduce` for accumulators, or a helper returning the value. `var` is forbidden outright. The only exception is genuinely hot-path imperative code where the refactor hurts readability — flag it explicitly in the diff and keep it scoped to one block.
