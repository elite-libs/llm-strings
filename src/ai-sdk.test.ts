import { describe, expect, it } from "vitest";
import { parse } from "./index.js";

describe("createAiSdkProviderOptions", () => {
  it("loads from the AI SDK adapter submodule with dynamic import", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://api.openai.com/o3?effort=high"),
    );

    expect(result.providerOptions).toEqual({
      openai: { reasoningEffort: "high" },
    });
  });

  it("parses connection strings directly", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      "llm://api.openai.com/o3?effort=high",
    );

    expect(result.providerOptions).toEqual({
      openai: { reasoningEffort: "high" },
    });
  });

  it("maps Anthropic cache and effort options", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://api.anthropic.com/claude-sonnet-4-5?cache=1h&effort=max"),
    );

    expect(result.providerOptions).toEqual({
      anthropic: {
        cacheControl: { type: "ephemeral", ttl: "1h" },
        effort: "max",
      },
    });
  });

  it("maps Bedrock cache options to cachePoint", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse(
        "llm://bedrock-runtime.us-east-1.amazonaws.com/anthropic.claude-sonnet-4-5-20250929-v1:0?cache=1h",
      ),
    );

    expect(result.providerOptions).toEqual({
      bedrock: { cachePoint: { type: "default", ttl: "1h" } },
    });
  });

  it("maps Mistral options to AI SDK camelCase", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://api.mistral.ai/mistral-large-latest?safe_prompt=true"),
    );

    expect(result.providerOptions).toEqual({
      mistral: { safePrompt: true },
    });
  });

  it("maps Google thinking options into thinkingConfig", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse(
        "llm://google/gemini-3.5-flash?thinking_level=high&thinking_budget=1024&include_thoughts=true",
      ),
    );

    expect(result.providerOptions).toEqual({
      google: {
        thinkingConfig: {
          thinkingLevel: "high",
          thinkingBudget: 1024,
          includeThoughts: true,
        },
      },
    });
  });

  it("uses gateway as the providerOptions key for Vercel AI Gateway", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse(
        "llm://vercel/anthropic/claude-sonnet-4?order=vertex,anthropic&sort=ttft&caching=auto",
      ),
    );

    expect(result.providerOptions).toEqual({
      gateway: {
        order: ["vertex", "anthropic"],
        sort: "ttft",
        caching: "auto",
      },
    });
  });

  it("uses xai as the providerOptions key for xAI aliases", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions("llm://grok/grok-4?effort=high");

    expect(result.provider).toBe("xai");
    expect(result.providerOptions).toEqual({
      xai: { reasoningEffort: "high" },
    });
  });

  it("uses vertex as the providerOptions key for Google Vertex", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      'llm://vertex/gemini-2.5-pro?safety_settings={"threshold":"BLOCK_LOW_AND_ABOVE"}',
    );

    expect(result.provider).toBe("google-vertex");
    expect(result.providerOptions).toEqual({
      vertex: { safetySettings: { threshold: "BLOCK_LOW_AND_ABOVE" } },
    });
  });

  it("passes flexible Fal providerOptions through", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      "llm://fal/fal-ai/flux-pro?image_size=square_hd&num_images=2",
    );

    expect(result.provider).toBe("fal");
    expect(result.providerOptions).toEqual({
      fal: { image_size: "square_hd", num_images: 2 },
    });
  });

  it("uses blackForestLabs as the providerOptions key for Black Forest Labs", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      "llm://bfl/flux-pro-1.1?output_format=jpeg",
    );

    expect(result.provider).toBe("black-forest-labs");
    expect(result.providerOptions).toEqual({
      blackForestLabs: { output_format: "jpeg" },
    });
  });

  it("maps OpenRouter reasoning effort into its nested reasoning option", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://openrouter.ai/openai/o3?effort=high"),
    );

    expect(result.providerOptions).toEqual({
      openrouter: { reasoning: { effort: "high" } },
    });
  });

  it("maps OpenRouter routing params into provider options", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse(
        "llm://openrouter.ai/openai/gpt-4o?provider.order=openai,anthropic&provider.allow_fallbacks=false&transforms=middle-out&plugins=context-compression",
      ),
    );

    expect(result.providerOptions).toEqual({
      openrouter: {
        provider: {
          order: ["openai", "anthropic"],
          allow_fallbacks: false,
        },
        transforms: ["middle-out"],
        plugins: ["context-compression"],
      },
    });
  });

  it("does not put common generation settings into providerOptions", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://api.openai.com/gpt-4o?temp=0.7&top_p=0.9&seed=42"),
    );

    expect(result.providerOptions).toEqual({});
  });
});
