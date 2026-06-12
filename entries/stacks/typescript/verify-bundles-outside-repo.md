---
description: Verify built artifacts from outside the repo — in-repo runs mask missing bundled dependencies
type: lesson
author: hrithik
date: 2026-06-12
---
A bundled CLI passed every in-repo test while shipping bare imports of its dependencies: Node silently resolved the repo's node_modules, and tsdown in library mode externalizes `dependencies` by default. Before publishing, copy the built artifact to a temp dir outside the repo and run it there as a release gate. Never trust a claim that a bundler "includes deps by default" — measure it.
