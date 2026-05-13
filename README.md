<div align="center">

# 🔗 llm-strings

**Connection strings for LLMs. Like database URLs, but for AI.**

[![npm version](https://img.shields.io/npm/v/llm-strings.svg)](https://www.npmjs.com/package/llm-strings)
[![License](https://img.shields.io/npm/l/llm-strings.svg)](https://github.com/justsml/llm-strings/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/llm-strings)

</div>

---

![the parts of a LLM connection string](./assets/inline-url-diagram-dark.svg)

```ini
llm://api.openai.com/gpt-5.2?temp=0.7&max=2000
llm://my-app:sk-key-123@api.anthropic.com/claude-sonnet-4-5?cache=5m
llm://bedrock-runtime.us-east-1.amazonaws.com/anthropic.claude-sonnet-4-5-20250929-v1:0?temp=0.5
llm://openai/gpt-5.2?temp=0.7&max=2000
```

Every LLM provider invented their own parameter names. `max_tokens` vs `maxOutputTokens` vs `maxTokens`. `top_p` vs `topP` vs `p`. `stop` vs `stop_sequences` vs `stopSequences`. You write the config once, then rewrite it for every provider.

**llm-strings** gives you a single, portable format. Parse it, normalize it to any provider's API, and validate it — all in one library with zero dependencies.

Based on the [LLM Connection Strings](https://danlevy.net/llm-connection-strings/) article by Dan Levy. See [draft IETF RFC for `llm://`](https://datatracker.ietf.org/doc/html/draft-levy-llm-uri-scheme-00).

## Install

```bash
npm install llm-strings
```

## Quick Start

```ts
import { parse, normalize, validate, build } from "llm-strings";

// Parse a connection string into structured config
const config = parse("llm://api.openai.com/gpt-5.2?temp=0.7&max=2000");
// → { host: "api.openai.com", model: "gpt-5.2", params: { temp: "0.7", max: "2000" } }

// Normalize aliases and map to the provider's actual API param names
const { config: normalized, provider } = normalize(config);
// → params: { temperature: "0.7", max_tokens: "2000" }, provider: "openai"

// Validate against provider specs (returns [] if valid)
const issues = validate("llm://api.openai.com/gpt-5.2?temp=3.0");
// → [{ param: "temperature", message: '"temperature" must be <= 2, got 3', severity: "error" }]

// Build a connection string from a config object
const str = build({
  host: "api.openai.com",
  model: "gpt-5.2",
  params: { temperature: "0.7" },
});
// → "llm://api.openai.com/gpt-5.2?temperature=0.7"
```

## Why Connection Strings?

You already use them for databases: `postgres://user:pass@host/db`. They're compact, portable, and easy to pass through environment variables. LLM configs deserve the same treatment.

**Store your entire model config in one env var:**

```bash
LLM_URL="llm://my-app:sk-proj-abc123@api.openai.com/gpt-5.2?temp=0.7&max=2000"
```

**Switch providers by changing a string, not refactoring code:**

```bash
# Monday: OpenAI
LLM_URL="llm://api.openai.com/gpt-5.2?temp=0.7&max=2000"

# Tuesday: Anthropic
LLM_URL="llm://api.anthropic.com/claude-sonnet-4-5?temp=0.7&max=2000"

# Wednesday: Bedrock in production
LLM_URL="llm://bedrock-runtime.us-east-1.amazonaws.com/anthropic.claude-sonnet-4-5-20250929-v1:0?temp=0.7&max=2000"
```

Your code stays the same. `normalize()` handles the parameter translation.

## Benefits

- **One format, every provider** — Write `temp=0.7&max=2000` once. Normalization maps it to `temperature`, `max_tokens`, `maxOutputTokens`, `maxTokens`, or whatever your provider calls it.
- **Catch mistakes early** — `validate()` checks types, ranges, and provider-specific rules before you burn tokens on a bad request.
- **Zero dependencies** — Pure TypeScript. No runtime baggage.
- **Portable config** — Fits in an env var, a CLI flag, a config file, or a database column.
- **Shorthand aliases** — Use `temp`, `max`, `topp`, `freq`, `pres` — they all expand to the right thing.
- **Short host aliases** — Use `llm://openai/...`, `llm://anthropic/...`, `llm://bedrock/...`, etc. Env overrides can redirect aliases to regional or private endpoints.

## Format

```ini
llm://[label[:apiKey]@]host/model[?params]
```

| Part     | Required | Description                        | Example                    |
| -------- | -------- | ---------------------------------- | -------------------------- |
| `label`  | No       | App name or identifier             | `my-app`                   |
| `apiKey` | No       | API key (in the password position) | `sk-proj-abc123`           |
| `host`   | Yes      | Provider's API host or short alias | `api.openai.com`, `openai` |
| `model`  | Yes      | Model name or ID                   | `gpt-5.2`                  |
| `params` | No       | Key-value config (query string)    | `temp=0.7&max=2000`        |

## Examples

### Switching between providers

Write portable params, let `normalize()` translate them:

```ts
import { parse, normalize } from "llm-strings";

// Same logical config, different providers
const strings = [
  "llm://api.openai.com/gpt-5.2?temp=0.7&max=2000&top_p=0.9",
  "llm://api.anthropic.com/claude-sonnet-4-5?temp=0.7&max=2000&top_p=0.9",
  "llm://generativelanguage.googleapis.com/gemini-3-flash-preview?temp=0.7&max=2000&top_p=0.9",
];

for (const str of strings) {
  const { config, provider } = normalize(parse(str));
  console.log(`${provider}:`, config.params);
}
// openai:    { temperature: "0.7", max_tokens: "2000", top_p: "0.9" }
// anthropic: { temperature: "0.7", max_tokens: "2000", top_p: "0.9" }
// google:    { temperature: "0.7", maxOutputTokens: "2000", topP: "0.9" }
```

### Short host aliases

Provider IDs can be used as short hostnames:

```ts
import { parse, normalize } from "llm-strings";

const { config, provider } = normalize(parse("llm://openai/gpt-5.2?temp=0.7"));

config.host; // "api.openai.com"
provider; // "openai"
```

Built-in aliases: `openai`, `anthropic`, `google`, `mistral`, `cohere`, `bedrock`, `openrouter`, `vercel`.

Set env overrides to point an alias at a regional or private endpoint:

```sh
LLM_STRINGS_OPENAI_HOST="regional.openai.example.com"
LLM_STRINGS_BEDROCK_HOST="bedrock-runtime.us-west-2.amazonaws.com"
```

The alternate form `LLM_STRINGS_HOST_OPENAI` is also supported. Overrides may include a scheme or path; only the host portion is used.

### Validating before calling the API

Catch bad config before it hits the network:

```ts
import { validate } from "llm-strings";

// Anthropic doesn't allow temperature + top_p together
const issues = validate(
  "llm://api.anthropic.com/claude-sonnet-4-5?temp=0.7&top_p=0.9",
);

for (const issue of issues) {
  console.error(`[${issue.severity}] ${issue.param}: ${issue.message}`);
}
// [error] temperature: Cannot specify both "temperature" and "top_p" for Anthropic models.
```

```ts
// OpenAI reasoning models have different rules
const issues = validate("llm://api.openai.com/o3?temp=0.7&max=2000");
// [error] temperature: "temperature" is not supported by OpenAI reasoning model "o3".
//         Use "reasoning_effort" instead of temperature for controlling output.
```

### Environment-driven config

```ts
import { parse, normalize } from "llm-strings";

// One env var holds the entire config
const { config, provider } = normalize(parse(process.env.LLM_URL!));

// Use the normalized params directly in your API call
const response = await fetch(`https://${config.host}/v1/chat/completions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: config.model,
    messages: [{ role: "user", content: "Hello!" }],
    ...Object.fromEntries(
      Object.entries(config.params).map(([k, v]) => [k, isNaN(+v) ? v : +v]),
    ),
  }),
});
```

### AI SDK providerOptions

The AI SDK adapter is available as a separate subpath so you can load it only
where you need it:

```ts
import { parse } from "llm-strings";

const { createAiSdkProviderOptions } = await import("llm-strings/ai-sdk");

const { providerOptions } = createAiSdkProviderOptions(
  parse("llm://api.anthropic.com/claude-sonnet-4-5?cache=1h&effort=max"),
);

// {
//   anthropic: {
//     cacheControl: { type: "ephemeral", ttl: "1h" },
//     effort: "max"
//   }
// }
```

Common generation settings like `temperature`, `topP`, and `maxOutputTokens`
belong on the AI SDK call itself, so this helper only emits provider-specific
configuration such as Anthropic cache control, Bedrock cache points, OpenAI
reasoning options, Mistral `safePrompt`, OpenRouter reasoning, and Vercel AI
Gateway routing options.

### Prompt caching (Anthropic & Bedrock)

```ts
import { parse, normalize } from "llm-strings";

// cache=true → cache_control=ephemeral
const { config } = normalize(
  parse("llm://api.anthropic.com/claude-sonnet-4-5?max=4096&cache=true"),
);
// → params: { max_tokens: "4096", cache_control: "ephemeral" }

// cache=5m → cache_control=ephemeral + cache_ttl=5m
const { config: withTtl } = normalize(
  parse("llm://api.anthropic.com/claude-sonnet-4-5?max=4096&cache=5m"),
);
// → params: { max_tokens: "4096", cache_control: "ephemeral", cache_ttl: "5m" }

// Works on Bedrock too (Claude and Nova models)
const { config: bedrock } = normalize(
  parse(
    "llm://bedrock-runtime.us-east-1.amazonaws.com/anthropic.claude-sonnet-4-5-20250929-v1:0?cache=1h",
  ),
);
// → params: { cache_control: "ephemeral", cache_ttl: "1h" }
```

### Debugging normalization

Use verbose mode to see exactly what was transformed:

```ts
import { parse, normalize } from "llm-strings";

const { changes } = normalize(
  parse(
    "llm://generativelanguage.googleapis.com/gemini-3-flash-preview?temp=0.7&max=2000&topp=0.9",
  ),
  { verbose: true },
);

for (const c of changes) {
  console.log(`${c.from} → ${c.to} (${c.reason})`);
}
// temp → temperature            (alias: "temp" → "temperature")
// max → max_tokens              (alias: "max" → "max_tokens")
// max_tokens → maxOutputTokens  (google uses "maxOutputTokens" instead of "max_tokens")
// topp → top_p                  (alias: "topp" → "top_p")
// top_p → topP                  (google uses "topP" instead of "top_p")
```

### Building connection strings programmatically

```ts
import { build } from "llm-strings";

const url = build({
  host: "api.openai.com",
  model: "gpt-5.2",
  label: "my-app",
  apiKey: "sk-proj-abc123",
  params: { temperature: "0.7", max_tokens: "2000", stream: "true" },
});
// → "llm://my-app:sk-proj-abc123@api.openai.com/gpt-5.2?temperature=0.7&max_tokens=2000&stream=true"
```

### AWS Bedrock with cross-region inference

```ts
import { parse, normalize } from "llm-strings";
import { detectBedrockModelFamily } from "llm-strings/providers";

const config = parse(
  "llm://bedrock-runtime.us-east-1.amazonaws.com/us.anthropic.claude-sonnet-4-5-20250929-v1:0?temp=0.5&max=4096",
);

detectBedrockModelFamily(config.model);
// → "anthropic"

const { config: normalized } = normalize(config);
// → params: { temperature: "0.5", maxTokens: "4096" }
//   (Bedrock Converse API uses camelCase)
```

### Gateway providers (OpenRouter, Vercel)

```ts
import { parse, normalize, validate } from "llm-strings";

// OpenRouter proxies to any provider
const { config } = normalize(
  parse("llm://openrouter.ai/anthropic/claude-sonnet-4-5?temp=0.7&max=2000"),
);
// → params: { temperature: "0.7", max_tokens: "2000" }

// Reasoning model restrictions apply even through gateways
const issues = validate("llm://openrouter.ai/openai/o3?temp=0.7");
// → [{ param: "temperature", severity: "error",
//      message: "...not supported by OpenAI reasoning model..." }]
```

## Supported Providers

| Provider    | Host Pattern                             | Param Style |
| ----------- | ---------------------------------------- | ----------- |
| OpenAI      | `api.openai.com`                         | snake_case  |
| Anthropic   | `api.anthropic.com`                      | snake_case  |
| Google      | `generativelanguage.googleapis.com`      | camelCase   |
| Mistral     | `api.mistral.ai`                         | snake_case  |
| Cohere      | `api.cohere.com`                         | snake_case  |
| AWS Bedrock | `bedrock-runtime.{region}.amazonaws.com` | camelCase   |
| OpenRouter  | `openrouter.ai`                          | snake_case  |
| Vercel AI   | `gateway.ai.vercel.app`                  | snake_case  |

Gateways like OpenRouter and Vercel route to any upstream provider. Bedrock hosts models from multiple families (Anthropic, Meta, Amazon, Mistral, Cohere, AI21) with cross-region inference support. Each provider's parameter names differ — normalization handles the translation automatically.

## Shorthand Aliases

Use these shortcuts in your connection strings — they expand automatically during normalization:

| Shorthand                                                                                                    | Canonical           |
| ------------------------------------------------------------------------------------------------------------ | ------------------- |
| `temp`                                                                                                       | `temperature`       |
| `max`, `max_out`, `max_output`, `max_output_tokens`, `maxTokens`, `maxOutputTokens`, `max_completion_tokens` | `max_tokens`        |
| `topp`, `topP`, `nucleus`                                                                                    | `top_p`             |
| `topk`, `topK`                                                                                               | `top_k`             |
| `freq`, `freq_penalty`, `frequencyPenalty`, `repetition_penalty`                                             | `frequency_penalty` |
| `pres`, `pres_penalty`, `presencePenalty`                                                                    | `presence_penalty`  |
| `stop_sequences`, `stopSequences`, `stop_sequence`                                                           | `stop`              |
| `random_seed`, `randomSeed`                                                                                  | `seed`              |
| `candidateCount`, `candidate_count`, `num_completions`                                                       | `n`                 |
| `reasoning`, `reasoning_effort`                                                                              | `effort`            |
| `cache_control`, `cacheControl`, `cachePoint`, `cache_point`                                                 | `cache`             |

## Sub-path Imports

For smaller bundles, import only what you need:

```ts
import { parse, build } from "llm-strings/parse";
import { normalize } from "llm-strings/normalize";
import { validate } from "llm-strings/validate";
import {
  detectProvider,
  resolveHostAlias,
  ALIASES,
  HOST_ALIASES,
  PROVIDER_PARAMS,
  PARAM_SPECS,
} from "llm-strings/providers";
```

All sub-paths ship ESM + CJS with full type declarations.

## API Reference

### `parse(connectionString): LlmConnectionConfig`

Parses an `llm://` connection string into its component parts. Throws if the scheme is not `llm://`.

### `build(config): string`

Reconstructs a connection string from a config object. Inverse of `parse()`.

### `normalize(config, options?): NormalizeResult`

Normalizes parameters for the target provider:

1. Expands shorthand aliases (`temp` → `temperature`)
2. Maps to provider-specific param names (`max_tokens` → `maxOutputTokens` for Google)
3. Normalizes cache values (`cache=true` → `cache_control=ephemeral`)
4. Adjusts for reasoning models (`max_tokens` → `max_completion_tokens` for o1/o3/o4)

Pass `{ verbose: true }` to get a detailed `changes` array documenting each transformation.

### `validate(connectionString, options?): ValidationIssue[]`

Parses, normalizes, and validates a connection string against provider-specific rules. Returns `[]` if everything is valid. Checks:

- Type correctness (number, boolean, string enums)
- Value ranges (e.g., temperature 0–2 for OpenAI, 0–1 for Anthropic)
- Mutual exclusions (`temperature` + `top_p` on Anthropic)
- Reasoning model restrictions (no `temperature` on o1/o3/o4)
- Bedrock model family constraints (`topK` only for Claude/Cohere/Mistral)

Pass `{ strict: true }` to promote warnings (unknown provider, unknown params) to errors:

```ts
validate("llm://custom-api.com/my-model?temp=0.5", { strict: true });
// → [{ severity: "error", message: "Unknown provider …" }]
```

### `detectProvider(host): Provider | undefined`

Identifies the provider from a hostname string.

### `resolveHostAlias(host): HostResolution`

Expands provider short host aliases such as `"openai"` to canonical hosts such as `"api.openai.com"`. Reads `LLM_STRINGS_<PROVIDER>_HOST` and `LLM_STRINGS_HOST_<PROVIDER>` env overrides when available.

### `detectBedrockModelFamily(model): BedrockModelFamily | undefined`

Identifies the model family (anthropic, meta, amazon, mistral, cohere, ai21) from a Bedrock model ID. Handles cross-region (`us.`, `eu.`, `apac.`) and global inference profiles.

### `detectGatewaySubProvider(model): Provider | undefined`

Extracts the underlying provider from a gateway model string (e.g. `"anthropic/claude-sonnet-4-5"` → `"anthropic"`). Returns `undefined` for unknown prefixes or models without a `/`.

### `isReasoningModel(model): boolean`

Returns `true` for OpenAI reasoning models (o1, o3, o4 families). Handles gateway prefixes like `"openai/o3"`.

### `isGatewayProvider(provider): boolean`

Returns `true` for gateway providers (`openrouter`, `vercel`) that proxy to other providers.

### `canHostOpenAIModels(provider): boolean`

Returns `true` for providers that can route to OpenAI models and need reasoning-model checks (`openai`, `openrouter`, `vercel`).

### `bedrockSupportsCaching(model): boolean`

Returns `true` if the Bedrock model supports prompt caching (Claude and Nova models only).

### Constants

| Export                        | Description                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `ALIASES`                     | Shorthand → canonical param name mapping                                                   |
| `HOST_ALIASES`                | Short provider host aliases → canonical API hosts                                          |
| `PROVIDER_PARAMS`             | Canonical → provider-specific param names, per provider                                    |
| `PARAM_SPECS`                 | Validation rules (type, min/max, enum) per provider, keyed by provider-specific param name |
| `REASONING_MODEL_UNSUPPORTED` | Set of canonical params unsupported by reasoning models                                    |
| `PROVIDER_META`               | Array of provider metadata (id, name, host, brand color) for UI integrations               |
| `MODELS`                      | Suggested model IDs per provider                                                           |
| `CANONICAL_PARAM_SPECS`       | Canonical param specs per provider with descriptions — useful for building UIs             |

## TypeScript

Full type definitions ship with the package:

```ts
// Core types from the main entry
import type {
  LlmConnectionConfig,
  NormalizeResult,
  NormalizeChange,
  NormalizeOptions,
  ValidateOptions,
  ValidationIssue,
} from "llm-strings";

// Provider types from the providers sub-path
import type {
  Provider,
  BedrockModelFamily,
  ParamSpec,
  ProviderMeta,
  CanonicalParamSpec,
} from "llm-strings/providers";
```

## Provider Metadata (for UI integrations)

The library exports metadata useful for building UIs — provider names, brand colors, suggested models, and canonical parameter specs:

```ts
import {
  PROVIDER_META,
  MODELS,
  CANONICAL_PARAM_SPECS,
} from "llm-strings/providers";

// Provider display info
PROVIDER_META.forEach((p) => console.log(`${p.name}: ${p.host} (${p.color})`));
// OpenAI: api.openai.com (#10a37f)
// Anthropic: api.anthropic.com (#e8956a)
// ...

// Suggested models per provider
MODELS.openai; // → ["gpt-5.2", "gpt-5.2-pro", "gpt-4.1", "gpt-4.1-mini", ...]
MODELS.anthropic; // → ["claude-opus-4-6", "claude-sonnet-4-6", "claude-sonnet-4-5", ...]

// Canonical param specs — useful for building config forms
CANONICAL_PARAM_SPECS.openai.temperature;
// → { type: "number", min: 0, max: 2, default: 0.7, description: "Controls randomness" }

CANONICAL_PARAM_SPECS.anthropic.effort;
// → { type: "enum", values: ["low", "medium", "high", "max"], default: "medium", description: "Thinking effort" }
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

<div align="center">

**[📖 Read the spec](https://danlevy.net/llm-connection-strings/) · [🐛 Report a bug](https://github.com/justsml/llm-strings/issues) · [💡 Request a feature](https://github.com/justsml/llm-strings/issues)**

</div>
