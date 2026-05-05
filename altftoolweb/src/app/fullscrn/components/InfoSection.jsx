import React, { useState } from "react";

const InfoSection = ({ toggleFullscreen }) => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState("");

  // 📧 Email Validation Logic
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please fill the email");
    } else if (!validateEmail(email)) {
      setError("Please enter a valid email"); // ✅ Ab ye incomplete email ko pakad lega
    } else {
      // Sab sahi hai toh Success Screen (Image 2) dikhao
      setError("");
      setIsSubscribed(true);
    }
  };

  // 🖼️ SUCCESS UI (Image 2 - Fullskrin Updates)
  if (isSubscribed) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <span className="text-[10px] font-bold text-[#6366f1] uppercase tracking-widest mb-2">MAILING LIST</span>
        <h2 className="text-4xl font-black text-[#1e293b] mb-10 tracking-tight">Fullskrin Updates</h2>
        
        {/* Error Box matching your Screenshot */}
        <div className="w-[500px] bg-[#fff1f2] border border-[#fecdd3] rounded-[4px] p-5 mb-8">
          <div className="flex items-start gap-4">
             <div className="bg-[#f43f5e] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</div>
             <div>
                <p className="text-[#9f1239] font-bold text-[14px]">Something went wrong:</p>
                <ul className="list-disc list-inside text-[#be123c] text-[13px] mt-1 ml-1">
                  <li>Email you entered is already subscribed to this list</li>
                </ul>
             </div>
          </div>
        </div>

        {/* Input area on Success Page */}
        <div className="flex gap-4 w-[500px]">
          <input 
            type="text" 
            readOnly 
            value={email} 
            className="flex-1 border border-[#e2e8f0] rounded-[6px] px-4 py-3.5 text-[#64748b] bg-white outline-none text-[15px]"
          />
          <button className="bg-[#6366f1] text-white font-bold px-10 py-3.5 rounded-[6px] text-[15px] cursor-not-allowed">
            Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center items-start">
        
        {/* 1. Fullscreen */}
        <div onClick={toggleFullscreen} className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight cursor-pointer hover:text-slate-800 transition-colors">
          Press <span className="font-bold text-slate-900 underline">CMD + ENTER</span> to go<br />fullscreen even faster
        </div>

        {/* 2. Exit Info */}
        <div className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
          Press <span className="font-bold text-slate-900">ESC</span> or click anywhere<br />to exit fullscreen
        </div>

        {/* 3. Feedback */}
        <div className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
          If fullskrin does not work on<br />your device, please <a href="mailto:support@altftool.com" className="font-bold text-slate-900 underline hover:text-[#0081d1]">LET ME KNOW</a>
        </div>

        {/* 4. Smart Subscribe Section */}
        <div className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 flex-wrap justify-center">
              Enter 
              <input 
                type="text" 
                placeholder="your email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`italic bg-transparent border-b ${error ? 'border-red-500 text-red-500' : 'border-slate-400 text-slate-900'} outline-none w-24 px-1 placeholder:text-slate-300 transition-colors`}
              />
              and 
              <button 
                onClick={handleSubscribe}
                className="bg-[#475569] text-white px-2.5 py-1 rounded-[4px] text-[10px] font-bold hover:bg-[#1e293b] active:scale-95 transition-all shadow-sm"
              >
                SUBSCRIBE
              </button>
            </div>
            
            {/* 🔴 Error Message */}
            {error ? (
              <span className="text-[10px] text-red-500 font-bold mt-1 lowercase animate-pulse">
                {error}
              </span>
            ) : (
              <span className="mt-1">to learn first about new features</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Line */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-[1px] bg-slate-200 mb-4"></div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
          Made by <span className="text-slate-600 font-black tracking-normal">ALT F Tool</span>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;