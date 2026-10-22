import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessagesSquare, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import logo from "@/assets/logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AiDisclaimer, CopyButton, ErrorNotice, PageHeader } from "@/components/tool-kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace Assistant" },
      {
        name: "description",
        content: "Have natural, contextual conversations with an AI assistant for your work.",
      },
      { property: "og:title", content: "AI Workplace Chatbot" },
      {
        property: "og:description",
        content: "A contextual AI chat assistant that remembers your conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "workplace-ai-chat-v1";

const SUGGESTIONS = [
  "Help me plan my week around three big deadlines",
  "How do I give constructive feedback to a teammate?",
  "Draft an agenda for a 30-minute project kickoff",
];

function loadMessages(): UIMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    setInitial(loadMessages());
  }, []);

  function newConversation() {
    window.localStorage.removeItem(STORAGE_KEY);
    setInitial([]);
    setSession((s) => s + 1);
  }

  return (
    <div className="mx-auto flex h-workspace max-w-4xl flex-col px-4 py-4 md:px-8 md:py-8">
      <PageHeader
        icon={<MessagesSquare className="size-5" />}
        title="AI Chatbot"
        description="Conversation is saved in this browser."
        actions={
          <Button variant="secondary" size="sm" onClick={newConversation}>
            <Plus /> New conversation
          </Button>
        }
      />
      <div className="surface-card mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
        {initial === null ? (
          <div className="flex flex-1 items-center justify-center">
            <Shimmer>Loading conversation…</Shimmer>
          </div>
        ) : (
          <ChatWindow key={session} initialMessages={initial} />
        )}
      </div>
    </div>
  );
}

function ChatWindow({ initialMessages }: { initialMessages: UIMessage[] }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: "workplace-chat",
    messages: initialMessages,
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    try {
      if (messages.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable: chat still works for this session.
    }
  }, [messages, status]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      setValidation("Type a message before sending.");
      return;
    }
    if (busy) return;
    setValidation(null);
    clearError();
    void sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSubmit(message: PromptInputMessage) {
    send(message.text);
  }

  const last = messages[messages.length - 1];
  const waiting = status === "submitted" || (status === "streaming" && last?.role !== "assistant");

  return (
    <>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-6 p-4 md:p-6">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <img src={logo} alt="" width={64} height={64} className="size-16 object-contain" />
              <div className="space-y-1">
                <h3 className="font-display text-base font-semibold text-foreground">
                  How can I help with your work today?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask anything — I'll keep track of the conversation.
                </p>
              </div>
              <div className="mt-2 flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-input bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:border-primary hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => {
              const text = message.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");
              const isUser = message.role === "user";
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent
                    className={
                      isUser
                        ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                        : "w-full leading-relaxed"
                    }
                  >
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        isUser ? (
                          <p key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </p>
                        ) : (
                          <MessageResponse
                            key={i}
                            isAnimating={status === "streaming" && message.id === last?.id}
                          >
                            {part.text}
                          </MessageResponse>
                        )
                      ) : null,
                    )}
                    {!isUser && !text && status === "streaming" && message.id === last?.id && (
                      <Shimmer>Thinking…</Shimmer>
                    )}
                  </MessageContent>
                  {!isUser && text && !(busy && message.id === last?.id) && (
                    <MessageActions>
                      <CopyButton text={text} size="icon" variant="ghost" />
                    </MessageActions>
                  )}
                </Message>
              );
            })
          )}
          {waiting && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3 md:p-4">
        {error && (
          <div className="mb-3">
            <ErrorNotice message={error.message || "Something went wrong. Please try again."} />
          </div>
        )}
        {validation && <p className="mb-2 text-sm text-destructive">{validation}</p>}
        <PromptInput onSubmit={handleSubmit} className="bg-background/60">
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (validation) setValidation(null);
            }}
            placeholder="Message the assistant…"
            aria-label="Chat message"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
        <AiDisclaimer className="mt-2" />
      </div>
    </>
  );
}
