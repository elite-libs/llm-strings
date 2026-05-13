import { normalize } from "./normalize.js";
import type { NormalizeOptions, NormalizeResult } from "./normalize.js";
import type { LlmConnectionConfig } from "./parse.js";
import type { Provider } from "./provider-core.js";

export type AiSdkProviderOptions = Record<string, Record<string, unknown>>;

export interface AiSdkProviderOptionsResult {
  provider: Provider | undefined;
  subProvider: Provider | undefined;
  providerOptions: AiSdkProviderOptions;
}

export interface AiSdkProviderOptionsOptions extends NormalizeOptions {
  /**
   * Include Vercel AI Gateway routing options under `providerOptions.gateway`.
   * Defaults to true for `vercel` hosts.
   */
  includeGatewayOptions?: boolean;
}

type ProviderOptionsKey = Provider | "gateway";

const PROVIDER_OPTION_KEYS: Record<Provider, ProviderOptionsKey> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "google",
  mistral: "mistral",
  cohere: "cohere",
  bedrock: "bedrock",
  openrouter: "openrouter",
  vercel: "gateway",
};

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

function providerOptionsKey(provider: Provider): ProviderOptionsKey {
  return PROVIDER_OPTION_KEYS[provider];
}

function setProviderOption(
  options: AiSdkProviderOptions,
  provider: ProviderOptionsKey,
  key: string,
  value: unknown,
): void {
  options[provider] ??= {};
  options[provider][key] = value;
}

function parseBoolean(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return undefined;
}

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function parseStringList(value: string): string[] {
  const json = parseJson(value);
  if (Array.isArray(json)) {
    return json.filter((item): item is string => typeof item === "string");
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function typedValue(value: string): unknown {
  const booleanValue = parseBoolean(value);
  if (booleanValue !== undefined) return booleanValue;

  const numberValue = parseNumber(value);
  if (numberValue !== undefined) return numberValue;

  const jsonValue = parseJson(value);
  if (jsonValue !== undefined) return jsonValue;

  return value;
}

function mergeObjectOption(
  options: AiSdkProviderOptions,
  provider: ProviderOptionsKey,
  key: string,
  value: string,
): void {
  const parsed = parseJson(value);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    setProviderOption(options, provider, key, parsed);
  }
}

function addOpenAiOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "openai";
  const mappings: Record<string, string> = {
    reasoning_effort: "reasoningEffort",
    max_completion_tokens: "maxCompletionTokens",
    parallel_tool_calls: "parallelToolCalls",
    service_tier: "serviceTier",
    strict_json_schema: "strictJsonSchema",
    text_verbosity: "textVerbosity",
    prompt_cache_key: "promptCacheKey",
    prompt_cache_retention: "promptCacheRetention",
    safety_identifier: "safetyIdentifier",
    system_message_mode: "systemMessageMode",
    force_reasoning: "forceReasoning",
    reasoning_summary: "reasoningSummary",
    previous_response_id: "previousResponseId",
    max_tool_calls: "maxToolCalls",
    allowed_tools: "allowedTools",
  };
  const directKeys = new Set([
    "conversation",
    "instructions",
    "logprobs",
    "metadata",
    "prediction",
    "store",
    "truncation",
    "user",
  ]);
  if (!mappings[key] && !directKeys.has(key) && key !== "include") return;
  const optionKey = mappings[key] ?? key;

  if (key === "include") {
    setProviderOption(options, target, optionKey, parseStringList(value));
    return;
  }

  if (key === "metadata" || key === "prediction" || key === "allowed_tools") {
    mergeObjectOption(options, target, optionKey, value);
    return;
  }

  setProviderOption(options, target, optionKey, typedValue(value));
}

function addAnthropicOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "anthropic";

  if (key === "cache_control" || key === "cacheControl") {
    const ttl = options[target]?.cacheControl;
    const ttlValue =
      ttl && typeof ttl === "object" && "ttl" in ttl ? ttl.ttl : undefined;
    setProviderOption(options, target, "cacheControl", {
      type: value === "ephemeral" ? "ephemeral" : value,
      ...(ttlValue ? { ttl: ttlValue } : {}),
    });
    return;
  }

  if (key === "cache_ttl") {
    const current = options[target]?.cacheControl;
    setProviderOption(options, target, "cacheControl", {
      ...(current && typeof current === "object" ? current : {}),
      type: "ephemeral",
      ttl: value,
    });
    return;
  }

  if (key === "thinking") {
    mergeObjectOption(options, target, "thinking", value);
    return;
  }

  if (key === "thinking_budget" || key === "budget_tokens") {
    const budgetTokens = parseNumber(value);
    if (budgetTokens !== undefined) {
      setProviderOption(options, target, "thinking", {
        type: "enabled",
        budgetTokens,
      });
    }
    return;
  }

  const mappings: Record<string, string> = {
    send_reasoning: "sendReasoning",
    structured_output_mode: "structuredOutputMode",
    disable_parallel_tool_use: "disableParallelToolUse",
    tool_streaming: "toolStreaming",
    inference_geo: "inferenceGeo",
    anthropic_beta: "anthropicBeta",
    mcp_servers: "mcpServers",
    task_budget: "taskBudget",
    context_management: "contextManagement",
  };
  const directKeys = new Set([
    "effort",
    "speed",
    "sendReasoning",
    "structuredOutputMode",
    "disableParallelToolUse",
    "toolStreaming",
    "inferenceGeo",
    "anthropicBeta",
    "metadata",
    "mcpServers",
    "container",
    "taskBudget",
    "contextManagement",
  ]);
  if (!mappings[key] && !directKeys.has(key)) return;
  const optionKey = mappings[key] ?? key;

  if (key === "anthropic_beta") {
    setProviderOption(options, target, optionKey, parseStringList(value));
    return;
  }

  if (
    key === "metadata" ||
    key === "mcp_servers" ||
    key === "container" ||
    key === "task_budget" ||
    key === "context_management"
  ) {
    mergeObjectOption(options, target, optionKey, value);
    return;
  }

  setProviderOption(options, target, optionKey, typedValue(value));
}

function addGoogleOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "google";

  if (
    key === "thinking_budget" ||
    key === "thinking_level" ||
    key === "include_thoughts"
  ) {
    const current = options[target]?.thinkingConfig;
    const thinkingConfig: Record<string, unknown> =
      current && typeof current === "object" && !Array.isArray(current)
        ? { ...current }
        : {};
    if (key === "thinking_budget") {
      const parsed = parseNumber(value);
      if (parsed !== undefined) thinkingConfig.thinkingBudget = parsed;
    }
    if (key === "thinking_level") thinkingConfig.thinkingLevel = value;
    if (key === "include_thoughts") {
      const parsed = parseBoolean(value);
      if (parsed !== undefined) thinkingConfig.includeThoughts = parsed;
    }
    setProviderOption(options, target, "thinkingConfig", thinkingConfig);
    return;
  }

  const mappings: Record<string, string> = {
    cached_content: "cachedContent",
    structured_outputs: "structuredOutputs",
    safety_settings: "safetySettings",
    response_modalities: "responseModalities",
    audio_timestamp: "audioTimestamp",
    media_resolution: "mediaResolution",
    image_config: "imageConfig",
    retrieval_config: "retrievalConfig",
    stream_function_call_arguments: "streamFunctionCallArguments",
    service_tier: "serviceTier",
  };
  const directKeys = new Set([
    "cachedContent",
    "structuredOutputs",
    "safetySettings",
    "threshold",
    "audioTimestamp",
    "labels",
    "mediaResolution",
    "imageConfig",
    "retrievalConfig",
    "responseModalities",
    "streamFunctionCallArguments",
    "serviceTier",
  ]);
  if (!mappings[key] && !directKeys.has(key)) return;
  const optionKey = mappings[key] ?? key;

  if (key === "response_modalities") {
    setProviderOption(options, target, optionKey, parseStringList(value));
    return;
  }

  if (
    key === "safety_settings" ||
    key === "labels" ||
    key === "image_config" ||
    key === "retrieval_config"
  ) {
    mergeObjectOption(options, target, optionKey, value);
    return;
  }

  setProviderOption(options, target, optionKey, typedValue(value));
}

function addMistralOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "mistral";
  const mappings: Record<string, string> = {
    safe_prompt: "safePrompt",
    document_image_limit: "documentImageLimit",
    document_page_limit: "documentPageLimit",
    structured_outputs: "structuredOutputs",
    strict_json_schema: "strictJsonSchema",
    parallel_tool_calls: "parallelToolCalls",
    reasoning_effort: "reasoningEffort",
  };
  const directKeys = new Set([
    "safePrompt",
    "documentImageLimit",
    "documentPageLimit",
    "structuredOutputs",
    "strictJsonSchema",
    "parallelToolCalls",
    "reasoningEffort",
  ]);
  if (!mappings[key] && !directKeys.has(key)) return;
  const optionKey = mappings[key] ?? key;
  setProviderOption(options, target, optionKey, typedValue(value));
}

function addCohereOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "cohere";

  if (key === "thinking") {
    mergeObjectOption(options, target, "thinking", value);
    return;
  }

  if (key === "thinking_token_budget" || key === "token_budget") {
    const tokenBudget = parseNumber(value);
    if (tokenBudget !== undefined) {
      setProviderOption(options, target, "thinking", {
        type: "enabled",
        tokenBudget,
      });
    }
    return;
  }

  if (key === "thinking_type") {
    const current = options[target]?.thinking;
    setProviderOption(options, target, "thinking", {
      ...(current && typeof current === "object" ? current : {}),
      type: value,
    });
  }
}

function addBedrockOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "bedrock";

  if (key === "cache_control") {
    setProviderOption(options, target, "cachePoint", {
      type: value === "ephemeral" ? "default" : value,
    });
    return;
  }

  if (key === "cache_ttl") {
    const current = options[target]?.cachePoint;
    setProviderOption(options, target, "cachePoint", {
      ...(current && typeof current === "object" ? current : {}),
      type: "default",
      ttl: value,
    });
    return;
  }

  if (key === "reasoning_config") {
    mergeObjectOption(options, target, "reasoningConfig", value);
    return;
  }

  if (key === "budget_tokens" || key === "reasoning_effort") {
    const current = options[target]?.reasoningConfig;
    const reasoningConfig: Record<string, unknown> =
      current && typeof current === "object" && !Array.isArray(current)
        ? { ...current }
        : {};
    reasoningConfig.type = "enabled";
    if (key === "budget_tokens") {
      const budgetTokens = parseNumber(value);
      if (budgetTokens !== undefined)
        reasoningConfig.budgetTokens = budgetTokens;
    }
    if (key === "reasoning_effort") reasoningConfig.maxReasoningEffort = value;
    setProviderOption(options, target, "reasoningConfig", reasoningConfig);
    return;
  }

  const mappings: Record<string, string> = {
    additional_model_request_fields: "additionalModelRequestFields",
    anthropic_beta: "anthropicBeta",
    service_tier: "serviceTier",
  };
  const directKeys = new Set([
    "additionalModelRequestFields",
    "anthropicBeta",
    "serviceTier",
  ]);
  if (!mappings[key] && !directKeys.has(key)) return;
  const optionKey = mappings[key] ?? key;

  if (key === "additional_model_request_fields") {
    mergeObjectOption(options, target, optionKey, value);
    return;
  }

  if (key === "anthropic_beta") {
    setProviderOption(options, target, optionKey, parseStringList(value));
    return;
  }

  setProviderOption(options, target, optionKey, typedValue(value));
}

function addGatewayOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "gateway";
  const listKeys = new Set(["only", "order", "tags", "models"]);
  const objectKeys = new Set(["byok", "provider_timeouts"]);
  const mappings: Record<string, string> = {
    zero_data_retention: "zeroDataRetention",
    disallow_prompt_training: "disallowPromptTraining",
    hipaa_compliant: "hipaaCompliant",
    quota_entity_id: "quotaEntityId",
    provider_timeouts: "providerTimeouts",
  };
  const directKeys = new Set([
    "sort",
    "user",
    "zeroDataRetention",
    "disallowPromptTraining",
    "hipaaCompliant",
    "quotaEntityId",
    "providerTimeouts",
  ]);
  if (
    !mappings[key] &&
    !directKeys.has(key) &&
    !listKeys.has(key) &&
    !objectKeys.has(key)
  ) {
    return;
  }
  const optionKey = mappings[key] ?? key;

  if (listKeys.has(key)) {
    setProviderOption(options, target, optionKey, parseStringList(value));
    return;
  }

  if (objectKeys.has(key)) {
    mergeObjectOption(options, target, optionKey, value);
    return;
  }

  setProviderOption(options, target, optionKey, typedValue(value));
}

