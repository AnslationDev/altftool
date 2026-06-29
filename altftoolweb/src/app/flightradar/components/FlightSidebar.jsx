// src/app/flightradar/components/FlightSidebar.jsx
"use client";

import { X, Settings, Info, Lock } from 'lucide-react';

export default function FlightSidebar({ selectedFlight, onSelectFlight }) {

  if (!selectedFlight) {
    return null;
  }

  return (
    <div className="absolute top-28 left-6 bottom-6 z-40 w-full sm:w-[380px] bg-card/95 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(13,148,136,0.2)] flex flex-col transform transition-all duration-500 overflow-hidden border border-border/50" style={{ borderRadius: '2rem 4rem 2rem 2rem' }}>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Top Image Section - Handcrafted Rotation Effect */}
        <div className="relative p-6 pb-2 shrink-0">
          <div className="relative h-[200px] w-full rounded-2xl overflow-hidden -rotate-1 border-4 border-white shadow-sm transition-transform hover:rotate-0 duration-500">
            <img
              src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&h=400"
              alt="Aircraft"
              className="w-full h-full object-cover filter sepia-[0.3]"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          </div>

          <button
            onClick={() => onSelectFlight(null)}
            className="absolute top-3 right-3 bg-card hover:bg-white text-primary p-1.5 rounded-full shadow-sm transition-transform hover:scale-80 active:scale-95 z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Flight Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-foreground font-sans leading-none tracking-tight">{selectedFlight.flightNumber}</h2>
              <p className="text-sm text-[var(--secondary)] font-bold mt-2 uppercase tracking-widest">{selectedFlight.airline}</p>
            </div>
            {/* Airline Logo Mock Organic */}
            <div className="w-14 h-14 bg-white/50 rounded-full border border-border/50 shadow-sm flex items-center justify-center">
              <div className="font-bold text-primary text-xl font-sans">
                {selectedFlight.airline.substring(0, 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Route / Progress Section */}
        <div className="px-6 py-6 relative">
          <div className="flex justify-between items-center text-center">
            {/* Origin */}
            <div className="flex flex-col items-start w-[100px]">
              <div className="text-4xl font-sans text-foreground leading-tight">{selectedFlight.origin.code}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 w-full truncate text-left" title={selectedFlight.origin.name}>{selectedFlight.origin.name}</div>
            </div>

            {/* Progress */}
            <div className="flex-1 px-4 flex flex-col items-center">
              {/* Organic hand-drawn feeling path */}
              <div className="w-full relative h-px flex bg-border border-b border-dashed border-border my-3">
                {/* Completed */}
                <div
                  className="h-1 bg-primary/20 rounded-full relative -top-px transition-all duration-1000"
                  style={{ width: `${selectedFlight.progress * 100}%` }}
                >
                  <PlaneProgressIcon />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col items-end w-[100px]">
              <div className="text-4xl font-sans text-foreground leading-tight">{selectedFlight.destination.code}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1 w-full truncate text-right" title={selectedFlight.destination.name}>{selectedFlight.destination.name}</div>
            </div>
          </div>

          {/* Time estimates */}
          <div className="flex justify-between mt-6 bg-white/40 p-4 rounded-[2rem] border border-border/30 shadow-sm">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Scheduled</div>
              <div className="text-sm text-foreground font-bold">10:00 AM</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Arrival</div>
              <div className="text-sm text-primary font-bold">
                In {Math.floor(selectedFlight.etaMinutes / 60)}h {selectedFlight.etaMinutes % 60}m
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Aircraft Info */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <Info size={16} />
              </div>
              <h3 className="text-sm font-bold text-foreground font-sans">Aircraft</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DataCell label="Type" value={selectedFlight.aircraft} />
              <DataCell label="Registration" value={`${selectedFlight.airline.substring(0, 2)}-${selectedFlight.flightNumber.substring(2, 5)}`} />
              {selectedFlight.registrationCountry ? (
                <DataCell label="Country" value={selectedFlight.registrationCountry} />
              ) : (
                <LockedCell label="Country" />
              )}
              <DataCell label="Age" value={`${selectedFlight.aircraftAge} yrs`} />
            </div>
          </div>

          {/* Telemetry */}
          <div className="pb-8">
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="bg-[var(--secondary)]/10 p-1.5 rounded-lg text-[var(--secondary)]">
                <Settings size={16} />
              </div>
              <h3 className="text-sm font-bold text-foreground font-sans">Telemetry</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <DataCell label="Altitude" value={`${selectedFlight.altitude.toLocaleString()} ft`} highlight={true} />
              <DataCell label="Speed" value={`${selectedFlight.speed} kt`} highlight={true} />
              <DataCell label="Track" value={`${Math.round(selectedFlight.heading)}°`} />
              <LockedCell label="Vertical Speed" />
              <DataCell label="Latitude" value={selectedFlight.lat.toFixed(4)} />
              <DataCell label="Longitude" value={selectedFlight.lng.toFixed(4)} />
              <DataCell label="Squawk" value={selectedFlight.flightNumber.substring(2, 6) || "7700"} />
              <DataCell label="Radar" value={`MOSS-RADAR`} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DataCell({ label, value, highlight = false }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-border/30 rounded-3xl p-4 transition-colors hover:bg-white/80">
      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function LockedCell({ label }) {
  return (
    <div className="bg-border/20 backdrop-blur-sm border border-border/30 rounded-3xl p-4 transition-colors cursor-not-allowed group">
      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
        {label}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock size={14} className="text-[var(--secondary)]" strokeWidth={2.5} />
        <span className="italic font-medium">Classified</span>
      </div>
    </div>
  );
}

function PlaneProgressIcon() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-primary rounded-full p-2 shadow-[0_4px_12px_-2px_rgba(13,148,136,0.4)] z-10">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" transform="rotate(90 12 12)" />
      </svg>
    </div>
  );
}
