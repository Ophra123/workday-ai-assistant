import { z } from "zod";

import { EMAIL_TONES, MAX_EMAIL_INPUT, MAX_RESEARCH_INPUT, RESEARCH_MODES } from "./prompts";

export const emailSchema = z.object({
  instructions: z
    .string()
    .trim()
    .min(1, "Please describe the email you need.")
    .max(MAX_EMAIL_INPUT),
  tone: z.enum(EMAIL_TONES),
  recipient: z.string().trim().max(120).optional(),
  sender: z.string().trim().max(120).optional(),
});

export const researchSchema = z.object({
  mode: z.enum(RESEARCH_MODES),
  input: z
    .string()
    .trim()
    .min(1, "Please enter a question or paste some text.")
    .max(MAX_RESEARCH_INPUT),
});
