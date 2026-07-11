# AGENTS.md — Guide for AI Coding Assistants

This file gives AI coding tools (Claude Code, Cursor, Copilot, etc.) the context needed to work effectively in this repo without re-deriving it each session.

## What this repo is

`llm-strings` is a zero-dependency TypeScript library that parses, normalizes, and validates LLM connection strings — URL-like strings of the form:

```
llm://[label[:apiKey]@]host/model[?params]
```

It lets callers express provider, model, and generation parameters in a single portable env var, then normalize those params to whatever shape a specific provider's API expects.

## Key files

| File                   | Responsibility                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/parse.ts`         | `parse()` — URL parsing into `LlmConnectionConfig`. `build()` — inverse.                                                                                        |
| `src/normalize.ts`     | `normalize()` — alias expansion, provider-specific param renaming, cache/reasoning rewrites.                                                                    |
| `src/validate.ts`      | `validate()` — calls normalize internally, then checks types, ranges, enums, mutual exclusions, and provider/model-family constraints.                          |
| `src/provider-core.ts` | Central registry: `ALIASES`, `HOST_ALIASES`, `PROVIDER_PARAMS`, `PARAM_SPECS`, `CACHE_VALUES`, `CACHE_TTLS`, `DURATION_RE`, and all provider detection helpers. |
| `src/provider-meta.ts` | `PROVIDER_META` (UI metadata array) and `CANONICAL_PARAM_SPECS` (derived canonical specs).                                                                      |
| `src/providers.ts`     | Re-exports `provider-core` and `provider-meta` as the `llm-strings/providers` sub-path.                                                                         |
| `src/ai-sdk.ts`        | `createAiSdkProviderOptions()` — builds AI SDK `providerOptions` from a connection string.                                                                      |
| `src/index.ts`         | Main entry point — re-exports parse, build, normalize, validate.                                                                                                |

## Data flow

```
connection string
  → parse()         → LlmConnectionConfig  { host, model, params (raw aliases) }
  → normalize()     → NormalizeResult      { config (provider-specific params), provider, subProvider, changes }
  → validate()      → ValidationIssue[]    (calls normalize internally; empty array = valid)
