import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Upload, X, Play, Pause, RotateCcw } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const EditorArea = forwardRef(({
  activeTab,
  setActiveTab,
  inputText,
  setInputText,
  textAlign,
  textColor,
  fontSize,
  bgColor 
}, ref) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [time, setTime] = useState(new Date());
  const [activeSub, setActiveSub] = useState("Time");
  const isSizeManuallyChanged = fontSize !== 20;

  const [hourFormat, setHourFormat] = useState("12");
  const [timezone, setTimezone] = useState("Local");
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(600);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const fileInputRef = useRef(null);
  const fullScreenRef = useRef(null);

  const timezones = [
    { label: "Local Time", value: "Local" },
    { label: "UTC (GMT)", value: "UTC" },
    { label: "New York (EST)", value: "America/New_York" },
    { label: "London (GMT)", value: "Europe/London" },
    { label: "Dubai (GST)", value: "Asia/Dubai" },
    { label: "India (IST)", value: "Asia/Kolkata" },
    { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  ];

  const triggerFullScreen = () => {
    if (fullScreenRef.current) {
      if (fullScreenRef.current.requestFullscreen) {
        fullScreenRef.current.requestFullscreen();
      } else if (fullScreenRef.current.webkitRequestFullscreen) {
        fullScreenRef.current.webkitRequestFullscreen();
      }
      setIsFullScreen(true);
    }
  };
  

  useImperativeHandle(ref, () => ({
    handleFullScreen: triggerFullScreen
  }));

  // Keyboard shortcut Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        triggerFullScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clock & Timer Logic
  useEffect(() => {
    let interval;
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    if (isStopwatchRunning) {
      interval = setInterval(() => setStopwatchTime((prev) => prev + 10), 10);
    }
    let countInterval;
    if (isCountdownRunning && countdownSeconds > 0) {
      countInterval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setIsCountdownRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(clockTimer);
      clearInterval(interval);
      clearInterval(countInterval);
    };
  }, [isStopwatchRunning, isCountdownRunning, countdownSeconds]);

  useEffect(() => {
    const handleExit = () => {
      if (!document.fullscreenElement) setIsFullScreen(false);
    };
    document.addEventListener("fullscreenchange", handleExit);
    return () => document.removeEventListener("fullscreenchange", handleExit);
  }, []);

  const formatTime = (date) => {
    const options = {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: hourFormat === "12",
      timeZone: timezone === "Local" ? undefined : timezone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatStopwatch = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const containerStyle = {
    width: '570px', height: '320px', top: '86px', left: '30px', position: 'absolute'
  };

  return (
    <div className="md:col-span-8 relative h-[374px] bg-white border-r  border-slate-100 overflow-hidden">
      {/* Tabs */}
      <div className="absolute top-[30px] left-[30px] flex">
        {["Text", "Image", "Clock"].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`w-[110px] h-[56px] flex items-center justify-center text-[14px] font-bold rounded-t-[8px] border border-[#E2E8F0] border-b-0 transition-all ${activeTab === tab ? "bg-white text-slate-800 z-10 border-t-2 border-t-[#00c2a8]" : "bg-[#F8FAFC] text-slate-400"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. TEXT AREA */}
      {activeTab === "Text" && (
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste your text here..."
          style={{ 
            ...containerStyle, 
            padding: '24px', 
            textAlign: textAlign || "left", 
            color: textColor, 
            fontSize: isSizeManuallyChanged ? `${fontSize}px` : '20px', 
            lineHeight: '1.2'
          }}
          className="rounded-tr-[12px] rounded-b-[12px] border border-slate-200  bg-white outline-none resize-none placeholder:text-[20px] placeholder:text-slate-400 placeholder:text-left"
        />
      )}

      {/* 2. IMAGE */}
      {activeTab === "Image" && (
        <div style={containerStyle} className="flex flex-col items-center justify-center border-[1.5px] border-dashed border-slate-200 rounded-[12px] bg-[#F8FAFC]">
          {selectedImage ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <ManagedImage src={selectedImage} className="max-w-full max-h-full object-contain" alt="Preview" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={14}/></button>
            </div>
          ) : (
            <div className="text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} onChange={(e) => setSelectedImage(URL.createObjectURL(e.target.files[0]))} className="hidden" accept="image/*" />
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                <Upload size={18} className="text-[#00c2a8]" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Click to upload image</p>
            </div>
          )}
        </div>
      )}

      {/* 3. CLOCK */}
      {activeTab === "Clock" && (
        <div style={containerStyle} className="flex flex-col gap-3">
          <div onClick={() => setActiveSub("Time")} className={`p-4 rounded-[10px] border flex flex-col items-center gap-3 transition-all ${activeSub === "Time" ? "border-[#00c2a8] bg-white shadow-sm" : "border-slate-100 bg-[#F8FAFC]"}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
            <div className="flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="text-[11px] border border-slate-200 rounded p-1 outline-none font-medium">
                {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
              <span className="text-xl font-bold text-slate-800 tabular-nums">{formatTime(time)}</span>
              <select value={hourFormat} onChange={(e) => setHourFormat(e.target.value)} className="text-[11px] border border-slate-200 rounded p-1 outline-none font-medium">
                <option value="12">12hr</option>
                <option value="24">24hr</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => setActiveSub("Stopwatch")} className={`p-3 rounded-[10px] border flex flex-col items-center transition-all ${activeSub === "Stopwatch" ? "border-[#00c2a8] bg-white shadow-sm" : "border-slate-100 bg-[#F8FAFC]"}`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase mb-2">Stopwatch</span>
              <span className="text-lg font-bold text-slate-800 font-mono mb-2">{formatStopwatch(stopwatchTime)}</span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsStopwatchRunning(!isStopwatchRunning)} className="p-1 rounded bg-slate-50 text-[#00c2a8]">{isStopwatchRunning ? <Pause size={12}/> : <Play size={12}/>}</button>
                <button onClick={() => {setStopwatchTime(0); setIsStopwatchRunning(false)}} className="p-1 rounded bg-slate-50 text-slate-400"><RotateCcw size={12}/></button>
              </div>
            </div>
            <div onClick={() => setActiveSub("Countdown")} className={`p-3 rounded-[10px] border flex flex-col items-center transition-all ${activeSub === "Countdown" ? "border-[#00c2a8] bg-white shadow-sm" : "border-slate-100 bg-[#F8FAFC]"}`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase mb-2">Countdown</span>
              <span className="text-lg font-bold text-slate-800 font-mono mb-2">{formatCountdown(countdownSeconds)}</span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsCountdownRunning(!isCountdownRunning)} className="p-1 rounded bg-slate-50 text-[#00c2a8]">{isCountdownRunning ? <Pause size={12}/> : <Play size={12}/>}</button>
                <button onClick={() => {setCountdownSeconds(600); setIsCountdownRunning(false)}} className="p-1 rounded bg-slate-50 text-slate-400"><RotateCcw size={12}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FULLSCREEN OVERLAY: Clock restored properly */}
      <div 
        ref={fullScreenRef}
        className={`${isFullScreen ? "flex" : "hidden"} fixed inset-0 z-[9999] flex-col items-center justify-center transition-colors duration-300`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="text-center w-full px-10">
          {activeTab === "Text" && (
            <div 
              style={{ color: textColor, fontSize: `${fontSize * 3}px`, textAlign }} 
              className="break-words font-black"
            >
              {inputText || "No Text"}
            </div>
          )}
          
          {activeTab === "Image" && selectedImage && (
            <ManagedImage src={selectedImage} className="max-w-[95%] max-h-[95%] object-contain mx-auto" />
          )}
          
          {activeTab === "Clock" && (
            <h1 
              style={{ color: textColor }}
              className="text-[150px] font-bold font-mono tracking-tighter"
            >
              {activeSub === "Time" ? formatTime(time).toUpperCase() : (activeSub === "Stopwatch" ? formatStopwatch(stopwatchTime) : formatCountdown(countdownSeconds))}
            </h1>
          )}
        </div>
      </div>
    </div>
  );
});

EditorArea.displayName = "EditorArea";

export default EditorArea;
