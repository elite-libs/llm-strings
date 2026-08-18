# Provider and model audit — 2026-08-18

This audit compares the provider registry in `src/provider-core.ts` and the option shaping in `src/ai-sdk.ts` with current first-party documentation. Vercel AI Gateway and OpenRouter are treated as catalog/routing observations, not authorities for a model vendor's native API.

## Executive findings

The current design cannot accurately represent “all available models and arguments” with one static parameter table per provider. It conflates at least six request dialects (OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, Gemini `generateContent`, Bedrock Converse/Invoke, and model-schema-driven prediction APIs), and many constraints are model-specific rather than provider-wide.

The highest-priority corrections are:

1. Add an API-dialect layer before provider/model capability overrides. In particular, Responses uses `max_output_tokens` and nested `reasoning`, while Chat Completions commonly uses `max_completion_tokens` and flat `reasoning_effort`.
2. Stop assigning generic defaults (`temperature: 0.7`, `max_tokens: 4096`, etc.) to every OpenAI-compatible provider. Several providers document model-specific defaults or unsupported parameters.
3. Shape structured values as objects/arrays. `cache_control`, schemas, tools, routing, provider timeouts, `thinking`, and Replicate `input` are not strings in native requests.
4. Source available model IDs dynamically. Both gateways expose unauthenticated model endpoints; most first-party platforms expose a models/list API, while media platforms expose per-model schemas.
5. Make validation capability-aware by model and endpoint. A gateway model's `supported_parameters` is a better validation input than the creator prefix alone.

## Live catalog observations

