// src/app/flightradar/components/CustomHeader.jsx
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plane, Shield, Navigation, SlidersHorizontal, X, Clock, Activity, Check, RotateCcw, Compass, Radio, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "@/contexts/ThemeContext";

export default function CustomHeader({ 
  flights, 
  onSelectFlight, 
  statusFilter, 
  setStatusFilter, 
  aircraftFilter, 
  setAircraftFilter 
}) {
  const { resolvedTheme, setThemeMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const filterRef = useRef(null);

  // 1. UTC Aviation Clock Ticker
  const [utcTime, setUtcTime] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hrs}:${mins}:${secs} UTC`);
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 2. Throttled Telemetry Stats (Updates exactly every 60 seconds)
  const [stats, setStats] = useState({ activeCount: 0, avgAltitude: 0, avgSpeed: 0 });
  const [timeToUpdate, setTimeToUpdate] = useState(60); // 60 second countdown
  const flightsRef = useRef(flights);

  useEffect(() => {
    flightsRef.current = flights;
  }, [flights]);

  const computeStats = () => {
    const currentFlights = flightsRef.current;
    const activeFlights = currentFlights.filter(f => f.status === 'On Time' || f.status === 'Delayed');
    const count = activeFlights.length;
    const sumAlt = activeFlights.reduce((sum, f) => sum + f.altitude, 0);
    const sumSpeed = activeFlights.reduce((sum, f) => sum + f.speed, 0);

    setStats({
      activeCount: count,
      avgAltitude: count > 0 ? Math.round(sumAlt / count) : 0,
      avgSpeed: count > 0 ? Math.round(sumSpeed / count) : 0
    });
  };

  // Compute initially as soon as flights are loaded
  useEffect(() => {
    if (flights.length > 0 && stats.activeCount === 0) {
      computeStats();
    }
  }, [flights, stats.activeCount]);

  // Handle the countdown timer and 1-minute updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeToUpdate((prev) => {
        if (prev <= 1) {
          computeStats();
          return 60; // reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute progress ring stroke values
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((60 - timeToUpdate) / 60) * circumference;

  // Search filter query
  const filteredFlights = useMemo(() => {
    if (!searchQuery) return [];
    return flights.filter(f => 
      f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.origin.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destination.code.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
  }, [flights, searchQuery]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = statusFilter !== 'ALL' || aircraftFilter !== 'ALL';

  const resetFilters = () => {
    setStatusFilter('ALL');
    setAircraftFilter('ALL');
  };

  return (
    <header className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/75 backdrop-blur-md border border-border/50 rounded-full h-16 flex items-center justify-between z-[1000] shadow-[0_4px_25px_-2px_rgba(13,148,136,0.15)] px-5 w-[95%] max-w-5xl transition-all duration-500">
      
      {/* 1. Left Section: Premium Compass Brandmark & Live Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          href="/" 
          className="flex items-center gap-3 group transition-all duration-300"
        >
          {/* Compass Radar brandmark */}
          <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground rounded-2xl transition-all duration-300 shadow-[0_4px_10px_-1px_rgba(13,148,136,0.1)]">
            <Compass size={18} className="absolute animate-[spin_40s_linear_infinite] opacity-40 text-primary group-hover:text-white" />
            <Plane size={18} className="rotate-45 relative z-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={2.2} />
          </div>

          <div className="flex flex-col text-left">
            <div className="text-foreground font-bold text-lg tracking-tight font-sans flex items-center gap-1.5 leading-none">
              FlightRadar
            </div>
            <span className="text-[9px] font-bold text-muted-foreground tracking-[0.15em] uppercase mt-0.5 font-sans leading-none">
              Simulation Engine
            </span>
          </div>
        </Link>

        {/* Vintage Vertical Divider */}
        <div className="hidden sm:block w-[1px] h-6 bg-border/80 mx-1 shrink-0" />

        {/* Live Clock / Radar Sweeper Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-background/40 px-3 py-1.5 rounded-full border border-border/40 shrink-0">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--secondary)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--secondary)]"></span>
          </div>
          <span className="text-[11px] font-bold text-foreground font-mono tracking-wide">
            {utcTime || "00:00:00 UTC"}
          </span>
        </div>
      </div>

      {/* 2. Center Section: Sleek Instrument Stats Cluster (Updated every 1-2 min) */}
      <div className="hidden md:flex items-center gap-5 bg-background/40 backdrop-blur-sm border border-border/60 px-5 h-11 rounded-full shadow-[inset_0_1px_2px_rgba(13,148,136,0.04)] mx-4 shrink-0">
        
        {/* Active Flights */}
        <div className="flex items-center gap-2" title="Active Airspace Traffic Count">
          <Activity size={14} className="text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold leading-none uppercase tracking-wider">Active</span>
            <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">{stats.activeCount}</span>
          </div>
        </div>

        <div className="w-[1px] h-4 bg-border/80" />

        {/* Avg Altitude */}
        <div className="flex items-center gap-2" title="Average Airspace Altitude">
          <Shield size={13} className="text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold leading-none uppercase tracking-wider">Avg Alt</span>
            <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">{stats.avgAltitude.toLocaleString()} ft</span>
          </div>
        </div>

        <div className="w-[1px] h-4 bg-border/80" />

        {/* Avg Speed */}
        <div className="flex items-center gap-2" title="Average Speed">
          <Navigation size={13} className="text-primary rotate-45" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold leading-none uppercase tracking-wider">Avg Speed</span>
            <span className="text-xs font-extrabold text-foreground leading-none mt-0.5">{stats.avgSpeed} kt</span>
          </div>
        </div>

        <div className="w-[1px] h-4 bg-border/80" />

        {/* Dynamic Telemetry Refresh Loader (1-Minute Cache Progress) */}
        <div 
          className="relative flex items-center justify-center cursor-pointer group"
          title={`Simulated stats refresh every 60s. Refreshes in ${timeToUpdate}s.`}
          onClick={computeStats} // Allow manual force update on click!
        >
          <svg className="w-5 h-5 transform -rotate-90">
            <circle
              cx="10"
              cy="10"
              r={radius}
              stroke="rgba(13, 148, 136, 0.15)"
              strokeWidth="2"
              fill="transparent"
            />
            <circle
              cx="10"
              cy="10"
              r={radius}
              stroke="#0D9488"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute text-[8px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {timeToUpdate}
          </span>
        </div>
      </div>

      {/* 3. Right Section: Custom Search & Airspace Filters */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Global Theme Toggle Button */}
        <button
          onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border/50 bg-card/40 hover:bg-card/80 text-foreground backdrop-blur transition-all duration-300 cursor-pointer"
          aria-label="Toggle Theme"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={15} className="text-[#14B8A6]" />
          ) : (
            <Moon size={15} className="text-[#14B8A6]" />
          )}
        </button>

        {/* Filter Dropdown Toggle Button */}
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 w-10 flex items-center justify-center rounded-full border border-border/50 backdrop-blur transition-all duration-300 cursor-pointer ${
              hasActiveFilters 
                ? 'bg-[var(--secondary)] text-white shadow-sm hover:bg-[var(--secondary)]/90 border-[var(--secondary)]/50' 
                : 'bg-card/40 hover:bg-card/80 text-foreground border-border/50'
            }`}
            title="Filter Airspace"
          >
            <SlidersHorizontal size={15} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-primary text-card-foreground border-2 border-rice rounded-full text-[8px] font-extrabold w-5 h-5 flex items-center justify-center shadow-sm">
                !
              </span>
            )}
          </button>

          {/* Filter Dropdown Popover */}
          {showFilters && (
            <div className="absolute top-[calc(100%+12px)] right-0 w-[280px] sm:w-[320px] bg-card/95 backdrop-blur-md rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,148,136,0.2)] border border-border/60 z-50 p-5 overflow-hidden transition-all duration-300 animate-fadeIn">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">Airspace Filters</span>
                </div>
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] text-[var(--secondary)] hover:text-[var(--secondary)]/80 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                )}
              </div>

              {/* Status Filter Stack */}
              <div className="mb-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Flight Status</div>
                <div className="grid grid-cols-3 gap-1.5 bg-background/40 p-1.5 rounded-2xl border border-border/30">
                  {['ALL', 'IN_FLIGHT', 'DELAYED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                        statusFilter === status 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status === 'IN_FLIGHT' ? 'In-Flight' : 'Delayed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aircraft Builder Filter Stack */}
              <div className="mb-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Aircraft Builder</div>
                <div className="grid grid-cols-3 gap-1.5 bg-background/40 p-1.5 rounded-2xl border border-border/30">
                  {['ALL', 'BOEING', 'AIRBUS'].map((builder) => (
                    <button
                      key={builder}
                      onClick={() => setAircraftFilter(builder)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                        aircraftFilter === builder 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      }`}
                    >
                      {builder === 'ALL' ? 'All' : builder === 'BOEING' ? 'Boeing' : 'Airbus'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact & Expanding Search Field */}
        <div className="relative flex items-center" ref={searchRef}>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-muted/40 text-foreground text-sm rounded-full pl-9 pr-8 py-2 w-[110px] sm:w-[200px] border border-border/80 focus:outline-none focus:bg-card focus:border-primary/50 focus:w-[150px] sm:focus:w-[240px] transition-all duration-300 placeholder-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors pointer-events-none" />
            
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown Panel */}
          {showSearch && searchQuery && (
            <div className="absolute top-[calc(100%+12px)] right-0 w-[290px] sm:w-[320px] bg-card/95 backdrop-blur-md rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(13,148,136,0.2)] border border-border/50 z-50 py-2 overflow-hidden transition-all duration-300 animate-fadeIn">
              <div className="px-5 py-2.5 text-[10px] font-bold text-muted-foreground tracking-wider border-b border-border/30 uppercase flex items-center gap-1.5">
                <Radio size={12} className="text-primary animate-pulse" />
                Airspace Matches
              </div>
              {filteredFlights.length === 0 ? (
                <div className="px-5 py-4 text-xs font-semibold text-muted-foreground italic">No active flights found</div>
              ) : (
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                  {filteredFlights.map(flight => (
                    <button
                      key={flight.id}
                      className="w-full text-left px-5 py-3 hover:bg-primary/5 flex items-center justify-between border-b border-border/10 last:border-0 transition-colors cursor-pointer"
                      onClick={() => {
                        onSelectFlight(flight.id);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <div>
                        <div className="font-bold text-foreground text-xs font-sans flex items-center gap-1">
                          <Plane size={11} className="rotate-45 text-primary/70" />
                          {flight.flightNumber}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{flight.airline} &middot; <span className="font-bold text-[var(--secondary)]/90">{flight.aircraft}</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary tracking-wider">{flight.origin.code} &rarr; {flight.destination.code}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{flight.status}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
