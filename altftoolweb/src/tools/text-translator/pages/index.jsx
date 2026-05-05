"use client";
import React, { useState, useTransition } from "react";
import Header from "../components/Header";
import LanguageSelect from "../components/LanguageSelect";
import TextPanel from "../components/TextPanel";
import TranslateButton from "../components/TranslateButton";
import LayoutWrapper from "../components/LayoutWrapper";
import { LANGUAGES } from "../constants/languages";
import { translateText } from "../utils/translate";
import { ArrowRightLeftIcon, CornerDownRight, Zap } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Features from "../components/Features";

export default function TextTranslator() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [, startTransition] = useTransition();

  const handleInputChange = (txt) => {
    startTransition(() => setInputText(txt));
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      // Use toast.error for validation failure
      toast.error("Please enter text to translate.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await translateText(inputText, sourceLang, targetLang);
      setTranslatedText(result);
      // Optional: Add success toast here if translation succeeds
      toast.success("Translation complete!");
    } catch {
      setError("Translation failed.");
      // Use toast.error for API failure
      toast.error("Translation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto text-(--foreground)">
        <Header />

        {/* LANGUAGE ROW */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-(--card) p-4 rounded-3xl shadow-lg border border-(--border)">
          <LanguageSelect
            label="Source"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            options={LANGUAGES}
          />

          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-(--primary) text-(--primary-foreground) shadow-lg transition hover:opacity-90"
          >
            <ArrowRightLeftIcon className="w-5 h-5" />
          </button>

          <LanguageSelect
            label="Target"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            options={LANGUAGES}
          />
        </div>

        {/* TEXT PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <TextPanel
            title="Your Text"
            icon={CornerDownRight}
            value={inputText}
            isEditable={true}
            placeholder="Type something…"
            onTextChange={handleInputChange}
          />

          <TextPanel
            title="Translation"
            icon={Zap}
            value={translatedText}
            isEditable={false}
            isLoading={isLoading}
            placeholder="Your translation appears here…"
            targetLang={targetLang}
          />
        </div>

        {/* TRANSLATE BUTTON */}
        <div className="flex justify-center mt-6">
          <TranslateButton
            onClick={handleTranslate}
            disabled={!inputText.trim() || isLoading}
            isLoading={isLoading}
          />
        </div>
        <Features/>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
