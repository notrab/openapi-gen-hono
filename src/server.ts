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

import { app } from "./app.js";

// Register the runtime /openapi.json endpoint (same as the current ensapi behaviour)
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
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
        { url: "http://localhost:3000", description: "Local Development" },
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
  }),
);

const port = 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
  console.log(`OpenAPI spec: http://localhost:${info.port}/openapi.json`);
});
