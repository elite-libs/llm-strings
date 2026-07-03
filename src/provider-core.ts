export type Provider =
  | "openai"
  | "azure"
  | "anthropic"
  | "google"
  | "google-vertex"
  | "mistral"
  | "cohere"
  | "bedrock"
  | "openrouter"
  | "vercel"
  | "xai"
  | "groq"
  | "fal"
  | "deepinfra"
  | "black-forest-labs"
  | "together"
  | "fireworks"
  | "deepseek"
  | "moonshotai"
  | "perplexity"
  | "alibaba"
  | "cerebras"
  | "replicate"
  | "prodia"
  | "luma"
  | "bytedance"
  | "kling"
  | "elevenlabs"
  | "assemblyai"
  | "deepgram"
  | "gladia"
  | "lmnt"
  | "hume"
  | "revai"
  | "baseten"
  | "huggingface";

export type HostAlias =
  | Provider
  | "aistudio"
  | "alibaba"
  | "alibabacloud"
  | "atlascloud"
  | "baidu"
  | "cerebras"
  | "dashscope"
  | "deepinfra"
  | "deepseek"
  | "fireworks"
  | "fireworksai"
  | "groq"
  | "grok"
  | "bfl"
  | "minimax"
  | "moonshot"
  | "novita"
  | "novitaai"
  | "parasail"
  | "perplexity"
  | "qianfan"
  | "together"
  | "togetherai"
  | "vertex"
  | "venice"
  | "wandb"
  | "weightsandbiases"
  | "xai"
  | "xiaomi";

type Env = Record<string, string | undefined>;

declare const process:
  | {
      env?: Env;
    }
  | undefined;

function hasOwn<T extends object>(object: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export const HOST_ALIASES: Record<HostAlias, string> = {
  openai: "api.openai.com",
  azure: "models.inference.ai.azure.com",
  anthropic: "api.anthropic.com",
  google: "generativelanguage.googleapis.com",
  "google-vertex": "aiplatform.googleapis.com",
  aistudio: "generativelanguage.googleapis.com",
  mistral: "api.mistral.ai",
  cohere: "api.cohere.com",
  bedrock: "bedrock-runtime.us-east-1.amazonaws.com",
  openrouter: "openrouter.ai",
  vercel: "gateway.ai.vercel.app",
  alibaba: "dashscope-intl.aliyuncs.com",
  alibabacloud: "dashscope-intl.aliyuncs.com",
  dashscope: "dashscope-intl.aliyuncs.com",
  groq: "api.groq.com",
  fal: "fal.run",
  fireworks: "api.fireworks.ai",
  fireworksai: "api.fireworks.ai",
  "black-forest-labs": "api.bfl.ai",
  bfl: "api.bfl.ai",
  deepseek: "api.deepseek.com",
  moonshotai: "api.moonshot.ai",
  moonshot: "api.moonshot.ai",
  perplexity: "api.perplexity.ai",
  venice: "api.venice.ai",
  parasail: "api.parasail.io",
  deepinfra: "api.deepinfra.com",
  atlascloud: "api.atlascloud.ai",
  novita: "api.novita.ai",
  novitaai: "api.novita.ai",
  grok: "api.x.ai",
  xai: "api.x.ai",
  together: "api.together.xyz",
  togetherai: "api.together.xyz",
  cerebras: "api.cerebras.ai",
  replicate: "api.replicate.com",
  prodia: "api.prodia.com",
  luma: "api.lumalabs.ai",
  bytedance: "ark.cn-beijing.volces.com",
  kling: "api.klingai.com",
  elevenlabs: "api.elevenlabs.io",
  assemblyai: "api.assemblyai.com",
  deepgram: "api.deepgram.com",
  gladia: "api.gladia.io",
  lmnt: "api.lmnt.com",
  hume: "api.hume.ai",
  revai: "api.rev.ai",
  baseten: "api.baseten.co",
  huggingface: "api-inference.huggingface.co",
  wandb: "api.inference.wandb.ai",
  weightsandbiases: "api.inference.wandb.ai",
  baidu: "qianfan.baidubce.com",
  qianfan: "qianfan.baidubce.com",
  vertex: "aiplatform.googleapis.com",
  xiaomi: "api.xiaomimimo.com",
  minimax: "api.minimax.io",
};

const HOST_ALIAS_PROVIDERS: Partial<Record<HostAlias, Provider>> = {
  aistudio: "google",
  vertex: "google-vertex",
  grok: "xai",
  bfl: "black-forest-labs",
  moonshot: "moonshotai",
  alibaba: "alibaba",
  alibabacloud: "alibaba",
  dashscope: "alibaba",
  togetherai: "together",
  fireworksai: "fireworks",
};

export interface HostResolution {
  /** The hostname/host to use for requests. */
  host: string;
  /** The provider alias that was expanded, if any. */
  alias?: HostAlias;
}

function readProcessEnv(): Env {
  return typeof process !== "undefined" && process.env ? process.env : {};
}

function normalizeHostValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  try {
    if (trimmed.includes("://")) {
      return new URL(trimmed).host;
    }
  } catch {
    // Fall through and treat it as a host-ish string.
  }

  return trimmed.replace(/^\/\//, "").split("/")[0] ?? trimmed;
}

function envHostOverride(alias: HostAlias, env: Env): string | undefined {
  const upper = alias.toUpperCase();
  const override =
    env[`LLM_STRINGS_${upper}_HOST`] ?? env[`LLM_STRINGS_HOST_${upper}`];
  return override?.trim() ? override : undefined;
}

/**
 * Resolve short provider host aliases (`openai`, `anthropic`, etc.) to their
 * canonical hostnames. Per-provider environment overrides can redirect aliases
 * to regional or private endpoints:
 *
 * - `LLM_STRINGS_OPENAI_HOST`
 * - `LLM_STRINGS_HOST_OPENAI`
 */
export function resolveHostAlias(
  host: string,
  env: Env = readProcessEnv(),
): HostResolution {
  const normalizedHost = host.toLowerCase();
  if (!hasOwn(HOST_ALIASES, normalizedHost)) {
    return { host };
  }

  const alias = normalizedHost as HostAlias;
  const override = envHostOverride(alias, env);
  return {
    host: normalizeHostValue(override ?? HOST_ALIASES[alias]),
    alias,
  };
}

export function providerFromHostAlias(alias: string): Provider | undefined {
  const normalizedAlias = alias.toLowerCase();
  if (hasOwn(PROVIDER_PARAMS, normalizedAlias)) {
    return normalizedAlias as Provider;
  }
  if (hasOwn(HOST_ALIAS_PROVIDERS, normalizedAlias)) {
    return HOST_ALIAS_PROVIDERS[normalizedAlias as HostAlias];
  }
  return undefined;
}

function canonicalHostName(host: string): string {
  return normalizeHostValue(host).toLowerCase().split(":")[0] ?? host;
}

function hostMatches(host: string, ...domains: string[]): boolean {
  return domains.some((domain) => {
    const normalizedDomain = domain.toLowerCase();
    return host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);
  });
}

