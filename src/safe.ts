import { normalize } from "./normalize.js";
import type { NormalizeOptions, NormalizeResult } from "./normalize.js";
import { parse } from "./parse.js";
import { validate } from "./validate.js";
import type { ValidateOptions, ValidationIssue } from "./validate.js";

export interface SafeParseOptions extends NormalizeOptions, ValidateOptions {}

export type SafeParseResult =
  | (NormalizeResult & { success: true; issues: ValidationIssue[] })
  | { success: false; error: Error; issues: ValidationIssue[] };

/** Opt-in provider/model-aware parsing, normalization, and validation. */
export function safeParse(
  connectionString: string,
  options: SafeParseOptions = {},
): SafeParseResult {
  try {
    const normalized = normalize(parse(connectionString), options);
    const issues = validate(connectionString, options);
    const success = !issues.some((issue) => issue.severity === "error");
    if (!success) {
      return {
        success: false,
        error: new Error("Connection string failed provider-aware validation"),
        issues,
      };
    }
    return { success: true, ...normalized, issues };
  } catch (cause) {
    return {
      success: false,
      error: cause instanceof Error ? cause : new Error(String(cause)),
      issues: [],
    };
  }
}

export { normalize as safeNormalize, validate as safeValidate };
export type {
  NormalizeOptions,
  NormalizeResult,
  ValidateOptions,
  ValidationIssue,
};
