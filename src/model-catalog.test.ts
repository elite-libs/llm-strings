import { describe, expect, it, vi } from "vitest";
import { listAvailableModels, MODEL_CATALOG_URLS } from "./model-catalog.js";

describe("listAvailableModels", () => {
  it("normalizes and filters the Vercel catalog", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                id: "openai/gpt-current",
                owned_by: "openai",
                name: "GPT Current",
                context_window: 1000,
                max_tokens: 100,
                supported_parameters: ["temperature", "tools"],
              },
              { id: "anthropic/claude-current", owned_by: "anthropic" },
            ],
          }),
        ),
    );

    await expect(
      listAvailableModels({ provider: "openai", fetch: fetcher }),
    ).resolves.toEqual([
      {
        id: "openai/gpt-current",
        name: "GPT Current",
        provider: "openai",
        contextWindow: 1000,
        maxOutputTokens: 100,
        supportedParameters: ["temperature", "tools"],
        source: "vercel",
      },
    ]);
    expect(fetcher).toHaveBeenCalledWith(MODEL_CATALOG_URLS.vercel, {
      headers: { accept: "application/json" },
      signal: undefined,
    });
  });

  it("normalizes OpenRouter's catalog shape", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                id: "~google/gemini-current",
                context_length: 2000,
                top_provider: { max_completion_tokens: 200 },
                supported_parameters: ["reasoning"],
              },
            ],
          }),
        ),
    );

    const [model] = await listAvailableModels({
      source: "openrouter",
      provider: "google",
      fetch: fetcher,
    });
    expect(model).toMatchObject({
      id: "~google/gemini-current",
      provider: "google",
      contextWindow: 2000,
      maxOutputTokens: 200,
      source: "openrouter",
    });
  });

  it("rejects failed and malformed catalog responses", async () => {
    await expect(
      listAvailableModels({
        fetch: async () => new Response("no", { status: 503 }),
      }),
    ).rejects.toThrow("503");
    await expect(
      listAvailableModels({
        fetch: async () => new Response(JSON.stringify({ models: [] })),
      }),
    ).rejects.toThrow("Invalid vercel model catalog response");
  });
});