function hostHasLabel(host: string, ...labels: string[]): boolean {
  const hostLabels = host.split(".");
  return labels.some((label) => hostLabels.includes(label.toLowerCase()));
}

function hostHasLabelPrefix(host: string, ...prefixes: string[]): boolean {
  const hostLabels = host.split(".");
  return prefixes.some((prefix) =>
    hostLabels.some((label) => label.startsWith(prefix.toLowerCase())),
  );
}

const MODEL_FAMILY_DELIMITERS = new Set(["-", "."]);

function normalizeModelForMatching(model: string): string {
  return model.trim().toLowerCase();
}

function modelLeafName(model: string): string {
  const normalized = normalizeModelForMatching(model);
  const slash = normalized.lastIndexOf("/");
  return slash >= 0 ? normalized.slice(slash + 1) : normalized;
}

export function modelMatchesFamily(model: string, family: string): boolean {
  const name = modelLeafName(model);
  const normalizedFamily = normalizeModelForMatching(family);
  if (!name || !normalizedFamily) return false;
  if (name === normalizedFamily) return true;

  const delimiter = name[normalizedFamily.length];
  return (
    name.startsWith(normalizedFamily) &&
    delimiter !== undefined &&
    MODEL_FAMILY_DELIMITERS.has(delimiter)
  );
}

export function detectProvider(host: string): Provider | undefined {
  host = canonicalHostName(host);

  // Gateways and aggregators first — they proxy to other providers
  if (hostMatches(host, "openrouter", "openrouter.ai")) return "openrouter";
  if (
    hostMatches(host, "vercel", "gateway.ai.vercel.app", "gateway.ai.vercel.sh")
  ) {
    return "vercel";
  }
  // Bedrock before native providers since it hosts models from multiple vendors
  if (
    hostMatches(host, "bedrock", "amazonaws.com") ||
    hostHasLabelPrefix(host, "bedrock")
  ) {
    return "bedrock";
  }
  if (hostMatches(host, "aiplatform.googleapis.com")) return "google-vertex";
  if (hostMatches(host, "xai", "x.ai", "api.x.ai")) return "xai";
  if (hostMatches(host, "groq", "groq.com", "api.groq.com")) return "groq";
  if (hostMatches(host, "fal", "fal.run", "fal.ai")) return "fal";
  if (hostMatches(host, "deepinfra", "deepinfra.com")) return "deepinfra";
  if (hostMatches(host, "bfl", "bfl.ai", "api.bfl.ai")) {
    return "black-forest-labs";
  }
  if (hostMatches(host, "together", "together.xyz")) return "together";
  if (hostMatches(host, "fireworks", "fireworks.ai")) return "fireworks";
  if (hostMatches(host, "deepseek", "deepseek.com")) return "deepseek";
  if (hostMatches(host, "moonshot", "moonshot.ai")) return "moonshotai";
  if (hostMatches(host, "perplexity", "perplexity.ai")) return "perplexity";
  if (
    hostMatches(host, "alibaba", "aliyuncs.com") ||
    hostHasLabelPrefix(host, "dashscope")
  ) {
    return "alibaba";
  }
  if (hostMatches(host, "cerebras", "cerebras.ai")) return "cerebras";
  if (hostMatches(host, "replicate", "replicate.com")) return "replicate";
  if (hostMatches(host, "prodia", "prodia.com")) return "prodia";
  if (hostMatches(host, "luma", "lumalabs.ai")) return "luma";
  if (
    hostMatches(host, "bytedance", "volces.com") ||
    hostHasLabel(host, "bytedance")
  ) {
    return "bytedance";
  }
  if (hostMatches(host, "kling", "klingai.com")) return "kling";
  if (hostMatches(host, "elevenlabs", "elevenlabs.io")) return "elevenlabs";
  if (hostMatches(host, "assemblyai", "assemblyai.com")) return "assemblyai";
  if (hostMatches(host, "deepgram", "deepgram.com")) return "deepgram";
  if (hostMatches(host, "gladia", "gladia.io")) return "gladia";
  if (hostMatches(host, "lmnt", "lmnt.com")) return "lmnt";
  if (hostMatches(host, "hume", "hume.ai")) return "hume";
  if (hostMatches(host, "revai", "rev.ai")) return "revai";
  if (hostMatches(host, "baseten", "baseten.co")) return "baseten";
  if (hostMatches(host, "huggingface", "huggingface.co")) return "huggingface";
  if (hostMatches(host, "azure", "azure.com")) return "azure";
  if (hostMatches(host, "openai", "openai.com")) return "openai";
  if (hostMatches(host, "anthropic", "anthropic.com", "claude.ai")) {
    return "anthropic";
  }
  if (hostMatches(host, "google", "googleapis.com")) return "google";
  if (hostMatches(host, "mistral", "mistral.ai")) return "mistral";
  if (hostMatches(host, "cohere", "cohere.com")) return "cohere";
  return undefined;
}

