/**
 * Custom validation middleware wrapper.
 *
 * Mirrors apps/ensapi/src/lib/handlers/validate.ts — wraps hono-openapi's
 * validator() with custom error formatting for consistent API responses.
 *
 * In the real codebase this uses @standard-schema/utils SchemaError and a
 * dedicated errorResponse helper. Here we simplify for the POC.
 */
import type { ValidationTargets } from "hono";
import { validator } from "hono-openapi";
import type { ZodType } from "zod";

export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  validator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        { message: "Invalid Input", details: result.error },
        400,
      );
    }
  });
