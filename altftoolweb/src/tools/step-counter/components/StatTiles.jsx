"use client";

import { Building2, Clock3, Flame, MapPin } from "lucide-react";
import {
  caloriesBurned,
  distanceKm,
  estimateFloors,
  formatActiveTime,
  formatNumber,
} from "../utils/stepStore";
import { toneStyle } from "../utils/tones";
import { CARD, CARD_HOVER } from "./ui.jsx";

function Tile({ icon: Icon, tone, value, unit, label }) {
  return (
    <div className={`${CARD} ${CARD_HOVER} flex flex-col items-center justify-center p-4 text-center`}>
      <span
        className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full"
        style={toneStyle(tone)}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="text-[22px] font-extrabold leading-tight tabular-nums text-(--foreground)">
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-semibold text-(--muted-foreground)">{unit}</span>
        ) : null}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted-foreground)">
        {label}
      </p>
    </div>
  );
}

export default function StatTiles({ steps, activeMs }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Today's activity stats">
      <Tile icon={MapPin} tone="primary" value={distanceKm(steps)} unit="km" label="Distance" />
      <Tile
        icon={Flame}
        tone="warning"
        value={formatNumber(caloriesBurned(steps))}
        unit="kcal"
        label="Calories"
      />
      <Tile icon={Clock3} tone="info" value={formatActiveTime(activeMs)} label="Active Time" />
      <Tile
        icon={Building2}
        tone="success"
        value={formatNumber(estimateFloors(steps))}
        unit="floors"
        label="Floors (est.)"
      />
    </div>
  );
}
