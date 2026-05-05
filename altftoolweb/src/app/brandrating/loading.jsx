"use client";

import React from "react";

function Bone({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-gray-200 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </div>
  );
}


function HeroSkeleton() {
  return (
    <section className="w-full px-4 py-10 text-center">
      <Bone className="h-12 w-2/3 mx-auto mb-4" />
      <Bone className="h-5 w-1/2 mx-auto mb-3" />
      <Bone className="h-5 w-1/3 mx-auto mb-8" />

      <div className="flex justify-center gap-4 mb-8">
        <Bone className="h-10 w-32 rounded-full" />
        <Bone className="h-10 w-32 rounded-full" />
      </div>

      <Bone className="h-64 w-full rounded-2xl" />
    </section>
  );
}

function CategorySkeleton() {
  return (
    <section className="w-full px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 border border-gray-100 rounded-xl">
            <Bone className="h-20 w-full mb-3 rounded-lg" />
            <Bone className="h-4 w-3/4 mb-2" />
            <Bone className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

function HorizontalSkeleton() {
  return (
    <section className="w-full px-4 py-8">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex flex-col gap-3 border border-gray-100 rounded-xl p-4">
            <Bone className="h-32 w-full rounded-lg" />
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}


function BlockSkeleton() {
  return (
    <section className="w-full px-4 py-10 text-center">
      <Bone className="h-10 w-64 mx-auto mb-4" />
      <Bone className="h-4 w-full max-w-2xl mx-auto mb-2" />
      <Bone className="h-4 w-5/6 max-w-xl mx-auto" />
    </section>
  );
}


function CardGridSkeleton() {
  return (
    <section className="w-full px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 border border-gray-100 rounded-2xl">
            <Bone className="h-40 w-full mb-4 rounded-xl" />
            <Bone className="h-5 w-2/3 mb-2" />
            <Bone className="h-4 w-1/2 mb-3" />
            <Bone className="h-3 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

//  MAIN LOADING
export default function Loading() {
  return (
    <div className="w-full">

      <HeroSkeleton />
      <CategorySkeleton />
      <HorizontalSkeleton />
      <BlockSkeleton />

      <CardGridSkeleton />
      <CardGridSkeleton />
      <BlockSkeleton />
    </div>
  );
}