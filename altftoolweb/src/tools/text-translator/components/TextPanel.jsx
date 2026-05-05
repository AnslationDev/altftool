import React from "react";
import { Copy, Volume2, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const TextPanel = React.memo(function TextPanel({
  title,
  value,
  placeholder,
  isEditable,
  icon: Icon,
  onTextChange,
  isLoading,
  targetLang = "en",
}) {
  const getBcp47Code = (shortCode) => {
    const map = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      "zh-CN": "zh-CN", // Often works as-is
      ja: "ja-JP",
      ko: "ko-KR",
      ru: "ru-RU",
      pt: "pt-PT", // or 'pt-BR' for Brazilian
      ar: "ar-SA",
      hi: "hi-IN",
    };
    return map[shortCode] || "en-US"; // Default to en-US if unmapped
  };

  const fullLangCode = getBcp47Code(targetLang);

  // -------------------------
  // Copy to clipboard
  // -------------------------
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Text copied to clipboard!");
    } catch {
      toast.error("Copy failed.");
    }
  };

  // -------------------------
  // Speak output text
  // -------------------------
  const handleSpeak = () => {
    if (!value) return;

    const utter = new SpeechSynthesisUtterance(value);

    // Set utterance language to the full BCP 47 code
    utter.lang = fullLangCode;

    // Retrieve voices (may load slowly)
    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
      // Find a voice that starts with the base language code (e.g., 'es' for 'es-ES')
      const baseLang = targetLang.split("-")[0].toLowerCase();

      const match = voices.find((v) =>
        v.lang.toLowerCase().startsWith(baseLang),
      );
      if (match) {
        utter.voice = match;
      }
    }

    speechSynthesis.speak(utter);
  };

  // -------------------------
  // Share output text
  // -------------------------
  const handleShare = async () => {
    if (!value) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Translated Text",
          text: value,
        });
      } else {
        toast("Sharing not supported on this device.", { icon: "⚠️" });
      }
    } catch (err) {
      console.log("Share error:", err);
      // Used toast.error for share failure
      toast.error("Share action failed.");
    }
  };

  return (
    <div
      className={`relative p-6 rounded-3xl h-full flex flex-col transition-colors ${
        isEditable ? "bg-(--card) shadow-xl" : "bg-(--muted) shadow-inner"
      }`}
    >
      {/* Title + Icon */}
      <div className="flex items-center text-lg font-semibold text-(--foreground) mb-3">
        {Icon && <Icon className="w-5 h-5 mr-2 text-(--primary)" />}
        {title}
      </div>

      {/* ACTION BUTTONS (only for translated output panel) */}
      {!isEditable && (
        <div className="absolute top-6 right-6 flex gap-3 text-(--muted-foreground)">
          <button
            onClick={handleCopy}
            className="hover:text-(--primary) cursor-pointer"
            title="Copy"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={handleSpeak}
            className="hover:text-(--primary) cursor-pointer"
            title="Speak"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="hover:text-(--primary) cursor-pointer"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Text Area or Output */}
      {isEditable ? (
        <textarea
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          className={`grow w-full p-4 border border-(--border) rounded-xl resize-none min-h-100
                 focus:ring-2 focus:ring-(--primary) text-(--foreground) bg-(--background) transition-colors`}
          rows={8}
        />
      ) : (
        <div className="grow w-full p-4 border border-(--border) rounded-xl bg-(--background) overflow-y-auto transition-colors">
          {isLoading ? (
            <div className="flex justify-center text-(--primary)">
              <div className="animate-spin mr-2">⏳</div> Translating...
            </div>
          ) : (
            value || (
              <span className="text-(--muted-foreground) italic">
                {placeholder}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
});

export default TextPanel;
