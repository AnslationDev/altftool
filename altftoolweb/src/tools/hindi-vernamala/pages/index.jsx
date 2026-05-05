"use client";
import React, { useState } from "react";
import {
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shuffle,
} from "lucide-react";

import { consonants } from "../data/consonents";
import { vowels } from "../data/vovels";


import Description from "../components/Description"; 

export default function ToolHome() {
  const [mode, setMode] = useState("browse");
  const [category, setCategory] = useState("vowels");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentData = category === "vowels" ? vowels : consonants;
  const currentLetter = currentData[currentIndex];

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      setIsPlaying(true);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % currentData.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + currentData.length) % currentData.length,
    );
  };

  const shuffle = () => {
    const randomIndex = Math.floor(Math.random() * currentData.length);
    setCurrentIndex(randomIndex);
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12 ">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-(--primary) mb-3 lg:mb-4 mt-[20]">
            हिंदी वर्णमाला
          </h1>

          <p className="description">Hindi Alphabet Learning Tool</p>

          <div className="mt-4 lg:mt-6 flex items-center justify-center gap-2 text-(--muted-foreground) text-sm">
            <div className="h-1 w-16 bg-blue-400 rounded"></div>
            <span>Learn • Practice • Master</span>
            <div className="h-1 w-16 bg-green-400 rounded"></div>
          </div>
        </div>

        {/* MODE + CATEGORY BAR */}
        <div className="flex justify-center gap-6 lg:gap-10 mb-10 lg:mb-14">
          {/* Browse Mode */}
          <div className="group relative">
            <button
              onClick={() => setMode("browse")}
              className={`p-4 rounded-2xl shadow-md transition-all cursor-pointer ${
                mode === "browse"
                  ? "bg-(--primary) text-(--primary-foreground) scale-110 shadow-xl"
                  : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <BookOpen className="w-7 h-7" />
            </button>

            <span className="absolute top-full right-1/2 translate-x-1/2 mt-2 bg-(--foreground) text-(--background) text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Browse All Letters
            </span>
          </div>

          {/* Flashcard Mode */}
          <div className="group relative">
            <button
              onClick={() => setMode("flashcard")}
              className={`p-4 rounded-2xl shadow-md transition-all cursor-pointer ${
                mode === "flashcard"
                  ? "bg-(--primary) text-(--primary-foreground) scale-110 shadow-xl"
                  : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <RotateCcw className="w-7 h-7" />
            </button>

            <span className="absolute top-full right-1/2 translate-x-1/2 mt-2 bg-(--foreground) text-(--background) text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Practice with Flashcards
            </span>
          </div>

          {/* Vowels */}
          <div className="group relative">
            <button
              onClick={() => {
                setCategory("vowels");
                setCurrentIndex(0);
              }}
              className={`p-4 rounded-2xl shadow-md transition-all cursor-pointer ${
                category === "vowels"
                  ? "bg-green-600 text-white scale-110 shadow-xl"
                  : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <span className="text-2xl font-bold">अ</span>
            </button>

            <span className="absolute top-full right-1/2 translate-x-1/2 mt-2 bg-(--foreground) text-(--background) text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              स्वर (Vowels) • {vowels.length}
            </span>
          </div>

          {/* Consonants */}
          <div className="group relative">
            <button
              onClick={() => {
                setCategory("consonants");
                setCurrentIndex(0);
              }}
              className={`p-4 rounded-2xl shadow-md transition-all cursor-pointer ${
                category === "consonants"
                  ? "bg-green-600 text-white scale-110 shadow-xl"
                  : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <span className="text-2xl font-bold">क</span>
            </button>

            <span className="absolute top-full right-1/2 translate-x-1/2 mt-2 bg-(--foreground) text-(--background) text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              व्यंजन (Consonants) • {consonants.length}
            </span>
          </div>
        </div>

        {/* BROWSE MODE */}
        {mode === "browse" && (
          <div>
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-(--foreground) mb-2">
                {category === "vowels"
                  ? "स्वर (Vowels)"
                  : "व्यंजन (Consonants)"}
              </h2>

              <p className="description">
                Click on any letter to hear its pronunciation
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-3 sm:gap-4 lg:gap-6">
              {currentData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => speak(item.letter)}
                  className="bg-(--card) rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center group hover:scale-110 hover:-translate-y-1 border-2 border-transparent hover:border-(--primary)"
                >
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 mb-2 lg:mb-3 group-hover:scale-110 transition-transform">
                    {item.letter}
                  </div>

                  <div className="text-xs sm:text-sm lg:text-base text-(--muted-foreground) font-semibold mb-1">
                    {item.transliteration}
                  </div>

                  <div className="text-xs text-(--muted-foreground) text-center hidden lg:block mt-1 max-w-full truncate">
                    {item.pronunciation}
                  </div>

                  <Volume2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mt-2 lg:mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLASHCARD MODE */}
        {mode === "flashcard" && (
          <div className="max-w-3xl lg:max-w-4xl mx-auto">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-(--foreground) mb-2">
                Practice Mode
              </h2>
              <p className="text-(--muted-foreground) text-sm lg:text-base">
                Practice pronunciation and learn each letter
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 lg:gap-4 mb-8 lg:mb-10">
              <button
                onClick={shuffle}
                className="px-5 lg:px-8 py-2.5 lg:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm lg:text-base font-semibold cursor-pointer"
              >
                <Shuffle className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => speak(currentLetter.letter)}
                disabled={isPlaying}
                className="px-5 lg:px-8 py-2.5 lg:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 text-sm lg:text-base font-semibold cursor-pointer"
              >
                <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Pronounce</span>
              </button>
            </div>

            {/* FLASHCARD */}
            <div className="bg-(--card) rounded-3xl shadow-2xl border-4 border-(--border) p-10 lg:pe-12 flex flex-col items-center text-center relative">
              {/* SPEAK BUTTON */}
              <div className="absolute top-4 right-4 group">
                <button
                  onClick={() => speak(currentLetter.letter)}
                  disabled={isPlaying}
                  className="p-3 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Volume2 className="w-6 h-6" />
                </button>

                <span className="absolute top-full right-1/2 translate-x-1/2 mt-2 bg-(--foreground) text-(--background) text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100">
                  Pronounce Letter
                </span>
              </div>

              {/* NAV LEFT */}
              <button
                onClick={prevCard}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-(--primary) text-(--primary-foreground) rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* NAV RIGHT */}
              <button
                onClick={nextCard}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-(--primary) text-(--primary-foreground) rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Letter */}
              <div className="text-9xl sm:text-[12rem] lg:text-[16rem] font-bold text-blue-600 mb-6 lg:mb-10">
                {currentLetter.letter}
              </div>

              {/* Transliteration */}
              <div className="text-3xl sm:text-4xl lg:text-5xl text-(--foreground) font-bold bg-(--muted) px-8 py-4 rounded-full shadow-md mb-6">
                {currentLetter.transliteration}
              </div>

              {/* Pronunciation */}
              <div className="text-lg sm:text-xl lg:text-2xl text-(--muted-foreground) bg-(--muted) px-6 py-4 rounded-2xl shadow-md">
                {currentLetter.pronunciation}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Render Description */}
        <Description />

        {/* FOOTER */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="bg-(--card) rounded-2xl shadow-lg p-6 lg:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Volume2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              <h3 className="text-xl lg:text-2xl font-bold text-(--foreground)">
                How to Use
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-left text-(--muted-foreground) text-sm lg:text-base">
              <div className="bg-(--muted) p-4 rounded-xl">
                <span className="font-bold text-blue-600">Browse Mode:</span>{" "}
                Tap any letter to hear its pronunciation and see details.
              </div>

              <div className="bg-(--muted) p-4 rounded-xl">
                <span className="font-bold text-green-600">
                  Flashcard Mode:
                </span>{" "}
                Use the arrow buttons to move to next or previous letters.
              </div>
            </div>

            <p className="mt-4 text-(--muted-foreground) text-xs lg:text-sm">
              Uses Web Speech API for accurate Hindi pronunciation • Works
              offline after initial load
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}