import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MessagesSquare, Search } from "lucide-react";

import { AiDisclaimer } from "@/components/tool-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your AI workplace assistant: generate emails, research and summarise topics, and chat for quick help.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Generate emails, research topics and chat with an AI assistant built for work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Email Generator",
    description:
      "Turn quick instructions into complete emails in a formal, friendly or persuasive tone.",
  },
  {
    to: "/research",
    icon: Search,
    title: "Research Assistant",
    description:
      "Answer questions, summarise pasted text, extract key insights and get recommendations.",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "AI Chatbot",
    description: "Talk through ideas with an assistant that remembers your conversation.",
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <p className="text-sm font-medium text-primary">AI Workplace Productivity Assistant</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-foreground md:text-4xl">
        Get your everyday work done <span className="text-gradient">faster</span>.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Pick a tool to draft emails, make sense of information, or think through a problem.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group surface-card flex flex-col p-5 transition-colors hover:border-primary/60"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <AiDisclaimer className="mt-10 max-w-2xl" />
    </div>
  );
}
