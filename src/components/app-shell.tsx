import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Mail, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", short: "Email", icon: Mail },
  { to: "/research", label: "Research Assistant", short: "Research", icon: Search },
  { to: "/chat", label: "AI Chatbot", short: "Chat", icon: MessagesSquare },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={logo} alt="" width={36} height={36} className="size-9 object-contain" />
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-foreground">Workplace AI</p>
        <p className="text-xs text-muted-foreground">Productivity Assistant</p>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-app">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="px-5 py-6">
          <Brand />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="m-3 rounded-lg border border-sidebar-border p-3 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-foreground">
            <ShieldCheck className="size-3.5 text-primary" /> Use AI responsibly
          </div>
          AI can make mistakes. Review outputs before sending or relying on them.
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center px-4">
          <Brand />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, ...rest }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="size-3.5" />
              {"short" in rest ? rest.short : label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="md:pl-64">{children}</main>
    </div>
  );
}
