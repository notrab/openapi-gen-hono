/**
 * App construction — used by server.ts for the runtime HTTP server.
 *
 * This module builds the Hono app with all route handlers registered.
 * The route handlers import their metadata from route-definitions.ts,
 * keeping this file focused on app assembly.
 *
 * Note: generate-openapi.ts does NOT import this file. It builds its own
 * lightweight Hono app from route-definitions.ts directly, avoiding any
 * runtime dependencies that handler files might bring.
 */
import { Hono } from "hono";

import metaRoutes from "./routes/meta.js";
import resolveRoutes from "./routes/resolve.js";
import exploreRoutes from "./routes/explore.js";

export const app = new Hono();

// Mount sub-routers (mirrors ensapi's app.route() calls)
app.route("/api", metaRoutes);
app.route("/api/resolve", resolveRoutes);
app.route("/api", exploreRoutes);
