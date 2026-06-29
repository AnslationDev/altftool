// src/app/flightradar/components/FlightMap.jsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { SlidersHorizontal, Settings, Layers, Plus, Minus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MapController = ({ selectedFlight }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedFlight) {
      map.flyTo([selectedFlight.lat, selectedFlight.lng], map.getZoom(), {
        duration: 1
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlight?.id, map]);

  return null;
};

// Custom Zoom Controls mimicking FlightRadar style
const MapUIOverlay = () => {
  const map = useMap();
  return (
    <div className="absolute right-6 top-28 z-[1000] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-[1px] bg-border/50 rounded-2xl shadow-sm overflow-hidden pointer-events-auto">
        <button className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-white text-foreground font-bold transition-colors" onClick={() => map.zoomIn()} title="Zoom In">
          <Plus size={18} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-white text-foreground font-bold transition-colors" onClick={() => map.zoomOut()} title="Zoom Out">
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
}

// Generate great-circle arc points between two airports and split them at the International Date Line
function getWrappedPath(origin, destination, numPoints = 60) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const rLat1 = origin.lat * Math.PI / 180;
    const rLon1 = origin.lng * Math.PI / 180;
    const rLat2 = destination.lat * Math.PI / 180;
    const rLon2 = destination.lng * Math.PI / 180;

    const dLat = rLat2 - rLat1;
    const dLon = rLon2 - rLon1;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    if (c === 0) continue;

    const A = Math.sin((1 - f) * c) / Math.sin(c);
    const B = Math.sin(f * c) / Math.sin(c);

    const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2);
    const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2);
    const z = A * Math.sin(rLat1) + B * Math.sin(rLat2);

    const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)) * 180 / Math.PI;
    const lng = Math.atan2(y, x) * 180 / Math.PI;
    points.push([lat, lng]);
  }

  // Split path into segments at the Date Line crossing
  const segments = [];
  let currentSegment = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (currentSegment.length > 0) {
      const prevPt = currentSegment[currentSegment.length - 1];
      const diffLng = pt[1] - prevPt[1];

      // If longitude jumps by more than 180 degrees, we crossed the International Date Line!
      if (Math.abs(diffLng) > 180) {
        const sign = Math.sign(diffLng); // positive if going west-to-east (- to +), negative if east-to-west (+ to -)
        const dateLineLng = sign > 0 ? -180 : 180;
        
        currentSegment.push([pt[0], dateLineLng]);
        segments.push(currentSegment);

        // Start a new segment on the opposite side of the date line
        currentSegment = [[pt[0], -dateLineLng], pt];
      } else {
        currentSegment.push(pt);
      }
    } else {
      currentSegment.push(pt);
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

// ALTFTool-branded flight icons
const createFlightIcon = (heading, isSelected) => {
  const color = isSelected ? '#22D3EE' : '#0D9488';
  const scale = isSelected ? 1.25 : 0.9;
  const shadow = isSelected ? 'drop-shadow(0px 4px 6px rgba(34, 211, 238, 0.4))' : 'drop-shadow(0px 2px 4px rgba(13, 148, 136, 0.3))';

  const html = `
    <div style="transform: rotate(${heading}deg) scale(${scale}); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; filter: ${shadow}; transition: transform 0.5s ease;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'organic-flight-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function FlightMap({ flights, selectedFlightId, onSelectFlight }) {
  const selectedFlight = flights.find(f => f.id === selectedFlightId) || null;

  // Get unique airports from all flights
  const airports = useMemo(() => {
    const airportMap = new Map();
    flights.forEach(flight => {
      if (!airportMap.has(flight.origin.code)) {
        airportMap.set(flight.origin.code, flight.origin);
      }
      if (!airportMap.has(flight.destination.code)) {
        airportMap.set(flight.destination.code, flight.destination);
      }
    });
    return Array.from(airportMap.values());
  }, [flights]);

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={3}
        minZoom={2}
        worldCopyJump={false}
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#EEF3F6' }}
        zoomControl={false}
        attributionControl={false}
        className="organic-map-filter"
      >
        <MapUIOverlay />
        {/* Esri World Street Map - Strictly 100% English Global Map Style */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          noWrap={false}
        />
        
        <MapController selectedFlight={selectedFlight} />

        {/* Airport markers */}
        {airports.map((airport) => (
          <CircleMarker
            key={airport.code}
            center={[airport.lat, airport.lng]}
            radius={4}
            pathOptions={{
              color: '#0D9488',
              fillColor: '#22D3EE',
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup className="fr24-popup" closeButton={false}>
              <div className="text-[#111827] px-2 py-1">
                <div className="font-bold text-[13px]">{airport.code}</div>
                <div className="text-[11px] text-[#607083]">{airport.name}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Flight path track - split dynamically at date line */}
        {selectedFlight && (
          getWrappedPath(selectedFlight.origin, selectedFlight.destination).map((segment, idx) => (
            <Polyline
              key={`path-${selectedFlight.id}-${idx}`}
              positions={segment}
              pathOptions={{
                color: '#22D3EE',
                weight: 3,
                opacity: 0.9,
                dashArray: '8, 4'
              }}
            />
          ))
        )}

        {flights.map((flight) => (
          <Marker
            key={flight.id}
            position={[flight.lat, flight.lng]}
            icon={createFlightIcon(flight.heading, flight.id === selectedFlightId)}
            eventHandlers={{
              click: () => onSelectFlight(flight.id),
            }}
            zIndexOffset={flight.id === selectedFlightId ? 1000 : 0}
          />
        ))}
      </MapContainer>
      
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .fr24-popup .leaflet-popup-content-wrapper {
          background: rgba(247, 248, 251, 0.95);
          border-radius: 4px;
          padding: 0;
          box-shadow: 0 2px 8px rgba(15,23,42,0.15);
        }
        .fr24-popup .leaflet-popup-content {
          margin: 4px 6px;
        }
        .fr24-popup .leaflet-popup-tip {
          background: rgba(247, 248, 251, 0.95);
        }
        .organic-flight-marker {
          background: transparent !important;
          border: none !important;
        }
        .organic-map-filter .leaflet-tile-pane {
          filter: saturate(105%) contrast(98%) brightness(102%);
        }
      `}</style>
    </div>
  );
}
