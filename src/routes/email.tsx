import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, RotateCcw, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  AiDisclaimer,
  CopyButton,
  ErrorNotice,
  PageHeader,
  Segmented,
} from "@/components/tool-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { EMAIL_TONES, MAX_EMAIL_INPUT, type EmailTone } from "@/lib/ai/prompts";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — AI Workplace Assistant" },
      {
        name: "description",
        content: "Generate complete, natural emails in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "AI Email Generator" },
      {
        property: "og:description",
        content: "Describe what you need and get a ready-to-edit email in the tone you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONE_OPTIONS = EMAIL_TONES.map((t) => ({ value: t, label: t }));

function EmailPage() {
  const generate = useServerFn(generateEmail);
  const [instructions, setInstructions] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<EmailTone>("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (loading) return;
    if (!instructions.trim()) {
      setValidation("Please describe the email you want to write.");
      return;
    }
    setValidation(null);
    setError(null);
    setLoading(true);
    try {
      const res = await generate({
        data: {
          instructions,
          tone,
          recipient: recipient || undefined,
          sender: sender || undefined,
        },
      });
      if (res.ok) setOutput(res.text);
      else setError(res.error);
    } catch {
      setError("Couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        icon={<Mail className="size-5" />}
        title="Email Generator"
        description="Describe the email you need and choose a tone."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="surface-card flex flex-col gap-4 p-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="instructions">What should the email say?</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value);
                if (validation) setValidation(null);
              }}
              maxLength={MAX_EMAIL_INPUT}
              rows={7}
              placeholder="e.g. Ask my manager for Friday off to attend a family event, offer to finish the report by Thursday."
              aria-invalid={!!validation}
              aria-describedby={validation ? "instructions-error" : undefined}
              className="bg-background/60"
            />
            {validation && (
              <p id="instructions-error" className="text-sm text-destructive">
                {validation}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                maxLength={120}
                placeholder="e.g. Sarah, Head of Sales"
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender">Your name (optional)</Label>
              <Input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                maxLength={120}
                placeholder="e.g. Thabo"
                className="bg-background/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Segmented value={tone} onChange={setTone} options={TONE_OPTIONS} label="Tone" />
          </div>

          <Button type="submit" variant="glow" disabled={loading} className="mt-1 h-10">
            <Wand2 />
            {loading ? "Writing…" : "Generate email"}
          </Button>
        </form>

        <section className="surface-card flex min-h-[22rem] flex-col p-5" aria-live="polite">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Your email</h2>
            <div className="flex gap-2">
              {output && !loading && (
                <Button type="button" size="sm" variant="ghost" onClick={() => onSubmit()}>
                  <RotateCcw /> Regenerate
                </Button>
              )}
              <CopyButton text={output} />
            </div>
          </div>

          {error && <ErrorNotice message={error} />}

          {loading ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border">
              <Shimmer>Drafting your email…</Shimmer>
            </div>
          ) : output ? (
            <Textarea
              aria-label="Generated email (editable)"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[18rem] flex-1 bg-background/60 font-sans leading-relaxed"
            />
          ) : (
            !error && (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Your generated email will appear here. You can edit it before copying.
              </div>
            )
          )}

          <AiDisclaimer className="mt-4" />
        </section>
      </div>
    </div>
  );
}
