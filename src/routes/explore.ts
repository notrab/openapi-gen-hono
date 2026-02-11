/**
 * Explore API routes — mirrors apps/ensapi/src/handlers/name-tokens-api.ts
 *
 * Imports route definitions from route-definitions.ts and wires them to
 * stub handlers. In the real codebase, this calls findRegisteredNameTokensForDomain().
 */
import { Hono } from "hono";

import { nameTokensRoute } from "../route-definitions.js";

const app = new Hono();

app.get(
  nameTokensRoute.path,
  nameTokensRoute.describe,
  nameTokensRoute.queryValidation,
  async (c) => {
    return c.json({ tokens: [] });
  },
);

export default app;
