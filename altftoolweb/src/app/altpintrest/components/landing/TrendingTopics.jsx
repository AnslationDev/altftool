"use client";

import React from 'react';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80";

const TRENDING_STORIES = [
  {
    id: 1,
    title: 'Top 10 Neumorphic & Modern UI Design Trends in 2026',
    author: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=90',
    tag: 'Trending UI',
    likes: '4.2k',
  },
  {
    id: 2,
    title: 'Designing Cyberpunk & GenAI Visual Aesthetics',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=90',
    tag: 'AI Art',
    likes: '8.9k',
  },
  {
    id: 3,
    title: 'Building Modern Conversational AI Cards & Interfaces',
    author: 'Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&auto=format&fit=crop&q=90',
    tag: 'Conversational UI',
    likes: '3.1k',
  },
  {
    id: 4,
    title: 'French Crop & Anime Avatar Midjourney Prompt Guide',
    author: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=90',
    tag: 'Prompts',
    likes: '6.7k',
  },
];

export default function TrendingTopics({ onSelectTopic }) {
  return (
    <section className="py-8 sm:py-12 px-2 sm:px-4 lg:px-6 max-w-[1560px] mx-auto w-full select-none">

      {/* Left-Aligned Section Heading */}
      <div className="mb-4 sm:mb-6 text-left">
        <h2 className="text-3xl sm:text-[42px] lg:text-[44px] font-bold text-[#111111] dark:text-white tracking-tight leading-tight">
          Trending story collections
        </h2>
      </div>

      {/* Story Cards Rail / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full">
        {TRENDING_STORIES.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelectTopic(story.tag)}
            className="group bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-[24px] overflow-hidden border border-gray-100 dark:border-zinc-800/80 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Story Media Header */}
            <div className="relative h-48 sm:h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={story.image}
                alt={story.title}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              {/* Ultra-Legible Glassmorphic Top-Left Tag Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700 text-[11px] font-extrabold text-gray-900 dark:text-white shadow-md tracking-wider uppercase transition-all duration-300 group-hover:bg-[#0D9488] group-hover:text-white group-hover:border-[#0D9488]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488] group-hover:bg-white transition-colors" />
                  {story.tag}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-[#0D9488] transition-colors leading-snug">
                {story.title}
              </h3>

              {/* Author Info */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                <img
                  src={story.avatar}
                  alt={story.author}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
                  }}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                  loading="lazy"
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                  {story.author}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
