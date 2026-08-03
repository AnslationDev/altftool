"use client";

import React from 'react';

const SKELETON_HEIGHTS = [
  "h-[280px]",
  "h-[360px]",
  "h-[420px]",
  "h-[300px]",
  "h-[450px]",
  "h-[320px]",
  "h-[380px]",
  "h-[290px]",
  "h-[400px]",
  "h-[340px]"
];

export default function PinSkeletonGrid({ count = 15 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-7 gap-6 w-full my-4">
      {items.map((index) => {
        const heightClass = SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length];
        return (
          <div
            key={index}
            className="break-inside-avoid flex flex-col gap-2.5 mb-8"
          >
            {/* Shimmer Image Placeholder */}
            <div
              className={`w-full ${heightClass} rounded-[14.36px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-zinc-800 dark:via-zinc-700/80 dark:to-zinc-800 animate-pulse relative overflow-hidden`}
            >
              <div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-zinc-600/20 to-transparent"
                style={{
                  animation: 'shimmer 1.8s infinite'
                }}
              />
            </div>

            {/* Skeleton Label */}
            <div className="flex flex-col gap-1.5 px-1">
              <div className="h-3.5 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-150 dark:bg-zinc-850 rounded-md animate-pulse opacity-70" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