```

## How to run things

```bash
pnpm test                                   # run all tests
pnpm test -- src/validate.test.ts           # single file
pnpm test -- -t "flags temperature"         # by name pattern
pnpm run test:coverage                      # coverage report
pnpm run build                              # tsup → dist/
pnpm run lint                               # eslint
pnpm run format                             # prettier --write
```

## How to add a provider

Work through `src/provider-core.ts` in this order:

1. **`Provider` type** — add the new string literal to the union (e.g. `"myprovider"`).
2. **`HostAlias` type** — add any short alias(es) (e.g. `"myp"`).
3. **`HOST_ALIASES`** — map each alias to its canonical API hostname.
4. **`HOST_ALIAS_PROVIDERS`** (if alias ≠ provider id) — map alias → Provider.
5. **`detectProvider(host)`** — add a `host.includes(...)` branch. Place gateways/aggregators first, then cloud-specific patterns, then generic ones.
6. **`PROVIDER_PARAMS`** — map canonical snake_case param names → provider-specific API param names. Use `OPENAI_COMPATIBLE_PARAMS` for OpenAI-compatible providers. Use `{}` for flexible/media providers where any param should pass through.
7. **`PARAM_SPECS`** — validation rules keyed by provider-specific param name. Use `OPENAI_COMPATIBLE_PARAM_SPECS` for OpenAI-compatible providers. Use `{}` for flexible providers.
8. **`CACHE_VALUES`** — set `"ephemeral"` if the provider supports explicit prompt caching, `undefined` otherwise.
9. **`CACHE_TTLS`** — set TTL options if supported, `undefined` otherwise.
10. **`src/provider-meta.ts` → `PROVIDER_META`** — add `{ id, name, host, color }` entry.
11. **`src/ai-sdk.ts`** — add `PROVIDER_OPTION_KEYS` entry; add an `addXxxOption` function if the provider needs non-trivial option shaping; wire it into `addProviderSpecificOption`.
12. **Tests** — add coverage in `src/providers.test.ts` (detection) and `src/normalize.test.ts` (param mapping). If there are validation quirks, add to `src/validate.test.ts`.

For OpenAI-compatible providers that simply forward params unchanged, steps 6–7 are just assigning `OPENAI_COMPATIBLE_PARAMS` / `OPENAI_COMPATIBLE_PARAM_SPECS` — no custom logic needed.

## How to add a param alias

In `src/provider-core.ts`, add an entry to `ALIASES`:

```ts
myAlias: "canonical_snake_case_name",
```

Canonical names follow OpenAI convention (snake_case). The alias expands during normalize step 1 before any provider-specific mapping.

If the canonical name doesn't yet exist, also add it to every relevant provider's `PROVIDER_PARAMS` and `PARAM_SPECS`.

## How to add a provider-specific param name mapping

In `PROVIDER_PARAMS[provider]`, add:

```ts
canonical_name: "ProviderSpecificName",
```

Then add the validation spec in `PARAM_SPECS[provider]` keyed by the provider-specific name:

```ts
ProviderSpecificName: { type: "number", min: 0, max: 1, default: 0.7, description: "..." },
```

## Conventions

- **Canonical param names are snake_case** (OpenAI convention). Provider-specific names vary (camelCase for Google/Bedrock).
- **All params flow as strings** through the connection string; `validate()` coerces to numbers/booleans for range checking only.
- **`PARAM_SPECS` keys are provider-specific names**, not canonical names. This means for Google, the spec for temperature is keyed `"temperature"` (unchanged) but the spec for max tokens is keyed `"maxOutputTokens"`.
- **Severity**: `"error"` blocks usage; `"warning"` is advisory. Strict mode (`{ strict: true }`) promotes warnings to errors.
- **Gateways** (`openrouter`, `vercel`) use loose validation ranges since they proxy to many providers. When a sub-provider is detected from the model prefix (e.g. `anthropic/claude-*`), `validate()` switches to that sub-provider's tighter specs.
- **`isReasoningModel(model)`** strips gateway prefixes before matching — `"openai/gpt-5.6-sol"` and `"gpt-5.6-sol"` both match.
- **ESM-first** (`"type": "module"`); imports inside `src/` use `.js` extensions even for `.ts` source files.
- **Zero runtime dependencies** — do not add any.

## Common pitfalls

- **Don't add a provider to `PROVIDER_PARAMS` without also adding it to `PARAM_SPECS`**, and vice versa — they must be in sync because `validate()` iterates `PARAM_SPECS[provider]` and `normalize()` iterates `PROVIDER_PARAMS[provider]`.
- **`PROVIDER_PARAMS` maps canonical → provider-specific; `PARAM_SPECS` maps provider-specific → spec.** Following the wrong direction breaks both normalization and validation silently.
- **`CACHE_VALUES` and `CACHE_TTLS` must include every `Provider` union member** (even as `undefined`) because they are `Record<Provider, ...>`. TypeScript will catch missing entries at build time, but add the `undefined` entry explicitly to avoid confusion.
- **Tests use the Vercel `"vercel"` alias or full hostname** (`gateway.ai.vercel.app`, `gateway.ai.vercel.sh`). The bare string `"gateway"` is not a registered alias.
- **`gpt-5.x` models are classified as reasoning models** by `isReasoningModel()`. Do not invent OpenAI- or Anthropic-looking model IDs for tests or docs. Use real current & verified models, or use neutral names such as `custom-model` only with custom/non-provider hosts when the test is about parser mechanics.
- **Bedrock model IDs include vendor prefixes** (`anthropic.claude-*`, `amazon.nova-*`, `meta.llama4-*`) and may carry cross-region prefixes (`us.`, `eu.`, `apac.`, `global.`). `detectBedrockModelFamily()` handles this correctly — don't do your own prefix parsing.
- **`CANONICAL_PARAM_SPECS` is derived at module load** from `PROVIDER_PARAMS` + `PARAM_SPECS` in `provider-meta.ts`. It doesn't need manual updates when you add params to `provider-core.ts`.
- **Do not introduce old model IDs in README/docs/examples.** Anything released more than six months ago, or whose freshness is unclear, needs a live web/docs check before keeping it. Prefer current, official model IDs such as `gpt-5.6-sol`, `claude-sonnet-5`, `gemini-3.5-flash`, `openai/gpt-oss-120b` on Groq, and `amazon.nova-2-lite-v1:0` on Bedrock. Only use older model names in tests or docs when the point is explicitly legacy compatibility.

## Exports & APIs

| Import path             | Contents                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `llm-strings`           | `parse`, `build`, `normalize`, `validate`, shared types               |
| `llm-strings/parse`     | `parse`, `build`, `LlmConnectionConfig`                               |
| `llm-strings/normalize` | `normalize`, `NormalizeResult`, `NormalizeChange`, `NormalizeOptions` |
| `llm-strings/validate`  | `validate`, `ValidationIssue`, `ValidateOptions`                      |
| `llm-strings/providers` | Everything from `provider-core` and `provider-meta`                   |
| `llm-strings/ai-sdk`    | `createAiSdkProviderOptions`, `AiSdkProviderOptionsResult`            |

All sub-paths ship ESM + CJS with `.d.ts` / `.d.cts` declarations.
