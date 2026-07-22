"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Users } from "lucide-react";
import { formatCompact } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { PromptThumb } from "./prompt-thumb";

export function CreatorCard({ creator, index = 0 }) {
  const [following, setFollowing] = React.useState(false);
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
          {creator.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
        </div>
        <div className="text-xs text-muted-foreground">@{creator.handle}</div>
        <div className="mt-1 text-xs text-primary">{creator.specialty}</div>

        <div className="mt-4 flex w-full items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {formatCompact(creator.followers ?? 0)}</span>
          <span>{creator.prompts} prompts</span>
        </div>

        <Button
          variant={following ? "secondary" : "outline"}
          size="sm"
          className="mt-4 w-full"
          onClick={() => setFollowing((f) => !f)}
        >
          {following ? "Following" : "Follow"}
        </Button>
      </div>
    </motion.div>
  );
}
