"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { PromptThumb } from "./prompt-thumb";

export function CreatorCard({ creator, index = 0 }) {
  const initials = creator.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      className="group overflow-hidden rounded-2xl border border-border bg-card/50 card-hover"
    >
      <div className="relative h-20">
        <PromptThumb seed={creator.avatarSeed + "cover"} rounded="rounded-none" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>
      <div className="-mt-8 flex flex-col items-center px-5 pb-5 text-center">
        <Avatar className="h-16 w-16 ring-4 ring-card">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="mt-3 flex items-center gap-1">
          <h3 className="font-display font-semibold">{creator.name}</h3>
        </div>
        <div className="text-xs text-muted-foreground">@{creator.handle}</div>
        <div className="mt-1 text-xs text-primary">{creator.specialty}</div>
        <div className="mt-4 rounded-full border border-border bg-foreground/[0.03] px-3 py-1 text-xs text-muted-foreground">
          Fictional demo profile
        </div>
      </div>
    </motion.div>
  );
}
