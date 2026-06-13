---
name: YAML colon-in-description
description: OpenAPI YAML descriptions containing ": " break orval with cryptic error
---

Any `description:` value in openapi.yaml that contains a colon followed by a space (`: `) must be wrapped in double quotes. Without quotes, the YAML parser treats the colon as a key-value separator, causing a parse error that orval reports as "Failed to resolve input: Please provide a valid string value or pass a loader to process the input".

**Why:** YAML spec treats `: ` (colon + space) as a mapping indicator. Unquoted scalars with `: ` inside are parsed as nested mappings, breaking the document structure.

**How to apply:** When writing OpenAPI path parameter descriptions or any description that includes Korean examples like `(예: 값)`, always quote the entire value:
```yaml
# WRONG - breaks orval silently
description: 자치구명 (예: 성동구)
# CORRECT
description: "자치구명 (예: 성동구)"
```
