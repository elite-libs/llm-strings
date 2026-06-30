import type { Provider } from "./provider-core.js";

/* ------------------------------------------------------------------ */
/*  UI-consumable metadata for 3rd-party integrations                 */
/* ------------------------------------------------------------------ */

export interface ProviderMeta {
  /** Provider identifier — matches the Provider union type. */
  id: Provider;
  /** Human-readable display name. */
  name: string;
  /** Default / canonical API hostname. */
  host: string;
  /** Brand color as a CSS hex value. */
  color: string;
}

export const PROVIDER_META: ProviderMeta[] = [
  { id: "openai", name: "OpenAI", host: "api.openai.com", color: "#10a37f" },
  {
    id: "azure",
    name: "Azure OpenAI",
    host: "models.inference.ai.azure.com",
    color: "#0078d4",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    host: "api.anthropic.com",
    color: "#e8956a",
  },
  {
    id: "google",
    name: "Google",
    host: "generativelanguage.googleapis.com",
    color: "#4285f4",
  },
  {
    id: "google-vertex",
    name: "Google Vertex AI",
    host: "aiplatform.googleapis.com",
    color: "#34a853",
  },
  { id: "mistral", name: "Mistral", host: "api.mistral.ai", color: "#ff7000" },
  { id: "cohere", name: "Cohere", host: "api.cohere.com", color: "#39594d" },
  {
    id: "bedrock",
    name: "Bedrock",
    host: "bedrock-runtime.us-east-1.amazonaws.com",
    color: "#ff9900",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    host: "openrouter.ai",
    color: "#818cf8",
  },
  {
    id: "vercel",
    name: "Vercel",
    host: "gateway.ai.vercel.app",
    color: "#ededed",
  },
  { id: "xai", name: "xAI", host: "api.x.ai", color: "#111111" },
  { id: "groq", name: "Groq", host: "api.groq.com", color: "#f55036" },
  { id: "fal", name: "Fal", host: "fal.run", color: "#111111" },
  {
    id: "deepinfra",
    name: "DeepInfra",
    host: "api.deepinfra.com",
    color: "#2563eb",
  },
  {
    id: "black-forest-labs",
    name: "Black Forest Labs",
    host: "api.bfl.ai",
    color: "#111111",
  },
  {
    id: "together",
    name: "Together.ai",
    host: "api.together.xyz",
    color: "#ff4f00",
  },
  {
    id: "fireworks",
    name: "Fireworks",
    host: "api.fireworks.ai",
    color: "#7c3aed",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    host: "api.deepseek.com",
    color: "#4d6bfe",
  },
  {
    id: "moonshotai",
    name: "Moonshot AI",
    host: "api.moonshot.ai",
    color: "#6b46ff",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    host: "api.perplexity.ai",
    color: "#20b8cd",
  },
  {
    id: "alibaba",
    name: "Alibaba",
    host: "dashscope-intl.aliyuncs.com",
    color: "#ff6a00",
  },
  {
    id: "cerebras",
    name: "Cerebras",
    host: "api.cerebras.ai",
    color: "#d71920",
  },
  {
    id: "replicate",
    name: "Replicate",
    host: "api.replicate.com",
    color: "#111111",
  },
  { id: "prodia", name: "Prodia", host: "api.prodia.com", color: "#6d28d9" },
  { id: "luma", name: "Luma", host: "api.lumalabs.ai", color: "#111111" },
  {
    id: "bytedance",
    name: "ByteDance",
    host: "ark.cn-beijing.volces.com",
    color: "#2563eb",
  },
  { id: "kling", name: "Kling AI", host: "api.klingai.com", color: "#111111" },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    host: "api.elevenlabs.io",
    color: "#111111",
  },
  {
    id: "assemblyai",
    name: "AssemblyAI",
    host: "api.assemblyai.com",
    color: "#4f46e5",
  },
  {
    id: "deepgram",
    name: "Deepgram",
    host: "api.deepgram.com",
    color: "#13ef93",
  },
  { id: "gladia", name: "Gladia", host: "api.gladia.io", color: "#7c3aed" },
  { id: "lmnt", name: "LMNT", host: "api.lmnt.com", color: "#14b8a6" },
  { id: "hume", name: "Hume", host: "api.hume.ai", color: "#8b5cf6" },
  { id: "revai", name: "Rev.ai", host: "api.rev.ai", color: "#ef4444" },
  {
    id: "baseten",
    name: "Baseten",
    host: "api.baseten.co",
    color: "#111111",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    host: "api-inference.huggingface.co",
    color: "#ffcc4d",
  },
];

