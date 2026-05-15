// src/tools/afterimage-generator/components.jsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Download,
  Image as ImageIcon,
  Info,
  Palette,
  Play,
  RotateCcw,
  Square,
  Upload,
  X,
} from 'lucide-react';

export const ProgressRing = ({ progress, timeLeft }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-5 px-4 text-center">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="h-36 w-36 -rotate-90 sm:h-44 sm:w-44">
          <circle cx="90" cy="90" r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="transparent" />
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke="var(--primary)"
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.1, ease: 'linear' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-4xl font-black text-white sm:text-5xl">{Math.ceil(timeLeft)}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Seconds</span>
        </div>
      </div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
      >
        <p className="text-xs font-semibold tracking-wide text-white sm:text-sm">Keep your eyes fixed on the center</p>
      </motion.div>
    </div>
  );
};

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center space-y-4 p-12">
    <div className="relative">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-[var(--primary)] opacity-20" />
    </div>
    <p className="animate-pulse font-medium text-[var(--muted-foreground)]">Processing image...</p>
  </div>
);

export const AfterimageCanvas = ({
  mode,
  selectedColor,
  uploadedImage,
  isStaring,
  timeLeft,
  timerDuration,
  intensity,
  isFullscreen,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let image = null;
    let objectUrl = null;
    let cancelled = false;

    const drawFixationPoint = (ctx, width, height) => {
      const ring = Math.min(width, height) * 0.16;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    };

    const drawPlaceholder = (ctx, width, height) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#dbeafe');
      gradient.addColorStop(0.5, '#f8fbff');
      gradient.addColorStop(1, '#bfdbfe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(37,99,235,0.1)';
      for (let i = 0; i < 10; i += 1) {
        ctx.beginPath();
        ctx.arc(width * (0.15 + i * 0.08), height * (0.24 + (i % 4) * 0.14), width * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (mode === 'color') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, width, height);
      } else if (mode === 'image' && image?.complete && image.naturalWidth) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const x = (width - image.naturalWidth * scale) / 2;
        const y = (height - image.naturalHeight * scale) / 2;
        ctx.filter = `saturate(${intensity.saturation}) brightness(${intensity.brightness}) contrast(${0.75 + intensity.contrast})`;
        ctx.drawImage(image, x, y, image.naturalWidth * scale, image.naturalHeight * scale);
        ctx.filter = 'none';
      } else {
        drawPlaceholder(ctx, width, height);
      }

      drawFixationPoint(ctx, width, height);
    };

    if (mode === 'image' && uploadedImage) {
      image = new Image();
      image.onload = () => {
        if (!cancelled) draw();
      };
      image.src = typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage);
      if (typeof uploadedImage !== 'string') objectUrl = image.src;
    }

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);
    draw();

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, selectedColor, uploadedImage, intensity]);

  return (
    <div className={`afterimage-canvas-shell relative w-full overflow-hidden transition-all duration-500 ease-in-out ${isFullscreen ? 'h-screen rounded-none' : 'min-h-[320px] rounded-[1.25rem] sm:aspect-[16/10] sm:min-h-[420px] lg:min-h-[560px]'}`}>
      <canvas ref={canvasRef} className="block h-full min-h-[320px] w-full sm:min-h-[420px] lg:min-h-[560px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_28%,rgba(0,0,0,0.16)_100%)]" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur">
        Fixation target
      </div>
      <AnimatePresence>
        {isStaring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-md"
          >
            <ProgressRing progress={(timeLeft / timerDuration) * 100} timeLeft={timeLeft} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const IntensitySlider = ({ label, value, onChange, min, max, step, disabled }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="shrink-0 rounded bg-[var(--muted)] px-2 py-0.5 font-mono text-xs text-[var(--muted-foreground)]">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--muted)] accent-[var(--primary)] disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--muted) ${percentage}%, var(--muted) 100%)`,
        }}
      />
    </div>
  );
};

export const TimerSelector = ({ value, onChange, disabled }) => {
  const durations = [10, 20, 30, 45];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-[var(--primary)]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Duration</h3>
      </div>
      <div className="grid grid-cols-4 gap-2 rounded-xl bg-[var(--muted)] p-1">
        {durations.map((duration) => (
          <button
            key={duration}
            onClick={() => onChange(duration)}
            disabled={disabled}
            className={`min-w-0 rounded-lg py-2 text-xs font-black transition-all ${
              value === duration
                ? 'border border-[var(--border)] bg-[var(--card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {duration}s
          </button>
        ))}
      </div>
    </div>
  );
};

