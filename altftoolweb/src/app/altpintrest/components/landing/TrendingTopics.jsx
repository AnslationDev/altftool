"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, Bookmark, Eye, Star } from 'lucide-react';

const TRENDING_STORIES = [
  {
    id: 1,
    title: 'Top 10 Neumorphic UI Design Trends in 2026',
    author: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    image: '/altpintrest-images/Listitem → Group - Pin card-3.png',
    tag: 'Trending UI',
    likes: '4.2k',
  },
  {
    id: 2,
    title: 'Designing Cyberpunk 2077 Visual Aesthetics',
    author: 'Elena Rostova',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    image: '/altpintrest-images/Listitem → Group - Pin card-10.png',
    tag: 'AI Art',
    likes: '8.9k',
  },
  {
    id: 3,
    title: 'Building Modern Conversational AI Cards',
    author: 'Marco Rossi',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    image: '/altpintrest-images/Listitem → Group - Pin card.png',
    tag: 'Conversational UI',
    likes: '3.1k',
  },
  {
    id: 4,
    title: 'French Crop & Anime Avatar Prompt Guide',
    author: 'Sophia Chen',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267040',
    image: '/altpintrest-images/Listitem → Group - Pin card-6.png',
    tag: 'Prompts',
    likes: '6.7k',
  },
];

export default function TrendingTopics({ onSelectTopic }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-100 dark:border-zinc-800">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span>Viral This Week</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Trending Story Collections
          </h2>
        </div>
      </div>

      {/* Story Cards Rail / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRENDING_STORIES.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelectTopic(story.tag)}
            className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Story Media Header */}
            <div className="relative h-64 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-bold text-white tracking-wide uppercase">
                  {story.tag}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white">
                <Heart size={13} className="fill-red-500 text-red-500" />
                <span>{story.likes}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col justify-between flex-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 mb-4 group-hover:text-[#E60023] transition-colors">
                {story.title}
              </h3>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <img
                  src={story.avatar}
                  alt={story.author}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800"
                />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate">
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
