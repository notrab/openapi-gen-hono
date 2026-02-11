/**
 * App construction — separated from server startup.
 *
 * This module builds the fully-configured Hono app with all routes registered.
 * It can be imported by:
 *   1. src/server.ts  — to start the HTTP server (runtime)
 *   2. src/generate-openapi.ts — to generate the OpenAPI spec (build-time, no server)
 *
 * This is the core of the proposal: describeRoute() metadata is attached to
 * route handlers at import time. generateSpecs() from hono-openapi can then
 * walk app.routes to collect it — no HTTP server needed.
 */
import { Hono } from "hono";
import type { OpenAPIRouteHandlerConfig } from "hono-openapi";

import metaRoutes from "./routes/meta.js";
import resolveRoutes from "./routes/resolve.js";
import exploreRoutes from "./routes/explore.js";

// Build the app — register middleware and mount route handlers.
// This mirrors apps/ensapi/src/index.ts but without server startup.
export const app = new Hono();

// Mount sub-routers (mirrors ensapi's app.route() calls)
app.route("/api", metaRoutes);
app.route("/api/resolve", resolveRoutes);
app.route("/api", exploreRoutes);

// OpenAPI documentation config — exported separately so both the
// runtime /openapi.json endpoint and the build-time script can use it.
export const openAPIDocumentation: OpenAPIRouteHandlerConfig["documentation"] = {
  info: {
    title: "ENSApi APIs",
    version: "0.0.1",
    description:
      "APIs for ENS resolution, navigating the ENS nameforest, and metadata about an ENSNode",
  },
  servers: [
    { url: "https://api.alpha.ensnode.io", description: "ENSNode Alpha (Mainnet)" },
    { url: "https://api.alpha-sepolia.ensnode.io", description: "ENSNode Alpha (Sepolia Testnet)" },
    { url: "http://localhost:3000", description: "Local Development" },
  ],
  tags: [
    { name: "Resolution", description: "APIs for resolving ENS names and addresses" },
    { name: "Meta", description: "APIs for indexing status, configuration, and realtime monitoring" },
    { name: "Explore", description: "APIs for exploring the indexed state of ENS" },
  ],
};
