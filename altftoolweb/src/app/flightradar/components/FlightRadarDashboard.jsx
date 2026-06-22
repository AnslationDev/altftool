// src/app/flightradar/components/FlightRadarDashboard.jsx
"use client";

import { useState, useMemo } from 'react';
import useFlights from '../hooks/useFlights';
import CustomHeader from './CustomHeader';
import FlightMap from './FlightMap';
import FlightSidebar from './FlightSidebar';

export default function FlightRadarDashboard() {
  const { flights } = useFlights(400); // Track 400 animated flights simultaneously
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  
  // Interactive Airspace Filters
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, IN_FLIGHT, DELAYED
  const [aircraftFilter, setAircraftFilter] = useState('ALL'); // ALL, BOEING, AIRBUS

  // Compute filtered flights for the Map view dynamically
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // 1. Status Filter
      if (statusFilter === 'IN_FLIGHT') {
        if (flight.status !== 'On Time' && flight.status !== 'Delayed') return false;
      } else if (statusFilter === 'DELAYED') {
        if (flight.status !== 'Delayed') return false;
      }

      // 2. Aircraft Builder Filter
      if (aircraftFilter === 'BOEING') {
        if (!flight.aircraft.startsWith('B')) return false;
      } else if (aircraftFilter === 'AIRBUS') {
        if (!flight.aircraft.startsWith('A')) return false;
      }

      return true;
    });
  }, [flights, statusFilter, aircraftFilter]);

  const selectedFlight = flights.find(f => f.id === selectedFlightId) || null;

  return (
    <div className="flex flex-col absolute inset-0 w-full h-full overflow-hidden bg-rice font-sans text-loam">
      {/* Global Grain Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-multiply" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }}
      />

      <div className="flex-1 relative w-full h-full">
        <FlightMap 
          flights={filteredFlights} 
          selectedFlightId={selectedFlightId}
          onSelectFlight={setSelectedFlightId}
        />
        
        <CustomHeader 
          flights={flights}
          onSelectFlight={setSelectedFlightId}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          aircraftFilter={aircraftFilter}
          setAircraftFilter={setAircraftFilter}
        />

        <FlightSidebar 
          selectedFlight={selectedFlight}
          onSelectFlight={setSelectedFlightId}
        />
      </div>
    </div>
  );
}
