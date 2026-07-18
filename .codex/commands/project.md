---
description: "Propose and create a runnable example project for a studied topic"
argument-hint: "<topic, chapter path, project idea, or constraints>"
---

Use the `example-project` skill for: $ARGUMENTS

First inspect the relevant learning material and present the project title, learning objectives, destination, stack, observable behavior, completion criteria, and expected files. Then ask: **"Create this example project?"**

Do not create or modify project files, install dependencies, or generate scaffolding until the user explicitly confirms. Invoking `/project` is not confirmation. After confirmation, implement the project and smoke-test its actual entrypoint. Do not invoke subagents automatically.
