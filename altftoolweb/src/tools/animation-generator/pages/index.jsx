"use client";

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Copy, Download, Check } from "lucide-react";

/* COMPONENT IMPORTS */
import KeyframeEditor from "../components/keyframeEditor.jsx";
import AnimationControls from "../components/AnimationControls.jsx";
import TransformControls from "../components/TransformControls.jsx";
import PresetsDropdown from "../components/PresetsDropdown.jsx";
import PlaygroundCanvas from "../components/PlaygroundCanvas.jsx";
import ExportOptions from "../components/ExportOptions.jsx";
import TriggerSelector from "../components/TriggerSelector.jsx";
import AnimationGuide from "../components/AnimationGuide.jsx";
import GifExport from "../components/GifExports.jsx";
import PerformanceIndicator from "../components/PerformanceIndicator.jsx";
import AiAnimationGenerator from "../components/AiAnimationGenerator.jsx";
import ColorGradientAnimator from "../components/ColorGradientAnimator.jsx";
import {
  DEFAULT_ANIMATION_CONTROLS,
  DEFAULT_TRANSFORM,
  buildAnimationShorthand,
  resolveAnimation,
  updateAnimationControl,
} from "../lib/animationState.js";

/* ANIMATION PRESETS */

const animations = {
  fadeIn: {
    name: "Fade In",
    keyframes: `@keyframes fadeIn {
      from { opacity:0 }
      to { opacity:1 }
    }`
  },

  slideRight: {
    name: "Slide Right",
    keyframes: `@keyframes slideRight {
      from { transform:translateX(-100px); opacity:0 }
      to { transform:translateX(0); opacity:1 }
    }`
  },

  bounce: {
    name: "Bounce",
    keyframes: `@keyframes bounce {
      0%,100% { transform:translateY(0) }
      50% { transform:translateY(-30px) }
    }`
  }
};

const easingOptions = ["ease","linear","ease-in","ease-out","ease-in-out"];