/**
 * Suggested / common model IDs per provider, ordered by recency.
 * Not exhaustive — providers add models frequently.
 */
export const MODELS: Record<Provider, string[]> = {
  openai: [
    "gpt-5.2",
    "gpt-5.2-pro",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o3",
    "o3-mini",
    "o4-mini",
    "o1-pro",
  ],
  azure: ["gpt-5.2", "gpt-4.1", "o3", "o4-mini"],
  anthropic: [
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-sonnet-4-5",
    "claude-haiku-4-5",
  ],
  google: [
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
  ],
  "google-vertex": [
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
  ],
  mistral: [
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "codestral-latest",
    "magistral-medium-latest",
  ],
  cohere: [
    "command-a-03-2025",
    "command-r-plus-08-2024",
    "command-r-08-2024",
    "command-r7b-12-2024",
  ],
  bedrock: [
    "anthropic.claude-opus-4-6-v1",
    "anthropic.claude-sonnet-4-6-v1",
    "anthropic.claude-haiku-4-5-v1",
    "amazon.nova-pro-v1",
    "amazon.nova-lite-v1",
    "meta.llama3-70b-instruct-v1:0",
  ],
  openrouter: [
    "openai/gpt-5.2",
    "anthropic/claude-opus-4-6",
    "google/gemini-2.5-pro",
    "mistral/mistral-large-latest",
  ],
  vercel: [
    "openai/gpt-5.2",
    "anthropic/claude-opus-4-6",
    "google/gemini-2.5-pro",
    "google/gemini-3-pro-preview",
    "google/gemini-3-flash-preview",
    "mistral/mistral-large-latest",
    "qwen/qwen2.5-pro",
  ],
  xai: ["grok-4", "grok-3", "grok-3-mini"],
  groq: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"],
  fal: ["fal-ai/flux-pro", "fal-ai/imagen4/preview"],
  deepinfra: [
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "deepseek-ai/DeepSeek-V3",
  ],
  "black-forest-labs": ["flux-pro-1.1", "flux-kontext-pro"],
  together: [
    "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    "deepseek-ai/DeepSeek-V3",
  ],
  fireworks: [
    "accounts/fireworks/models/llama-v3p1-70b-instruct",
    "accounts/fireworks/models/deepseek-v3",
  ],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  moonshotai: ["kimi-k2-0905-preview", "moonshot-v1-128k"],
  perplexity: ["sonar", "sonar-pro", "sonar-reasoning"],
  alibaba: ["qwen-plus", "qwen-max", "qwen3-coder-plus"],
  cerebras: ["llama3.1-8b", "llama-3.3-70b"],
  replicate: [
    "black-forest-labs/flux-schnell",
    "meta/meta-llama-3-70b-instruct",
  ],
  prodia: ["sdxl", "flux-schnell"],
  luma: ["ray-2", "photon-1"],
  bytedance: ["seedream-4-0", "seedance-1-0-pro"],
  kling: ["kling-v2.1", "kling-v1.6"],
  elevenlabs: ["eleven_multilingual_v2", "eleven_turbo_v2_5"],
  assemblyai: ["universal"],
  deepgram: ["nova-3", "nova-2"],
  gladia: ["solaria-1"],
  lmnt: ["aurora"],
  hume: ["octave"],
  revai: ["machine"],
  baseten: ["meta-llama/Llama-3.1-8B-Instruct", "deepseek-ai/DeepSeek-R1"],
  huggingface: [
    "meta-llama/Llama-3.1-8B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
  ],
};

