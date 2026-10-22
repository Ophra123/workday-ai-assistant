import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText, type ModelMessage } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const CHAT_MODEL = "openai/gpt-6-astra";

/** Request-scoped Responses-API model through Lovable AI Gateway. */
export function createGatewayModel(apiKey: string, initialRunId?: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { model: provider.responses(CHAT_MODEL), runIdFetch };
}

export const responsesProviderOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
};

export type AiErrorInfo = { status: number; message: string };

function findApiCallError(error: unknown, depth = 0): APICallError | undefined {
  if (!error || depth > 5) return undefined;
  if (APICallError.isInstance(error)) return error;
  if (typeof error === "object" && "cause" in error) {
    return findApiCallError((error as { cause?: unknown }).cause, depth + 1);
  }
  return undefined;
}

function safeBodyMessage(body: string | undefined): string | undefined {
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: { message?: unknown } };
    const msg = parsed.message ?? parsed.error?.message;
    return typeof msg === "string" && msg.length < 400 ? msg : undefined;
  } catch {
    return undefined;
  }
}

/** Map gateway/provider failures to a user-safe message and status. */
export function describeAiError(error: unknown): AiErrorInfo {
  const apiError = findApiCallError(error);
  const status = apiError?.statusCode ?? 500;
  const bodyMessage = safeBodyMessage(apiError?.responseBody);
  switch (status) {
    case 400:
      return {
        status,
        message: "The request couldn't be processed. Try shortening or rephrasing your input.",
      };
    case 401:
      return { status, message: "The AI service isn't configured correctly for this app." };
    case 402:
      return {
        status,
        message:
          bodyMessage ??
          "AI credits for this workspace have run out. Add credits in your Lovable workspace to continue.",
      };
    case 403:
      return {
        status,
        message: bodyMessage ?? "AI access is currently blocked for this workspace.",
      };
    case 429:
      return {
        status,
        message: "Too many requests right now. Please wait a moment and try again.",
      };
    default:
      return {
        status,
        message: "The AI service is temporarily unavailable. Please try again in a moment.",
      };
  }
}

/** Stream a one-shot completion server-side and return the final text. */
export async function generateFinalText(
  apiKey: string,
  instructions: string,
  prompt: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const { model } = createGatewayModel(apiKey);
  let streamError: unknown;
  try {
    const messages: ModelMessage[] = [{ role: "user", content: prompt }];
    const result = streamText({
      model,
      instructions,
      messages,
      providerOptions: responsesProviderOptions,
      onError: ({ error }) => {
        streamError = error;
      },
    });
    const text = (await result.text).trim();
    if (streamError) throw streamError;
    if (!text) {
      return { ok: false, error: "The AI returned an empty response. Please try again." };
    }
    return { ok: true, text };
  } catch (error) {
    const info = describeAiError(streamError ?? error);
    console.error("AI generation failed", info.status, streamError ?? error);
    return { ok: false, error: info.message };
  }
}
