# Model support research — September 22, 2026

Connection strings accept arbitrary model IDs; there is no frozen model allowlist.
This update covers parameter compatibility and decision-model discovery, without
adding runtime dependencies or making inference requests.

## OpenAI

Current general-purpose API IDs include `gpt-6-astra`, `gpt-6-sol`, and
`gpt-6-luna`. Sol and Luna support `none` reasoning; Astra does not. Sampling
parameters are available on Sol/Luna with `effort=none`. Normalization now preserves
`temperature`, `top_p`, `logprobs`, and `top_logprobs` in that mode and drops them
when reasoning is enabled. Existing Astra validation remains in place.

```text
llm://openai/gpt-6-sol?effort=none&temp=0.7
llm://openai/gpt-6-luna?effort=high&max=2000
llm://openai/gpt-6-astra?effort=high
```

Use Responses for reasoning with tools. This package normalizes connection
parameters; it does not construct Responses request bodies or select an API.

Source: [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model).

## Anthropic

The fetched catalog includes today's `claude-opus-5-5` release alongside
`claude-fable-5-1` and `claude-sonnet-5`. Search summaries still showed Opus 5;
the fetched model page takes precedence. Fable 5.1 and Opus 5.5 require adaptive
thinking. Strict validation now recognizes the JSON `thinking` parameter and
rejects disabled/manual thinking for those two families. The existing AI SDK
adapter emits the parsed thinking object.

```text
llm://anthropic/claude-opus-5-5?effort=medium
llm://anthropic/claude-fable-5-1?effort=high
llm://anthropic/claude-sonnet-5?effort=high
```

Sources: [catalog](https://platform.claude.com/docs/en/models/overview),
[Opus 5.5](https://platform.claude.com/docs/en/models/opus-5-5/overview),
[Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview).

## Grok / xAI

`grok-4.7` supports low, medium, high, and xhigh reasoning effort. Validation
rejects other levels and reports ignored log-probability options. Gateway model
prefixes `x-ai/` and `xai/` now select xAI validation. The Fast variant is not a
public API model and is not presented as one here.

```text
llm://grok/grok-4.7?effort=xhigh
llm://openrouter/x-ai/grok-4.7?effort=high
```

Sources: [Grok 4.7](https://docs.x.ai/developers/grok-4-7),
[model catalog](https://docs.x.ai/developers/models).

## TypeSafe Jev

Use `llm://openrouter/typesafe/jev-1.13`. OpenRouter's fetched endpoint metadata
identifies the model as `text->decisions`. Jev produces typed decisions rather
than text completions. `isJevModel` and `OPENROUTER_DECISIONS_URL` are exported
from `llm-strings/providers`; the model catalog preserves `outputModalities`
when supplied by OpenRouter. Catalog absence does not establish unavailability.

Call the separate `POST https://openrouter.ai/api/alpha/decisions` endpoint.
With a compatible OpenRouter AI SDK provider, select `evaluationModel()` rather
than a chat model. Parsing and building preserve the route; validation rejects
common chat generation parameters. Keep state/questions in the request body,
not in a connection URL. This library does not send decision requests or validate
their bodies. Recognition of `~typesafe/jev-latest` does not guarantee that alias
has an available endpoint; the pinned route above was verified in metadata.

Sources: [live endpoint metadata](https://openrouter.ai/api/v1/models/typesafe/jev-1.13/endpoints),
[official OpenRouter adapter changelog](https://github.com/OpenRouterTeam/ai-sdk-provider/blob/main/CHANGELOG.md),
[TypeSafe introduction](https://docs.typesafe.ai/introduction).

## Verification scope

Research used public documentation and endpoint metadata. No paid inference calls
were made. Unit tests verify parsing, normalization, validation, and adapter
shaping; they do not establish account access or live inference success.