On 2026-08-18, direct unauthenticated reads returned **348 models** from Vercel's [`/v1/models`](https://ai-gateway.vercel.sh/v1/models) and **413 models** from OpenRouter's [`/api/v1/models`](https://openrouter.ai/api/v1/models). These are snapshots, not durable allowlists. Both responses include per-model capability/parameter metadata; Vercel documents its endpoint as returning model IDs, context windows, pricing, and capabilities ([Vercel model discovery](https://vercel.com/docs/ai-gateway/models-and-providers)). OpenRouter likewise exposes `supported_parameters`, provider limits, and reasoning metadata in its model objects.

Catalog examples observed on that date included `openai/gpt-5.6-luna`, `anthropic/claude-opus-5`, `google/gemini-3.7-flash`, `xai/grok-4.6`, `deepseek/deepseek-v4-pro-0813`, `moonshotai/kimi-k3-fast`, `mistral/mistral-medium-3.5`, `amazon/nova-2-lite`, and `alibaba/qwen3.8-27b` on Vercel. Their presence proves gateway availability only; it does not prove direct first-party availability or identical argument behavior.

Recommendation: expose a small catalog adapter interface and cache fetched catalogs with timestamps. Do not check hundreds of model literals into `provider-core.ts`.

## Detailed correctness gaps

### OpenAI and Azure OpenAI

- OpenAI Responses uses `max_output_tokens` and `reasoning: { effort }`; request options also include `prompt_cache_key`, `prompt_cache_retention`, `previous_response_id`, tools, and structured text formats. A flat provider-wide `reasoning_effort` mapping is therefore dialect-dependent. The current documented effort set is `none|minimal|low|medium|high|xhigh`; `max` should not be accepted generically ([OpenAI Responses reference](https://platform.openai.com/docs/api-reference/responses)).
- OpenAI prompt caching is automatic; cache keys/retention are request hints, not Anthropic-style cache breakpoints. Keep it separate from the canonical `cache_control` abstraction.
- Azure has multiple surfaces: Azure OpenAI deployments and Azure AI Model Inference are not safely represented by one “OpenAI-compatible” table. Model IDs are deployment names on many Azure OpenAI endpoints. Treat endpoint dialect and API version as explicit context ([Azure OpenAI REST API](https://learn.microsoft.com/azure/ai-services/openai/reference)).

### Anthropic

- Native `cache_control` is an object (`{type: "ephemeral", ttl?: "5m"|"1h"}`), used at top level for automatic caching or on content blocks for explicit breakpoints. A bare string plus synthetic `cache_ttl` is not the native request shape.
- Effort is `output_config.effort`, not flat `effort`. Current levels are model-dependent; the common documented set is `low|medium|high`, with newer models adding higher modes. Thinking is separately configured as `thinking: {type: "adaptive"|"enabled"|"disabled", budget_tokens?}`.
- Structured output belongs under output configuration and is model-capability-dependent. `max_tokens` may be `0` for cache warming, so the current minimum of 1 is too strict ([Messages API](https://platform.claude.com/docs/en/api/messages/create), [effort](https://platform.claude.com/docs/en/build-with-claude/effort)).
- Do not retain retired model examples. Anthropic release notes are the authoritative retirement feed ([release notes](https://platform.claude.com/docs/en/release-notes/overview)).

### Google AI Studio and Vertex AI

- `GenerationConfig` includes `thinkingConfig`, with `includeThoughts`, `thinkingBudget`, and Gemini 3+ `thinkingLevel`. It also includes log-probability and media/output controls omitted by the current table.
- `stopSequences` permits at most five entries. Structured output uses a JSON-schema path; the older `responseSchema` field is marked deprecated in the current API reference. The repo currently maps only the deprecated name ([GenerateContent API](https://ai.google.dev/api/generate-content), [structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)).
- AI Studio and Vertex share concepts but not identical endpoint/authentication semantics. Preserve separate transports while sharing model capability definitions where the official model metadata agrees.

### Amazon Bedrock

- Bedrock cannot have one universal model parameter table. Converse's common `inferenceConfig` contains `maxTokens`, `stopSequences`, `temperature`, and `topP`; model-specific fields such as Anthropic `top_k` belong in `additionalModelRequestFields`. Unsupported fields may be ignored on InvokeModel, which makes permissive normalization dangerous ([model parameters](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html)).
- Bedrock now has multiple compatible endpoints, including OpenAI-compatible and Anthropic Messages surfaces, plus `bedrock-mantle.{region}.api.aws`; the current host detector covers only `bedrock-runtime` ([endpoint matrix](https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html)).
- Explicit prompt caching is not limited to Claude and Nova. AWS currently documents supported Claude models and OpenAI GPT-5.6 models, with model-specific TTLs and fields; Nova also has automatic caching. The repo's blanket `5m|1h` allowance for all Claude/Nova is inaccurate ([Bedrock prompt caching](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)).
- Model IDs, inference-profile prefixes, APIs, and regional availability must come from AWS's model catalog rather than a hand-maintained family list ([Bedrock model compatibility](https://docs.aws.amazon.com/bedrock/latest/userguide/models.html)).

### Mistral, Cohere, xAI, Groq

- Mistral Chat currently supports `reasoning_effort`, `prompt_mode: "reasoning"`, `prompt_cache_key`, prediction, parallel tool calls, guardrails, metadata, response formats, and first-party tools. It recommends changing either temperature or top-p, not both. The current mapping omits most of these ([Mistral Chat API](https://docs.mistral.ai/api)).
- Cohere's current Chat API documents `k` as 0–500 (default 0) and `p` as 0.01–0.99 (default 0.75); the repo's generic top-p 0–1/default 1 and top-k default 40 are wrong. Cohere also has deployment-specific fields and tool/JSON behavior ([Cohere Chat](https://docs.cohere.com/reference/chat-v1)).
- xAI reasoning constraints are model-specific. `grok-4.5` accepts low/medium/high and cannot disable reasoning; `grok-4.20-multi-agent` also accepts xhigh, where effort changes agent count. Reasoning models reject presence/frequency penalties and stop. The shared OpenAI table cannot express this ([xAI reasoning](https://docs.x.ai/developers/model-capabilities/text/reasoning)).
- Groq's `max_tokens` is deprecated in favor of `max_completion_tokens`; `n` is limited to 1; penalties are documented but unsupported; reasoning effort and format are model-specific; `include_reasoning` conflicts with `reasoning_format`; structured-output support is model-specific and can conflict with streaming/tools ([Groq API](https://console.groq.com/docs/api-reference), [reasoning](https://console.groq.com/docs/reasoning), [structured outputs](https://console.groq.com/docs/structured-outputs)).

### OpenRouter and Vercel AI Gateway

- OpenRouter's `provider` object is genuinely structured. `order`, `only`, `ignore`, quantizations, and transforms/plugins are arrays/objects, not comma-delimited strings in the wire request. `require_parameters: true` is the correct way to constrain routing to implementations that support requested features ([provider routing](https://openrouter.ai/docs/guides/routing/provider-selection)).
- OpenRouter structured output is `response_format: {type: "json_schema", json_schema: ...}` and is model/provider dependent. Its Responses beta uses nested `reasoning` and `max_output_tokens`, not the Chat schema ([structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs), [Responses reasoning](https://openrouter.ai/docs/api/reference/responses/reasoning)).
- Vercel gateway options (`order`, `only`, `models`, `tags`) are arrays; `providerTimeouts` and `byok` are structured objects. `caching: "auto"` asks the gateway to apply a provider-specific caching strategy. Current specs define several of these but `PROVIDER_PARAMS.vercel` does not map them, so normalization/validation and AI SDK shaping are internally inconsistent ([provider options](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options), [model fallbacks](https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks)).
- `zeroDataRetention` implies training opt-out on Vercel; keep these policy flags distinct from model parameters ([Vercel ZDR](https://vercel.com/changelog/zero-data-retention-no-prompt-training-on-ai-gateway)).

### Other OpenAI-compatible inference providers

The providers `deepinfra`, `together`, `fireworks`, `deepseek`, `moonshotai`, `perplexity`, `alibaba`, `cerebras`, `baseten`, and `huggingface` should not all reuse an identical parameter/range/default table.

- DeepSeek's current direct models are `deepseek-v4-flash` and `deepseek-v4-pro`; `deepseek-chat` and `deepseek-reasoner` were scheduled for discontinuation in July 2026. Current reasoning is controlled with structured `thinking`, its effort mapping is nonstandard, and penalties are deprecated/no-op ([DeepSeek Chat API](https://api-docs.deepseek.com/api/create-chat-completion/), [updates](https://api-docs.deepseek.com/updates/)).
- Together adds `top_k` and `repetition_penalty`, supports response formats/tools/logprobs, and documents model-specific defaults. Generic 0.7/4096 defaults should be removed ([Together chat parameters](https://docs.together.ai/docs/inference/chat/parameters)).
- Fireworks exposes richer reasoning/history/thinking, truncation, tokenization, and speculation controls; these are model-specific ([Fireworks Chat Completions](https://docs.fireworks.ai/api-reference/post-chatcompletions)).
- Perplexity adds search/citation controls and has endpoint/model-specific capabilities; these should be a native extension, not silently discarded ([Perplexity Chat Completions](https://docs.perplexity.ai/api-reference/chat-completions-post)).
- Alibaba/DashScope, Cerebras, Moonshot, DeepInfra, Baseten, and Hugging Face all publish live model catalogs. Treat “OpenAI-compatible” as a transport baseline only, then overlay their first-party schema and model metadata. Do not invent common defaults or claim all common fields are supported.
- `meta` is questionable as a direct provider entry: `api.meta.ai` is not a generally documented Llama inference endpoint. Meta is a model creator whose models are served by Bedrock, Groq, Together, Fireworks, gateways, and others. Prefer creator metadata separate from serving provider.

### Media, speech, and model-schema platforms

For `fal`, `replicate`, `prodia`, `luma`, `bytedance`, `kling`, `elevenlabs`, `assemblyai`, `deepgram`, `gladia`, `lmnt`, `hume`, `revai`, `black-forest-labs`, and similar platforms, provider-wide generation arguments are especially misleading. Image/video/audio model inputs routinely have different names, types, enums, and limits per model and version.

- Replicate explicitly says `input` is an object whose schema depends on the selected model/version. Its model resource exposes OpenAPI input/output schemas. The prediction-level `stream` request field is deprecated; supported predictions return a stream URL automatically. The current spec incorrectly validates `input` as a string and treats model-specific image options as universal ([Replicate HTTP API](https://replicate.com/docs/reference/http), [model schemas](https://replicate.com/docs/reference/openapi/)).
- fal endpoints are likewise model-specific. Use each endpoint's generated schema rather than `FAL_DEF` as an allowlist ([fal model APIs](https://docs.fal.ai/model-apis)).
- BFL, Luma, Kling, ByteDance/Ark, and the speech vendors should retain permissive pass-through only if validation clearly says “unknown/model-specific”; otherwise add schema adapters for the concrete endpoint. Luma, for example, has separate generation resources and model fields rather than one universal media request ([Luma create generation](https://docs.lumalabs.ai/reference/creategeneration)).

## Provider-by-provider disposition

| Registry provider                                                                                                  | Disposition                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| openai                                                                                                             | Split Chat/Responses; fix reasoning enum and structured cache/output fields.        |
| azure                                                                                                              | Split Azure OpenAI from Azure AI Model Inference and deployment-name semantics.     |
| anthropic                                                                                                          | Native object shaping for cache, thinking, effort, structured output.               |
| google / google-vertex                                                                                             | Add thinking and current JSON-schema field; share capabilities, not transport.      |
| mistral                                                                                                            | Add current reasoning/cache/tool/output options; remove invented defaults.          |
| cohere                                                                                                             | Correct ranges/defaults and add current Chat/tool/output fields.                    |
| bedrock                                                                                                            | Validate by API + model ID; expand endpoints and cache capability table.            |
| openrouter                                                                                                         | Use live supported-parameter metadata and structured routing objects.               |
| vercel                                                                                                             | Use live model metadata; fix missing gateway param mappings and object/array types. |
| xai                                                                                                                | Add model-specific reasoning restrictions.                                          |
| meta                                                                                                               | Reclassify as model creator unless a documented direct inference API is selected.   |
| groq                                                                                                               | Replace shared definition with Groq-native model-aware schema.                      |
| deepinfra / together / fireworks / deepseek / moonshotai / perplexity / alibaba / cerebras / baseten / huggingface | Keep OpenAI transport baseline, but add first-party overlays and dynamic catalogs.  |
| fal / replicate / prodia / luma / bytedance / kling / black-forest-labs                                            | Validate from per-model schemas; do not promise universal image/video args.         |
| elevenlabs / assemblyai / deepgram / gladia / lmnt / hume / revai                                                  | Split TTS/STT/voice endpoints and use endpoint-specific schemas/model lists.        |

## Proposed implementation order

1. Introduce `ApiDialect` and a `ModelCapabilities` shape (`supportedParameters`, ranges/enums, tools, structured output, reasoning, caching, modalities, context/output limits, deprecation).
2. Correct native mappings for OpenAI, Anthropic, Google, Bedrock, Vercel, and OpenRouter.
3. Replace `OPENAI_COMPATIBLE_DEF` reuse with a minimal no-default baseline plus provider overlays for Groq, Mistral, Cohere, xAI, DeepSeek, Together, Fireworks, and Perplexity.
4. Add gateway catalog adapters and snapshot/fixture tests. Treat gateway data as observations, with first-party docs winning conflicts.
5. Add per-model schema adapters for Replicate/fal and leave other media/speech parameters explicitly model-specific until adapters exist.
6. Add deprecation metadata and tests that reject retired IDs only when the authoritative provider supplies reliable lifecycle data; otherwise warn rather than hard-fail.

## Scope caveat

“Available models” is account-, region-, provider-, endpoint-, and date-dependent. This audit intentionally does not turn a 2026-08-18 catalog snapshot into a permanent allowlist. The robust outcome is dynamic discovery plus dated metadata, with documented neutral fallback behavior when a catalog cannot be reached.