/**
 * Shorthand aliases → canonical param name.
 * Canonical names use snake_case and follow OpenAI conventions where possible.
 */
export const ALIASES: Record<string, string> = {
  // temperature
  temp: "temperature",

  // max_tokens
  max: "max_tokens",
  max_out: "max_tokens",
  max_output: "max_tokens",
  max_output_tokens: "max_tokens",
  max_completion_tokens: "max_tokens",
  maxOutputTokens: "max_tokens",
  maxTokens: "max_tokens",

  // top_p
  topp: "top_p",
  topP: "top_p",
  nucleus: "top_p",

  // top_k
  topk: "top_k",
  topK: "top_k",

  // frequency_penalty
  freq: "frequency_penalty",
  freq_penalty: "frequency_penalty",
  frequencyPenalty: "frequency_penalty",
  repetition_penalty: "frequency_penalty",

  // presence_penalty
  pres: "presence_penalty",
  pres_penalty: "presence_penalty",
  presencePenalty: "presence_penalty",

  // stop
  stop_sequences: "stop",
  stopSequences: "stop",
  stop_sequence: "stop",

  // seed
  random_seed: "seed",
  randomSeed: "seed",

  // n (completions count)
  candidateCount: "n",
  candidate_count: "n",
  num_completions: "n",

  // effort / reasoning
  reasoning_effort: "effort",
  reasoningEffort: "effort",
  reasoning: "effort",
  thinking_effort: "effort",
  thinkingEffort: "effort",

  // cache
  cache_control: "cache",
  cacheControl: "cache",
  cachePoint: "cache",
  cache_point: "cache",
};

const OPENAI_COMPATIBLE_PARAMS: Record<string, string> = {
  temperature: "temperature",
  max_tokens: "max_tokens",
  max_completion_tokens: "max_completion_tokens",
  top_p: "top_p",
  top_k: "top_k",
  frequency_penalty: "frequency_penalty",
  presence_penalty: "presence_penalty",
  stop: "stop",
  n: "n",
  seed: "seed",
  stream: "stream",
  effort: "reasoning_effort",
};

const COMMON_IMAGE_PARAMS: Record<string, string> = {
  prompt: "prompt",
  negative_prompt: "negative_prompt",
  seed: "seed",
  image_size: "image_size",
  aspect_ratio: "aspect_ratio",
  output_format: "output_format",
  width: "width",
  height: "height",
};

const FAL_PARAMS: Record<string, string> = {
  ...COMMON_IMAGE_PARAMS,
  num_images: "num_images",
  enable_safety_checker: "enable_safety_checker",
  enable_safety_checks: "enable_safety_checks",
  enable_prompt_expansion: "enable_prompt_expansion",
  expand_prompt: "expand_prompt",
};

const REPLICATE_PARAMS: Record<string, string> = {
  ...COMMON_IMAGE_PARAMS,
  input: "input",
  version: "version",
  num_outputs: "num_outputs",
  num_inference_steps: "num_inference_steps",
  guidance_scale: "guidance_scale",
  stream: "stream",
  webhook: "webhook",
  webhook_events_filter: "webhook_events_filter",
};

const PRODIA_PARAMS: Record<string, string> = {
  ...COMMON_IMAGE_PARAMS,
  model: "model",
  style_preset: "style_preset",
  steps: "steps",
  cfg_scale: "cfg_scale",
  upscale: "upscale",
  sampler: "sampler",
  type: "type",
  config: "config",
  price: "price",
};

const LUMA_PARAMS: Record<string, string> = {
  prompt: "prompt",
  model: "model",
  aspect_ratio: "aspect_ratio",
  keyframes: "keyframes",
  loop: "loop",
  duration: "duration",
  type: "type",
  image_ref: "image_ref",
  video: "video",
  source: "source",
};

const OPENROUTER_ROUTING_PARAMS: Record<string, string> = {
  provider: "provider",
  order: "order",
  "provider.order": "provider.order",
  only: "only",
  "provider.only": "provider.only",
  ignore: "ignore",
  "provider.ignore": "provider.ignore",
  allow_fallbacks: "allow_fallbacks",
  "provider.allow_fallbacks": "provider.allow_fallbacks",
  require_parameters: "require_parameters",
  "provider.require_parameters": "provider.require_parameters",
  data_collection: "data_collection",
  "provider.data_collection": "provider.data_collection",
  zdr: "zdr",
  "provider.zdr": "provider.zdr",
  enforce_distillable_text: "enforce_distillable_text",
  "provider.enforce_distillable_text": "provider.enforce_distillable_text",
  quantizations: "quantizations",
  "provider.quantizations": "provider.quantizations",
  sort: "sort",
  "provider.sort": "provider.sort",
  preferred_min_throughput: "preferred_min_throughput",
  "provider.preferred_min_throughput": "provider.preferred_min_throughput",
  preferred_max_latency: "preferred_max_latency",
  "provider.preferred_max_latency": "provider.preferred_max_latency",
  max_price: "max_price",
  "provider.max_price": "provider.max_price",
  transforms: "transforms",
  plugins: "plugins",
};

