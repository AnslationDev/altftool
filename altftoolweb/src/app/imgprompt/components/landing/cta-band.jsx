"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../providers/auth-provider";
import { Button } from "../ui/button";
import { AuthDialog } from "../shared/auth-dialog";

export function CtaBand() {
  const router = useRouter();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState(undefined);

  const goToStudio = (href) => {
    if (user) {
      router.push(href);
    } else {
      setRedirectTo(href);
      setAuthOpen(true);
    }
  };

  const handleOpenStudio = () => goToStudio("/imgprompt/studio/prompt-generator");
  const handleExploreLibrary = () => goToStudio("/imgprompt/studio/trending");

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/15 via-card/40 to-brand-blue/10 px-6 py-16 text-center sm:px-16"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-purple/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Start free — no credit card
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Your next masterpiece starts with a <span className="text-gradient-brand">better prompt</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Generate, score and optimize prompts in seconds — then copy straight into OpenArt and render.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={handleOpenStudio}>
                <Sparkles className="h-4 w-4" /> Open Prompt Studio
              </Button>
              <Button size="lg" variant="outline" onClick={handleExploreLibrary}>
                Explore Library <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode="signup" redirectTo={redirectTo} />
    </section>
  );
}
