# Model support refresh — September 30, 2026

Connection strings accept model IDs without an allowlist. This refresh handles
model-specific parameter rules and updates playground suggestions. It does not
make inference requests or establish account access.

## GPT-6.1 Sol

The new OpenAI API ID is `gpt-6.1-sol`. OpenRouter and Vercel AI Gateway use
`openai/gpt-6.1-sol`. Reasoning effort supports `low`, `medium`, `high`, `xhigh`,
and `max`; `none` and `minimal` are invalid. Normalization applies the existing
OpenAI reasoning rules, including `max_tokens` → `max_completion_tokens` and
dropping unsupported sampling and log-probability options.

```text
llm://openai/gpt-6.1-sol?effort=medium&max=4096
llm://openrouter/openai/gpt-6.1-sol?effort=high
llm://vercel/openai/gpt-6.1-sol?effort=max
```

Tool calling with this model requires the Responses API. This library shapes
connection parameters; it does not select the API endpoint.

Sources: [OpenAI model](https://developers.openai.com/api/docs/models/gpt-6.1-sol),
[OpenAI GPT-6 guide](https://developers.openai.com/api/docs/guides/latest-model),
[Vercel AI Gateway](https://vercel.com/changelog/gpt-6-1-sol-now-available-on-ai-gateway),
[OpenRouter](https://openrouter.ai/compare/openai/gpt-6.1-sol).

## Claude Sonnet 5.5

The Claude API ID is `claude-sonnet-5-5`; Bedrock uses
`anthropic.claude-sonnet-5-5`. OpenRouter and Vercel use the provider-prefixed
route `anthropic/claude-sonnet-5.5`. This release accepts adaptive thinking, or
`between_tools` at `low`, `medium`, or `high` effort. Explicit `disabled` and
manual thinking are invalid. Forced `tool_choice` types `any` and `tool` are
also invalid. Validation checks these rules and non-default sampling options.

```text
llm://anthropic/claude-sonnet-5-5?effort=high
llm://bedrock/anthropic.claude-sonnet-5-5?max=4096
llm://openrouter/anthropic/claude-sonnet-5.5?effort=medium
```

Sources: [Anthropic model](https://platform.claude.com/docs/en/models/sonnet-5-5/overview),
[Anthropic changes](https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5),
[OpenRouter route](https://openrouter.ai/anthropic/claude-sonnet-5.5/providers),
[Vercel catalog](https://vercel.com/ai-gateway/models).

## Other current releases

The [Gemini catalog](https://ai.google.dev/gemini-api/docs/models) includes the
September 22 Gemini 3.8 Flash TTS and Flash-Lite TTS releases. Their model IDs
already pass through the parser and normalizer. Live gateway catalogs remain
available through `listAvailableModels()` for newly listed routes.

Meta's current Model API uses `muse-spark-1.3`, and OpenRouter lists
`meta/muse-spark-1.3`. Both routes already pass through; the playground now
suggests the newer model. Sources: [Meta quickstart](https://dev.meta.ai/docs/cookbook/quickstart-chat-completions),
[OpenRouter model](https://openrouter.ai/meta/muse-spark-1.3).
