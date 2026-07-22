"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { History, Star, Bookmark, TrendingUp, Users, FolderOpen, Frown } from "lucide-react";
import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import { TRENDING_PROMPTS } from "../../data/prompts";
import { COLLECTIONS } from "../../data/packs";
import { CREATORS } from "../../data/creators";
import { Workspace } from "../../components/studio/workspace";
import { Dashboard } from "../../components/studio/dashboard";
import { HistoryView } from "../../components/studio/history-view";
import { SettingsView } from "../../components/studio/settings-view";
import { PromptCard } from "../../components/shared/prompt-card";
import { CollectionCard } from "../../components/shared/collection-card";
import { CreatorCard } from "../../components/shared/creator-card";
import { Button } from "../../components/ui/button";

function GridHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export default function StudioToolPage() {
  const params = useParams();
  const slug = String(params.tool);
  const item = NAV_ITEMS_BY_SLUG[slug];

  if (!item) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <Frown className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 font-display text-xl font-bold">Tool not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The studio tool "{slug}" doesn&apos;t exist.</p>
        <Button className="mt-6" asChild><Link href="/imgprompt/studio">Back to dashboard</Link></Button>
      </div>
    );
  }

  switch (slug) {
    case "dashboard":
      return <Dashboard />;
    case "settings":
      return <SettingsView />;
    case "history":
      return <HistoryView filter="all" title="Prompt History" subtitle="Every prompt you've generated, saved on your device." icon={History} />;
    case "favorites":
      return <HistoryView filter="favorites" title="Favorites" subtitle="Your starred, best-performing prompts." icon={Star} />;
    case "saved":
      return <HistoryView filter="favorites" title="Saved Prompts" subtitle="Prompts you've bookmarked for later." icon={Bookmark} />;
    case "trending":
      return (
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <GridHeader icon={TrendingUp} title="Trending Prompts" subtitle="What creators are rendering most right now." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TRENDING_PROMPTS.map((p, i) => <PromptCard key={p.id} prompt={p} index={i} />)}
          </div>
        </div>
      );
    case "collections":
      return (
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <GridHeader icon={FolderOpen} title="Collections" subtitle="Curated prompt drops from editors & top creators." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c, i) => <CollectionCard key={c.id} collection={c} index={i} />)}
          </div>
        </div>
      );
    case "community":
      return (
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <GridHeader icon={Users} title="Community" subtitle="Follow and remix prompts from verified creators." />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {CREATORS.map((c, i) => <CreatorCard key={c.id} creator={c} index={i} />)}
          </div>
        </div>
      );
    default:
      return <Workspace tool={item} />;
  }
}
