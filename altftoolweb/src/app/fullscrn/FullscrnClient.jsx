"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import EditorArea from "./components/EditorArea";
import SettingSidebar from "./components/SettingSidebar";
import ActionFooter from "./components/ActionFooter";
import InfoSection from "./components/InfoSection";

export default function FullscrnClient() {
  // EditorArea ke functions ko bahar se call karne ke liye ref
  const editorRef = useRef();

  // --- States ---
  const [activeTab, setActiveTab] = useState("Text");
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(20); // Default bada rakha hai as per requirement
  const [textAlign, setTextAlign] = useState(""); 
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#0081d1"); 

  // --- Fullscreen Toggle Logic ---
  const toggleFullScreen = () => {
    if (editorRef.current) {
      // EditorArea ke andar wale handleFullScreen function ko trigger karta hai
      editorRef.current.handleFullScreen();
    }
  };

  // --- Keyboard Shortcuts (Command/Ctrl + Enter) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        toggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Cleanup listener on unmount
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col items-center overflow-x-hidden">
      
      {/*  Dynamic Header Bar (Changes with bgColor) */}
      <div 
        className="w-full max-w-[1440px] h-[86px] transition-colors duration-500 shrink-0 shadow-sm" 
        style={{ backgroundColor: bgColor }} 
      />
      
      {/* Navigation Header */}
      <div className="mt-[35px]">
        <Header />
      </div>
      
      {/*  Main Container Tool Card */}
      <div className="w-[950px] min-h-[374px] bg-white border border-slate-200 rounded-[16px] mt-[35px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col z-10 overflow-hidden relative">
        <div className="grid grid-cols-12 flex-grow">
          
          {/* Editor Section (Left Side) */}
          <EditorArea 
            ref={editorRef}
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            inputText={inputText} 
            setInputText={setInputText}
            textAlign={textAlign} 
            textColor={textColor}
            fontSize={fontSize}
            bgColor={bgColor}
          />

          {/* Sidebar Settings (Right Side) */}
          <SettingSidebar 
            fontSize={fontSize} 
            setFontSize={setFontSize}
            textAlign={textAlign} 
            setTextAlign={setTextAlign}
            textColor={textColor} 
            setTextColor={setTextColor}
            bgColor={bgColor} 
            setBgColor={setBgColor}
          />
        </div>
        
        {/* Bottom Actions (Clear & Fullscreen Button) */}
        <ActionFooter 
          onClear={() => setInputText("")} 
          onFullscreen={toggleFullScreen} 
          btnColor={bgColor} 
        />
      </div>

      {/* Additional Info Section at the bottom */}
      <div className="w-full max-w-[950px] mt-10 mb-20">
        <InfoSection toggleFullscreen={toggleFullScreen} />
      </div>
    </div>
  );
}