`hono-openapi` exports a `generateSpecs(app, options)` function that walks the
Hono route tree and collects `describeRoute()` metadata. It only needs the `app`
instance with its routes registered **not a running HTTP server**.

This means we can generate OpenAPI specs at build-time by importing the app
module directly, instead of starting a server, polling for readiness, fetching
`/openapi.json` via HTTP, and killing the process.

```
src/
  routes/
    meta.ts        # Route handlers with describeRoute()  mirrors ensapi handlers
    resolve.ts
    explore.ts
  app.ts           # Builds the Hono app, exports it + OpenAPI docs config
  server.ts        # Imports app, starts HTTP server (runtime entrypoint)
  generate-openapi.ts  # Imports app, calls generateSpecs() directly (build-time)
```

The key split is between `app.ts` (app construction) and `server.ts` (server
lifecycle). Both `server.ts` and `generate-openapi.ts` import the same `app`
one starts a server, the other generates the spec and exits.

## Try it

```bash
pnpm install

# Generate the spec (no server started)
pnpm generate

# Or start the server and hit /openapi.json to compare
pnpm serve
# curl http://localhost:3000/openapi.json
```

The output from `pnpm generate` and `curl /openapi.json` should be identical.

## ensapi todos

1. Extract app construction from `apps/ensapi/src/index.ts` into `src/app.ts`
2. `src/index.ts` imports `app` and calls `serve()` (runtime only)
3. A new `src/generate-openapi.ts` imports `app` and calls `generateSpecs()` directly
4. No server started, no polling, no mock config, no guard middleware

The main challenge is the `import config from "@/config"` chain. It's used in
~26 files and triggers an eager `await buildConfigFromEnvironment(process.env)`
at import time, which validates env vars and makes an HTTP request to ENSIndexer.

Options to break this coupling:

1. **Lazy config** change `@/config` to export a `getConfig()` function that
   resolves on first call. Handlers call it at request time, not import time.
   The generate script never handles a request, so config is never resolved.

2. **Dependency injection** route registration functions accept config as a
   parameter. `app.ts` calls them without config (just registers routes),
   `server.ts` injects the real config at startup.

3. **Keep OPENAPI_GENERATE_MODE as a stepping stone** use the existing mock
   config path to prove the approach works, then migrate to lazy config later.
