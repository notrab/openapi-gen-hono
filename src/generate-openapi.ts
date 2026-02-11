#!/usr/bin/env tsx

/**
 * Generate the OpenAPI spec directly from the Hono app — no server required.
 *
 * This is the key insight: hono-openapi exports generateSpecs() which walks
 * the Hono route tree and collects describeRoute() metadata. It only needs
 * the app instance, not a running HTTP server.
 *
 * Usage:
 *   pnpm generate                         # writes to stdout
 *   pnpm generate > openapi/ensapi.json   # writes to file
 */
import { generateSpecs } from "hono-openapi";
import { app, openAPIDocumentation } from "./app.js";

const spec = await generateSpecs(app, {
  documentation: openAPIDocumentation,
});

// We can put this wherever
process.stdout.write(JSON.stringify(spec, null, 2) + "\n");
