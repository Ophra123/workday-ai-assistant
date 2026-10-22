import { AlertCircle, Check, Copy, ShieldAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "secondary",
}: {
  text: string;
  label?: string;
  size?: "sm" | "icon";
  variant?: "secondary" | "ghost";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  const Icon = state === "copied" ? Check : Copy;
  const text_ = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label;

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={copy}
      disabled={!text}
      aria-label={size === "icon" ? text_ : undefined}
    >
      <Icon className={cn(state === "copied" && "text-success")} />
      {size !== "icon" && text_}
    </Button>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-xs text-muted-foreground", className)}>
      <ShieldAlert className="mt-px size-3.5 shrink-0 text-warning" />
      <span>
        AI-generated content can be inaccurate or incomplete. Review and edit before using it, and
        avoid sharing confidential or personal information.
      </span>
    </p>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className="rounded-lg border border-input bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
