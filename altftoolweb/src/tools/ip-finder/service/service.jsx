'use client';

import React, { useEffect, useRef } from 'react';
import { RiUserLocationFill } from 'react-icons/ri';

// Leaflet must be loaded client-side only (uses window)
let LeafletMap = null;

const Map = ({ lat, lon }) => {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // Dynamically import leaflet only on client
        import('leaflet').then((L) => {
            const leaflet = L.default || L;

            // Fix default marker icon paths broken by Webpack
            delete leaflet.Icon.Default.prototype._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            if (!mapRef.current && containerRef.current) {
                // Initialize map
                mapRef.current = leaflet.map(containerRef.current).setView([lat, lon], 13);

                leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(mapRef.current);

                markerRef.current = leaflet.marker([lat, lon]).addTo(mapRef.current);
            }
        });

        // Import leaflet CSS
        import('leaflet/dist/leaflet.css').catch(() => {});

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map view when lat/lon changes
    useEffect(() => {
        if (!mapRef.current || !markerRef.current) return;
        mapRef.current.setView([lat, lon], 13);
        markerRef.current.setLatLng([lat, lon]);
    }, [lat, lon]);

    return (
        <div className="map" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: '12px' }} />
        </div>
    );
};

export default Map;