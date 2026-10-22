import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  AiDisclaimer,
  CopyButton,
  ErrorNotice,
  PageHeader,
  Segmented,
} from "@/components/tool-kit";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { runResearch } from "@/lib/ai.functions";
import { MAX_RESEARCH_INPUT, type ResearchMode } from "@/lib/ai/prompts";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Ask questions, summarise pasted text, extract key insights and get practical recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Answers, summaries, key insights and recommendations for your work topics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const MODES: readonly { value: ResearchMode; label: string }[] = [
  { value: "question", label: "Answer a question" },
  { value: "summarise", label: "Summarise text" },
  { value: "insights", label: "Key insights" },
  { value: "recommendations", label: "Recommendations" },
];

const MODE_COPY: Record<ResearchMode, { label: string; placeholder: string; empty: string }> = {
  question: {
    label: "Your question or topic",
    placeholder: "e.g. What are the pros and cons of a four-day work week for a 50-person company?",
    empty: "Please enter a question or topic.",
  },
  summarise: {
    label: "Text to summarise",
    placeholder: "Paste an article, report, meeting notes or email thread…",
    empty: "Please paste the text you want summarised.",
  },
  insights: {
    label: "Text or topic to analyse",
    placeholder: "Paste a report or notes, or describe a topic to extract key insights from…",
    empty: "Please paste text or describe a topic.",
  },
  recommendations: {
    label: "Describe your situation or goal",
    placeholder:
      "e.g. Our team misses deadlines because priorities change weekly. How can we improve?",
    empty: "Please describe your situation or goal.",
  },
};

function ResearchPage() {
  const research = useServerFn(runResearch);
  const [mode, setMode] = useState<ResearchMode>("question");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tab, setTab] = useState("preview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const copy = MODE_COPY[mode];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!input.trim()) {
      setValidation(copy.empty);
      return;
    }
    setValidation(null);
    setError(null);
    setLoading(true);
    try {
      const res = await research({ data: { mode, input } });
      if (res.ok) {
        setOutput(res.text);
        setTab("preview");
      } else setError(res.error);
    } catch {
      setError("Couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        icon={<Search className="size-5" />}
        title="Research Assistant"
        description="Get answers, summaries, insights and recommendations."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="surface-card flex flex-col gap-4 p-5" noValidate>
          <div className="space-y-2">
            <Label>What do you need?</Label>
            <Segmented
              value={mode}
              onChange={(m) => {
                setMode(m);
                setValidation(null);
              }}
              options={MODES}
              label="Research task"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="research-input">{copy.label}</Label>
              <span className="text-xs text-muted-foreground">
                {input.length.toLocaleString()} / {MAX_RESEARCH_INPUT.toLocaleString()}
              </span>
            </div>
            <Textarea
              id="research-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (validation) setValidation(null);
              }}
              maxLength={MAX_RESEARCH_INPUT}
              rows={12}
              placeholder={copy.placeholder}
              aria-invalid={!!validation}
              aria-describedby={validation ? "research-error" : undefined}
              className="bg-background/60"
            />
            {validation && (
              <p id="research-error" className="text-sm text-destructive">
                {validation}
              </p>
            )}
          </div>

          <Button type="submit" variant="glow" disabled={loading} className="h-10">
            <Wand2 />
            {loading ? "Researching…" : "Run research"}
          </Button>
        </form>

        <section className="surface-card flex min-h-[22rem] flex-col p-5" aria-live="polite">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Results</h2>
              <div className="flex items-center gap-2">
                {output && !loading && (
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>
                )}
                <CopyButton text={output} />
              </div>
            </div>

            {error && <ErrorNotice message={error} />}

            {loading ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border">
                <Shimmer>Researching…</Shimmer>
              </div>
            ) : output ? (
              <>
                <TabsContent value="preview" className="flex-1">
                  <div className="max-h-[32rem] overflow-y-auto rounded-lg bg-background/40 p-4 text-sm leading-relaxed">
                    <MessageResponse>{output}</MessageResponse>
                  </div>
                </TabsContent>
                <TabsContent value="edit" className="flex flex-1 flex-col">
                  <Textarea
                    aria-label="Research results (editable)"
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="min-h-[20rem] flex-1 bg-background/60 font-mono text-xs leading-relaxed"
                  />
                </TabsContent>
              </>
            ) : (
              !error && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Results will appear here. You can preview, edit and copy them.
                </div>
              )
            )}
          </Tabs>
          <AiDisclaimer className="mt-4" />
        </section>
      </div>
    </div>
  );
}
