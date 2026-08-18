import { describe, expect, it } from "vitest";
import { safeNormalize, safeParse, safeValidate } from "./safe.js";

describe("safe provider-aware entry point", () => {
  it("parses, normalizes, and validates on demand", () => {
    const result = safeParse("llm://google/gemini-3.5-flash?max=2048");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.provider).toBe("google");
      expect(result.config.params).toEqual({ maxOutputTokens: "2048" });
      expect(result.issues).toEqual([]);
    }
  });

  it("returns failures instead of throwing", () => {
    expect(safeParse("https://example.com/model")).toMatchObject({
      success: false,
      issues: [],
    });
    expect(safeParse("llm://openai/gpt-5.6-sol?max_tokens=nope")).toMatchObject(
      { success: false },
    );
  });

  it("exposes explicit safe normalization and validation aliases", () => {
    expect(typeof safeNormalize).toBe("function");
    expect(typeof safeValidate).toBe("function");
  });
});
