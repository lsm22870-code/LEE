---
name: Orval config __dirname ESM issue
description: orval v8 may load orval.config.ts in ESM context where __dirname is undefined
---

In orval v8.x, the TypeScript config file (`orval.config.ts`) may be loaded in an ESM context where `__dirname` is not available. Using `__dirname` for path resolution can cause `path.resolve(undefined, ...)` to throw, resulting in the config silently failing and orval reporting "Failed to resolve input".

**Why:** orval uses jiti (or similar) to load TS configs. Jiti v2+ defaults to ESM mode, where `__dirname` is not a CJS global.

**How to apply:** Replace `path.resolve(__dirname, ...)` with `path.resolve(process.cwd(), ...)` in orval.config.ts. pnpm runs scripts from the package directory, so `process.cwd()` is reliable. Also use absolute paths for `input.target` (e.g. `path.resolve(process.cwd(), 'openapi.yaml')`).
