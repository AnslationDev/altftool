// src/app/flightradar/hooks/useFlights.js
"use client";

import { useState, useEffect, useRef } from 'react';

export const AIRPORTS = [
  // Europe
  { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543, country: 'United Kingdom' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', lat: 49.0097, lng: 2.5479, country: 'France' },
  { code: 'FRA', name: 'Frankfurt', lat: 50.0333, lng: 8.5706, country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lng: 4.7683, country: 'Netherlands' },
  { code: 'IST', name: 'Istanbul', lat: 41.2753, lng: 28.7519, country: 'Türkiye' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', lat: 40.4983, lng: -3.5676, country: 'Spain' },
  { code: 'MUC', name: 'Munich', lat: 48.3538, lng: 11.7861, country: 'Germany' },
  { code: 'DUB', name: 'Dublin', lat: 53.4213, lng: -6.2701, country: 'Ireland' },
  { code: 'ZRH', name: 'Zurich', lat: 47.4647, lng: 8.5492, country: 'Switzerland' },
  { code: 'CPH', name: 'Copenhagen', lat: 55.6179, lng: 12.6560, country: 'Denmark' },
  { code: 'VIE', name: 'Vienna', lat: 48.1103, lng: 16.5697, country: 'Austria' },
  { code: 'LIS', name: 'Lisbon', lat: 38.7742, lng: -9.1342, country: 'Portugal' },
  { code: 'OSL', name: 'Oslo', lat: 60.1939, lng: 11.1004, country: 'Norway' },
  { code: 'ARN', name: 'Stockholm Arlanda', lat: 59.6519, lng: 17.9186, country: 'Sweden' },
  { code: 'HEL', name: 'Helsinki', lat: 60.3172, lng: 24.9633, country: 'Finland' },
  { code: 'DME', name: 'Domodedovo', lat: 55.4086, lng: 37.9061, country: 'Russia' },
  { code: 'WAW', name: 'Warsaw Chopin', lat: 52.1657, lng: 20.9671, country: 'Poland' },
  
  // North America
  { code: 'JFK', name: 'John F. Kennedy', lat: 40.6413, lng: -73.7781, country: 'United States' },
  { code: 'LAX', name: 'Los Angeles', lat: 33.9416, lng: -118.4085, country: 'United States' },
  { code: 'DFW', name: 'Dallas/Fort Worth', lat: 32.8998, lng: -97.0403, country: 'United States' },
  { code: 'DEN', name: 'Denver International', lat: 39.8561, lng: -104.6737, country: 'United States' },
  { code: 'ORD', name: 'O\'Hare International', lat: 41.9742, lng: -87.9073, country: 'United States' },
  { code: 'ATL', name: 'Hartsfield-Jackson', lat: 33.6407, lng: -84.4277, country: 'United States' },
  { code: 'SFO', name: 'San Francisco', lat: 37.6188, lng: -122.3750, country: 'United States' },
  { code: 'SEA', name: 'Seattle-Tacoma', lat: 47.4489, lng: -122.3094, country: 'United States' },
  { code: 'LAS', name: 'McCarran', lat: 36.0801, lng: -115.1522, country: 'United States' },
  { code: 'MIA', name: 'Miami', lat: 25.7953, lng: -80.2906, country: 'United States' },
  { code: 'BOS', name: 'Logan International', lat: 42.3643, lng: -71.0052, country: 'United States' },
  { code: 'EWR', name: 'Newark Liberty', lat: 40.6925, lng: -74.1687, country: 'United States' },
  { code: 'YYZ', name: 'Toronto Pearson', lat: 43.6777, lng: -79.6248, country: 'Canada' },
  { code: 'YVR', name: 'Vancouver', lat: 49.1939, lng: -123.1844, country: 'Canada' },
  { code: 'YUL', name: 'Montréal-Trudeau', lat: 45.4706, lng: -73.7408, country: 'Canada' },
  { code: 'MEX', name: 'Mexico City International', lat: 19.4361, lng: -99.0719, country: 'Mexico' },

  // Asia
  { code: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657, country: 'United Arab Emirates' },
  { code: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798, country: 'Japan' },
  { code: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915, country: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International', lat: 22.3080, lng: 113.9185, country: 'Hong Kong' },
  { code: 'CAN', name: 'Guangzhou Baiyun', lat: 23.3924, lng: 113.2988, country: 'China' },
  { code: 'DEL', name: 'Indira Gandhi', lat: 28.5562, lng: 77.1000, country: 'India' },
  { code: 'CGK', name: 'Soekarno-Hatta', lat: -6.1256, lng: 106.6558, country: 'Indonesia' },
  { code: 'BKK', name: 'Suvarnabhumi', lat: 13.6900, lng: 100.7501, country: 'Thailand' },
  { code: 'ICN', name: 'Incheon International', lat: 37.4602, lng: 126.4407, country: 'South Korea' },
  { code: 'KUL', name: 'Kuala Lumpur', lat: 2.7456, lng: 101.7099, country: 'Malaysia' },
  { code: 'PEK', name: 'Beijing Capital', lat: 40.0799, lng: 116.6031, country: 'China' },
  { code: 'BOM', name: 'Chhatrapati Shivaji', lat: 19.0887, lng: 72.8679, country: 'India' },
  { code: 'BLR', name: 'Kempegowda', lat: 15.1979, lng: 77.7063, country: 'India' },
  { code: 'KHI', name: 'Jinnah International', lat: 24.9065, lng: 67.1608, country: 'Pakistan' },
  { code: 'NRT', name: 'Narita', lat: 35.7647, lng: 140.3863, country: 'Japan' },
  { code: 'TPE', name: 'Taoyuan', lat: 25.0777, lng: 121.2328, country: 'Taiwan' },
  { code: 'PVG', name: 'Shanghai Pudong', lat: 31.1434, lng: 121.8083, country: 'China' },
  { code: 'SGN', name: 'Tan Son Nhat', lat: 10.8188, lng: 106.6519, country: 'Vietnam' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos', lat: -23.4356, lng: -46.4731, country: 'Brazil' },
  { code: 'EZE', name: 'Ministro Pistarini', lat: -34.8128, lng: -58.5381, country: 'Argentina' },
  { code: 'SCL', name: 'Arturo Merino Benítez', lat: -33.3930, lng: -70.7858, country: 'Chile' },
  { code: 'BOG', name: 'El Dorado', lat: 4.7016, lng: -74.1469, country: 'Colombia' },
  { code: 'LIM', name: 'Jorge Chávez', lat: -12.0219, lng: -77.1143, country: 'Peru' },
  { code: 'GIG', name: 'Galeão', lat: -22.8089, lng: -43.2436, country: 'Brazil' },

  // Africa
  { code: 'JNB', name: 'O. R. Tambo', lat: -26.1392, lng: 28.2460, country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town', lat: -33.9715, lng: 18.6021, country: 'South Africa' },
  { code: 'LOS', name: 'Murtala Muhammed', lat: 6.5774, lng: 3.3215, country: 'Nigeria' },
  { code: 'NBO', name: 'Jomo Kenyatta', lat: -1.3192, lng: 36.9278, country: 'Kenya' },
  { code: 'ADD', name: 'Addis Ababa Bole', lat: 8.9779, lng: 38.7993, country: 'Ethiopia' },
  { code: 'CMN', name: 'Mohammed V', lat: 33.3675, lng: -7.5896, country: 'Morocco' },
  { code: 'CAI', name: 'Cairo International', lat: 30.1219, lng: 31.4056, country: 'Egypt' },

  // Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9461, lng: 151.1772, country: 'Australia' },
  { code: 'MEL', name: 'Melbourne', lat: -37.6690, lng: 144.8410, country: 'Australia' },
  { code: 'AKL', name: 'Auckland', lat: -38.0055, lng: 174.7966, country: 'New Zealand' },
  { code: 'BNE', name: 'Brisbane', lat: -27.3842, lng: 153.1175, country: 'Australia' },
  { code: 'PER', name: 'Perth', lat: -31.9403, lng: 115.9668, country: 'Australia' },
  { code: 'ADL', name: 'Adelaide', lat: -34.9450, lng: 138.5306, country: 'Australia' },
  { code: 'CHC', name: 'Christchurch', lat: -43.4894, lng: 172.5322, country: 'New Zealand' }
];

const AIRLINES = ['BA', 'AF', 'EK', 'JL', 'QF', 'SA', 'LA', 'DL', 'AA', 'SQ', 'CX', 'LH', 'KL', 'TK', 'CZ', 'AI', 'GA', 'TG', 'KE', 'MH', 'IB', 'UA', 'AC', 'AR', 'NZ'];
const AIRCRAFTS = ['B737', 'A320', 'B787', 'A380', 'B777', 'A330', 'A350', 'B747'];
const STATUSES = ['On Time', 'On Time', 'On Time', 'On Time', 'Delayed', 'Delayed', 'Boarding', 'Landed'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Spherical linear interpolation for great-circle route (Slerp)
function slerp(lat1, lon1, lat2, lon2, f) {
  const rLat1 = lat1 * Math.PI / 180;
  const rLon1 = lon1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;
  const rLon2 = lon2 * Math.PI / 180;

  const dLat = rLat2 - rLat1;
  const dLon = rLon2 - rLon1;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  if (c === 0) return { lat: lat1, lng: lon1 };

  const A = Math.sin((1 - f) * c) / Math.sin(c);
  const B = Math.sin(f * c) / Math.sin(c);

  const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2);
  const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2);
  const z = A * Math.sin(rLat1) + B * Math.sin(rLat2);

  const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)) * 180 / Math.PI;
  const lng = Math.atan2(y, x) * 180 / Math.PI;

  return { lat, lng };
}

function calculateHeading(lat1, lon1, lat2, lon2) {
  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  
  return (brng + 360) % 360;
}

const generateFlight = (id) => {
  const origin = getRandomItem(AIRPORTS);
  let destination = getRandomItem(AIRPORTS);
  while (destination.code === origin.code) {
    destination = getRandomItem(AIRPORTS);
  }

  const airline = getRandomItem(AIRLINES);
  const flightNumber = `${airline}${getRandomInt(100, 9999)}`;
  const aircraft = getRandomItem(AIRCRAFTS);
  const altitude = getRandomInt(12000, 41000);
  const speed = getRandomInt(350, 580);
  const status = getRandomItem(STATUSES);
  
  const progress = status === 'Landed' ? 1 : status === 'Boarding' ? 0 : Math.random() * 0.95;
  
  const { lat, lng } = slerp(origin.lat, origin.lng, destination.lat, destination.lng, progress);
  const heading = calculateHeading(origin.lat, origin.lng, destination.lat, destination.lng);
  
  const etaMinutes = Math.floor((1 - progress) * (getRandomInt(120, 600)));
  const aircraftAge = getRandomInt(1, 22);

  return {
    id,
    flightNumber,
    airline: airline === 'BA' ? 'British Airways' : 
             airline === 'LH' ? 'Lufthansa' :
             airline === 'AF' ? 'Air France' :
             airline === 'EK' ? 'Emirates' :
             airline === 'QR' ? 'Qatar Airways' :
             airline === 'SQ' ? 'Singapore Airlines' :
             airline === 'JL' ? 'Japan Airlines' :
             airline === 'QF' ? 'Qantas' :
             airline === 'SA' ? 'South African Airways' :
             airline === 'LA' ? 'LATAM Airlines' :
             airline === 'AI' ? 'Air India' :
             airline === 'CX' ? 'Cathay Pacific' :
             airline === 'TK' ? 'Turkish Airlines' : 
             airline === 'DL' ? 'Delta Air Lines' :
             airline === 'AA' ? 'American Airlines' :
             airline === 'UA' ? 'United Airlines' :
             airline === 'AC' ? 'Air Canada' : `${airline} Air`,
    aircraft,
    origin,
    destination,
    lat,
    lng,
    heading,
    altitude,
    speed,
    status,
    progress,
    etaMinutes,
    aircraftAge,
    registrationCountry: origin.country,
  };
};

export const useFlights = (count = 400) => {
  const [flights, setFlights] = useState([]);
  const flightsRef = useRef([]);

  // Initialize flights
  useEffect(() => {
    const initialFlights = Array.from({ length: count }, (_, i) => generateFlight(`F${i}`));
    setFlights(initialFlights);
    flightsRef.current = initialFlights;
  }, [count]);

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId;

    const updateFlights = (time) => {
      const deltaTime = time - lastTime;
      
      // Update every 250ms to save performance with 400 flights
      if (deltaTime > 250) {
        lastTime = time;
        
        flightsRef.current = flightsRef.current.map(flight => {
          if (flight.status === 'Landed' || flight.status === 'Boarding') {
            if (Math.random() < 0.03) {
              return generateFlight(flight.id);
            }
            return flight;
          }

          // Advance progress based on speed
          const speedFactor = flight.speed / 6000000; 
          let newProgress = flight.progress + speedFactor;

          if (newProgress >= 1) {
            newProgress = 1;
            return {
              ...flight,
              progress: 1,
              status: 'Landed',
              etaMinutes: 0
            };
          }

          const { lat, lng } = slerp(flight.origin.lat, flight.origin.lng, flight.destination.lat, flight.destination.lng, newProgress);
          const heading = calculateHeading(lat, lng, flight.destination.lat, flight.destination.lng) || flight.heading;

          return {
            ...flight,
            progress: newProgress,
            lat,
            lng,
            heading,
            etaMinutes: Math.floor((1 - newProgress) * 360)
          };
        });

        setFlights([...flightsRef.current]);
      }
      
      animationFrameId = requestAnimationFrame(updateFlights);
    };

    animationFrameId = requestAnimationFrame(updateFlights);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const activeFlights = flights.filter(f => f.status === 'On Time' || f.status === 'Delayed');
  const activeCount = activeFlights.length;
  
  const avgAltitude = activeCount > 0 
    ? Math.round(activeFlights.reduce((sum, f) => sum + f.altitude, 0) / activeCount)
    : 0;
    
  const avgSpeed = activeCount > 0
    ? Math.round(activeFlights.reduce((sum, f) => sum + f.speed, 0) / activeCount)
    : 0;

  return { flights, activeCount, avgAltitude, avgSpeed };
};
export default useFlights;
