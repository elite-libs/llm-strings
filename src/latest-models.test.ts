import { describe, expect, it } from "vitest";
import { parse, build } from "./parse.js";
import { normalize } from "./normalize.js";
import { validate } from "./validate.js";
import { isJevModel } from "./providers.js";
import { createAiSdkProviderOptions } from "./ai-sdk.js";

describe("September 2026 models", () => {
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
