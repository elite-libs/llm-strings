import { describe, expect, it } from "vitest";
import { build, parse } from "./index.js";
import { normalize } from "./normalize.js";

describe("parse", () => {
  it("parses a basic connection string", () => {
    const result = parse(
      "llm://api.openai.com/gpt-4o?temp=0.7&max_tokens=1500",
    );

    expect(result.host).toBe("api.openai.com");
    expect(result.model).toBe("gpt-4o");
    expect(result.params).toEqual({ temp: "0.7", max_tokens: "1500" });
    expect(result.label).toBeUndefined();
    expect(result.apiKey).toBeUndefined();
  });

  it("parses auth credentials", () => {
    const result = parse(
      "llm://app-name:sk-proj-123456@api.openai.com/gpt-4o?temp=0.7",
    );

    expect(result.host).toBe("api.openai.com");
    expect(result.model).toBe("gpt-4o");
    expect(result.label).toBe("app-name");
    expect(result.apiKey).toBe("sk-proj-123456");
    expect(result.params).toEqual({ temp: "0.7" });
  });

  it("parses a string with no query params", () => {
    const result = parse("llm://api.openai.com/gpt-4o");

    expect(result.host).toBe("api.openai.com");
    expect(result.model).toBe("gpt-4o");
    expect(result.params).toEqual({});
  });

  it("expands short provider host aliases", () => {
    const result = parse("llm://openai/gpt-4o?temp=0.7");

    expect(result.host).toBe("api.openai.com");
    expect(result.hostAlias).toBe("openai");
    expect(result.model).toBe("gpt-4o");
    expect(normalize(result).provider).toBe("openai");
  });

  it("uses env overrides for short provider host aliases", () => {
    const original = process.env.LLM_STRINGS_OPENAI_HOST;
    process.env.LLM_STRINGS_OPENAI_HOST =
      "https://regional.openai.example.com/v1";

    try {
      const result = parse("llm://openai/gpt-4o");

      expect(result.host).toBe("regional.openai.example.com");
      expect(result.hostAlias).toBe("openai");
      expect(normalize(result).provider).toBe("openai");
    } finally {
      if (original === undefined) {
        delete process.env.LLM_STRINGS_OPENAI_HOST;
      } else {
        process.env.LLM_STRINGS_OPENAI_HOST = original;
      }
    }
  });

  it("uses the hostAlias for provider detection when overrides are private", () => {
    const original = process.env.LLM_STRINGS_BEDROCK_HOST;
    process.env.LLM_STRINGS_BEDROCK_HOST = "private-runtime.example.internal";

    try {
      const result = parse(
        "llm://bedrock/anthropic.claude-sonnet-4-5-v1?max=4096",
      );

      expect(result.host).toBe("private-runtime.example.internal");
      expect(result.hostAlias).toBe("bedrock");
      expect(normalize(result).provider).toBe("bedrock");
    } finally {
      if (original === undefined) {
        delete process.env.LLM_STRINGS_BEDROCK_HOST;
      } else {
        process.env.LLM_STRINGS_BEDROCK_HOST = original;
      }
    }
  });

  it("throws on invalid scheme", () => {
    expect(() => parse("http://api.openai.com/gpt-4o")).toThrow(
      "Invalid scheme",
    );
  });
});

describe("build", () => {
  it("builds a basic connection string", () => {
    const result = build({
      host: "api.openai.com",
      model: "gpt-4o",
      params: { temp: "0.7", max_tokens: "1500" },
    });

    expect(result).toBe("llm://api.openai.com/gpt-4o?temp=0.7&max_tokens=1500");
  });

  it("builds with auth credentials", () => {
    const result = build({
      host: "api.openai.com",
      model: "gpt-4o",
      label: "app-name",
      apiKey: "sk-proj-123456",
      params: { temp: "0.7" },
    });

    expect(result).toBe(
      "llm://app-name:sk-proj-123456@api.openai.com/gpt-4o?temp=0.7",
    );
  });

  it("builds with no params", () => {
    const result = build({
      host: "api.openai.com",
      model: "gpt-4o",
      params: {},
    });

    expect(result).toBe("llm://api.openai.com/gpt-4o");
  });

  it("builds with short provider host aliases", () => {
    const result = build({
      host: "anthropic",
      model: "claude-sonnet-4-5",
      params: { temp: "0.7" },
    });

    expect(result).toBe("llm://api.anthropic.com/claude-sonnet-4-5?temp=0.7");
  });
});
