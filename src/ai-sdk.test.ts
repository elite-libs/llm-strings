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
        "llm://google/gemini-3-flash-preview?thinking_level=high&thinking_budget=1024&include_thoughts=true",
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
      parse("llm://vercel/anthropic/claude-sonnet-4?order=vertex,anthropic"),
    );

    expect(result.providerOptions).toEqual({
      gateway: { order: ["vertex", "anthropic"] },
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

  it("does not put common generation settings into providerOptions", async () => {
    const { createAiSdkProviderOptions } = await import("./ai-sdk.js");

    const result = createAiSdkProviderOptions(
      parse("llm://api.openai.com/gpt-5.2?temp=0.7&top_p=0.9&seed=42"),
    );

    expect(result.providerOptions).toEqual({});
  });
});
