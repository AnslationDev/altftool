import { motion, AnimatePresence } from "framer-motion";
import { Eye, Monitor, Smartphone, Tablet, RotateCw, Maximize2, ZoomIn, ZoomOut, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
export const PreviewPanel = ({ html }) => {
  const iframeRef = useRef(null);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(/* @__PURE__ */ new Date());
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
      try {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#667eea',
            secondary: '#764ba2'
          }
        }
      }
    }
  <\/script>
  <style>
    * {
      box-sizing: border-box;
    }
    html {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #1e293b;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }

    /* Ensure good contrast for all text */
    h1, h2, h3, h4, h5, h6 {
      color: #f1f5f9;
    }

    p, div, span, li, td, th {
      color: #e2e8f0;
    }

    a {
      color: #93c5fd;
    }

    a:hover {
      color: #bfdbfe;
    }

    code {
      background: #1e293b;
      color: #cbd5e1;
      padding: 0.2em 0.4em;
      border-radius: 0.25em;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1em;
      border-radius: 0.5em;
      overflow: auto;
    }

    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 0.5em 1em;
      border-radius: 0.375em;
      cursor: pointer;
    }

    button:hover {
      background: #4338ca;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
        const iframe = iframeRef.current;
        iframe.srcdoc = "";
        setTimeout(() => {
          iframe.srcdoc = fullHtml;
          iframe.onload = () => {
            setIsLoading(false);
            setLastUpdated(/* @__PURE__ */ new Date());
          };
          iframe.onerror = (error) => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage("Failed to load preview. Please check your HTML code for errors.");
            console.error("Preview error:", error);
          };
          setTimeout(() => {
            setIsLoading(false);
            setLastUpdated(/* @__PURE__ */ new Date());
          }, 1e3);
        }, 10);
      } catch (error) {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("An error occurred while generating the preview.");
        console.error("Preview generation error:", error);
      }
    }
  }, [html]);
  const toggleOrientation = () => {
    if (previewMode !== "desktop") {
      setOrientation((prev) => prev === "portrait" ? "landscape" : "portrait");
      toast.success(`Switched to ${orientation === "portrait" ? "landscape" : "portrait"} mode`);
    }
  };
  const handleZoomIn = () => {
    if (zoom < 2) {
      setZoom((prev) => Math.min(prev + 0.1, 2));
      toast.success(`Zoom: ${Math.round((zoom + 0.1) * 100)}%`);
    }
  };
  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom((prev) => Math.max(prev - 0.1, 0.5));
      toast.success(`Zoom: ${Math.round((zoom - 0.1) * 100)}%`);
    }
  };
  const handleResetZoom = () => {
    setZoom(1);
    toast.success("Zoom reset to 100%");
  };
  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");
      const currentSrc = iframeRef.current.srcdoc;
      iframeRef.current.srcdoc = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = currentSrc;
          setIsLoading(false);
          toast.success("Preview refreshed");
        }
      }, 100);
    }
  };
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast.success(isFullscreen ? "Exited fullscreen" : "Entered fullscreen");
  };
  const getPreviewWidth = () => {
    if (previewMode === "desktop") return "100%";
    const widths = {
      mobile: orientation === "portrait" ? "375px" : "667px",
      tablet: orientation === "portrait" ? "768px" : "1024px",
      desktop: "100%"
    };
    return widths[previewMode];
  };
  const getPreviewHeight = () => {
    if (previewMode === "desktop") return "100%";
    const heights = {
      mobile: orientation === "portrait" ? "667px" : "375px",
      tablet: orientation === "portrait" ? "1024px" : "768px",
      desktop: "100%"
    };
    return heights[previewMode];
  };
  return <div className="h-full glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {
    /* Header with responsive controls */
  }
      <div className="p-4 border-b border-border bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex flex-col gap-3">
          {
    /* Top row: Title and Device modes */
  }
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary animate-pulse" />
                <span className="font-bold text-primary">Live Preview</span>
              </h2>
              {
    /* Last updated indicator */
  }
              <motion.div
    className="text-xs text-muted-foreground flex items-center gap-1"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    key={lastUpdated.getTime()}
  >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </motion.div>
            </div>

            {
    /* Responsive mode toggles */
  }
            <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
              <motion.button
    onClick={() => {
      setPreviewMode("desktop");
      setOrientation("portrait");
    }}
    className={`p-2 rounded-md transition-all duration-200 ${previewMode === "desktop" ? "bg-primary text-foreground shadow-md scale-105" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}
    title="Desktop View (Full Width)"
    whileHover={{ scale: previewMode === "desktop" ? 1.05 : 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
                <Monitor className="w-4 h-4" />
              </motion.button>
              <motion.button
    onClick={() => {
      setPreviewMode("tablet");
      setOrientation("portrait");
    }}
    className={`p-2 rounded-md transition-all duration-200 ${previewMode === "tablet" ? "bg-primary text-foreground shadow-md scale-105" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}
    title="Tablet View (768px)"
    whileHover={{ scale: previewMode === "tablet" ? 1.05 : 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
                <Tablet className="w-4 h-4" />
              </motion.button>
              <motion.button
    onClick={() => {
      setPreviewMode("mobile");
      setOrientation("portrait");
    }}
    className={`p-2 rounded-md transition-all duration-200 ${previewMode === "mobile" ? "bg-primary text-foreground shadow-md scale-105" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}
    title="Mobile View (375px)"
    whileHover={{ scale: previewMode === "mobile" ? 1.05 : 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
                <Smartphone className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {
    /* Bottom row: Additional controls */
  }
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {
    /* Zoom controls */
  }
              <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
                <motion.button
    onClick={handleZoomOut}
    disabled={zoom <= 0.5}
    className={`p-1.5 rounded-md transition-all duration-200 ${zoom <= 0.5 ? "opacity-50 cursor-not-allowed text-muted-foreground" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}
    title="Zoom Out"
    whileHover={zoom > 0.5 ? { scale: 1.1 } : {}}
    whileTap={zoom > 0.5 ? { scale: 0.95 } : {}}
  >
                  <ZoomOut className="w-3.5 h-3.5" />
                </motion.button>
                <button
    onClick={handleResetZoom}
    className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    title="Reset Zoom"
  >
                  {Math.round(zoom * 100)}%
                </button>
                <motion.button
    onClick={handleZoomIn}
    disabled={zoom >= 2}
    className={`p-1.5 rounded-md transition-all duration-200 ${zoom >= 2 ? "opacity-50 cursor-not-allowed text-muted-foreground" : "hover:bg-background/80 text-muted-foreground hover:text-foreground"}`}
    title="Zoom In"
    whileHover={zoom < 2 ? { scale: 1.1 } : {}}
    whileTap={zoom < 2 ? { scale: 0.95 } : {}}
  >
                  <ZoomIn className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {
    /* Orientation toggle (only for mobile/tablet) */
  }
              <AnimatePresence>
                {previewMode !== "desktop" && <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    onClick={toggleOrientation}
    className="p-1.5 rounded-md bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all duration-200"
    title={`Switch to ${orientation === "portrait" ? "landscape" : "portrait"}`}
    whileHover={{ scale: 1.1, rotate: 90 }}
    whileTap={{ scale: 0.95 }}
  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </motion.button>}
              </AnimatePresence>
            </div>

            {
    /* Right side controls */
  }
            <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
              <motion.button
    onClick={handleRefresh}
    className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all duration-200"
    title="Refresh Preview"
    whileHover={{ scale: 1.1, rotate: 180 }}
    whileTap={{ scale: 0.95 }}
  >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
    onClick={toggleFullscreen}
    className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all duration-200"
    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
                <Maximize2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {
    /* Preview container */
  }
      <div
    className={`flex-grow overflow-auto flex items-center justify-center p-6 relative ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""} bg-gradient-to-br from-gray-900 to-gray-800`}
  >
        {
    /* Fullscreen close button */
  }
        <AnimatePresence>
          {isFullscreen && <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    onClick={toggleFullscreen}
    className="fixed top-4 right-4 z-50 p-3 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg hover:bg-background text-foreground"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
              <Maximize2 className="w-5 h-5" />
            </motion.button>}
        </AnimatePresence>

        <motion.div
    className="relative"
    style={{
      width: previewMode === "desktop" ? "100%" : "auto",
      height: previewMode === "desktop" ? "100%" : "auto",
      maxWidth: "100%",
      maxHeight: "100%",
      transform: `scale(${zoom})`,
      transformOrigin: "center"
    }}
    key={`${previewMode}-${orientation}`}
    initial={{ scale: 0.95 * zoom, opacity: 0, y: 10 }}
    animate={{ scale: 1 * zoom, opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
          {
    /* Device frame wrapper */
  }
          <div
    className={`relative ${previewMode !== "desktop" ? "shadow-2xl rounded-[2.5rem] border-[14px] border-gray-800 dark:border border-border" : "shadow-xl rounded-lg"}`}
    style={{
      width: getPreviewWidth(),
      height: getPreviewHeight(),
      minHeight: previewMode === "desktop" ? "100%" : getPreviewHeight()
    }}
  >
            {
    /* Device notch for mobile */
  }
            {previewMode === "mobile" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-32 h-6 bg-gray-800 dark:bg-gray-700 rounded-b-2xl flex items-center justify-center">
                  <div className="w-12 h-1 bg-muted dark:bg-gray-600 rounded-full" />
                </div>
              </div>}

            {
    /* Device camera for tablet */
  }
            {previewMode === "tablet" && <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-2 h-2 bg-muted dark:bg-gray-600 rounded-full" />
              </div>}

            {
    /* Error overlay */
  }
            {hasError && <div className="absolute inset-0 bg-background/90 dark:bg-muted/90 flex items-center justify-center z-30 rounded-lg">
                <div className="flex flex-col items-center gap-3 text-center p-4">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                  <h3 className="text-lg font-semibold text-foreground">Preview Error</h3>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                  <button
    onClick={handleRefresh}
    className="mt-2 px-4 py-2 bg-primary text-foreground rounded-md hover:bg-primary/90 transition-colors"
  >
                    Retry
                  </button>
                </div>
              </div>}

            {
    /* Loading overlay */
  }
            {isLoading && <div className="absolute inset-0 bg-background/90 dark:bg-muted/90 flex items-center justify-center z-30 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground font-medium">Loading preview...</p>
                </div>
              </div>}

            {
    /* Iframe */
  }
            <iframe
    ref={iframeRef}
    className={`w-full h-full border-0 ${previewMode !== "desktop" ? "rounded-[1.5rem]" : "rounded-lg"}`}
    title="Live Preview"
    sandbox="allow-scripts allow-same-origin"
    style={{
      background: "#0f172a"
    }}
  />

            {
    /* Home button for mobile */
  }
            {previewMode === "mobile" && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-10 h-10 border-2 border-gray-900 dark:border-gray-600 rounded-full" />
              </div>}
          </div>

          {
    /* Device label */
  }
          {previewMode !== "desktop" && <motion.div
    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50 shadow-sm"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    key={`${previewMode}-${orientation}`}
  >
              {previewMode === "mobile" ? `\u{1F4F1} iPhone 12 Pro ${orientation === "portrait" ? "(375\xD7667)" : "(667\xD7375)"} - ${orientation}` : `\u{1F4F1} iPad ${orientation === "portrait" ? "(768\xD71024)" : "(1024\xD7768)"} - ${orientation}`}
            </motion.div>}
        </motion.div>
      </div>
    </div>;
};
