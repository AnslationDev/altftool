"use client";

import React from "react";
import { BookOpen, Camera, Info, HelpCircle, AlertTriangle, Eye, Sparkles } from "lucide-react";

export default function DofGuide() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl">
        <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2 mb-6 pb-4 border-b border-[var(--card-border)]">
          <BookOpen className="h-5 w-5 text-[var(--primary)]" />
          The Science & Art of Depth of Field
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: What is Depth of Field */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 p-5 space-y-3">
            <h4 className="text-sm font-black text-[var(--foreground)] flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-[var(--primary)]" />
              1. What is Depth of Field (DoF)?
            </h4>
            <p className="text-xs text-[var(--secondary-foreground)] leading-relaxed font-medium">
              Depth of field is the zone of acceptable sharpness within a photo that will appear in focus. In every photo, there is a single plane of absolute, perfect focus. As objects move closer to or farther away from this plane, they gradually become less sharp. The range where this loss of sharpness remains unnoticeable to the human eye is called the <strong>Depth of Field</strong>.
            </p>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono border-t border-[var(--card-border)]/40 pt-2.5">
              • Wide aperture (f/1.4) = Shallow DoF (blurry background, great for portraits).<br />
              • Narrow aperture (f/16) = Deep DoF (everything sharp, great for landscapes).
            </div>
          </div>

          {/* Card 2: Circle of Confusion */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 p-5 space-y-3">
            <h4 className="text-sm font-black text-[var(--foreground)] flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-[var(--primary)]" />
              2. Circle of Confusion (CoC)
            </h4>
            <p className="text-xs text-[var(--secondary-foreground)] leading-relaxed font-medium">
              A single point of light in three-dimensional space is projected onto a camera sensor as a tiny circular spot. If this spot is smaller than the sensor's threshold of detail, the human eye perceives it as a perfect "point" (sharp). If the spot is larger, we perceive it as a blurry circle. The maximum acceptable diameter of this spot is the <strong>Circle of Confusion (CoC)</strong> limit.
            </p>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono border-t border-[var(--card-border)]/40 pt-2.5">
              • Full Frame standard CoC = 0.030 mm<br />
              • APS-C standard CoC = 0.020 mm (due to higher crop enlargement)<br />
              • Micro Four Thirds standard CoC = 0.015 mm
            </div>
          </div>

          {/* Card 3: Hyperfocal Distance */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 p-5 space-y-3">
            <h4 className="text-sm font-black text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[var(--primary)]" />
              3. The Power of Hyperfocal Distance
            </h4>
            <p className="text-xs text-[var(--secondary-foreground)] leading-relaxed font-medium">
              The <strong>Hyperfocal Distance</strong> is the focus distance that gives your camera the maximum possible depth of field. When you focus your lens exactly at the hyperfocal distance, everything from <strong>half of that distance</strong> all the way to <strong>infinity</strong> will be acceptably sharp! This is the ultimate tool for landscape photographers wanting edge-to-edge sharpness.
            </p>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono border-t border-[var(--card-border)]/40 pt-2.5">
              • Formula: H = (Focal Length²) / (Aperture × Circle of Confusion)<br />
              • Example: 24mm at f/8 on Full Frame. H is 2.4 meters. Focus at 2.4m, and everything from 1.2m to Infinity is sharp!
            </div>
          </div>

          {/* Card 4: Diffraction softeness */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 p-5 space-y-3">
            <h4 className="text-sm font-black text-[var(--foreground)] flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-[var(--primary)]" />
              4. Why f/22 Isn't Always Sharp (Diffraction)
            </h4>
            <p className="text-xs text-[var(--secondary-foreground)] leading-relaxed font-medium">
              It is a common mistake to assume that using the smallest aperture (like f/22 or f/32) always guarantees the sharpest photo. In physics, when light passes through a very tiny hole (a narrow aperture), it bends and spreads out. This is called <strong>diffraction</strong>. When this scattered light creates a blur (Airy Disk) larger than your sensor's Circle of Confusion, your entire image will appear slightly soft.
            </p>
            <div className="text-[10px] text-[var(--muted-foreground)] font-mono border-t border-[var(--card-border)]/40 pt-2.5">
              • Sweet Spot: Most modern lenses are at their sharpest between <strong>f/4.0 and f/8.0</strong>.<br />
              • Higher f-stops (f/16, f/22) increase DoF but lower pixel-level peak resolution.
            </div>
          </div>
        </div>

        {/* Practical workflow box */}
        <div className="mt-6 p-5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] space-y-3">
          <h4 className="text-sm font-black text-[var(--primary)] flex items-center gap-2">
            <Info className="h-4.5 w-4.5 text-[var(--primary)]" />
            3 Golden Rules of Focus Workflows
          </h4>
          <ol className="list-decimal pl-5 space-y-2 text-xs font-medium text-[var(--secondary-foreground)] leading-relaxed">
            <li>
              <strong>The 1/3 - 2/3 Concept:</strong> At close portrait distances, the depth of field is distributed roughly <strong>50% in front and 50% behind</strong> the subject. As you move farther away, the depth behind the subject grows exponentially (eventually reaching <strong>1/3 in front, 2/3 behind</strong>). Bear this in mind when aiming your focus point!
            </li>
            <li>
              <strong>Focal Length has the Largest Impact:</strong> Focal length compresses depth of field dramatically. A 200mm lens has a much shallower depth of field than a 24mm lens, even if you keep the subject distance and f-stop identical!
            </li>
            <li>
              <strong>Pre-Calculate for Zone Focusing:</strong> Street photographers using manual lenses can lock aperture to f/8, calculate DoF for a focus distance of 3m (giving a sharp range of 2.1m to 5.2m), and shoot completely without autofocusing. This is called <strong>Zone Focusing</strong> and is lightning fast!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