function addOpenRouterOption(
  options: AiSdkProviderOptions,
  key: string,
  value: string,
): void {
  const target: ProviderOptionsKey = "openrouter";

  if (key === "models") {
    setProviderOption(options, target, "models", parseStringList(value));
    return;
  }

  if (key === "reasoning") {
    mergeObjectOption(options, target, "reasoning", value);
    return;
  }

  if (key === "reasoning_effort") {
    const current = options[target]?.reasoning;
    setProviderOption(options, target, "reasoning", {
      ...(current && typeof current === "object" ? current : {}),
      effort: value,
    });
    return;
  }

  if (key === "reasoning_max_tokens" || key === "max_reasoning_tokens") {
    const current = options[target]?.reasoning;
    const maxTokens = parseNumber(value);
    if (maxTokens !== undefined) {
      setProviderOption(options, target, "reasoning", {
        ...(current && typeof current === "object" ? current : {}),
        max_tokens: maxTokens,
      });
    }
    return;
  }

  if (key === "reasoning_enabled" || key === "reasoning_exclude") {
    const current = options[target]?.reasoning;
    const parsed = parseBoolean(value);
    if (parsed !== undefined) {
      setProviderOption(options, target, "reasoning", {
        ...(current && typeof current === "object" ? current : {}),
        [key === "reasoning_enabled" ? "enabled" : "exclude"]: parsed,
      });
    }
    return;
  }

  if (key === "user") {
    setProviderOption(options, target, "user", value);
  }
}

function addProviderSpecificOption(
  options: AiSdkProviderOptions,
  provider: Provider,
  key: string,
  value: string,
  includeGatewayOptions: boolean,
): void {
  if (provider === "vercel") {
    if (includeGatewayOptions) addGatewayOption(options, key, value);
    return;
  }

  if (provider === "openai") addOpenAiOption(options, key, value);
  if (provider === "anthropic") addAnthropicOption(options, key, value);
  if (provider === "google") addGoogleOption(options, key, value);
  if (provider === "mistral") addMistralOption(options, key, value);
  if (provider === "cohere") addCohereOption(options, key, value);
  if (provider === "bedrock") addBedrockOption(options, key, value);
  if (provider === "openrouter") addOpenRouterOption(options, key, value);
}

/**
 * Build AI SDK `providerOptions` from an LLM connection config.
 *
 * Common model call settings such as `temperature`, `topP`, and
 * `maxOutputTokens` are intentionally not emitted here. This helper only emits
 * provider-specific AI SDK options under the correct provider key.
 */
export function createAiSdkProviderOptions(
  configOrResult: LlmConnectionConfig | NormalizeResult,
  options: AiSdkProviderOptionsOptions = {},
): AiSdkProviderOptionsResult {
  const normalized =
    "changes" in configOrResult && "subProvider" in configOrResult
      ? configOrResult
      : normalize(configOrResult, options);
  const providerOptions: AiSdkProviderOptions = {};

  if (!normalized.provider) {
    return {
      provider: normalized.provider,
      subProvider: normalized.subProvider,
      providerOptions,
    };
  }

  const includeGatewayOptions =
    options.includeGatewayOptions ?? normalized.provider === "vercel";

  for (const [key, value] of Object.entries(normalized.config.params)) {
    addProviderSpecificOption(
      providerOptions,
      normalized.provider,
      key,
      value,
      includeGatewayOptions,
    );
  }

  if (
    normalized.provider !== "vercel" &&
    !providerOptions[providerOptionsKey(normalized.provider)]
  ) {
    return {
      provider: normalized.provider,
      subProvider: normalized.subProvider,
      providerOptions: {},
    };
  }

  return {
    provider: normalized.provider,
    subProvider: normalized.subProvider,
    providerOptions,
  };
}
