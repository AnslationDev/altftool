import React from "react";
import { Code, X, CheckCircle } from "lucide-react";
import { useState } from "react";

const ExportModal = ({ title, content, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = () => {
    // Using execCommand for better compatibility within iFrame environments
    const tempElement = document.createElement("textarea");
    tempElement.value = content;
    document.body.appendChild(tempElement);
    tempElement.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        console.error("Copy command failed");
      }
    } catch (err) {
      console.error("Error copying text:", err);
    }
    document.body.removeChild(tempElement);
  };

  return (
    <div className="fixed inset-0 bg-background bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-(--card) dark:bg-(--card) rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-(--border) dark:border-(--border) transform scale-95 animate-zoom-in">
        <div className="flex justify-between items-center p-5 border-b border-(--border) dark:border-(--border) bg-(--card) dark:bg-(--card) rounded-t-2xl">
          <h3 className="text-xl font-bold text-(--foreground) flex items-center gap-2">
            <Code className="w-6 h-6 text-accent" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted dark:hover:bg-gray-700 text-(--muted-foreground) transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <textarea
          readOnly
          className="w-full flex-1 p-5 font-mono text-sm border-0 resize-none outline-none bg-input-bg text-(--foreground) rounded-b-2xl focus:ring-0 hide-scrollbar"
          value={content}
        />
        <div className="p-5 border-t border-(--border) dark:border-(--border) bg-(--card) dark:bg-(--card) rounded-b-2xl flex justify-end relative">
          {copySuccess && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center text-green-500 font-medium animate-fade-in">
              <CheckCircle className="w-5 h-5 mr-2" />
              Copied to clipboard!
            </div>
          )}
          <button
            onClick={handleCopyToClipboard}
            className="py-2.5 px-5 bg-(--primary) text-foreground rounded-lg hover:hover:bg-(--primary)/90 transition-all text-base font-medium shadow-md"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
