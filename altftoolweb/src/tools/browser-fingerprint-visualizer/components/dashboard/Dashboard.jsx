"use client";

import { useFingerprint } from "../../hooks/useFingerprint";
import { useStabilityTest } from "../../hooks/useStabilityTest.js";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { FingerprintID } from "./FingerprintID";
import { TrackingRiskMeter } from "./TrackingRiskMeter";
import { CanvasFingerprint } from "../sections/CanvasFingerprint";
import { WebGLFingerprint } from "../sections/WebGLFingerprint";
import { AudioFingerprint } from "../sections/AudioFingerprint";
import { FontDetection } from "../sections/FontDetection";
import { DeviceInfo } from "../sections/DeviceInfo";
import { BrowserInfo } from "../sections/BrowserInfo";
import { ScreenGraphics } from "../sections/ScreenGraphics";
import { StorageCapabilities } from "../sections/StorageCapabilities";
import { MediaDevices } from "../sections/MediaDevices";
import { UniquenessEstimator } from "../sections/UniquenessEstimator";
import { StabilityTest } from "../sections/StabilityTest";
import { TrackingSimulation } from "../sections/TrackingSimulation";
import { PrivacyRecommendations } from "../sections/PrivacyRecommendations";
import { RefreshCw } from "lucide-react";

export function Dashboard() {
  const {
    loading,
    progress,
    currentStep,
    fingerprintId,
    signals,
    riskScore,
    uniqueness,
    privacyTips,
    error,
    refresh,
  } = useFingerprint();

  const stability = useStabilityTest(fingerprintId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-center p-8">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="subheading mb-2">Analysis Failed</h2>
          <p className="description mb-6">{error}</p>
          <button
            onClick={refresh}
            className="px-6 py-2.5 rounded-xl bg-(--primary) text-white
                       text-sm font-medium font-secondary hover:opacity-90
                       transition-opacity active:scale-95 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      <Header loading={loading} progress={progress} currentStep={currentStep} />

      {/* ─ 3-column: Left Ad | Content | Right Ad ─ */}
      <div className="flex w-full max-w-[1600px] mx-auto ">
       

        {/*  MAIN CONTENT ─ */}
        <main className="flex-1 min-w-0 ">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="heading mb-2 text-2xl md:text-5xl 2xl:text-4xl ">Browser Fingerprint Visualizer</h1>
            <p className="description max-w-2xl text-md ">
              Discover exactly how trackers identify your browser across the web
              — without cookies, without logins, without your knowledge.
            </p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4 md:p-0 p-5">
            <div className="lg:col-span-2">
              <FingerprintID fingerprintId={fingerprintId} loading={loading} />
            </div>
            <div className="lg:col-span-1">
              <TrackingRiskMeter riskScore={riskScore} loading={loading} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mb-4 md:p-0 p-5">
            <UniquenessEstimator uniqueness={uniqueness} loading={loading} />
            <StabilityTest stability={stability} loading={loading} />
          </div>
          <TrackingSimulation
            fingerprintId={fingerprintId}
            riskScore={riskScore}
            loading={loading}
          />
       
          <div className="md:py-8 py-5">
<SectionDivider
            title=" Fingerprint Signals"
            subtitle="The raw data used to build your fingerprint"
          />
          <WebGLFingerprint
            webgl={signals.webgl}
            loading={loading}
            className=""
          />

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:p-0 py-5 mt-5 ">
            <AudioFingerprint audio={signals.audio} loading={loading} />
            <CanvasFingerprint canvas={signals.canvas} loading={loading} />
          </div>
          </div>

          

          {/* Row 4 */}
          <div className="mb-3">
            <FontDetection fonts={signals.fonts} loading={loading} />
          </div>

          
        

<div  className="md:py-8 py-5">
 <SectionDivider
            title="Device & Browser Profile"
            subtitle="What your device reveals about itself"
          />

          {/* Row 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 p-5 ">
            <DeviceInfo device={signals.device} loading={loading} />
            <BrowserInfo browser={signals.browser} loading={loading} />
            <ScreenGraphics screen={signals.screen} loading={loading} />
          </div>
</div>
         

          {/* Row 6 */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4 p-5">
            <StorageCapabilities storage={signals.storage} loading={loading} />
            <MediaDevices media={signals.media} loading={loading} />
          </div>

          <div className="md:py-5 py-2">
            <SectionDivider
              title="Privacy Protection"
              subtitle="How to reduce your tracking risk"
            />

            {/* Row 7 */}
            <div className="p-5">
              <PrivacyRecommendations tips={privacyTips} loading={loading} />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer
                         bg-(--primary)/10 border border-(--primary)/25
                         text-(--primary) text-sm font-semibold font-secondary
                         hover:bg-(--primary)/20 active:scale-95
                         transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Analyzing..." : "Re-run Analysis"}
            </button>
          </div>
         
        </main>

       
      </div>

      <Footer />
    </div>
  );
}

function SectionDivider({ title, subtitle }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-(--border)" />
      <div className="text-center shrink-0">
        <p className="md:text-4xl text-md font-semibold font-primary text-(--foreground)">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-(--muted-foreground) font-secondary mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 h-px bg-(--border)" />
    </div>
  );
}

export default Dashboard;
