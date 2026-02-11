/**
 * Meta API routes — mirrors apps/ensapi/src/handlers/ensnode-api.ts
 *
 * Demonstrates config and indexing-status routes.
 */
import { Hono } from "hono";
import { describeRoute, resolver as validationResolver } from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const PublicConfigSchema = z.object({
  version: z.string(),
  namespace: z.string(),
});

app.get(
  "/config",
  describeRoute({
    tags: ["Meta"],
    summary: "Get ENSApi Public Config",
    description: "Gets the public config of the ENSApi instance",
    responses: {
      200: {
        description: "Successfully retrieved ENSApi public config",
        content: {
          "application/json": {
            schema: validationResolver(PublicConfigSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    return c.json({ version: "0.0.1", namespace: "mainnet" });
  },
);

const IndexingStatusSchema = z.object({
  status: z.enum(["ok", "error"]),
});

app.get(
  "/indexing-status",
  describeRoute({
    tags: ["Meta"],
    summary: "Get ENSIndexer Indexing Status",
    description: "Returns the indexing status snapshot most recently captured from ENSIndexer",
    responses: {
      200: {
        description: "Successfully retrieved indexing status",
        content: {
          "application/json": {
            schema: validationResolver(IndexingStatusSchema),
          },
        },
      },
      503: {
        description: "Indexing status snapshot unavailable",
        content: {
          "application/json": {
            schema: validationResolver(IndexingStatusSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    return c.json({ status: "ok" as const });
  },
);

export default app;
