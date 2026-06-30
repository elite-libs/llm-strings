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

export function detectProvider(host: string): Provider | undefined {
  host = host.toLowerCase();

  // Gateways and aggregators first — they proxy to other providers
  if (host.includes("openrouter")) return "openrouter";
  if (host.includes("gateway.ai.vercel")) return "vercel";
  // Bedrock before native providers since it hosts models from multiple vendors
  if (host.includes("amazonaws") || host.includes("bedrock")) return "bedrock";
  if (host.includes("aiplatform.googleapis")) return "google-vertex";
  if (host.includes("api.x.ai")) return "xai";
  if (host.includes("groq")) return "groq";
  if (host.includes("fal.run") || host.includes("fal.ai")) return "fal";
  if (host.includes("deepinfra")) return "deepinfra";
  if (host.includes("bfl.ai")) return "black-forest-labs";
  if (host.includes("together")) return "together";
  if (host.includes("fireworks")) return "fireworks";
  if (host.includes("deepseek")) return "deepseek";
  if (host.includes("moonshot")) return "moonshotai";
  if (host.includes("perplexity")) return "perplexity";
  if (host.includes("dashscope") || host.includes("aliyuncs")) return "alibaba";
  if (host.includes("cerebras")) return "cerebras";
  if (host.includes("replicate")) return "replicate";
  if (host.includes("prodia")) return "prodia";
  if (host.includes("lumalabs") || host.includes("luma")) return "luma";
  if (host.includes("volces") || host.includes("bytedance")) return "bytedance";
  if (host.includes("kling")) return "kling";
  if (host.includes("elevenlabs")) return "elevenlabs";
  if (host.includes("assemblyai")) return "assemblyai";
  if (host.includes("deepgram")) return "deepgram";
  if (host.includes("gladia")) return "gladia";
  if (host.includes("lmnt")) return "lmnt";
  if (host.includes("hume")) return "hume";
  if (host.includes("rev.ai")) return "revai";
  if (host.includes("baseten")) return "baseten";
  if (host.includes("huggingface")) return "huggingface";
  if (host.includes("azure")) return "azure";
  if (host.includes("openai")) return "openai";
  if (host.includes("anthropic") || host.includes("claude")) return "anthropic";
  if (host.includes("googleapis") || host.includes("google")) return "google";
  if (host.includes("mistral")) return "mistral";
  if (host.includes("cohere")) return "cohere";
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
  reasoning: "effort",

  // cache
  cache_control: "cache",
  cacheControl: "cache",
  cachePoint: "cache",
  cache_point: "cache",
};

const OPENAI_COMPATIBLE_PARAMS: Record<string, string> = {
  temperature: "temperature",
  max_tokens: "max_tokens",
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
  vercel: {
    // OpenAI-compatible gateway
    temperature: "temperature",
    max_tokens: "max_tokens",
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
  fal: {},
  deepinfra: OPENAI_COMPATIBLE_PARAMS,
  "black-forest-labs": {},
  together: OPENAI_COMPATIBLE_PARAMS,
  fireworks: OPENAI_COMPATIBLE_PARAMS,
  deepseek: OPENAI_COMPATIBLE_PARAMS,
  moonshotai: OPENAI_COMPATIBLE_PARAMS,
  perplexity: OPENAI_COMPATIBLE_PARAMS,
  alibaba: OPENAI_COMPATIBLE_PARAMS,
  cerebras: OPENAI_COMPATIBLE_PARAMS,
  replicate: {},
  prodia: {},
  luma: {},
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
    values: ["none", "minimal", "low", "medium", "high", "xhigh"],
    default: "medium",
    description: "Reasoning effort",
  },
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
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
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
      values: ["low", "medium", "high", "max"],
      default: "medium",
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
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
      default: "medium",
      description: "Reasoning effort",
    },
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
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
      default: "medium",
      description: "Reasoning effort",
    },
  },
  xai: OPENAI_COMPATIBLE_PARAM_SPECS,
  groq: OPENAI_COMPATIBLE_PARAM_SPECS,
  fal: {},
  deepinfra: OPENAI_COMPATIBLE_PARAM_SPECS,
  "black-forest-labs": {},
  together: OPENAI_COMPATIBLE_PARAM_SPECS,
  fireworks: OPENAI_COMPATIBLE_PARAM_SPECS,
  deepseek: OPENAI_COMPATIBLE_PARAM_SPECS,
  moonshotai: OPENAI_COMPATIBLE_PARAM_SPECS,
  perplexity: OPENAI_COMPATIBLE_PARAM_SPECS,
  alibaba: OPENAI_COMPATIBLE_PARAM_SPECS,
  cerebras: OPENAI_COMPATIBLE_PARAM_SPECS,
  replicate: {},
  prodia: {},
  luma: {},
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
  // Strip gateway prefix: "openai/o3" → "o3"
  const name = model.includes("/") ? model.split("/").pop()! : model;
  return /^o[134]/.test(name);
}

/** Providers that can route to OpenAI models (and need reasoning-model checks). */
export function canHostOpenAIModels(provider: Provider): boolean {
  return (
    provider === "openai" || provider === "openrouter" || provider === "vercel"
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
  const prefix = model.slice(0, slash);
  const direct: Provider[] = [
    "openai",
    "anthropic",
    "google",
    "mistral",
    "cohere",
  ];
  return direct.find((p) => p === prefix);
}

export const REASONING_MODEL_UNSUPPORTED = new Set([
  "temperature",
  "top_p",
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
  // Handle cross-region inference profiles (e.g. "us.anthropic.claude-sonnet-4-5...")
  // and global inference profiles (e.g. "global.anthropic.claude-sonnet-4-5...")
  const parts = model.split(".");

  // If first part is a region prefix (us, eu, apac) or global, skip it
  let prefix = parts[0];
  if (["us", "eu", "apac", "global"].includes(prefix) && parts.length > 1) {
    prefix = parts[1];
  }

  const families: BedrockModelFamily[] = [
    "anthropic",
    "meta",
    "amazon",
    "mistral",
    "cohere",
    "ai21",
  ];
  return families.find((f) => prefix === f);
}

/** Whether a Bedrock model supports prompt caching (Claude and Nova only). */
export function bedrockSupportsCaching(model: string): boolean {
  const family = detectBedrockModelFamily(model);
  if (family === "anthropic") return true;
  if (family === "amazon" && model.includes("nova")) return true;
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

/** Match a duration expression like "5m", "1h", "30m". */
export const DURATION_RE = /^\d+[mh]$/;