const GOOGLE_COMPATIBLE_PARAMS: Record<string, string> = {
  temperature: "temperature",
  max_tokens: "maxOutputTokens",
  top_p: "topP",
  top_k: "topK",
  frequency_penalty: "frequencyPenalty",
  presence_penalty: "presencePenalty",
  stop: "stopSequences",
  n: "candidateCount",
  stream: "stream",
  seed: "seed",
  responseMimeType: "responseMimeType",
  responseSchema: "responseSchema",
};

/**
 * Canonical param name → provider-specific API param name.
 * Only includes params the provider actually supports.
 */
export const PROVIDER_PARAMS: Record<Provider, Record<string, string>> = {
  openai: {
    temperature: "temperature",
    max_tokens: "max_tokens",
    max_completion_tokens: "max_completion_tokens",
    top_p: "top_p",
    frequency_penalty: "frequency_penalty",
    presence_penalty: "presence_penalty",
    stop: "stop",
    n: "n",
    seed: "seed",
    stream: "stream",
    effort: "reasoning_effort",
  },
  azure: OPENAI_COMPATIBLE_PARAMS,
  anthropic: {
    temperature: "temperature",
    max_tokens: "max_tokens",
    top_p: "top_p",
    top_k: "top_k",
    stop: "stop_sequences",
    stream: "stream",
    effort: "effort",
    cache: "cache_control",
    cache_ttl: "cache_ttl",
  },
  google: {
    temperature: "temperature",
    max_tokens: "maxOutputTokens",
    top_p: "topP",
    top_k: "topK",
    frequency_penalty: "frequencyPenalty",
    presence_penalty: "presencePenalty",
    stop: "stopSequences",
    n: "candidateCount",
    stream: "stream",
    seed: "seed",
    responseMimeType: "responseMimeType",
    responseSchema: "responseSchema",
  },
  "google-vertex": GOOGLE_COMPATIBLE_PARAMS,
  mistral: {
    temperature: "temperature",
    max_tokens: "max_tokens",
    top_p: "top_p",
    frequency_penalty: "frequency_penalty",
    presence_penalty: "presence_penalty",
    stop: "stop",
    n: "n",
    seed: "random_seed",
    stream: "stream",
    safe_prompt: "safe_prompt",
    min_tokens: "min_tokens",
  },
  cohere: {
    temperature: "temperature",
    max_tokens: "max_tokens",
    top_p: "p",
    top_k: "k",
    frequency_penalty: "frequency_penalty",
    presence_penalty: "presence_penalty",
    stop: "stop_sequences",
    stream: "stream",
    seed: "seed",
  },
  bedrock: {
    // Bedrock Converse API uses camelCase
    temperature: "temperature",
    max_tokens: "maxTokens",
    top_p: "topP",
    top_k: "topK", // Claude models via additionalModelRequestFields
    stop: "stopSequences",
    stream: "stream",
    cache: "cache_control",
    cache_ttl: "cache_ttl",
  },
  openrouter: {
    // OpenAI-compatible API with extra routing params
    temperature: "temperature",
    max_tokens: "max_tokens",
    max_completion_tokens: "max_completion_tokens",
    top_p: "top_p",
    top_k: "top_k",
    frequency_penalty: "frequency_penalty",
    presence_penalty: "presence_penalty",
    stop: "stop",
    n: "n",
    seed: "seed",
    stream: "stream",
    effort: "reasoning_effort",
    ...OPENROUTER_ROUTING_PARAMS,
  },
  vercel: {
    // OpenAI-compatible gateway
    temperature: "temperature",
    max_tokens: "max_tokens",
    max_completion_tokens: "max_completion_tokens",
    top_p: "top_p",
    top_k: "top_k",
    frequency_penalty: "frequency_penalty",
    presence_penalty: "presence_penalty",
    stop: "stop",
    n: "n",
    seed: "seed",
    stream: "stream",
    effort: "reasoning_effort",
  },
  xai: OPENAI_COMPATIBLE_PARAMS,
  groq: OPENAI_COMPATIBLE_PARAMS,
  fal: FAL_PARAMS,
  deepinfra: OPENAI_COMPATIBLE_PARAMS,
  "black-forest-labs": {},
  together: OPENAI_COMPATIBLE_PARAMS,
  fireworks: OPENAI_COMPATIBLE_PARAMS,
  deepseek: OPENAI_COMPATIBLE_PARAMS,
  moonshotai: OPENAI_COMPATIBLE_PARAMS,
  perplexity: OPENAI_COMPATIBLE_PARAMS,
  alibaba: OPENAI_COMPATIBLE_PARAMS,
  cerebras: OPENAI_COMPATIBLE_PARAMS,
  replicate: REPLICATE_PARAMS,
  prodia: PRODIA_PARAMS,
  luma: LUMA_PARAMS,
  bytedance: {},
  kling: {},
  elevenlabs: {},
  assemblyai: {},
  deepgram: {},
  gladia: {},
  lmnt: {},
  hume: {},
  revai: {},
  baseten: OPENAI_COMPATIBLE_PARAMS,
  huggingface: OPENAI_COMPATIBLE_PARAMS,
};

/**
 * Validation specs per provider, keyed by provider-specific param name.
 */
export interface ParamSpec {
  type: "number" | "string" | "boolean";
  min?: number;
  max?: number;
  values?: string[];
  default?: string | number | boolean;
  description?: string;
}

const REASONING_EFFORT_VALUES = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

