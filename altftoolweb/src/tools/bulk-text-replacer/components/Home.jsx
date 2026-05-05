"use client";

import { useState } from "react";
import Header from "./Header";
import TextArea from "./TextArea";
import InputField from "./InputField";
import Options from "./Options";
import ActionButtons from "./ActionButtons";
import Cards from "./Cards";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const handleReplace = () => {
    if (!findText) return;
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(findText, flags);
    setOutputText(inputText.replace(regex, replaceText));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-(--background) text-(--foreground)">

      {/* THEME GLOWS */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-(--primary)/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-(--primary)/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 space-y-14">

        <Header />

        {/* TOOL CONTAINER */}
        <div className="
          rounded-3xl 
          border border-(--border)
          bg-(--card)
          backdrop-blur-xl 
          p-8 
          space-y-8
          shadow-xl
        ">

          {/* CONTROLS */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <InputField
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text"
            />
            <InputField
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with"
            />
            <Options
              caseSensitive={caseSensitive}
              setCaseSensitive={setCaseSensitive}
            />
          </div>

          <ActionButtons
            onReplace={handleReplace}
            onCopy={handleCopy}
          />

          {/* EDITORS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-sm text-(--muted-foreground)">
                Input
              </p>
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here…"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-(--muted-foreground)">
                Output
              </p>
              <TextArea
                value={outputText}
                placeholder="Your replaced text appears here…"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <Cards />

      </div>
    </div>
  );
}
