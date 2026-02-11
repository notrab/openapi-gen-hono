#!/usr/bin/env tsx

/**
 * Server entrypoint — imports the app and starts the HTTP server.
 *
 * This is what apps/ensapi/src/index.ts would look like after the refactor:
 * it imports the pre-built app and only handles server lifecycle concerns.
 *
 * The /openapi.json endpoint is registered here as a runtime convenience,
 * but the spec can also be generated at build-time via generate-openapi.ts.
 */
import { serve } from "@hono/node-server";
import { openAPIRouteHandler } from "hono-openapi";

import { app, openAPIDocumentation } from "./app.js";

// Register the runtime /openapi.json endpoint (same as the current ensapi behaviour)
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, { documentation: openAPIDocumentation }),
);

const port = 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
  console.log(`OpenAPI spec: http://localhost:${info.port}/openapi.json`);
});
