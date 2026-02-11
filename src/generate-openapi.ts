#!/usr/bin/env tsx

/**
 * Build-time OpenAPI spec generator.
 *
 * Constructs a Hono app from route definitions only (no runtime imports)
 * and uses generateSpecs to produce the OpenAPI JSON spec.
 *
 * This is the key insight: by importing only from route-definitions.ts,
 * this script avoids all runtime dependencies (config, database, caches,
 * middleware) that would otherwise require a running server or environment.
 *
 * Usage:
 *   pnpm generate                         # writes to stdout
 *   pnpm generate > openapi/spec.json     # writes to file
 */
import { Hono } from "hono";
import { generateSpecs } from "hono-openapi";

import {
  // Resolution API
  resolveRecordsRoute,
  resolvePrimaryNameRoute,
  // Meta API
  configRoute,
  indexingStatusRoute,
  // Explore: Name Tokens
  nameTokensRoute,
} from "./route-definitions.js";

// No-op handler — generateSpecs never calls handlers, it only reads metadata
const noop = async () => new Response();

// ── Build the spec-only app mirroring the real route tree ───────

// /api sub-routes
const ensNodeApi = new Hono();
ensNodeApi.get(configRoute.path, configRoute.describe, noop);
ensNodeApi.get(indexingStatusRoute.path, indexingStatusRoute.describe, noop);

// /api/resolve sub-routes
const resolutionApi = new Hono();
resolutionApi.get(
  resolveRecordsRoute.path,
  resolveRecordsRoute.describe,
  resolveRecordsRoute.paramValidation,
  resolveRecordsRoute.queryValidation,
  noop,
);
resolutionApi.get(
  resolvePrimaryNameRoute.path,
  resolvePrimaryNameRoute.describe,
  resolvePrimaryNameRoute.paramValidation,
  resolvePrimaryNameRoute.queryValidation,
  noop,
);

// /api/name-tokens sub-routes
const nameTokensApi = new Hono();
nameTokensApi.get(
  nameTokensRoute.path,
  nameTokensRoute.describe,
  nameTokensRoute.queryValidation,
  noop,
);

// Mount sub-routes under /api
ensNodeApi.route("/resolve", resolutionApi);
ensNodeApi.route("/name-tokens", nameTokensApi);

// ── Root app ────────────────────────────────────────────────────

const app = new Hono();
app.route("/api", ensNodeApi);

// ── Generate spec ───────────────────────────────────────────────

const spec = await generateSpecs(app, {
  documentation: {
    info: {
      title: "ENSApi APIs",
      version: "0.0.1",
      description:
        "APIs for ENS resolution, navigating the ENS nameforest, and metadata about an ENSNode",
    },
    servers: [
      {
        url: "https://api.alpha.ensnode.io",
        description: "ENSNode Alpha (Mainnet)",
      },
      {
        url: "https://api.alpha-sepolia.ensnode.io",
        description: "ENSNode Alpha (Sepolia Testnet)",
      },
    ],
    tags: [
      {
        name: "Resolution",
        description: "APIs for resolving ENS names and addresses",
      },
      {
        name: "Meta",
        description:
          "APIs for indexing status, configuration, and realtime monitoring",
      },
      {
        name: "Explore",
        description: "APIs for exploring the indexed state of ENS",
      },
    ],
  },
});

process.stdout.write(JSON.stringify(spec, null, 2) + "\n");
