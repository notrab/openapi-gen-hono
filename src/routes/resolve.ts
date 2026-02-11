/**
 * Resolution API routes — mirrors apps/ensapi/src/handlers/resolution-api.ts
 *
 * Demonstrates that describeRoute + validate can define OpenAPI metadata
 * without any runtime dependencies (no config, no database, no RPC).
 */
import { Hono } from "hono";
import {
  describeRoute,
  resolver as validationResolver,
  validator,
} from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const RecordsResponseSchema = z.object({
  records: z.object({
    name: z.string().nullable(),
    addresses: z.record(z.string(), z.string()).optional(),
    texts: z.record(z.string(), z.string()).optional(),
  }),
  accelerationRequested: z.boolean(),
  accelerationAttempted: z.boolean(),
});

app.get(
  "/records/:name",
  describeRoute({
    tags: ["Resolution"],
    summary: "Resolve ENS Records",
    description: "Resolves ENS records for a given name",
    responses: {
      200: {
        description: "Successfully resolved records",
        content: {
          "application/json": {
            schema: validationResolver(RecordsResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", z.object({ name: z.string() })),
  async (c) => {
    // In the real app, this calls resolveForward() etc.
    return c.json({
      records: { name: null },
      accelerationRequested: false,
      accelerationAttempted: false,
    });
  }
);

const PrimaryNameResponseSchema = z.object({
  name: z.string().nullable(),
  accelerationRequested: z.boolean(),
  accelerationAttempted: z.boolean(),
});

app.get(
  "/primary-name/:address/:chainId",
  describeRoute({
    tags: ["Resolution"],
    summary: "Resolve Primary Name",
    description: "Resolves a primary name for a given address and chainId",
    responses: {
      200: {
        description: "Successfully resolved name",
        content: {
          "application/json": {
            schema: validationResolver(PrimaryNameResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", z.object({ address: z.string(), chainId: z.string() })),
  async (c) => {
    return c.json({
      name: null,
      accelerationRequested: false,
      accelerationAttempted: false,
    });
  }
);

export default app;
