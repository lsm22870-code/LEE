---
name: Orval codegen clean risk
description: orval clean:true deletes generated files before generating; a failure leaves frontend broken
---

When `orval` runs with `clean: true` in output config, it deletes the entire output folder **before** attempting code generation. If generation then fails (e.g. due to bad YAML), the generated files are gone and the frontend cannot build.

**Why:** orval's design choice — clean before generate, not after success.

**How to apply:** Always fix the root cause of any codegen error immediately after discovering it. Do not leave generated files in a deleted state. After fixing, run `pnpm --filter @workspace/api-spec run codegen` to regenerate, then restart the frontend workflow.
