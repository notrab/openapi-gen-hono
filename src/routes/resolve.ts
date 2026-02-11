/**
 * Resolution API routes — mirrors apps/ensapi/src/handlers/resolution-api.ts
 *
 * Imports route definitions from route-definitions.ts and wires them to
 * stub handlers. In the real codebase, the handlers call resolveForward(),
 * resolveReverse(), etc.
 */
import { Hono } from "hono";

import {
  resolveRecordsRoute,
  resolvePrimaryNameRoute,
} from "../route-definitions.js";

const app = new Hono();

app.get(
  resolveRecordsRoute.path,
  resolveRecordsRoute.describe,
  resolveRecordsRoute.paramValidation,
  resolveRecordsRoute.queryValidation,
  async (c) => {
    // In the real app, this calls resolveForward() etc.
    return c.json({
      records: { name: null },
      accelerationRequested: false,
      accelerationAttempted: false,
    });
  },
);

app.get(
  resolvePrimaryNameRoute.path,
  resolvePrimaryNameRoute.describe,
  resolvePrimaryNameRoute.paramValidation,
  resolvePrimaryNameRoute.queryValidation,
  async (c) => {
    // In the real app, this calls resolveReverse()
    return c.json({
      name: null,
      accelerationRequested: false,
      accelerationAttempted: false,
    });
  },
);

export default app;
