/**
 * Route definitions for all API endpoints that use describeRoute.
 *
 * This file contains ONLY the OpenAPI metadata (describeRoute, validate, paths)
 * for each route. It has zero runtime imports — no config, caches, db, or middleware.
 *
 * It is consumed by:
 *   1. Handler files (src/routes/*) — wire definitions to runtime handlers
 *   2. generate-openapi.ts — build the OpenAPI spec without starting a server
 *
 * DEPENDENCY RULE: This file may only import from:
 *   - hono-openapi (describeRoute, resolver)
 *   - zod
 *   - ./lib/handlers/params.schema (shared param schemas)
 *   - ./lib/handlers/validate (validate helper)
 *
 * It must NEVER import from runtime modules (config, caches, db, middleware).
 */

import {
  describeRoute,
  resolver as validationResolver,
} from "hono-openapi";
import { z } from "zod";

import { params } from "./lib/handlers/params.schema.js";
import { validate } from "./lib/handlers/validate.js";

// ── Resolution API (/api/resolve) ───────────────────────────────

const RecordsResponseSchema = z.object({
  records: z.object({
    name: z.string().nullable(),
    addresses: z.record(z.string(), z.string()).optional(),
    texts: z.record(z.string(), z.string()).optional(),
  }),
  accelerationRequested: z.boolean(),
  accelerationAttempted: z.boolean(),
});

export const resolveRecordsRoute = {
  path: "/records/:name" as const,
  describe: describeRoute({
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
  paramValidation: validate("param", z.object({ name: params.name })),
  queryValidation: validate(
    "query",
    z
      .object({
        ...params.selectionParams.shape,
        trace: params.trace,
        accelerate: params.accelerate,
      })
      .transform((value) => {
        const { trace, accelerate, ...selectionParams } = value;
        const selection = params.selection.parse(selectionParams);
        return { selection, trace, accelerate };
      }),
  ),
};

const PrimaryNameResponseSchema = z.object({
  name: z.string().nullable(),
  accelerationRequested: z.boolean(),
  accelerationAttempted: z.boolean(),
});

export const resolvePrimaryNameRoute = {
  path: "/primary-name/:address/:chainId" as const,
  describe: describeRoute({
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
  paramValidation: validate(
    "param",
    z.object({
      address: params.address,
      chainId: params.defaultableChainId,
    }),
  ),
  queryValidation: validate(
    "query",
    z.object({
      trace: params.trace,
      accelerate: params.accelerate,
    }),
  ),
};

// ── Meta API (/api) ─────────────────────────────────────────────

const PublicConfigSchema = z.object({
  version: z.string(),
  namespace: z.string(),
});

export const configRoute = {
  path: "/config" as const,
  describe: describeRoute({
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
};

const IndexingStatusSchema = z.object({
  status: z.enum(["ok", "error"]),
});

export const indexingStatusRoute = {
  path: "/indexing-status" as const,
  describe: describeRoute({
    tags: ["Meta"],
    summary: "Get ENSIndexer Indexing Status",
    description:
      "Returns the indexing status snapshot most recently captured from ENSIndexer",
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
};

// ── Explore: Name Tokens API (/api/name-tokens) ────────────────

const NameTokensResponseSchema = z.object({
  tokens: z.array(
    z.object({
      label: z.string(),
      labelhash: z.string(),
    }),
  ),
});

const ErrorResponseSchema = z.object({
  message: z.string(),
  details: z.unknown().optional(),
});

export const nameTokensQuerySchema = z
  .object({
    domainId: z.string().optional().describe("Domain node hash identifier"),
    name: params.name.optional().describe("ENS name to look up tokens for"),
  })
  .refine(
    (data) => (data.domainId !== undefined) !== (data.name !== undefined),
    {
      message: "Exactly one of 'domainId' or 'name' must be provided",
    },
  );

export const nameTokensRoute = {
  path: "/" as const,
  describe: describeRoute({
    tags: ["Explore"],
    summary: "Get Name Tokens",
    description:
      "Returns name tokens for the requested identifier (domainId or name)",
    responses: {
      200: {
        description: "Name tokens known",
        content: {
          "application/json": {
            schema: validationResolver(NameTokensResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid input",
        content: {
          "application/json": {
            schema: validationResolver(ErrorResponseSchema),
          },
        },
      },
      404: {
        description: "Name tokens not indexed",
        content: {
          "application/json": {
            schema: validationResolver(NameTokensResponseSchema),
          },
        },
      },
      503: {
        description: "Service unavailable",
        content: {
          "application/json": {
            schema: validationResolver(ErrorResponseSchema),
          },
        },
      },
    },
  }),
  queryValidation: validate("query", nameTokensQuerySchema),
};
