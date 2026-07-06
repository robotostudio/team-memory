---
description: A de-risking spike only counts if it exercises the production data shape
type: lesson
author: hrithik
date: 2026-06-12
---
A Phase-0 MDX spike "proved" rendering using only a string attribute; real content passed arrays and objects, which the library silently dropped — the failure surfaced only after seeding real content and cost a full debug cycle. A green spike on a simplified stand-in is not de-risked: feed spikes the production data shape, including the gnarliest real records, before declaring an approach proven.
