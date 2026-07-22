"use client";

import * as React from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Sliders, Link2, KeyRound, ShieldAlert } from "lucide-react";
import { useAuth } from "../../providers/auth-provider";
import { useStudio } from "../../store/studio";
import { useRedirectConfig } from "../../store/redirect-config";
import { IMAGE_MODELS } from "../../data/models";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

function Card({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground/[0.04]"><Icon className="h-4 w-4 text-primary" /></span>
        <div>
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsView() {
  const { user, authConfigured, signOut } = useAuth();
  const modelId = useStudio((s) => s.modelId);
  const setModelId = useStudio((s) => s.setModelId);
  const clearHistory = useStudio((s) => s.clearHistory);
  const destinationUrl = useRedirectConfig((s) => s.redirectUrl);
  const [autoRedirect, setAutoRedirect] = React.useState(true);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
          <SettingsIcon className="h-5 w-5 text-white" />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, defaults and integrations.</p>
        </div>
      </div>

      <div className="space-y-5">
        <Card icon={User} title="Profile" desc="Your creator identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input defaultValue={user?.name ?? "Creator"} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue={user?.email ?? "creator@imaginnex.ai"} readOnly />
            </div>
          </div>
        </Card>

        <Card icon={Sliders} title="Studio Defaults" desc="Pre-fill new prompts">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Default Model</Label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4">
              <div>
                <div className="text-sm font-medium">Auto-redirect to OpenArt</div>
                <div className="text-xs text-muted-foreground">After copying a prompt</div>
              </div>
              <Switch checked={autoRedirect} onCheckedChange={setAutoRedirect} />
            </div>
          </div>
        </Card>

        <Card icon={Link2} title="Redirect Destination" desc="Where copied prompts open">
          <div className="flex items-center gap-2">
            <Input readOnly value={destinationUrl} className="font-mono text-sm" />
            <Button variant="outline" asChild><a href={destinationUrl} target="_blank" rel="noopener noreferrer">Open</a></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Managed from the admin panel (Firestore: <code className="rounded bg-foreground/5 px-1">projects/altftool/lookoutLinks</code>,
            the active entry) — change it there any time, e.g. to an affiliate link, with no rebuild. Falls back to
            OpenArt if nothing is active.
          </p>
        </Card>

        <Card icon={KeyRound} title="OpenAI Integration" desc="Real generations, powered by your key">
          <div className={`rounded-xl border p-4 text-sm ${authConfigured ? "border-emerald-500/20 bg-emerald-500/[0.05] text-foreground/85" : "border-primary/20 bg-primary/[0.05] text-foreground/85"}`}>
            The prompt engine reads{" "}
            <code className="rounded bg-foreground/5 px-1 text-xs">OPENAI_API_KEY</code> from{" "}
            <code className="rounded bg-foreground/5 px-1 text-xs">.env.local</code> server-side. When it&apos;s set, every
            generation calls OpenAI directly; without it (or if a call fails), the built-in deterministic engine takes over
            automatically so the studio never breaks.
          </div>
        </Card>

        <Card icon={ShieldAlert} title="Data & Privacy" desc="Your prompts stay on your device">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { clearHistory(); toast.success("Local history cleared"); }}>
              Clear prompt history
            </Button>
            {user && <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign out</Button>}
          </div>
        </Card>
      </div>
    </div>
  );
}
