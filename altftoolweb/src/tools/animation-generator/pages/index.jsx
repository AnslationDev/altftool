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

const [transform,setTransform] = useState({
  x:0,
  y:0,
  scale:1,
  rotate:0,
  skew:0
});

const [trigger,setTrigger] = useState("auto");

const [controls,setControls] = useState({
  duration:"1",
  delay:"0",
  easing:"ease",
  iterations:"1",
  direction:"normal",
  fill:"forwards"
});

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
  setControls(prev=>({...prev,[key]:value}));
};

const handleReplay=()=>{
  setIsPlaying(false);
  setTimeout(()=>{
    setAnimationKey(prev=>prev+1);
    setIsPlaying(true);
  },50);
};

/* ANIMATION NAME FIX */
const animationName = customKeyframes ? "customAnimation" : "aiAnimation";

/* KEYFRAMES */

const generatedKeyframes = customKeyframes
  ? `@keyframes customAnimation {
${customKeyframes.map(k=>`
${k.percent}% {
opacity:${k.opacity};
transform:translateY(${k.translateY}px);
background: ${useGradient 
  ? `linear-gradient(45deg, ${color1}, ${color2})`
  : color1};
}
`).join("")}
}`
  : aiKeyframes || animations[animation]?.keyframes;

/* CSS */

const cssCode = `
.animated-element{
animation:${animationName}
${controls.duration}s
${controls.easing}
${controls.delay}s
${controls.iterations}
${controls.direction}
${controls.fill};
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
? `${animationName} ${controls.duration}s ${controls.easing}`
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
value={animation}
onChange={(e)=>{setAnimation(e.target.value);handleReplay();}}
className=" w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
>
{Object.entries(animations).map(([k,v])=>(
<option key={k} value={k}>{v.name}</option>
))}
</select>

<input
type="number"
value={controls.duration}
onChange={(e)=>updateControl("duration",e.target.value)}
className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
/>

<select
value={controls.easing}
onChange={(e)=>updateControl("easing",e.target.value)}
className=" w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
>
{easingOptions.map(e=>(<option key={e}>{e}</option>))}
</select>

<div className="flex gap-3">
<button onClick={handleReplay} className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg hover:scale-105">
<RotateCcw size={18}/> 
</button>

<button onClick={()=>setIsPlaying(p=>!p)} className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg hover:scale-105">
{isPlaying ? <Pause size={18}/> : <Play size={18}/>}
</button>
</div>

<PresetsDropdown/>
<TransformControls onChange={setTransform}/>
<AnimationControls controls={controls} onChange={setControls}/>
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

<KeyframeEditor onChange={setCustomKeyframes}/>
<GifExport/>

<PerformanceIndicator
controls={controls}
transform={transform}
animation={animation}
/>

<AiAnimationGenerator
onGenerate={(data)=>{
  setCustomKeyframes(null);
  setAiKeyframes(data.keyframes);
  setAnimation(data.name);
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