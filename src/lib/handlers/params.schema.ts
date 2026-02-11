/**
 * Shared parameter schemas for route validation.
 *
 * Mirrors apps/ensapi/src/lib/handlers/params.schema.ts — centralizes
 * reusable Zod schemas for path params, query params, and transforms.
 *
 * In the real codebase these use SDK validators (makeLowercaseAddressSchema,
 * makeCoinTypeStringSchema, etc.). Here we use simplified equivalents.
 */
import { z } from "zod";

const boolstring = z
  .string()
  .pipe(z.enum(["true", "false"]))
  .transform((val) => val === "true");

const name = z
  .string()
  .min(1, "Name must not be empty")
  .refine((val) => val.includes("."), "Must be a valid ENS name (e.g. example.eth)");

const trace = z.optional(boolstring).default(false);
const accelerate = z.optional(boolstring).default(false);

const address = z
  .string()
  .regex(/^0x[a-f0-9]{40}$/i, "Must be a valid Ethereum address")
  .transform((val) => val.toLowerCase());

const defaultableChainId = z.string().regex(/^\d+$/, "Must be a numeric chain ID");

const coinType = z.string().min(1);

const selectionParams = z.object({
  name: z.string().optional(),
  addresses: z.string().optional(),
  texts: z.string().optional(),
});

const stringarray = z
  .string()
  .transform((val) => val.split(","))
  .pipe(z.array(z.string().min(1)).min(1));

const selection = z
  .object({
    name: z.optional(boolstring),
    addresses: z.optional(stringarray.pipe(z.array(coinType))),
    texts: z.optional(stringarray),
  })
  .transform((value) => {
    const result: Record<string, unknown> = {};
    if (value.name) result.name = true;
    if (value.addresses) result.addresses = value.addresses;
    if (value.texts) result.texts = value.texts;

    if (Object.keys(result).length === 0) {
      throw new Error("Selection cannot be empty");
    }

    return result;
  });

export const params = {
  boolstring,
  name,
  trace,
  accelerate,
  address,
  defaultableChainId,
  coinType,
  selectionParams,
  selection,
  stringarray,
};
