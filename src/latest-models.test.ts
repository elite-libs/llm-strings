import { describe, expect, it } from "vitest";
import { parse, build } from "./parse.js";
import { normalize } from "./normalize.js";
import { validate } from "./validate.js";
import { isJevModel } from "./providers.js";
import { createAiSdkProviderOptions } from "./ai-sdk.js";

describe("September 2026 models", () => {
  it.each([
    "llm://meta/muse-spark-1.3",
    "llm://openrouter/meta/muse-spark-1.3",
  ])("preserves Muse Spark 1.3 routes in %s", (url) => {
    expect(parse(build(parse(url))).model).toContain("muse-spark-1.3");
    expect(validate(url, { strict: true })).toEqual([]);
  });
  it.each([
    "openai/gpt-6.1-sol",
    "openrouter/openai/gpt-6.1-sol",
    "vercel/openai/gpt-6.1-sol",
  ])("supports GPT-6.1 Sol reasoning through %s", (route) => {
    const url = `llm://${route}?effort=max&max=4096&temp=0.5&logprobs=true`;
    const result = normalize(parse(url));
    expect(result.config.params).toMatchObject({
      reasoning_effort: "max",
      max_completion_tokens: "4096",
    });
    expect(result.config.params).not.toHaveProperty("temperature");
    expect(result.config.params).not.toHaveProperty("logprobs");
    expect(validate(url, { strict: true })).toEqual([]);
    for (const effort of ["none", "minimal"]) {
      expect(validate(`llm://${route}?effort=${effort}`)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            param: "reasoning_effort",
            severity: "error",
          }),
        ]),
      );
    }
  });

  it.each([
    "anthropic/claude-sonnet-5-5",
    "openrouter/anthropic/claude-sonnet-5.5",
    "vercel/anthropic/claude-sonnet-5.5",
  ])("supports Claude Sonnet 5.5 through %s", (route) => {
    const base = `llm://${route}`;
    const betweenTools = build({
      ...parse(base),
      params: {
        thinking: JSON.stringify({ type: "between_tools" }),
        effort: "high",
      },
    });
    expect(validate(betweenTools, { strict: true })).toEqual([]);
    expect(
      validate(
        build({
          ...parse(base),
          params: { tool_choice: JSON.stringify({ type: "auto" }) },
        }),
        { strict: true },
      ),
    ).toEqual([]);
    if (route.startsWith("anthropic/")) {
      expect(
        createAiSdkProviderOptions(betweenTools).providerOptions,
      ).toMatchObject({
        anthropic: { thinking: { type: "between_tools" } },
      });
    }
    expect(
      validate(
        build({
          ...parse(base),
          params: {
            thinking: JSON.stringify({ type: "between_tools" }),
            effort: "max",
          },
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: "thinking", severity: "error" }),
      ]),
    );
    for (const params of [
      { thinking: JSON.stringify({ type: "disabled" }) },
      { thinking: JSON.stringify({ type: "enabled", budget_tokens: 1024 }) },
      { tool_choice: JSON.stringify({ type: "any" }) },
      { temp: "0.5" },
      { top_k: "40" },
    ] as Record<string, string>[]) {
      const url = build({ ...parse(base), params });
      expect(validate(url)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
    }
  });

  it.each(["gpt-6-sol", "gpt-6-luna"])(
    "preserves sampling only without reasoning for %s",
    (model) => {
      for (const host of ["openai", "openrouter", "vercel"]) {
        const route = host === "openai" ? model : `openai/${model}`;
        const result = normalize(
          parse(
            `llm://${host}/${route}?temp=0.5&reasoningEffort=none&top_p=0.8&logprobs=true`,
          ),
        );
        expect(result.config.params).toMatchObject({
          temperature: "0.5",
          top_p: "0.8",
          logprobs: "true",
        });
        expect(
          normalize(
            parse(`llm://${host}/${route}?effort=high&temp=0.5&logprobs=true`),
          ).config.params,
        ).not.toHaveProperty("logprobs");
      }
    },
  );
  it.each(["grok", "xai", "openrouter/x-ai", "vercel/xai"])(
    "validates Grok effort via %s",
    (route) => {
      expect(validate(`llm://${route}/grok-4.7?effort=xhigh`)).toEqual([]);
      expect(validate(`llm://${route}/grok-4.7?effort=none`)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
    },
  );
  it.each(["claude-fable-5-1", "claude-opus-5-5"])(
    "supports adaptive thinking for %s",
    (model) => {
      const url = build({
        host: "api.anthropic.com",
        model,
        params: { thinking: JSON.stringify({ type: "adaptive" }) },
      });
      expect(validate(url, { strict: true })).toEqual([]);
      expect(createAiSdkProviderOptions(url).providerOptions).toMatchObject({
        anthropic: { thinking: { type: "adaptive" } },
      });
      expect(validate(url.replace("adaptive", "disabled"))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
    },
  );
  it("preserves and identifies Jev decision routes", () => {
    const url = "llm://openrouter/typesafe/jev-1.13";
    expect(parse(build(parse(url))).model).toBe("typesafe/jev-1.13");
    expect(isJevModel(parse(url).model)).toBe(true);
    expect(isJevModel("~typesafe/jev-latest")).toBe(true);
    expect(isJevModel("other/jev-1.13")).toBe(false);
    expect(validate(url, { strict: true })).toEqual([]);
    expect(validate(`${url}?temp=0.5`)[0].severity).toBe("error");
  });
});
