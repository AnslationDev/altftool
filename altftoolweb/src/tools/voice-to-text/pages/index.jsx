// import React, { useState, useEffect, useRef } from 'react';
// import { Mic, Square, Copy, Check, Globe2, Sparkles, Languages } from 'lucide-react';

// // Languages list for target translation
// const LANGUAGES = [
//   { code: 'hi', name: 'Hindi' },
//   { code: 'en', name: 'English' },
//   { code: 'es', name: 'Spanish' },
//   { code: 'fr', name: 'French' },
//   { code: 'bn', name: 'Bengali' },
//   { code: 'ar', name: 'Arabic' },
//   { code: 'ru', name: 'Russian' },
//   { code: 'ja', name: 'Japanese' },
//   { code: 'de', name: 'German' },
// ];

// export default function ToolHome() {
//   const [isListening, setIsListening] = useState(false);
//   const [originalText, setOriginalText] = useState('');
//   const [translatedText, setTranslatedText] = useState('');
//   const [targetLang, setTargetLang] = useState('hi'); // Default to Hindi
//   const [isTranslating, setIsTranslating] = useState(false);
//   const [copied, setCopied] = useState(false);

//   const recognitionRef = useRef(null);

//   // Initialize Speech Recognition
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = false; // Stop after speaking
//       recognitionRef.current.interimResults = true; // Show live typing

//       recognitionRef.current.onresult = (event) => {
//         let currentTranscript = '';
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           currentTranscript += event.results[i][0].transcript;
//         }
//         setOriginalText(currentTranscript);
//       };

//       recognitionRef.current.onend = () => {
//         setIsListening(false);
//       };

//       recognitionRef.current.onerror = (event) => {
//         // console.error("Speech recognition error", event.error);
//         setIsListening(false);
//       };
//     } 
//     // else {
//     //   // alert("Your browser does not support Speech Recognition. Please use Chrome.");
//     // }
//   }, []);

  
//   useEffect(() => {
//     if (!isListening && originalText.trim().length > 0) {
//       handleTranslate(originalText);
//     }
//   }, [isListening]);

//   // Translation API Function 
//   const handleTranslate = async (text) => {
//     setIsTranslating(true);
//     try {
//       //  Memory Free Translation API 
//       const response = await fetch(
//         `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`
//       );
//       const data = await response.json();
      
//       if (data.responseData.translatedText) {
//         setTranslatedText(data.responseData.translatedText);
//       }
//     } catch (error) {
//       console.error("Translation failed:", error);
//       setTranslatedText("Translation failed. Please try again.");
//     } finally {
//       setIsTranslating(false);
//     }
//   };

  
//   const toggleListening = () => {
//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       setOriginalText('');
//       setTranslatedText('');
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

 
//   const handleCopy = () => {
//     if (translatedText) {
//       navigator.clipboard.writeText(translatedText);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   return (
//     <div className="min-h-screen    ">
//        <h1 className="heading text-center animate-fade-up pt-5">Voice to Text</h1>
//        <p className='description text-center animate-fade-up pt-1'>Convert your voice into text</p>
      
     
//       <div className="w-full max-w-3xl  rounded-lg p-6 md:p-10 item-center justify-center  gap-4 border border-(--border) bg-(--card) shadow-md ml-96 mt-12">
        
       

      
        

      
//         <div className="flex flex-col md:flex-row  p-4 rounded-2xl mb-8 border border-(--border) relative z-10 gap-48">
//           <div className="flex items-center space-x-2 text-(--muted-foreground) mb-4 md:mb-0  ">
//             <Globe2 className="w-5 h-5 text-blue-400" />
//             <span className="font-medium">Speak in Any Language</span>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <Languages className="w-5 h-5 text-(--foreground)" />
//             <span className="text-(--muted-foreground)">Translate to:</span>
//             <select
//               value={targetLang}
//               onChange={(e) => {
//                 setTargetLang(e.target.value);
//                 if (originalText) handleTranslate(originalText);
//               }}
//               className="bg-(--card) border border-(--border) text-white text-sm rounded-xl  block p-2.5 outline-none transition-all cursor-pointer"
//             >
//               {LANGUAGES.map((lang) => (
//                 <option key={lang.code} value={lang.code} className="bg-(--card) text-(--foreground)">
//                   {lang.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Microphone Button */}
//         <div className="flex justify-center mb-10 relative z-10">
//           <button
//             onClick={toggleListening}
//             className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 group ${
//               isListening 
//                 ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
//                 : 'bg-linear-to-tr from-purple-600 to-blue-600 hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
//             }`}
//           >
//             {isListening && (
//               <span className="absolute inset-0 rounded-full animate-ping border-2 border-red-400 opacity-75"></span>
//             )}
//             {isListening ? <Square className="w-8 h-8 text-(--foreground) fill-(--foreground)" /> : <Mic className="w-10 h-10 text-(--foreground)" />}
//           </button>
//         </div>
//         <p className="text-center text-(--foreground) mb-8 -mt-6">
//           {isListening ? 'Listening... Click square to stop' : 'Tap the mic and start speaking'}
//         </p>

//         {/* Text Output Areas */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
//           {/* Original Text Box */}
//           <div className="bg-(--card) rounded-2xl p-5 border border-(--border) min-h-37.5 flex flex-col">
//             <h3 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider mb-3">Original Text</h3>
//             <p className="text-(--muted-foreground) grow text-lg leading-relaxed">
//               {originalText || <span className="text-(--muted-foreground) italic">Your speech will appear here...</span>}
//             </p>
//           </div>