export default function ToolHome(){

/* STATES */

const [animation,setAnimation] = useState("fadeIn");
const [customKeyframes,setCustomKeyframes] = useState(null);
const [aiKeyframes, setAiKeyframes] = useState(""); // ✅ FIXED

const [transform,setTransform] = useState({ ...DEFAULT_TRANSFORM });

const [trigger,setTrigger] = useState("auto");

const [controls,setControls] = useState({ ...DEFAULT_ANIMATION_CONTROLS });

const [isPlaying,setIsPlaying] = useState(true);
const [animationKey,setAnimationKey] = useState(0);
const [copied,setCopied] = useState(false);
const [activeTab,setActiveTab] = useState("preview");
const [exportFormat,setExportFormat] = useState("css");

/* 🎨 COLOR STATES */
const [color1, setColor1] = useState("#ff0000");
const [color2, setColor2] = useState("#0000ff");
const [useGradient, setUseGradient] = useState(false);

/* FUNCTIONS */

const updateControl = (key,value)=>{
  setControls(prev=>updateAnimationControl(prev,key,value));
};

const handleReplay=()=>{
  setIsPlaying(false);
  setTimeout(()=>{
    setAnimationKey(prev=>prev+1);
    setIsPlaying(true);
  },50);
};

const selectBaseAnimation = (name) => {
  setAnimation(name);
  setCustomKeyframes(null);
  setAiKeyframes("");
  handleReplay();
};

const activateCustomKeyframes = (frames) => {
  setCustomKeyframes(frames);
  setAiKeyframes("");
  handleReplay();
};

/* KEYFRAMES */

const activeAnimation = resolveAnimation({
  animation,
  animations,
  customKeyframes,
  aiKeyframes,
});
const animationName = activeAnimation.name;
const generatedKeyframes = activeAnimation.keyframes;
const animationSelectorValue = customKeyframes
  ? "customAnimation"
  : aiKeyframes
    ? "aiAnimation"
    : animation;

/* CSS */

const cssCode = `
.animated-element{
animation:${buildAnimationShorthand(animationName, controls)};
}

${generatedKeyframes}
`;

/* PREVIEW CODE */

let previewCode="";

if(exportFormat==="css") previewCode=cssCode;

if(exportFormat==="react"){
previewCode=`export default function Animation(){
  return <div className="animated-element">✨</div>;
}`;
}

if(exportFormat==="tailwind"){
previewCode=`<div class="animate-bounce">✨</div>`;
}

if(exportFormat==="framer"){
previewCode=`import { motion } from "framer-motion";

export default function Animation(){
  return (
    <motion.div animate={{ scale:1.2 }}>
      ✨
    </motion.div>
  );
}`;
}

/* COPY / DOWNLOAD */

const handleCopy = async()=>{
  await navigator.clipboard.writeText(previewCode);
  setCopied(true);
  setTimeout(()=>setCopied(false),1500);
};

const handleDownload = ()=>{
  const blob = new Blob([previewCode],{type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;

  if(exportFormat==="css") a.download="animation.css";
  if(exportFormat==="react") a.download="animation.jsx";
  if(exportFormat==="tailwind") a.download="animation.html";
  if(exportFormat==="framer") a.download="animation.jsx";

  a.click();
  URL.revokeObjectURL(url);
};

const animationStyle = isPlaying
? buildAnimationShorthand(animationName, controls)
: "none";

/* UI */

return(

<div className="p-6 space-y-10">

<style>{generatedKeyframes}</style>

<div className="text-center">
<h1 className="heading">Animation Generator</h1>
<p className="description">Create beautiful animations for your Projects in Easy way!!</p>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

{/* LEFT */}

<div className="space-y-6 border border-(--border) p-4 rounded-xl">

<select
value={animationSelectorValue}
onChange={(e)=>selectBaseAnimation(e.target.value)}
aria-label="Base animation"
className=" w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
>
{customKeyframes && <option value="customAnimation" disabled>Custom keyframes</option>}
{aiKeyframes && <option value="aiAnimation" disabled>AI-generated animation</option>}
{Object.entries(animations).map(([k,v])=>(
<option key={k} value={k}>{v.name}</option>
))}
</select>

<input
type="number"
value={controls.duration}
onChange={(e)=>updateControl("duration",e.target.value)}
aria-label="Duration in seconds"
min="0.1"
step="0.1"
className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
/>

<select
value={controls.easing}
onChange={(e)=>updateControl("easing",e.target.value)}
aria-label="Easing"
className=" w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
>
{easingOptions.map(e=>(<option key={e}>{e}</option>))}
</select>

<div className="flex gap-3">
<button onClick={handleReplay} aria-label="Replay animation" className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg hover:scale-105">
<RotateCcw size={18}/> 
</button>

<button onClick={()=>setIsPlaying(p=>!p)} aria-label={isPlaying ? "Pause animation" : "Play animation"} className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg hover:scale-105">
{isPlaying ? <Pause size={18}/> : <Play size={18}/>}
</button>
</div>

<PresetsDropdown/>
<TransformControls value={transform} onChange={setTransform}/>
<AnimationControls value={controls} onChange={setControls}/>
<TriggerSelector trigger={trigger} setTrigger={setTrigger}/>

</div>

{/* RIGHT */}

<div className="border border-(--border) p-4 rounded-xl">

{activeTab==="preview" && (
<PlaygroundCanvas
animationStyle={animationStyle}
animationKey={animationKey}
transform={transform}
trigger={trigger}
color1={color1}
color2={color2}
useGradient={useGradient}
/>
)}

</div>

</div>

{/* EXTRA FEATURES */}

<KeyframeEditor onChange={activateCustomKeyframes}/>
<GifExport
  controls={controls}
  transform={transform}
  animationName={animationName}
  color={color1}
  keyframesCss={generatedKeyframes}
  customKeyframes={customKeyframes}
/>

<PerformanceIndicator
controls={controls}
transform={transform}
animation={animationName}
/>

<AiAnimationGenerator
onGenerate={(data)=>{
  setCustomKeyframes(null);
  setAiKeyframes(data.keyframes);
  handleReplay();
}}
/>

<ColorGradientAnimator
color1={color1}
color2={color2}
setColor1={setColor1}
setColor2={setColor2}
useGradient={useGradient}
setUseGradient={setUseGradient}
/>

<AnimationGuide/>

</div>
);
}
