---
description: Gate destructive migration deletes on real browser rendering, not HTTP 200s
type: lesson
author: hrithik
date: 2026-06-12
---
In a public-assets-to-Blob migration, HTTP 200 checks did not prove pages render — lazy loading, image optimizers, and dynamically constructed paths all hide breakage. Before deleting any migrated resource, verify the per-file invariant: uploaded, AND verified working in a real browser on the page that links it, AND unreferenced. Automate it with a Playwright sitemap crawl asserting every asset loads.
