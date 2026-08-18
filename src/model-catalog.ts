import type { Provider } from "./provider-core.js";

export type ModelCatalogSource = "vercel" | "openrouter";

export interface AvailableModel {
  id: string;
  name?: string;
  provider?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  supportedParameters: string[];
  source: ModelCatalogSource;
}

export interface ListAvailableModelsOptions {
  source?: ModelCatalogSource;
  /** Match either the catalog owner or the provider prefix in the model ID. */
  provider?: Provider | string;
  /** Override fetch for tests, non-browser runtimes, proxies, or cached catalogs. */
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
}

export const MODEL_CATALOG_URLS: Record<ModelCatalogSource, string> = {
  vercel: "https://ai-gateway.vercel.sh/v1/models",
  openrouter: "https://openrouter.ai/api/v1/models",
};

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function providerFromModelId(id: string): string | undefined {
  const slash = id.indexOf("/");
  return slash > 0 ? id.slice(0, slash).replace(/^~/, "") : undefined;
}

/**
 * Query a gateway's public model catalog and return a small, stable common shape.
 * Catalogs are fetched at call time because model availability changes independently
 * of this package. No request is made merely by importing llm-strings.
 */
export async function listAvailableModels(
  options: ListAvailableModelsOptions = {},
): Promise<AvailableModel[]> {
  const source = options.source ?? "vercel";
  const fetcher = options.fetch ?? globalThis.fetch;
  if (!fetcher) {
    throw new Error("listAvailableModels requires a Fetch API implementation");
  }

  const response = await fetcher(MODEL_CATALOG_URLS[source], {
    headers: { accept: "application/json" },
    signal: options.signal,
  });
  if (!response.ok) {
    throw new Error(
      `Unable to load ${source} model catalog (${response.status} ${response.statusText})`,
    );
  }

  const body = (await response.json()) as { data?: unknown };
  if (!Array.isArray(body.data)) {
    throw new Error(`Invalid ${source} model catalog response`);
  }

  const models = body.data.flatMap((entry): AvailableModel[] => {
    if (!entry || typeof entry !== "object") return [];
    const model = entry as Record<string, unknown>;
    if (typeof model.id !== "string") return [];
    const inferredProvider = providerFromModelId(model.id);
    const owner =
      typeof model.owned_by === "string" ? model.owned_by : inferredProvider;

    return [
      {
        id: model.id,
        ...(typeof model.name === "string" ? { name: model.name } : {}),
        ...(owner ? { provider: owner } : {}),
        contextWindow: optionalNumber(
          model.context_window ?? model.context_length,
        ),
        maxOutputTokens: optionalNumber(
          model.max_tokens ??
            (model.top_provider as Record<string, unknown> | undefined)
              ?.max_completion_tokens,
        ),
        supportedParameters: stringArray(model.supported_parameters),
        source,
      },
    ];
  });

  if (!options.provider) return models;
  const provider = options.provider.toLowerCase();
  return models.filter(
    (model) =>
      model.provider?.toLowerCase() === provider ||
      providerFromModelId(model.id)?.toLowerCase() === provider,
  );
}