export const ColorGrid = ({ selectedColor, onColorChange, disabled }) => {
  const colors = [
    '#ff3333', '#ff9933', '#ffff33', '#33ff33', '#33ffff', '#3333ff', '#9933ff', '#ff33ff',
    '#ffffff', '#888888', '#444444', '#000000', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-[var(--primary)]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Colors</h3>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {colors.map((color) => (
          <motion.button
            key={color}
            whileHover={!disabled ? { scale: 1.14, zIndex: 10 } : {}}
            whileTap={!disabled ? { scale: 0.92 } : {}}
            onClick={() => onColorChange(color)}
            disabled={disabled}
            className={`aspect-square rounded-full border-2 transition-all ${
              selectedColor === color ? 'scale-110 border-[var(--primary)] shadow-lg' : 'border-[var(--border)]'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export const UploadZone = ({ onImageUpload, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') setDragActive(true);
    else if (event.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files?.[0]) onImageUpload(event.dataTransfer.files[0]);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative flex h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all md:h-44 ${
        dragActive ? 'scale-[0.98] border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--card)]'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => event.target.files?.[0] && onImageUpload(event.target.files[0])}
        className="hidden"
      />
      <div className="mb-2 rounded-full bg-[var(--muted)] p-3">
        <Upload size={20} className="text-[var(--primary)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--foreground)]">Click or Drag Image</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">PNG, JPG, WebP</p>
    </div>
  );
};

export const ImagePreview = ({ image, onRemove }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    if (!image || typeof image === 'string') return undefined;

    const objectUrl = URL.createObjectURL(image);
    if (imageRef.current) imageRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  if (!image) return null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
      <img ref={imageRef} src={typeof image === 'string' ? image : undefined} alt="Preview" className="h-44 w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onRemove}
          className="rounded-full bg-red-500 p-2 text-white transition-all hover:scale-110 hover:bg-red-600"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white">Image Loaded</p>
      </div>
    </div>
  );
};

export const ControlPanel = ({
  mode,
  onModeChange,
  selectedColor,
  onColorChange,
  uploadedImage,
  onImageUpload,
  timerDuration,
  onTimerDurationChange,
  intensity,
  onIntensityChange,
  isStaring,
  onStartStare,
  onStopStare,
  onReset,
}) => {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">Controls</p>
          <h2 className="mt-1 text-xl font-black text-[var(--foreground)]">Build the stimulus</h2>
        </div>
        <div className={`h-3 w-3 rounded-full ${isStaring ? 'bg-red-500' : 'bg-emerald-500'}`} />
      </div>

      <div className="space-y-5">
        <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">1. Select Mode</h3>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--muted)] p-1">
              <button
                onClick={() => onModeChange('color')}
                disabled={isStaring}
                className={`min-w-0 rounded-xl py-3 text-sm font-bold transition-all ${
                  mode === 'color' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'
                }`}
                type="button"
              >
                <span className="flex items-center justify-center gap-2"><Palette size={18} /> Color</span>
              </button>
              <button
                onClick={() => onModeChange('image')}
                disabled={isStaring}
                className={`min-w-0 rounded-xl py-3 text-sm font-bold transition-all ${
                  mode === 'image' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'
                }`}
                type="button"
              >
                <span className="flex items-center justify-center gap-2"><ImageIcon size={18} /> Image</span>
              </button>
            </div>
          </div>

          {mode === 'color' ? (
            <ColorGrid selectedColor={selectedColor} onColorChange={onColorChange} disabled={isStaring} />
          ) : (
            <div className="space-y-4">
              {uploadedImage ? (
                <ImagePreview image={uploadedImage} onRemove={() => onImageUpload(null)} />
              ) : (
                <UploadZone onImageUpload={onImageUpload} disabled={isStaring} />
              )}
            </div>
          )}

          <TimerSelector value={timerDuration} onChange={onTimerDurationChange} disabled={isStaring} />
        </div>

        <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">2. Adjust Intensity</h3>
            <IntensitySlider
              label="Inversion Intensity"
              value={intensity.inversionIntensity}
              onChange={(value) => onIntensityChange({ ...intensity, inversionIntensity: value })}
              min={0}
              max={1}
              step={0.01}
              disabled={isStaring}
            />
            {mode === 'image' && (
              <>
                <IntensitySlider
                  label="Saturation"
                  value={intensity.saturation}
                  onChange={(value) => onIntensityChange({ ...intensity, saturation: value })}
                  min={0}
                  max={2}
                  step={0.1}
                  disabled={isStaring}
                />
                <IntensitySlider
                  label="Brightness"
                  value={intensity.brightness}
                  onChange={(value) => onIntensityChange({ ...intensity, brightness: value })}
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  disabled={isStaring}
                />
              </>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">3. Experience</h3>
            <div className="flex gap-3">
              {!isStaring ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartStare}
                  className="btn-primary flex-1 rounded-2xl py-4 font-bold"
                  type="button"
                >
                  <Play size={20} fill="currentColor" /> Start
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStopStare}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600"
                  type="button"
                >
                  <Square size={20} fill="currentColor" /> Stop
                </motion.button>
              )}
              <button onClick={onReset} className="btn-secondary h-auto rounded-2xl p-4" title="Reset" type="button">
                <RotateCcw size={20} />
              </button>
            </div>
            <p className="text-center text-[10px] italic text-[var(--muted-foreground)]">
              Fixate on the white dot in the center of the canvas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultOverlay = ({ isVisible, resultImage, onClose, onExport }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            className="custom-scrollbar relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-2xl"
          >
            <div className="sticky top-0 z-20 flex justify-end gap-3 bg-[var(--card)]/90 p-4 backdrop-blur sm:p-6">
              <button onClick={onExport} className="btn-primary rounded-full px-5 py-2.5" title="Download Result" type="button">
                <Download size={18} />
                <span className="text-sm font-bold">Download</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-red-500/20 bg-red-500/10 p-2.5 text-red-500 transition-all hover:bg-red-500/20"
                title="Close"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-7 p-5 sm:p-8 md:p-10">
              <div className="text-center">
                <h2 className="afterimage-heading text-3xl font-black md:text-4xl">Your Retinal Afterimage</h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)] md:text-base">
                  Blink rapidly or look at a plain white surface to see the illusion.
                </p>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                <img src={resultImage} alt="Afterimage" className="h-full w-full object-contain" />
              </div>

              <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 md:grid-cols-2">
                <InfoBlock
                  icon={<Info size={22} />}
                  title="How it works"
                  text="Photoreceptors become fatigued by intense colors. When you look away, the less-fatigued complementary receptors respond more strongly."
                />
                <InfoBlock
                  icon={<Palette size={22} />}
                  title="Complementary Colors"
                  text="Red can create cyan afterimages, green can create magenta, and blue can create yellow through opponent-process vision."
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InfoBlock = ({ icon, title, text }) => (
  <div className="flex gap-4">
    <div className="h-fit rounded-xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]">{icon}</div>
    <div className="min-w-0">
      <h4 className="text-sm font-black text-[var(--foreground)]">{title}</h4>
      <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">{text}</p>
    </div>
  </div>
);

export const ScientificEducation = () => {
  const items = [
    {
      title: 'Retinal Adaptation',
      icon: <Info size={20} />,
      text: 'Prolonged exposure to one color temporarily desensitizes the matching cone cells in your retina.',
    },
    {
      title: 'Opponent-Process',
      icon: <Palette size={20} />,
      text: 'The visual system processes colors in opposing pairs, so the complementary signal feels stronger after staring.',
    },
    {
      title: 'Neural Persistence',
      icon: <Clock size={20} />,
      text: 'Your brain continues processing the inverted signal for a few seconds after the original stimulus disappears.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">Science Behind</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--foreground)]">Why afterimages appear</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
          The experiment is simple, but the effect comes from real color-processing behavior inside the eye and brain.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition-all hover:border-[var(--primary)]/40">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              {item.icon}
            </div>
            <h4 className="text-base font-black text-[var(--foreground)]">{item.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
