"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const CURATED_STORIES = [
  {
    id: 1,
    title: 'Neumorphic interface inspiration',
    image: '/altpintrest-images/pin-card-3.png',
    tag: 'Trending UI',
  },
  {
    id: 2,
    title: 'Cyberpunk visual concepts',
    image: '/altpintrest-images/pin-card-10.png',
    tag: 'AI Art',
  },
  {
    id: 3,
    title: 'Conversational interface inspiration',
    image: '/altpintrest-images/pin-card.png',
    tag: 'Conversational UI',
  },
  {
    id: 4,
    title: 'Avatar and portrait prompt inspiration',
    image: '/altpintrest-images/pin-card-6.png',
    tag: 'Prompts',
  },
];

export default function TrendingTopics({ onSelectTopic }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-800">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles size={16} aria-hidden="true" />
            <span>Curated themes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore story collections
          </h2>
        </div>
      </div>

      {/* Story Cards Rail / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CURATED_STORIES.map((story, index) => (
          <motion.button
            type="button"
            key={story.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelectTopic(story.tag)}
            aria-label={`Explore ${story.tag}: ${story.title}`}
            className="group flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface text-left shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* Story Media Header */}
            <div className="relative h-64 overflow-hidden bg-surface-soft">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground backdrop-blur-md">
                  {story.tag}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-5">
              <h3 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {story.title}
              </h3>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
