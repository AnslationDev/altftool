"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeaderIntro from "../components/HeaderIntro";
import InfoCard from "../components/InfoCard";
import InputCard from "../components/InputCard";
import OutputCard from "../components/OutputCard";
import FeatureStrip from "../components/FeatureStrip";
import UseCasesCard from "../components/UseCasesCard";
import ExamplesCard from "../components/ExamplesCard";
import { encodeBase32 } from "../utils/base32";
import { downloadText } from "../utils/download";

export default function Base32EncoderPage() {
  const [input, setInput] = useState("Hello, World! 👋");
  const [alphabetCase, setAlphabetCase] = useState("upper");
  const [paddingMode, setPaddingMode] = useState("with");
  const [lineLength, setLineLength] = useState("");
  const [copied, setCopied] = useState(false);
  const [encoded, setEncoded] = useState(false);
  const outputRef = useRef(null);

  const encodeOptions = useMemo(
    () => ({
      lowercase: alphabetCase === "lower",
      padding: paddingMode === "with",
      lineLength: Math.max(0, Math.min(512, Number(lineLength) || 0)),
    }),
    [alphabetCase, paddingMode, lineLength],
  );

  // Live encoding (pure); timing is measured separately after render because
  // performance.now() isn't allowed during the render phase.
  const result = useMemo(() => encodeBase32(input, encodeOptions), [input, encodeOptions]);
  const [timeMs, setTimeMs] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const start = performance.now();
      encodeBase32(input, encodeOptions);
      setTimeMs(performance.now() - start);
    });
    return () => cancelAnimationFrame(id);
  }, [input, encodeOptions]);

  const flash = (setter) => {
    setter(true);
    window.setTimeout(() => setter(false), 1800);
  };

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      flash(setCopied);
    } catch {
      window.alert("Clipboard access isn't available in this browser.");
    }
  };

  const handleDownload = () => {
    if (result.output) downloadText(result.output, "base32-output.txt");
  };

  const handleEncode = () => {
    flash(setEncoded);
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const applyUseCase = (useCase) => {
    setInput(useCase.input);
    setAlphabetCase(useCase.options.alphabetCase);
    setPaddingMode(useCase.options.paddingMode);
    setLineLength(useCase.options.lineLength);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="grid items-center gap-6 xl:grid-cols-2">
          <HeaderIntro />
          <InfoCard />
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-2">
          <InputCard
            input={input}
            onInputChange={setInput}
            alphabetCase={alphabetCase}
            onAlphabetCaseChange={setAlphabetCase}
            paddingMode={paddingMode}
            onPaddingModeChange={setPaddingMode}
            lineLength={lineLength}
            onLineLengthChange={setLineLength}
            onEncode={handleEncode}
            encoded={encoded}
          />
          <div ref={outputRef} className="scroll-mt-6">
            <OutputCard
              input={input}
              result={result}
              timeMs={timeMs}
              alphabetCase={alphabetCase}
              onCopy={handleCopy}
              copied={copied}
              onDownload={handleDownload}
            />
          </div>
        </div>

        <FeatureStrip />

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <UseCasesCard onApply={applyUseCase} />
          <ExamplesCard onUseExample={setInput} />
        </div>
      </div>
    </main>
  );
}
