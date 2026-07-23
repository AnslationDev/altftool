"use client";

import { useState } from "react";
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Download,
  Settings,
  Eye,
  Code,
  Sparkles,
  Check
} from "lucide-react";
import { useToast } from '../components/ui/use-toast';

const animations = {
  fadeIn: {
    name: "Fade In",
    keyframes: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`
  },
  fadeOut: {
    name: "Fade Out",
    keyframes: `@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}`
  },
  slideUp: {
    name: "Slide Up",
    keyframes: `@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`
  },
  slideDown: {
    name: "Slide Down",
    keyframes: `@keyframes slideDown {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`
  },
  slideRight: {
    name: "Slide Right",
    keyframes: `@keyframes slideRight {
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`
  },
  slideLeft: {
    name: "Slide Left",
    keyframes: `@keyframes slideLeft {
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`
  },
  rotate: {
    name: "Rotate",
    keyframes: `@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`
  },
  bounce: {
    name: "Bounce",
    keyframes: `@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}`
  },
  scaleUp: {
    name: "Scale Up",
    keyframes: `@keyframes scaleUp {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`
  },
  scaleDown: {
    name: "Scale Down",
    keyframes: `@keyframes scaleDown {
  from { transform: scale(1.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`
  },
  pulse: {
    name: "Pulse",
    keyframes: `@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}`
  },
  shake: {
    name: "Shake",
    keyframes: `@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}`
  },
  flip: {
    name: "Flip",
    keyframes: `@keyframes flip {
  from { transform: perspective(400px) rotateY(0); }
  to { transform: perspective(400px) rotateY(360deg); }
}`
  },
  swing: {
    name: "Swing",
    keyframes: `@keyframes swing {
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}`
  },
  heartbeat: {
    name: "Heartbeat",
    keyframes: `@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}`
  }
};
const easingOptions = ["ease", "linear", "ease-in", "ease-out", "ease-in-out"];
const iterationOptions = ["1", "2", "3", "5", "10", "infinite"];
const directionOptions = [
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse"
];
const fillOptions = ["none", "forwards", "backwards", "both"];
const AnimationGenerator = () => {
  const { toast } = useToast();
  const [animation, setAnimation] = useState("fadeIn");
  const [controls, setControls] = useState({
    duration: "1",
    delay: "0",
    easing: "ease",
    iterations: "1",
    direction: "normal",
    fill: "forwards"
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const updateControl = (key, value) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };
  const handleAnimationChange = (newAnimation) => {
    setAnimation(newAnimation);
    handleReplay();
  };
  const handleReplay = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setAnimationKey((prev) => prev + 1);
      setIsPlaying(true);
    }, 50);
  };
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };
  const generateCssCode = () => {
    const { duration, delay, easing, iterations, direction, fill } = controls;
    return `.animated-element {
  animation: ${animation} ${duration}s ${easing} ${delay}s ${iterations} ${direction} ${fill};
}

${animations[animation]?.keyframes || ""}`;
  };
  const cssCode = generateCssCode();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      toast({
        title: "CSS code copied!",
        description: "The animation CSS has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2e3);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleDownload = () => {
    const blob = new Blob([cssCode], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${animation}-animation.css`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const animationStyle = isPlaying ? `${animation} ${controls.duration}s ${controls.easing} ${controls.delay}s ${controls.iterations} ${controls.direction} ${controls.fill}` : "none";
  return <div className="w-full space-y-6">
      <style>
        {Object.values(animations).map((a) => a.keyframes).join("\n")}
        {`
          @keyframes floatBadge {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style>

      {
    /* Page Header */
  }
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-(--foreground)">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            Advanced Animation Generator
          </h1>
          <p className="mt-2 opacity-90">
            Create, preview, and copy CSS animations instantly
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* ========== LEFT COLUMN - CONTROLS ========== */
  }
        <div className="space-y-6">
          {
    /* Animation Selector Card */
  }
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Animation Type
              </h2>

              <div className="space-y-4 ">
                <div>
                  <Label htmlFor="animation-select " className="text-(--foreground)">Select Animation</Label>
                  <Select value={animation} onValueChange={handleAnimationChange}>
                    <SelectTrigger id="animation-select">
                      <SelectValue placeholder="Select animation" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(animations).map(([key, value]) => <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {
    /* Animation Tags */
  }
                <div className="flex flex-wrap gap-2">
                  {["fadeIn", "bounce", "pulse", "rotate", "shake"].map(
    (tag) => <Badge
      key={tag}
      variant={animation === tag ? "default" : "secondary"}
      className="cursor-pointer"
      onClick={() => handleAnimationChange(tag)}
    >
                        {animations[tag]?.name}
                      </Badge>
  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {
    /* Controls Panel Card */
  }
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-indigo-600" />
                Controls
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {
    /* Duration */
  }
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-(--foreground)">Duration (s)</Label>
                  <Input
    id="duration"
    type="number"
    min="0.1"
    step="0.1"
    value={controls.duration}
    onChange={(e) => updateControl("duration", e.target.value)}
  />
                </div>

                {
    /* Delay */
  }
                <div className="space-y-2">
                  <Label htmlFor="delay" className="text-(--foreground)">Delay (s)</Label>
                  <Input
    id="delay"
    type="number"
    min="0"
    step="0.1"
    value={controls.delay}
    onChange={(e) => updateControl("delay", e.target.value)}
  />
                </div>

                {
    /* Easing */
  }
                <div className="space-y-2">
                  <Label htmlFor="easing" className="text-(--foreground)">Easing</Label>
                  <Select value={controls.easing} onValueChange={(value) => updateControl("easing", value)}>
                    <SelectTrigger id="easing">
                      <SelectValue placeholder="Select easing" />
                    </SelectTrigger>
                    <SelectContent>
                      {easingOptions.map((opt) => <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {
    /* Iterations */
  }
                <div className="space-y-2">
                  <Label htmlFor="iterations" className="text-(--foreground)">Iterations</Label>
                  <Select value={controls.iterations} onValueChange={(value) => updateControl("iterations", value)}>
                    <SelectTrigger id="iterations">
                      <SelectValue placeholder="Select iterations" />
                    </SelectTrigger>
                    <SelectContent>
                      {iterationOptions.map((opt) => <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {
    /* Direction */
  }
                <div className="space-y-2">
                  <Label htmlFor="direction" className="text-(--foreground)">Direction</Label>
                  <Select value={controls.direction} onValueChange={(value) => updateControl("direction", value)}>
                    <SelectTrigger id="direction">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {directionOptions.map((opt) => <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {
    /* Fill Mode */
  }
                <div className="space-y-2">
                  <Label htmlFor="fill" className="text-(--foreground)">Fill Mode</Label>
                  <Select value={controls.fill} onValueChange={(value) => updateControl("fill", value)}>
                    <SelectTrigger id="fill">
                      <SelectValue placeholder="Select fill mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {fillOptions.map((opt) => <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {
    /* Action Buttons */
  }
              <div className="flex flex-wrap gap-3 mt-6">
                <Button onClick={handleReplay} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Replay
                </Button>

                <Button
    variant="outline"
    onClick={handleTogglePlay}
    className="flex items-center gap-2"
  >
                  {isPlaying ? <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </> : <>
                      <Play className="h-4 w-4" />
                      Play
                    </>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {
    /* ========== RIGHT COLUMN - PREVIEW & CODE ========== */
  }
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                CSS Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              {
    /* Preview Card */
  }
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Animation Preview</h2>

                  {
    /* Preview Stage */
  }
                  <div
    className="h-56 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden"
    style={{
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
    }}
  >
                    {
    /* Grid Pattern */
  }
                    <div
    className="absolute inset-0"
    style={{
      backgroundImage: `
                          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
      backgroundSize: "20px 20px"
    }}
  />

                    {
    /* Animated Element */
  }
                    <div
    key={animationKey}
    className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl shadow-lg relative z-10"
    style={{
      background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
      animation: animationStyle
    }}
  >
                      ✨
                    </div>
                  </div>

                  {
    /* Status Bar */
  }
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm bg-(--muted) rounded-lg p-3">
                    <span>
                      <strong>Animation:</strong> {animations[animation]?.name}
                    </span>
                    <span>
                      <strong>Duration:</strong> {controls.duration}s
                    </span>
                    <span>
                      <strong>Status:</strong>{" "}
                      {isPlaying ? "\u25B6\uFE0F Playing" : "\u23F8\uFE0F Paused"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              {
    /* Code Output Card */
  }
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Code className="h-5 w-5 text-indigo-600" />
                      Generated CSS
                    </h2>

                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download CSS</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
    variant={copied ? "default" : "outline"}
    size="sm"
    onClick={handleCopy}
    className="flex items-center gap-2"
  >
                        {copied ? <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </> : <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>}
                      </Button>
                    </div>
                  </div>

                  {
    /* Code Block */
  }
                  <pre className=" text-(--foreground) p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                    <code>{cssCode}</code>
                  </pre>

                  {
    /* Usage Tip */
  }
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    💡 <strong>Tip:</strong> Add the class{" "}
                    <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono">
                      animated-element
                    </code>{" "}
                    to any HTML element to apply this animation.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {
    /* Footer Badge */
  }
          <div className="text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 p-3 px-5 md:px-8 rounded-full bg-(--background)/70 backdrop-blur-sm  border border-(--border)/60 shadow-sm animate-floatBadge">
              {[
    ["\u2728", "Pure CSS"],
    ["\u26A1", "Ultra Fast"],
    ["\u{1F4CB}", "Copy Ready"]
  ].map(([icon, text], i) => <span key={i} className="text-(--foreground) font-medium flex items-center gap-1.5 text-sm">
                  {icon} {text}
                </span>)}
            </div>
          </div>
        </div>




{
    /* ========== HOW IT WORKS SECTION ========== */
  }

<div className="relative left-1 right-1-ml-[50vw]-mr-[50vw] w-screen mr-10">
  <Card className="rounded-md  w-84 max-w-none mt-10 ml-92 mr-24 bg-gray-200">
    <CardContent className="p-6 md:p-10">
      <h2 className="text-2xl font-bold text-black text-center mb-2 flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-indigo-600" />
        How It Works
      </h2>

      <p className="text-center text-black mb-10 max-w-2xl mx-auto">
        Create professional CSS animations in just a few simple steps
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-10">
        {
    /* Step 1 */
  }
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-5 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg">Choose Animation</h3>
            <p className="text-sm text-(--muted-foreground)">
              Select from ready-made animations like Fade, Bounce, Rotate, Slide, and more.
            </p>
          </CardContent>
        </Card>

        {
    /* Step 2 */
  }
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-5 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg">Customize Controls</h3>
            <p className="text-sm text-(--muted-foreground)">
              Adjust duration, delay, easing, direction, iterations, and fill mode easily.
            </p>
          </CardContent>
        </Card>

        {
    /* Step 3 */
  }
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-5 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg">Live Preview</h3>
            <p className="text-sm text-(--muted-foreground)">
              Instantly preview the animation and replay or pause it in real time.
            </p>
          </CardContent>
        </Card>

        {
    /* Step 4 */
  }
        <Card className="hover:shadow-lg transition">
          <CardContent className="p-5 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Code className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Copy or Download</h3>
            <p className="text-sm text-(--muted-foreground)">
              Copy the generated CSS or download it as a ready-to-use file.
            </p>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
</div>
 </div>




{
    /* FAQ SECTION */
  }




    </div>;
};
export default AnimationGenerator;
