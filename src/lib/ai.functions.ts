import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateFinalText } from "./ai/gateway.server";
import {
  EMAIL_TONES,
  MAX_EMAIL_INPUT,
  MAX_RESEARCH_INPUT,
  RESEARCH_MODES,
  emailInstructions,
  emailPrompt,
  researchInstructions,
} from "./ai/prompts";

const emailSchema = z.object({
  instructions: z
    .string()
    .trim()
    .min(1, "Please describe the email you need.")
    .max(MAX_EMAIL_INPUT),
  tone: z.enum(EMAIL_TONES),
  recipient: z.string().trim().max(120).optional(),
  sender: z.string().trim().max(120).optional(),
});

const researchSchema = z.object({
  mode: z.enum(RESEARCH_MODES),
  input: z
    .string()
    .trim()
    .min(1, "Please enter a question or paste some text.")
    .max(MAX_RESEARCH_INPUT),
});

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