//           {/* Translated Text Box */}
//           <div className="bg-(--card) rounded-2xl p-5 border border-(--border) min-h-37.5 flex flex-col relative group">
//             <h3 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider mb-3">Translated Output</h3>
            
//             {isTranslating ? (
//                <div className="flex items-center justify-center grow">
//                  <div className="w-6 h-6 border-2 border-(--border) border-t-transparent rounded-full animate-spin"></div>
//                </div>
//             ) : (
//               <p className="text-(--foreground) font-medium grow text-lg leading-relaxed">
//                 {translatedText || <span className="text-(--muted-foreground) italic font-normal">Translation will appear here...</span>}
//               </p>
//             )}

//             {/* Copy Button */}
//             {translatedText && (
//               <button
//                 onClick={handleCopy}
//                 className="absolute bottom-4 right-4 bg-(--card)  p-2 rounded-lg text-(--foreground)  transition-all border border-(--border) cursor-pointer  "
//                 title="Copy text"
//               >
//                 {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-(--muted-foreground)" />}
//               </button>
//             )}
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Copy,
  Check,
  Globe2,
  Sparkles,
  Languages,
} from "lucide-react";
import Features from "../components/Features";

// Languages list for target translation
const LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "bn", name: "Bengali" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "de", name: "German" },
];

export default function ToolHome() {
  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("hi"); // Default to Hindi
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after speaking
      recognitionRef.current.interimResults = true; // Show live typing

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setOriginalText(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        // console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
    // else {
    //   // alert("Your browser does not support Speech Recognition. Please use Chrome.");
    // }
  }, []);

  useEffect(() => {
    if (!isListening && originalText.trim().length > 0) {
      handleTranslate(originalText);
    }
  }, [isListening]);

  // Translation API Function
  const handleTranslate = async (text) => {
    setIsTranslating(true);
    try {
      //  Memory Free Translation API
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}`,
      );
      const data = await response.json();

      if (data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setOriginalText("");
      setTranslatedText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-0">
      <h1 className="heading text-center animate-fade-up pt-5">
        Voice to Text
      </h1>
      <p className="description text-center animate-fade-up pt-1">
        Convert your voice into text
      </p>

      <div className="w-full max-w-5xl rounded-lg p-4 sm:p-6 md:p-10 border border-(--border) bg-(--card) shadow-md mt-6 sm:mt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center p-4 sm:p-5 rounded-2xl mb-6 sm:mb-8 border border-(--border) relative z-10 gap-4 md:gap-8 lg:gap-12">
          <div className="flex items-center space-x-2 text-(--muted-foreground) mb-4 md:mb-0  ">
            <Globe2 className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Speak in Any Language</span>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Languages className="w-5 h-5 text-(--foreground)" />
            <span className="text-(--muted-foreground)">Translate to:</span>
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                if (originalText) handleTranslate(originalText);
              }}
              className="bg-(--card) border border-(--border) text-(--foreground) text-sm rounded-xl block p-2.5 w-full md:w-auto outline-none transition-all cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-(--card) text-(--foreground)"
                >
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center mb-10 relative z-10">
          <button
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 cursor-pointer group ${
              isListening
                ? "bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                : "bg-(--primary) hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full animate-ping border-2 border-red-400 opacity-75"></span>
            )}
            {isListening ? (
              <Square className="w-8 h-8 text-(--foreground) fill-(--foreground)" />
            ) : (
              <Mic className="w-10 h-10 text-(--foreground)" />
            )}
          </button>
        </div>
        <p className="text-center text-(--foreground) mb-6 sm:mb-8 -mt-4 sm:-mt-6 text-sm sm:text-base">
          {isListening
            ? "Listening... Click square to stop"
            : "Tap the mic and start speaking"}
        </p>

        {/* Text Output Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
          {/* Original Text Box */}
          <div className="bg-(--card) rounded-2xl p-5 border border-(--border) min-h-37.5 flex flex-col">
            <h3 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider mb-3">
              Original Text
            </h3>
            <p className="text-(--muted-foreground) grow text-base sm:text-lg leading-relaxed">
              {originalText || (
                <span className="text-(--muted-foreground) italic">
                  Your speech will appear here...
                </span>
              )}
            </p>
          </div>

          {/* Translated Text Box */}
          <div className="bg-(--card) rounded-2xl p-5 border border-(--border) min-h-37.5 flex flex-col relative group">
            <h3 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider mb-3">
              Translated Output
            </h3>

            {isTranslating ? (
              <div className="flex items-center justify-center grow">
                <div className="w-6 h-6 border-2 border-(--border) border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <p className="text-(--foreground) font-medium grow text-lg leading-relaxed">
                {translatedText || (
                  <span className="text-(--muted-foreground) italic font-normal">
                    Translation will appear here...
                  </span>
                )}
              </p>
            )}

            {/* Copy Button */}
            {translatedText && (
              <button
                onClick={handleCopy}
                className="absolute bottom-4 right-4 bg-(--card)  p-2 rounded-lg text-(--foreground)  transition-all border border-(--border) cursor-pointer  "
                title="Copy text"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-(--muted-foreground)" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <Features/>
    </div>
  );
}
