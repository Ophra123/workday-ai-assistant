import { createServerFn } from "@tanstack/react-start";

import { generateFinalText } from "./ai/gateway.server";
import { emailInstructions, emailPrompt, researchInstructions } from "./ai/prompts";
import { emailSchema, researchSchema } from "./ai/schemas";

function missingKey() {
  return { ok: false as const, error: "The AI service isn't configured for this app yet." };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return missingKey();
    return generateFinalText(apiKey, emailInstructions(data.tone), emailPrompt(data));
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return missingKey();
    return generateFinalText(apiKey, researchInstructions(data.mode), data.input);
  });
