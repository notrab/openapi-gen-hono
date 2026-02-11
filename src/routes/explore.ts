/**
 * Explore API routes — mirrors apps/ensapi/src/handlers/name-tokens-api.ts
 *
 * Demonstrates query parameter validation and multiple response codes.
 */
import { Hono } from "hono";
import {
  describeRoute,
  resolver as validationResolver,
  validator,
} from "hono-openapi";
import { z } from "zod";

const app = new Hono();

const NameTokensResponseSchema = z.object({
  tokens: z.array(
    z.object({
      label: z.string(),
      labelhash: z.string(),
    })
  ),
});

app.get(
  "/name-tokens",
  describeRoute({
    tags: ["Explore"],
    summary: "Get Name Tokens",
    description: "Returns name tokens for the requested identifier",
    responses: {
      200: {
        description: "Name tokens known",
        content: {
          "application/json": {
            schema: validationResolver(NameTokensResponseSchema),
          },
        },
      },
      400: {
        description: "Invalid input",
      },
      404: {
        description: "Name tokens not indexed",
      },
      503: {
        description: "Service unavailable",
      },
    },
  }),
  validator(
    "query",
    z.object({
      name: z.string().optional(),
      domainId: z.string().optional(),
    })
  ),
  async (c) => {
    return c.json({ tokens: [] });
  }
);

export default app;
