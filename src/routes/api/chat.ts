import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, validateUIMessages, type UIMessage } from "ai";

import {
  createGatewayModel,
  describeAiError,
  responsesProviderOptions,
} from "@/lib/ai/gateway.server";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts";
import {
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id.server";

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return jsonError(500, "The AI service isn't configured for this app yet.");

        let messages: UIMessage[];
        try {
          const body = (await request.json()) as { messages?: unknown };
          messages = await validateUIMessages({ messages: body.messages });
        } catch {
          return jsonError(400, "Invalid chat request.");
        }
        if (messages.length === 0 || messages.length > 200) {
          return jsonError(400, "Invalid conversation length.");
        }

        const { model, runIdFetch } = createGatewayModel(
          apiKey,
          getLovableAiGatewayRunId(request),
        );
        const result = streamText({
          model,
          instructions: CHAT_INSTRUCTIONS,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: responsesProviderOptions,
        });

        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages,
            sendReasoning: true,
            onError: (error) => {
              const info = describeAiError(error);
              console.error("Chat stream failed", info.status, error);
              return info.message;
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
