"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const FEATURED_CATEGORIES = [
  {
    id: 'ai-image',
    name: 'AI Image & Art',
    description: 'Generative art, prompt ideas, character design',
    image: '/altpintrest-images/Listitem → Group - Pin card.png',
    count: '24.5k Pins',
    gradient: 'from-amber-600/80 to-rose-900/90',
  },
  {
    id: 'design',
    name: 'UI/UX & Mobile Design',
    description: 'Neumorphic interfaces, app mockups, web components',
    image: '/altpintrest-images/Listitem → Group - Pin card-1.png',
    count: '18.2k Pins',
    gradient: 'from-blue-600/80 to-indigo-900/90',
  },
  {
    id: 'productivity',
    name: 'Productivity & Workflows',
    description: 'Dashboard layouts, task trackers, workflow hacks',
    image: '/altpintrest-images/Listitem → Group - Pin card-7.png',
    count: '12.8k Pins',
    gradient: 'from-emerald-600/80 to-teal-900/90',
  },
  {
    id: 'development',
    name: 'Web & App Development',
    description: 'Frontend setups, code snippets, login screens',
    image: '/altpintrest-images/Component 4.png',
    count: '31.0k Pins',
    gradient: 'from-purple-600/80 to-violet-900/90',
  },
  {
    id: 'video',
    name: 'Video & Animation',
    description: 'Motion graphics, UI micro-interactions, reels',
    image: '/altpintrest-images/Listitem → Group - Pin card-12.png',
    count: '9.4k Pins',
    gradient: 'from-rose-600/80 to-pink-900/90',
  },
  {
    id: 'chatbot',
    name: 'AI Chatbots & Agents',
    description: 'Conversational UI, assistant widgets, LLM prompts',
    image: '/altpintrest-images/Listitem → Group - Pin card.png',
    count: '15.6k Pins',
    gradient: 'from-cyan-600/80 to-blue-900/90',
  },
];

export default function ExploreCategories({ onSelectCategory }) {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E60023] mb-1">
            <Sparkles size={14} />
            <span>Discover by Interest</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore Featured Categories
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Browse visual moodboards grouped by industry, tool type, and creative domain.
        </p>
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURED_CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelectCategory(cat.name)}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-zinc-800"
          >
            {/* Background Image */}
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-85 group-hover:opacity-95 transition-opacity duration-300`} />

            {/* Content Container */}
            <div className="relative h-full p-6 flex flex-col justify-between text-white z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide border border-white/30">
                  {cat.count}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1 tracking-tight text-white group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
