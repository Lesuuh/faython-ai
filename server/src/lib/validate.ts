import { ZodError, type ZodTypeAny } from "zod";
import { badRequest } from "../lib/errors.js";

export function validate<T extends ZodTypeAny>(schema: T) {
  return (data: unknown): ZodTypeAny extends T ? unknown : T["_output"] => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const first = result.error.errors[0];
      const message = first
        ? `${first.path.join(".") || "input"}: ${first.message}`
        : result.error.message;
      throw badRequest(message);
    }
    return result.data;
  };
}