const OPENAI_COMPATIBLE_PARAM_SPECS: Record<string, ParamSpec> = {
  temperature: {
    type: "number",
    min: 0,
    max: 2,
    default: 0.7,
    description: "Controls randomness",
  },
  max_tokens: {
    type: "number",
    min: 1,
    default: 4096,
    description: "Maximum output tokens",
  },
  max_completion_tokens: {
    type: "number",
    min: 1,
    default: 4096,
    description: "Maximum completion tokens (reasoning models)",
  },
  top_p: {
    type: "number",
    min: 0,
    max: 1,
    default: 1,
    description: "Nucleus sampling",
  },
  top_k: {
    type: "number",
    min: 0,
    default: 40,
    description: "Top-K sampling",
  },
  frequency_penalty: {
    type: "number",
    min: -2,
    max: 2,
    default: 0,
    description: "Penalize frequent tokens",
  },
  presence_penalty: {
    type: "number",
    min: -2,
    max: 2,
    default: 0,
    description: "Penalize repeated topics",
  },
  stop: { type: "string", description: "Stop sequences" },
  n: { type: "number", min: 1, default: 1, description: "Completions count" },
  seed: { type: "number", description: "Random seed" },
  stream: { type: "boolean", default: false, description: "Stream response" },
  reasoning_effort: {
    type: "string",
    values: REASONING_EFFORT_VALUES,
    default: "medium",
    description: "Reasoning effort",
  },
};

const OPENROUTER_ROUTING_PARAM_SPECS: Record<string, ParamSpec> = {
  provider: { type: "string", description: "Provider routing preferences" },
  order: { type: "string", description: "Provider order" },
  "provider.order": { type: "string", description: "Provider order" },
  only: { type: "string", description: "Provider allowlist" },
  "provider.only": { type: "string", description: "Provider allowlist" },
  ignore: { type: "string", description: "Provider blocklist" },
  "provider.ignore": { type: "string", description: "Provider blocklist" },
  allow_fallbacks: {
    type: "boolean",
    default: true,
    description: "Allow fallback providers",
  },
  "provider.allow_fallbacks": {
    type: "boolean",
    default: true,
    description: "Allow fallback providers",
  },
  require_parameters: {
    type: "boolean",
    default: false,
    description: "Only route to providers that support all request params",
  },
  "provider.require_parameters": {
    type: "boolean",
    default: false,
    description: "Only route to providers that support all request params",
  },
  data_collection: {
    type: "string",
    values: ["allow", "deny"],
    default: "allow",
    description: "Provider data collection policy",
  },
  "provider.data_collection": {
    type: "string",
    values: ["allow", "deny"],
    default: "allow",
    description: "Provider data collection policy",
  },
  zdr: {
    type: "boolean",
    description: "Require zero data retention providers",
  },
  "provider.zdr": {
    type: "boolean",
    description: "Require zero data retention providers",
  },
  enforce_distillable_text: {
    type: "boolean",
    description: "Require providers that allow text distillation",
  },
  "provider.enforce_distillable_text": {
    type: "boolean",
    description: "Require providers that allow text distillation",
  },
  quantizations: {
    type: "string",
    description: "Allowed provider quantization levels",
  },
  "provider.quantizations": {
    type: "string",
    description: "Allowed provider quantization levels",
  },
  sort: {
    type: "string",
    values: ["price", "throughput", "latency", "cost", "ttft", "tps"],
    description: "Provider sort strategy",
  },
  "provider.sort": {
    type: "string",
    values: ["price", "throughput", "latency", "cost", "ttft", "tps"],
    description: "Provider sort strategy",
  },
  preferred_min_throughput: {
    type: "number",
    min: 0,
    description: "Preferred minimum provider throughput",
  },
  "provider.preferred_min_throughput": {
    type: "number",
    min: 0,
    description: "Preferred minimum provider throughput",
  },
  preferred_max_latency: {
    type: "number",
    min: 0,
    description: "Preferred maximum provider latency",
  },
  "provider.preferred_max_latency": {
    type: "number",
    min: 0,
    description: "Preferred maximum provider latency",
  },
  max_price: {
    type: "string",
    description: "Maximum provider price filter",
  },
  "provider.max_price": {
    type: "string",
    description: "Maximum provider price filter",
  },
  transforms: {
    type: "string",
    description: "Legacy OpenRouter message transforms",
  },
  plugins: {
    type: "string",
    description: "OpenRouter request plugins",
  },
};

const FAL_PARAM_SPECS: Record<string, ParamSpec> = {
  prompt: { type: "string", description: "Prompt" },
  negative_prompt: { type: "string", description: "Negative prompt" },
  seed: { type: "number", description: "Random seed" },
  num_images: {
    type: "number",
    min: 1,
    description: "Number of images to generate",
  },
  image_size: { type: "string", description: "Output image size" },
  aspect_ratio: { type: "string", description: "Output aspect ratio" },
  enable_safety_checker: {
    type: "boolean",
    description: "Enable safety checker",
  },
  enable_safety_checks: {
    type: "boolean",
    description: "Enable safety checker",
  },
  enable_prompt_expansion: {
    type: "boolean",
    description: "Enable prompt expansion",
  },
  expand_prompt: {
    type: "boolean",
    description: "Enable prompt expansion",
  },
  output_format: {
    type: "string",
    values: ["jpeg", "jpg", "png", "webp", "gif"],
    description: "Output image format",
  },
  width: { type: "number", min: 1, description: "Image width" },
  height: { type: "number", min: 1, description: "Image height" },
};

const REPLICATE_PARAM_SPECS: Record<string, ParamSpec> = {
  prompt: { type: "string", description: "Prompt" },
  negative_prompt: { type: "string", description: "Negative prompt" },
  input: { type: "string", description: "Model input object" },
  version: { type: "string", description: "Model version" },
  seed: { type: "number", description: "Random seed" },
  num_outputs: {
    type: "number",
    min: 1,
    description: "Number of outputs to generate",
  },
  num_inference_steps: {
    type: "number",
    min: 1,
    description: "Number of inference steps",
  },
  guidance_scale: {
    type: "number",
    min: 0,
    description: "Guidance scale",
  },
  image_size: { type: "string", description: "Output image size" },
  aspect_ratio: { type: "string", description: "Output aspect ratio" },
  output_format: { type: "string", description: "Output format" },
  width: { type: "number", min: 1, description: "Image width" },
  height: { type: "number", min: 1, description: "Image height" },
  stream: { type: "boolean", description: "Request streaming output" },
  webhook: { type: "string", description: "Webhook URL" },
  webhook_events_filter: {
    type: "string",
    description: "Webhook events filter",
  },
};

