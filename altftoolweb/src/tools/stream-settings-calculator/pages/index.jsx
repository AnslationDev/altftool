"use client";

import { useMemo, useState } from "react";

const PLATFORM_PRESETS = {
  youtube: { maxBitrate: 9000, recommended: "6000-9000", keyframe: 2 },
  twitch: { maxBitrate: 6000, recommended: "4500-6000", keyframe: 2 },
  kick: { maxBitrate: 8000, recommended: "5000-8000", keyframe: 2 },
  facebook: { maxBitrate: 6000, recommended: "3500-6000", keyframe: 2 },
  tiktok: { maxBitrate: 6000, recommended: "2500-6000", keyframe: 2 },
  trovo: { maxBitrate: 8000, recommended: "4000-8000", keyframe: 2 },
  linkedin: { maxBitrate: 6000, recommended: "3000-6000", keyframe: 2 },
  custom: { maxBitrate: 10000, recommended: "3000-10000", keyframe: 2 },
};

const RESOLUTION_FACTORS = {
  "480p": 0.7,
  "576p": 0.82,
  "720p": 1,
  "900p": 1.25,
  "1080p": 1.6,
  "1440p": 2.4,
  "4k": 3.8,
};

const FPS_FACTORS = { 24: 0.88, 25: 0.9, 30: 1, 48: 1.25, 50: 1.33, 60: 1.45 };

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function ToolHome() {
  const [platform, setPlatform] = useState("youtube");
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("60");
  const [uploadMbps, setUploadMbps] = useState("20");
  const [contentType, setContentType] = useState("gaming");
  const [encoder, setEncoder] = useState("nvenc");
  const [latencyMode, setLatencyMode] = useState("normal");
  const [targetQuality, setTargetQuality] = useState("balanced");
  const [packetLoss, setPacketLoss] = useState("0");
  const [cpuHeadroom, setCpuHeadroom] = useState("40");
  const [bitrateMode, setBitrateMode] = useState("cbr");
  const [audioMode, setAudioMode] = useState("stereo");

  const output = useMemo(() => {
    const upl = Number(uploadMbps) || 0;
    const loss = Number(packetLoss) || 0;
    const cpu = Number(cpuHeadroom) || 0;
    const preset = PLATFORM_PRESETS[platform] || PLATFORM_PRESETS.youtube;
    const base = 4500;
    const motionFactor =
      contentType === "gaming" ? 1.2 :
      contentType === "sports" ? 1.35 :
      contentType === "music" ? 1.1 :
      contentType === "irL" ? 1.15 :
      contentType === "education" ? 0.92 :
      contentType === "presentation" ? 0.85 :
      1;
    const resFactor = RESOLUTION_FACTORS[resolution] || 1;
    const fpsFactor = FPS_FACTORS[Number(fps)] || 1;
    const qualityFactor =
      targetQuality === "quality" ? 1.12 :
      targetQuality === "performance" ? 0.9 :
      targetQuality === "mobile" ? 0.82 :
      1;

    const estimatedNeed = Math.round(base * resFactor * fpsFactor * motionFactor * qualityFactor);
    const safeFromUpload = Math.round(upl * 1000 * 0.7);
    const modeFactor = bitrateMode === "vbr" ? 0.94 : bitrateMode === "capped-vbr" ? 0.9 : 1;
    const bitrate = clamp(Math.round(Math.min(estimatedNeed, safeFromUpload) * modeFactor), 1500, preset.maxBitrate);

    const uploadHeadroom = Math.max(0, Math.round(upl * 1000 - bitrate));
    const stability = uploadHeadroom > 4000 ? "Excellent" : uploadHeadroom > 2000 ? "Good" : uploadHeadroom > 800 ? "Fair" : "Risky";
    const latencyTune =
      latencyMode === "ultra-low"
        ? "Use ultra-low latency, reduce B-frames and prioritize stable keyframe cadence."
        : latencyMode === "low"
          ? "Use low-latency mode, disable look-ahead, reduce B-frames."
          : "Normal latency for better quality retention.";
    const codecProfile = encoder === "x264" ? (cpu > 45 ? "x264 medium" : "x264 veryfast") : encoder === "nvenc" ? "H.264 High Profile (NVENC Quality)" : "H.264 Main Profile (hardware)";
    const bframes = latencyMode === "low" ? 2 : 3;
    const bufferSize = bitrate * 2;

    const encoderPreset =
      encoder === "x264"
        ? "x264: veryfast (or faster if CPU constrained)"
        : encoder === "nvenc"
          ? "NVENC: quality preset, look-ahead off for stability"
          : "AMF/QuickSync: balanced preset, test for dropped frames";

    const audioBitrate = audioMode === "mono" ? 96 : platform === "youtube" ? 160 : 128;
    const healthPenalty = (stability === "Risky" ? 35 : stability === "Fair" ? 18 : stability === "Good" ? 7 : 0) + (loss * 6) + (cpu < 20 ? 12 : 0);
    const streamHealth = clamp(Math.round(100 - healthPenalty), 15, 100);
    const dropRisk = streamHealth >= 85 ? "Low" : streamHealth >= 65 ? "Moderate" : "High";
    const fallback = {
      resolution: resolution === "1440p" ? "1080p" : resolution === "1080p" ? "900p" : "720p",
      fps: Number(fps) === 60 ? 30 : Number(fps),
      bitrate: Math.max(2500, Math.round(bitrate * 0.78)),
    };

    return {
      bitrate,
      recommendedRange: preset.recommended,
      keyframe: preset.keyframe,
      bframes,
      bufferSize,
      uploadHeadroom,
      stability,
      streamHealth,
      dropRisk,
      audioBitrate,
      codecProfile,
      latencyTune,
      fallback,
      encoderPreset,
      notes: [
        "Keep keyframe interval fixed to platform requirement.",
        "Use CBR for most live platforms unless instructed otherwise.",
        "If stability is fair/risky, reduce FPS first, then resolution.",
      ],
    };
  }, [platform, resolution, fps, uploadMbps, contentType, encoder, latencyMode, targetQuality, packetLoss, cpuHeadroom, bitrateMode, audioMode]);

  const copyPreset = async () => {
    const text = [
      `Platform: ${platform}`,
      `Resolution/FPS: ${resolution} ${fps}fps`,
      `Video Bitrate: ${output.bitrate} kbps`,
      `Audio Bitrate: ${output.audioBitrate} kbps`,
      `Keyframe: ${output.keyframe}s | B-frames: ${output.bframes}`,
      `Buffer: ${output.bufferSize} kbps`,
      `Profile: ${output.codecProfile}`,
      `Health: ${output.streamHealth}/100 (${output.dropRisk} drop risk)`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  };

  const exportProfile = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      input: { platform, resolution, fps, uploadMbps, contentType, encoder, latencyMode, targetQuality, packetLoss, cpuHeadroom, bitrateMode, audioMode },
      output,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stream-settings-profile.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ssc-shell">
      <div className="ssc-container">
        <div className="ssc-hero">
          <h1 className="heading ssc-title">Stream Settings Calculator</h1>
          <p className="description ssc-subtitle">Get optimized bitrate, encoder, and stream stability recommendations.</p>
        </div>

        <div className="ssc-card ssc-form-card">
          <div className="ssc-form-grid">
            <select className="ssc-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="youtube">YouTube</option>
              <option value="twitch">Twitch</option>
              <option value="kick">Kick</option>
              <option value="facebook">Facebook Live</option>
              <option value="tiktok">TikTok Live</option>
              <option value="trovo">Trovo</option>
              <option value="linkedin">LinkedIn Live</option>
              <option value="custom">Custom RTMP</option>
            </select>
            <select className="ssc-input" value={resolution} onChange={(e) => setResolution(e.target.value)}>
              <option value="480p">480p</option>
              <option value="576p">576p</option>
              <option value="720p">720p</option>
              <option value="900p">900p</option>
              <option value="1080p">1080p</option>
              <option value="1440p">1440p</option>
              <option value="4k">4K</option>
            </select>
            <select className="ssc-input" value={fps} onChange={(e) => setFps(e.target.value)}>
              <option value="24">24 FPS</option>
              <option value="25">25 FPS</option>
              <option value="30">30 FPS</option>
              <option value="48">48 FPS</option>
              <option value="50">50 FPS</option>
              <option value="60">60 FPS</option>
            </select>
            <input type="number" min="1" className="ssc-input" value={uploadMbps} onChange={(e) => setUploadMbps(e.target.value)} placeholder="Upload speed (Mbps)" />
            <select className="ssc-input" value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="gaming">Gaming</option>
              <option value="talk">Talking Head</option>
              <option value="sports">Sports/High Motion</option>
              <option value="music">Music/Concert</option>
              <option value="irL">IRL/Outdoor</option>
              <option value="education">Education/Tutorial</option>
              <option value="presentation">Slides/Presentation</option>
            </select>
            <select className="ssc-input" value={encoder} onChange={(e) => setEncoder(e.target.value)}>
              <option value="nvenc">NVENC</option>
              <option value="x264">x264</option>
              <option value="av1">AV1 (if supported)</option>
              <option value="hevc">HEVC/H.265</option>
              <option value="other">AMF/QuickSync</option>
            </select>
            <select className="ssc-input" value={latencyMode} onChange={(e) => setLatencyMode(e.target.value)}>
              <option value="normal">Normal Latency</option>
              <option value="low">Low Latency</option>
              <option value="ultra-low">Ultra Low Latency</option>
            </select>
            <select className="ssc-input" value={targetQuality} onChange={(e) => setTargetQuality(e.target.value)}>
              <option value="balanced">Balanced Quality</option>
              <option value="quality">Max Quality</option>
              <option value="performance">Max Stability</option>
              <option value="mobile">Mobile Friendly</option>
            </select>
            <select className="ssc-input" value={bitrateMode} onChange={(e) => setBitrateMode(e.target.value)}>
              <option value="cbr">CBR</option>
              <option value="vbr">VBR</option>
              <option value="capped-vbr">Capped VBR</option>
            </select>
            <select className="ssc-input" value={audioMode} onChange={(e) => setAudioMode(e.target.value)}>
              <option value="stereo">Stereo</option>
              <option value="mono">Mono</option>
            </select>
            <input type="number" min="0" max="10" step="0.1" className="ssc-input" value={packetLoss} onChange={(e) => setPacketLoss(e.target.value)} placeholder="Packet loss (%)" />
            <input type="number" min="0" max="100" className="ssc-input" value={cpuHeadroom} onChange={(e) => setCpuHeadroom(e.target.value)} placeholder="CPU headroom (%)" />
          </div>
          <div className="ssc-actions">
            <button className="ssc-btn ssc-btn-primary" onClick={copyPreset}>Copy Preset</button>
            <button className="ssc-btn ssc-btn-secondary" onClick={exportProfile}>Export JSON</button>
          </div>
        </div>

        <div className="ssc-grid">
          <div className="ssc-card ssc-panel">
            <h2 className="ssc-h2">Recommended Settings</h2>
            <p className="ssc-muted">Video Bitrate: <strong>{output.bitrate} kbps</strong></p>
            <p className="ssc-muted">Platform Range: <strong>{output.recommendedRange} kbps</strong></p>
            <p className="ssc-muted">Keyframe Interval: <strong>{output.keyframe}s</strong></p>
            <p className="ssc-muted">B-Frames: <strong>{output.bframes}</strong></p>
            <p className="ssc-muted">Buffer Size (VBV): <strong>{output.bufferSize} kbps</strong></p>
            <p className="ssc-muted">Audio Bitrate: <strong>{output.audioBitrate} kbps</strong></p>
          </div>
          <div className="ssc-card ssc-panel">
            <h2 className="ssc-h2">Stability & Encoder</h2>
            <p className="ssc-muted">Upload Headroom: <strong>{output.uploadHeadroom} kbps</strong></p>
            <p className="ssc-muted">Stability Grade: <strong>{output.stability}</strong></p>
            <p className="ssc-muted">Stream Health: <strong>{output.streamHealth}/100</strong> ({output.dropRisk} risk)</p>
            <p className="ssc-muted">Codec Profile: <strong>{output.codecProfile}</strong></p>
            <p className="ssc-muted">{output.encoderPreset}</p>
            <p className="ssc-muted">{output.latencyTune}</p>
          </div>
          <div className="ssc-card ssc-panel ssc-wide">
            <h2 className="ssc-h2">Adaptive Fallback (If Frames Drop)</h2>
            <p className="ssc-muted">Resolution fallback: <strong>{output.fallback.resolution}</strong></p>
            <p className="ssc-muted">FPS fallback: <strong>{output.fallback.fps} FPS</strong></p>
            <p className="ssc-muted">Bitrate fallback: <strong>{output.fallback.bitrate} kbps</strong></p>
          </div>
        </div>

        <div className="ssc-card ssc-panel">
          <h2 className="ssc-h2">Pro Tips</h2>
          <ul className="ssc-list">
            {output.notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
