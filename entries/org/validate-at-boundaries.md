---
description: Schema-validate external input at the boundary; fix nullable types at the source, not per call site
type: standard
author: hrithik
date: 2026-06-12
---
Validate all external data — user input, API responses, file content — with schema-based validation where it enters the system; fail fast with clear errors so downstream code can trust the types. If the same null/empty/missing guard appears 3+ times, the type is wrong: enforce non-null at the boundary and delete the downstream guards. In TypeScript, infer static types from the schema (Zod `z.infer`) so runtime validation and compile-time types cannot drift.
