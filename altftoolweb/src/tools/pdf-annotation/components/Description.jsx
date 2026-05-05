"use client";

import React from "react";
import { 
  UploadCloud, 
  MousePointer2, 
  Type, 
  Highlighter, 
  History, 
  Download 
} from "lucide-react";

export default function Description() {
  const steps = [
    {
      title: "Upload PDF",
      desc: "Select and upload any PDF from your local storage. Our tool renders all pages instantly for a smooth experience.",
      icon: <UploadCloud size={24} className="text-blue-500" />,
    },
    {
      title: "Choose Your Tool",
      desc: "Select the Pen, Highlighter, or Text tool from the toolbar. You can also customize colors for your drawings.",
      icon: <MousePointer2 size={24} className="text-purple-500" />,
    },
    {
      title: "Annotate & Draw",
      desc: "Draw with your mouse or highlight important sections on any page. Every page supports independent annotations.",
      icon: <Highlighter size={24} className="text-yellow-500" />,
    },
    {
      title: "Add Custom Text",
      desc: "Click anywhere on the PDF to type feedback or comments. This is the best option for formal editing and notes.",
      icon: <Type size={24} className="text-emerald-500" />,
    },
    {
      title: "Undo/Redo History",
      desc: "Made a mistake? No worries. Our history system tracks every move so you can easily fix or revert changes.",
      icon: <History size={24} className="text-orange-500" />,
    },
    {
      title: "Export & Share",
      desc: "After annotating, download your file in high-quality image format and share it anywhere instantly.",
      icon: <Download size={24} className="text-pink-500" />,
    },
  ];

  return (
    <div className="py-12 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-(--foreground)">How It Works</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="bg-(--card) border border-(--border) p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>

            <h3 className="text-xl font-semibold mb-2 text-(--foreground) group-hover:text-blue-500 transition-colors">
              {index + 1}. {step.title}
            </h3>

            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}