const PRODIA_PARAM_SPECS: Record<string, ParamSpec> = {
  model: { type: "string", description: "Model name" },
  prompt: { type: "string", description: "Prompt" },
  negative_prompt: { type: "string", description: "Negative prompt" },
  style_preset: { type: "string", description: "Style preset" },
  steps: { type: "number", min: 1, description: "Generation steps" },
  cfg_scale: { type: "number", min: 0, description: "CFG scale" },
  seed: { type: "number", description: "Random seed" },
  upscale: { type: "boolean", description: "Enable 2x upscale" },
  sampler: { type: "string", description: "Sampler" },
  width: { type: "number", min: 1, max: 1024, description: "Image width" },
  height: { type: "number", min: 1, max: 1024, description: "Image height" },
  image_size: { type: "string", description: "Output image size" },
  aspect_ratio: { type: "string", description: "Output aspect ratio" },
  output_format: { type: "string", description: "Output format" },
  type: { type: "string", description: "Prodia v2 job type" },
  config: { type: "string", description: "Prodia v2 job config" },
  price: { type: "boolean", description: "Include Prodia v2 job price" },
};

const LUMA_PARAM_SPECS: Record<string, ParamSpec> = {
  prompt: { type: "string", description: "Prompt" },
  model: { type: "string", description: "Model name" },
  aspect_ratio: { type: "string", description: "Output aspect ratio" },
  keyframes: { type: "string", description: "Generation keyframes" },
  loop: { type: "boolean", description: "Generate a looping video" },
  duration: { type: "string", description: "Generation duration" },
  type: { type: "string", description: "Generation type" },
  image_ref: { type: "string", description: "Image reference" },
  video: { type: "string", description: "Video options" },
  source: { type: "string", description: "Source generation or media" },
};

const GOOGLE_COMPATIBLE_PARAM_SPECS: Record<string, ParamSpec> = {
  temperature: {
    type: "number",
    min: 0,
    max: 2,
    default: 0.7,
    description: "Controls randomness",
  },
  maxOutputTokens: {
    type: "number",
    min: 1,
    default: 4096,
    description: "Maximum output tokens",
  },
  topP: {
    type: "number",
    min: 0,
    max: 1,
    default: 1,
    description: "Nucleus sampling",
  },
  topK: {
    type: "number",
    min: 0,
    default: 40,
    description: "Top-K sampling",
  },
  frequencyPenalty: {
    type: "number",
    min: -2,
    max: 2,
    default: 0,
    description: "Penalize frequent tokens",
  },
  presencePenalty: {
    type: "number",
    min: -2,
    max: 2,
    default: 0,
    description: "Penalize repeated topics",
  },
  stopSequences: { type: "string", description: "Stop sequences" },
  candidateCount: {
    type: "number",
    min: 1,
    default: 1,
    description: "Candidate count",
  },
  stream: { type: "boolean", default: false, description: "Stream response" },
  seed: { type: "number", description: "Random seed" },
  responseMimeType: { type: "string", description: "Response MIME type" },
  responseSchema: { type: "string", description: "Response schema" },
};

