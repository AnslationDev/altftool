"use client";

import React, { useMemo } from "react";
import { Table, Info, HelpCircle } from "lucide-react";

// Standard apertures to use as table columns
const TABLE_APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];

// Preset focus distances depending on unit
const DISTANCES_METRIC = [0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0];
const DISTANCES_IMPERIAL = [2.0, 4.0, 6.0, 8.0, 10.0, 15.0, 25.0, 50.0, 100.0];

export default function DofTable({ sensor, focalLength, distanceUnit }) {

  const distances = useMemo(() => {
    return distanceUnit === "m" ? DISTANCES_METRIC : DISTANCES_IMPERIAL;
  }, [distanceUnit]);

  // Compute DoF matrix cells
  const dofMatrix = useMemo(() => {
    const f = focalLength;
    const c = sensor.coc;
    const scale = distanceUnit === "m" ? 1000 : 304.8;

    return distances.map((distVal) => {
      const s = distVal * scale; // Focus distance in mm

      const rowData = {
        distance: distVal,
        apertures: {}
      };

      TABLE_APERTURES.forEach((N) => {
        // H = f^2 / (N * c) + f
        const H = (f * f) / (N * c) + f;

        let totalDofText = "";
        let dofVal = 0;

        if (s >= H) {
          totalDofText = "∞";
        } else {
          const nearLimit = (s * (H - f)) / (H + s - 2 * f);
          const farLimit = (s * (H - f)) / (H - s);

          if (farLimit < 0 || isNaN(farLimit) || farLimit === Infinity) {
            totalDofText = "∞";
          } else {
            dofVal = farLimit - nearLimit;
            const valInTarget = dofVal / scale;

            if (valInTarget < 0.01) {
              // Show in mm or inches for very close focus macro depth of field
              if (distanceUnit === "m") {
                totalDofText = `${(valInTarget * 100).toFixed(1)} cm`;
              } else {
                totalDofText = `${(valInTarget * 12).toFixed(1)}"`;
              }
            } else if (valInTarget > 100) {
              totalDofText = "∞";
            } else {
              totalDofText = `${valInTarget.toFixed(2)} ${distanceUnit}`;
            }
          }
        }

        rowData.apertures[N] = {
          text: totalDofText,
          isInfinite: totalDofText === "∞"
        };
      });

      return rowData;
    });
  }, [sensor, focalLength, distanceUnit, distances]);

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-[var(--card-border)] gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">
            <Table className="h-5 w-5 text-[var(--primary)]" />
            Depth of Field Reference Grid
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 font-mono">
            Sensor: {sensor.name.split(" ")[0]} ({sensor.cropFactor}x Crop) • Lens: {focalLength}mm
          </p>
        </div>
        <div className="text-xs rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-2 text-[var(--primary)] font-medium flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>Table shows total acceptable sharpness ranges.</span>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-inner">
        <table className="w-full border-collapse text-left text-xs font-bold text-[var(--foreground)]">
          <thead>
            <tr className="bg-[var(--card)] border-b border-[var(--card-border)]">
              <th className="px-4 py-4 text-xs font-black uppercase text-[var(--secondary-foreground)] tracking-wider border-r border-[var(--card-border)]">
                Focus Distance
              </th>
              {TABLE_APERTURES.map((ap) => (
                <th
                  key={ap}
                  className="px-4 py-4 text-center text-xs font-black font-mono text-[var(--primary)] border-r last:border-r-0 border-[var(--card-border)]"
                >
                  f/{ap}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)] font-mono text-sm">
            {dofMatrix.map((row) => (
              <tr key={row.distance} className="hover:bg-[var(--muted)]/20 transition-colors duration-75">
                <td className="px-4 py-3.5 font-bold font-secondary text-xs text-[var(--secondary-foreground)] bg-[var(--card)]/40 border-r border-[var(--card-border)]">
                  {row.distance.toFixed(1)} {distanceUnit}
                </td>
                {TABLE_APERTURES.map((ap) => {
                  const cell = row.apertures[ap];
                  return (
                    <td
                      key={ap}
                      className={`px-4 py-3.5 text-center font-semibold border-r last:border-r-0 border-[var(--card-border)] ${
                        cell.isInfinite
                          ? "text-[var(--primary)] font-black bg-[var(--primary)]/5"
                          : cell.text.includes("cm") || cell.text.includes('"')
                          ? "text-[var(--secondary-foreground)]/80 font-bold bg-[var(--muted)]/20"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {cell.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex gap-3.5 items-start">
        <HelpCircle className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-medium">
          <h4 className="font-bold text-[var(--foreground)] mb-1">How to Read this Grid</h4>
          <ul className="list-disc pl-4 space-y-1 text-[var(--secondary-foreground)]">
            <li>
              <strong>Apertures (f/stops)</strong> run horizontally. As f-number increases (stopping down), the depth of field deepens.
            </li>
            <li>
              <strong>Subject Distances</strong> run vertically. The closer the camera is to the focus target, the shallower the depth of field becomes.
            </li>
            <li>
              <span className="text-[var(--primary)] font-black bg-[var(--primary)]/5 px-1 py-0.5 rounded">∞ (Infinity symbol)</span> cells indicate the far limit extends to infinity (the subject distance is equal to or greater than the hyperfocal distance). Perfect for zone focusing or landscape shooting!
            </li>
            <li>
              <span className="text-[var(--secondary-foreground)]/80 font-bold bg-[var(--muted)]/20 px-1 py-0.5 rounded">Highlighted close-up cells</span> represent highly compressed depth of field (under 1 cm or 1 inch), typical for macro photography and closeups.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