/**
 * Canonical parameter spec — keyed by canonical (snake_case) param names
 * with defaults and descriptions for UI consumption.
 */
export interface CanonicalParamSpec {
  type: "number" | "string" | "boolean" | "enum";
  min?: number;
  max?: number;
  values?: string[];
  default?: string | number | boolean;
  description?: string;
}

const OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS: Record<
  string,
  CanonicalParamSpec
> = {
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
  stop: { type: "string", default: "", description: "Stop sequences" },
  n: { type: "number", min: 1, default: 1, description: "Completions count" },
  seed: { type: "number", default: "", description: "Random seed" },
  stream: { type: "boolean", default: false, description: "Stream response" },
  effort: {
    type: "enum",
    values: ["none", "minimal", "low", "medium", "high", "xhigh"],
    default: "medium",
    description: "Reasoning effort",
  },
};

const GOOGLE_COMPATIBLE_CANONICAL_PARAM_SPECS: Record<
  string,
  CanonicalParamSpec
> = {
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
  stop: { type: "string", default: "", description: "Stop sequences" },
  n: { type: "number", min: 1, default: 1, description: "Candidate count" },
  stream: { type: "boolean", default: false, description: "Stream response" },
  seed: { type: "number", default: "", description: "Random seed" },
};

export const CANONICAL_PARAM_SPECS: Record<
  Provider,
  Record<string, CanonicalParamSpec>
> = {
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", default: "", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    effort: {
      type: "enum",
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
      default: "medium",
      description: "Reasoning effort",
    },
  },
  azure: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    effort: {
      type: "enum",
      values: ["low", "medium", "high", "max"],
      default: "medium",
      description: "Thinking effort",
    },
    cache: {
      type: "enum",
      values: ["ephemeral"],
      default: "ephemeral",
      description: "Cache control",
    },
    cache_ttl: {
      type: "enum",
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Candidate count" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    seed: { type: "number", default: "", description: "Random seed" },
  },
  "google-vertex": GOOGLE_COMPATIBLE_CANONICAL_PARAM_SPECS,
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", default: "", description: "Random seed" },
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
    top_p: {
      type: "number",
      min: 0,
      max: 1,
      default: 1,
      description: "Nucleus sampling (p)",
    },
    top_k: {
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    seed: { type: "number", default: "", description: "Random seed" },
  },
  bedrock: {
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    cache: {
      type: "enum",
      values: ["ephemeral"],
      default: "ephemeral",
      description: "Cache control",
    },
    cache_ttl: {
      type: "enum",
      values: ["5m", "1h"],
      default: "5m",
      description: "Cache TTL",
    },
  },
  openrouter: {
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", default: "", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    effort: {
      type: "enum",
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
      default: "medium",
      description: "Reasoning effort",
    },
  },
  vercel: {
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
    stop: { type: "string", default: "", description: "Stop sequences" },
    n: { type: "number", min: 1, default: 1, description: "Completions count" },
    seed: { type: "number", default: "", description: "Random seed" },
    stream: { type: "boolean", default: false, description: "Stream response" },
    effort: {
      type: "enum",
      values: ["none", "minimal", "low", "medium", "high", "xhigh"],
      default: "medium",
      description: "Reasoning effort",
    },
  },
  xai: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  groq: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  fal: {},
  deepinfra: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  "black-forest-labs": {},
  together: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  fireworks: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  deepseek: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  moonshotai: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  perplexity: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  alibaba: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  cerebras: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
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
  baseten: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
  huggingface: OPENAI_COMPATIBLE_CANONICAL_PARAM_SPECS,
};
