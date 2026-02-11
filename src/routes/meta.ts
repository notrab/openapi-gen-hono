/**
 * Meta API routes — mirrors apps/ensapi/src/handlers/ensnode-api.ts
 *
 * Imports route definitions from route-definitions.ts and wires them to
 * stub handlers. In the real codebase, config comes from buildEnsApiPublicConfig()
 * and indexing status from middleware context.
 */
import { Hono } from "hono";

import { configRoute, indexingStatusRoute } from "../route-definitions.js";

const app = new Hono();

app.get(configRoute.path, configRoute.describe, async (c) => {
  return c.json({ version: "0.0.1", namespace: "mainnet" });
});

app.get(indexingStatusRoute.path, indexingStatusRoute.describe, async (c) => {
  return c.json({ status: "ok" as const });
});

export default app;
