/* eslint-disable react-hooks/set-state-in-effect */
// [file name]: AncestorOriginMap.jsx - ULTIMATE VERSION
'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COUNTRY_DB, getCountryInfo } from '../utils/countryData';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function getCountryColor(percentage) {
  if (percentage >= 80) return '#064e3b';
  if (percentage >= 60) return '#065f46';
  if (percentage >= 40) return '#047857';
  if (percentage >= 20) return '#059669';
  if (percentage >= 10) return '#10b981';
  return '#34d399';
}

export function AncestorOriginMap({ countries = [], name = '' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const plotted = useMemo(() => {
    if (!countries || countries.length === 0) return [];
    
    return countries
      .map((c) => {
        const countryId = c.country_id || c.code;
        const info = getCountryInfo(countryId);
        if (!info) return null;

        return {
          ...c,
          code: info.code,
          coords: info.centroid,
          label: info.name,
          pct: Math.round((c.probability || 0) * 100),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 20); // Support more countries
  }, [countries]);

  // Theme detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDarkMode(dark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [25, 10],
      zoom: 2,
      scrollWheelZoom: false,
      worldCopyJump: true,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      tap: true, // Enable touch interactions
      touchZoom: true,
      bounceAtZoomLimits: true
    });

    map.zoomControl.setPosition('bottomright');
    mapRef.current = map;

    // Wait for layout stable
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tiles with premium styles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDarkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
      className: isDarkMode ? 'dark-map-tiles' : ''
    }).addTo(map);
  }, [isDarkMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    if (plotted.length === 0) return;

    const bounds = [];
    plotted.forEach((entry) => {
      if (!entry.coords) return;
      const [lat, lng] = entry.coords;
      const size = Math.max(14, Math.min(32, 14 + entry.pct / 3));
      
      // Top Level Custom Marker
      const icon = L.divIcon({
        className: 'premium-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-full h-full rounded-full animate-ping opacity-25" style="background-color: #10b981; animation-duration: 3s;"></div>
            <div style="
              background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
              color: white;
              border-radius: 50%;
              width: ${size * 2}px;
              height: ${size * 2}px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              font-weight: 900;
              border: 3px solid ${isDarkMode ? '#ffffff' : '#ffffff'};
              box-shadow: ${isDarkMode ? '0 0 15px rgba(16, 185, 129, 0.6), 0 0 5px #fff' : '0 8px 24px rgba(0,0,0,0.3)'};
              z-index: 10;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            " class="marker-blob hover:scale-125 cursor-pointer">
              <span style="font-size: ${size < 18 ? '10px' : '13px'}; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${entry.pct}%</span>
            </div>
          </div>
        `,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 12px; min-width: 140px; font-family: 'Inter', sans-serif;">
          <div style="font-weight: 800; color: ${isDarkMode ? '#34d399' : '#065f46'}; font-size: 16px; margin-bottom: 2px;">${entry.label}</div>
          <div style="color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;">Historical Concentration</div>
          <div style="margin-top: 8px; font-size: 24px; font-weight: 900; color: ${isDarkMode ? '#10b981' : '#059669'};">${entry.pct}%</div>
        </div>
      `, {
        className: 'premium-map-popup',
        offset: [0, -size]
      });
      
      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      map.flyToBounds(bounds, { 
        padding: [100, 100], 
        maxZoom: 5,
        duration: 2,
        easeLinearity: 0.2
      });
    }
  }, [plotted, name, isDarkMode]);

  return (
    <div className="relative group w-full max-w-6xl mx-auto px-4 md:px-0">
      <div
        ref={containerRef}
        className="h-[450px] md:h-[600px] w-full rounded-2xl md:rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 md:border-[6px] border-white dark:border-gray-900 transition-all duration-700 hover:shadow-[0_32px_64px_rgba(0,0,0,0.3)]"
      />
      
      {/* Legend - Responsive and Aesthetic */}
      <div className="absolute top-8 left-8 z-[400] hidden lg:block scale-110 origin-top-left">
        <div 
          className="backdrop-blur-xl p-5 rounded-[24px] shadow-2xl border transition-colors duration-500"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] font-black mb-3" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Lineage Analysis</p>
          <div className="flex flex-col gap-3">
            {[90, 50, 10].map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: getCountryColor(p) }}></div>
                <span className="text-xs font-bold" style={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}>{p}% Probability</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Touch Interaction Prompt (Mobile Only) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] lg:hidden">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <p className="text-[10px] text-white/80 font-medium tracking-wide">Pinch to Zoom • Tap for Details</p>
        </div>
      </div>
      
      {/* Dynamic Analyzer Overlay */}
      {plotted.length === 0 && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl dark:bg-black/60 flex items-center justify-center z-[400] rounded-2xl md:rounded-[40px]">
          <div className="text-center p-12 bg-white/90 dark:bg-gray-900/90 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-white/20 max-w-sm">
            <div className="relative flex justify-center mb-8">
              <div className="w-16 h-16 border-[5px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Analyzing Lineage</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Processing 2.4 million historical records for <span className="text-emerald-500 font-bold">${name}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}