export const PARAM_SPECS: Record<Provider, Record<string, ParamSpec>> = {
  openai: {
    temperature: {
      type: "number",
      min: 0,
      max: 2,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    max_completion_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum completion tokens (reasoning models)",
    },
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    frequency_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presence_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize repeated topics",
    },
    stop: { type: "string", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    reasoning_effort: {
      type: "string",
      values: REASONING_EFFORT_VALUES,
      default: "medium",
      description: "Reasoning effort",
    },
  },
  azure: OPENAI_COMPATIBLE_PARAM_SPECS,
  anthropic: {
    temperature: {
      type: "number",
      min: 0,
      max: 1,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    top_k: {
      type: "number",
      min: 0,
      default: 40,
      description: "Top-K sampling",
    },
    stop_sequences: { type: "string", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    effort: {
      type: "string",
      values: REASONING_EFFORT_VALUES,
      default: "low",
      description: "Thinking effort",
    },
    cache_control: {
      type: "string",
      values: ["ephemeral"],
      default: "ephemeral",
      description: "Cache control",
    },
    cache_ttl: {
      type: "string",
      values: ["5m", "1h"],
      default: "5m",
      description: "Cache TTL",
    },
  },
  google: {
    temperature: {
      type: "number",
      min: 0,
      max: 2,
      default: 0.7,
      description: "Controls randomness",
    },
    maxOutputTokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    topP: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    topK: {
      type: "number",
      min: 0,
      default: 40,
      description: "Top-K sampling",
    },
    frequencyPenalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presencePenalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize repeated topics",
    },
    stopSequences: { type: "string", description: "Stop sequences" },
    candidateCount: {
      type: "number",
      min: 1,
      default: 1,
      description: "Candidate count",
    },
    stream: { type: "boolean", default: false, description: "Stream response" },
    seed: { type: "number", description: "Random seed" },
    responseMimeType: { type: "string", description: "Response MIME type" },
    responseSchema: { type: "string", description: "Response schema" },
  },
  "google-vertex": GOOGLE_COMPATIBLE_PARAM_SPECS,
  mistral: {
    temperature: {
      type: "number",
      min: 0,
      max: 1,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    frequency_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presence_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize repeated topics",
    },
    stop: { type: "string", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    random_seed: { type: "number", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    safe_prompt: {
      type: "boolean",
      default: false,
      description: "Enable safe prompt",
    },
    min_tokens: {
      type: "number",
      min: 0,
      default: 0,
      description: "Minimum tokens",
    },
  },
  cohere: {
    temperature: {
      type: "number",
      min: 0,
      max: 1,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling (p)",
    },
    k: {
      type: "number",
      min: 0,
      max: 500,
      default: 40,
      description: "Top-K sampling (k)",
    },
    frequency_penalty: {
      type: "number",
      min: 0,
      max: 1,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presence_penalty: {
      type: "number",
      min: 0,
      max: 1,
      default: 0,
      description: "Penalize repeated topics",
    },
    stop_sequences: { type: "string", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    seed: { type: "number", description: "Random seed" },
  },
  bedrock: {
    // Converse API inferenceConfig params
    temperature: {
      type: "number",
      min: 0,
      max: 1,
      default: 0.7,
      description: "Controls randomness",
    },
    maxTokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    topP: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    topK: {
      type: "number",
      min: 0,
      default: 40,
      description: "Top-K sampling",
    },
    stopSequences: { type: "string", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    cache_control: {
      type: "string",
      values: ["ephemeral"],
      default: "ephemeral",
      description: "Cache control",
    },
    cache_ttl: {
      type: "string",
      values: ["5m", "1h"],
      default: "5m",
      description: "Cache TTL",
    },
  },
  openrouter: {
    // Loose validation — proxies to many providers with varying ranges
    temperature: {
      type: "number",
      min: 0,
      max: 2,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    max_completion_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum completion tokens (reasoning models)",
    },
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    top_k: {
      type: "number",
      min: 0,
      default: 40,
      description: "Top-K sampling",
    },
    frequency_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presence_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize repeated topics",
    },
    stop: { type: "string", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    reasoning_effort: {
      type: "string",
      values: REASONING_EFFORT_VALUES,
      default: "medium",
      description: "Reasoning effort",
    },
    ...OPENROUTER_ROUTING_PARAM_SPECS,
  },
  vercel: {
    // Loose validation — proxies to many providers with varying ranges
    temperature: {
      type: "number",
      min: 0,
      max: 2,
      default: 0.7,
      description: "Controls randomness",
    },
    max_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum output tokens",
    },
    max_completion_tokens: {
      type: "number",
      min: 1,
      default: 4096,
      description: "Maximum completion tokens (reasoning models)",
    },
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling",
    },
    top_k: {
      type: "number",
      min: 0,
      default: 40,
      description: "Top-K sampling",
    },
    frequency_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize frequent tokens",
    },
    presence_penalty: {
      type: "number",
      min: -2,
      max: 2,
      default: 0,
      description: "Penalize repeated topics",
    },
    stop: { type: "string", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    reasoning_effort: {
      type: "string",
      values: REASONING_EFFORT_VALUES,
      default: "medium",
      description: "Reasoning effort",
    },
    order: { type: "string", description: "Gateway provider order" },
    only: { type: "string", description: "Gateway provider allowlist" },
    models: { type: "string", description: "Gateway fallback models" },
    tags: { type: "string", description: "Gateway usage tags" },
    sort: {
      type: "string",
      values: ["cost", "ttft", "tps"],
      description: "Gateway provider sort strategy",
    },
    caching: {
      type: "string",
      values: ["auto"],
      description: "Gateway automatic caching strategy",
    },
    user: { type: "string", description: "Gateway usage user identifier" },
    byok: { type: "string", description: "Gateway BYOK credentials" },
    zero_data_retention: {
      type: "boolean",
      description: "Gateway zero data retention routing",
    },
    zeroDataRetention: {
      type: "boolean",
      description: "Gateway zero data retention routing",
    },
    disallow_prompt_training: {
      type: "boolean",
      description: "Gateway prompt training opt-out routing",
    },
    disallowPromptTraining: {
      type: "boolean",
      description: "Gateway prompt training opt-out routing",
    },
    hipaa_compliant: {
      type: "boolean",
      description: "Gateway HIPAA-compliant routing",
    },
    hipaaCompliant: {
      type: "boolean",
      description: "Gateway HIPAA-compliant routing",
    },
    quota_entity_id: {
      type: "string",
      description: "Gateway quota entity identifier",
    },
    quotaEntityId: {
      type: "string",
      description: "Gateway quota entity identifier",
    },
    provider_timeouts: {
      type: "string",
      description: "Gateway provider timeouts",
    },
    providerTimeouts: {
      type: "string",
      description: "Gateway provider timeouts",
    },
  },
  xai: OPENAI_COMPATIBLE_PARAM_SPECS,
  groq: OPENAI_COMPATIBLE_PARAM_SPECS,
  fal: FAL_PARAM_SPECS,
  deepinfra: OPENAI_COMPATIBLE_PARAM_SPECS,
  "black-forest-labs": {},
  together: OPENAI_COMPATIBLE_PARAM_SPECS,
  fireworks: OPENAI_COMPATIBLE_PARAM_SPECS,
  deepseek: OPENAI_COMPATIBLE_PARAM_SPECS,
  moonshotai: OPENAI_COMPATIBLE_PARAM_SPECS,
  perplexity: OPENAI_COMPATIBLE_PARAM_SPECS,
  alibaba: OPENAI_COMPATIBLE_PARAM_SPECS,
  cerebras: OPENAI_COMPATIBLE_PARAM_SPECS,
  replicate: REPLICATE_PARAM_SPECS,
  prodia: PRODIA_PARAM_SPECS,
  luma: LUMA_PARAM_SPECS,
  bytedance: {},
  kling: {},
  elevenlabs: {},
  assemblyai: {},
  deepgram: {},
  gladia: {},
  lmnt: {},
  hume: {},
  revai: {},
  baseten: OPENAI_COMPATIBLE_PARAM_SPECS,
  huggingface: OPENAI_COMPATIBLE_PARAM_SPECS,
};

/** OpenAI reasoning models don't support standard sampling params. */
export function isReasoningModel(model: string): boolean {
  const name = modelLeafName(model);
  const oSeries = name.match(/^o\d+/)?.[0];
  const gptSeries = name.match(/^gpt-[5-9]/)?.[0];
  return (
    (oSeries ? modelMatchesFamily(name, oSeries) : false) ||
    (gptSeries ? modelMatchesFamily(name, gptSeries) : false)
  );
}

/** Providers that can route to OpenAI models (and need reasoning-model checks). */
export function canHostOpenAIModels(provider: Provider): boolean {
  return (
    provider === "openai" ||
    provider === "azure" ||
    provider === "openrouter" ||
    provider === "vercel"
  );
}

/** Whether this provider is a gateway/router that proxies to other providers. */
export function isGatewayProvider(provider: Provider): boolean {
  return provider === "openrouter" || provider === "vercel";
}

/**
 * Extract the underlying provider from a gateway model string.
 * e.g. "anthropic/claude-sonnet-4-5" → "anthropic"
 * Returns undefined for unknown prefixes (qwen, deepseek, etc.) or models without "/".
 */
export function detectGatewaySubProvider(model: string): Provider | undefined {
  const slash = model.indexOf("/");
  if (slash < 1) return undefined;
  const prefix = normalizeModelForMatching(model.slice(0, slash));
  const direct: Partial<Record<string, Provider>> = {
    openai: "openai",
    anthropic: "anthropic",
    google: "google",
    vertex: "google",
    "google-vertex": "google",
    mistral: "mistral",
    cohere: "cohere",
  };
  return direct[prefix];
}

export const REASONING_MODEL_UNSUPPORTED = new Set([
  "temperature",
  "top_p",
  "top_k",
  "frequency_penalty",
  "presence_penalty",
  "n",
]);

/**
 * Bedrock model IDs are prefixed with the vendor name.
 * e.g. "anthropic.claude-sonnet-4-5-20250929-v1:0"
 */
export type BedrockModelFamily =
  | "anthropic"
  | "meta"
  | "amazon"
  | "mistral"
  | "cohere"
  | "ai21";

export function detectBedrockModelFamily(
  model: string,
): BedrockModelFamily | undefined {
  const families: BedrockModelFamily[] = [
    "anthropic",
    "meta",
    "amazon",
    "mistral",
    "cohere",
    "ai21",
  ];
  const parts = modelLeafName(model).split(".");
  return families.find((family) => parts.includes(family));
}

/** Whether a Bedrock model supports prompt caching (Claude and Nova only). */
export function bedrockSupportsCaching(model: string): boolean {
  const family = detectBedrockModelFamily(model);
  if (family === "anthropic") return true;
  if (family === "amazon") {
    const parts = modelLeafName(model).split(".");
    const amazonIndex = parts.indexOf("amazon");
    const modelName = amazonIndex >= 0 ? parts[amazonIndex + 1] : undefined;
    return modelName ? modelMatchesFamily(modelName, "nova") : false;
  }
  return false;
}

/** Cache value normalization per provider. */
export const CACHE_VALUES: Record<Provider, string | undefined> = {
  openai: undefined, // OpenAI auto-caches; no explicit param
  azure: undefined,
  anthropic: "ephemeral",
  google: undefined, // Google uses explicit caching API, not a param
  "google-vertex": undefined,
  mistral: undefined,
  cohere: undefined,
  bedrock: "ephemeral", // Supported for Claude models on Bedrock
  openrouter: undefined, // Depends on underlying provider
  vercel: undefined, // Depends on underlying provider
  xai: undefined,
  groq: undefined,
  fal: undefined,
  deepinfra: undefined,
  "black-forest-labs": undefined,
  together: undefined,
  fireworks: undefined,
  deepseek: undefined,
  moonshotai: undefined,
  perplexity: undefined,
  alibaba: undefined,
  cerebras: undefined,
  replicate: undefined,
  prodia: undefined,
  luma: undefined,
  bytedance: undefined,
  kling: undefined,
  elevenlabs: undefined,
  assemblyai: undefined,
  deepgram: undefined,
  gladia: undefined,
  lmnt: undefined,
  hume: undefined,
  revai: undefined,
  baseten: undefined,
  huggingface: undefined,
};

/** Valid cache TTL values per provider. */
export const CACHE_TTLS: Record<Provider, string[] | undefined> = {
  openai: undefined,
  azure: undefined,
  anthropic: ["5m", "1h"],
  google: undefined,
  "google-vertex": undefined,
  mistral: undefined,
  cohere: undefined,
  bedrock: ["5m", "1h"], // Claude on Bedrock uses same TTLs as direct Anthropic
  openrouter: undefined,
  vercel: undefined,
  xai: undefined,
  groq: undefined,
  fal: undefined,
  deepinfra: undefined,
  "black-forest-labs": undefined,
  together: undefined,
  fireworks: undefined,
  deepseek: undefined,
  moonshotai: undefined,
  perplexity: undefined,
  alibaba: undefined,
  cerebras: undefined,
  replicate: undefined,
  prodia: undefined,
  luma: undefined,
  bytedance: undefined,
  kling: undefined,
  elevenlabs: undefined,
  assemblyai: undefined,
  deepgram: undefined,
  gladia: undefined,
  lmnt: undefined,
  hume: undefined,
  revai: undefined,
  baseten: undefined,
  huggingface: undefined,
};
