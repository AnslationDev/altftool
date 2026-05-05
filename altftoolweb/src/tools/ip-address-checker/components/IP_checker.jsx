import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';


const CustomButton = ({ onClick, disabled, children, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </button>
);

export default function IPChecker() {
  const [domain, setDomain] = useState('');
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidDomain, setIsValidDomain] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);


  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (domainData && mapRef.current && mapLoaded) {
      
      const lat = parseFloat(domainData.latitude);
      const lng = parseFloat(domainData.longitude);
      
      if (window.google && window.google.maps) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
        } else {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 12,
            styles: [
              { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
              { featureType: 'road', elementType: 'all', stylers: [{ saturation: -100 }] }
            ]
          });
        }

        new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: domainData.ip,
          animation: window.google.maps.Animation.DROP
        });
      }
    }
  }, [domainData, mapLoaded]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps key is not configured');
      return;
    }

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => setError('Failed to load Google Maps');
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const isValidDomainFormat = (input) => {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return domainRegex.test(input) || ipRegex.test(input);
  };

  const checkDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain or IP address');
      return;
    }

    setLoading(true);
    setError('');

    try {
    
      const response = await axios.get(`http://ip-api.com/json/${domain}`);
      
      const data = response.data;

      if (data.status === "fail") {
        throw new Error(data.message || 'Invalid IP/Domain');
      }

      
      setDomainData({
        ip: data.query,
        city: data.city,
        region: data.regionName,
        country_name: data.country,
        country_code: data.countryCode,
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
        org: data.isp,
        timezone: data.timezone,
        zip: data.zip
      });
      
      setIsValidDomain(true);
    } catch (err) {
      setError('IP-API blocked ya format galat hai. Make sure IP is correct.');
      setDomainData(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDomain('');
    setDomainData(null);
    setError('');
    setIsValidDomain(null);
    mapInstanceRef.current = null;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') checkDomain();
  };

  const calculateSecurityRisk = () => {
    if (!domainData) return { level: 'Unknown', score: 0, details: [] };
    const details = [];
    let score = 0;

    if (domainData.org && domainData.org.toLowerCase().includes('hosting')) {
      score += 30;
      details.push('Hosting provider detected - Potential for malicious content');
    }
    if (domainData.timezone && (domainData.timezone.includes('Asia') || domainData.timezone.includes('Africa'))) {
      score += 20;
      details.push('High risk region for cyber threats');
    }
    if (!domainData.org) {
      score += 15;
      details.push('Organization information not available');
    }

    if (score < 20) return { level: 'Low', score, color: 'text-green-600', bg: 'bg-green-100', details: ['No significant risks detected'] };
    if (score < 40) return { level: 'Medium', score, color: 'text-yellow-600', bg: 'bg-yellow-100', details };
    return { level: 'High', score, color: 'text-red-600', bg: 'bg-red-100', details };
  };

  const securityRisk = calculateSecurityRisk();

  return (
    <div className="min-h-screen p-4 md:p-8 ">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className=" block text-(--primary) text-7xl font-bold mb-3 ">IP Checker</h1>
          <p className="description opacity-90 mt-3 text-(--secondary) text-2xl">Check IP information, location, and security risks</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setIsValidDomain(null);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter IP address (e.g. 8.8.8.8)"
                className=" text-(--primary) w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {domain && isValidDomain !== null && (
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-xs font-medium ${isValidDomain ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isValidDomain ? '✓ Valid' : '✗ Invalid'}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <CustomButton
                onClick={checkDomain}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Checking...' : 'Check'}
              </CustomButton>
              <button onClick={resetForm} className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-600">
                ↺ Reset
              </button>
            </div>
          </div>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{error}</div>}
        </div>

        {/* Results Section */}
        {domainData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: IP Details */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 px-6 py-4"><h2 className="text-white font-bold">📍 IP Details</h2></div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>IP Address</span><span className="font-mono font-bold text-blue-600">{domainData.ip}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Country</span><span>{domainData.country_name || domainData.country}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>City</span><span>{domainData.city || 'N/A'}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>ISP</span><span className="text-xs truncate max-w-[150px]">{domainData.org || 'N/A'}</span></div>
              </div>
            </div>

            {/* Card 2: Security */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
              <div className="bg-orange-500 px-6 py-4"><h2 className="text-white font-bold">🔒 Risk Assessment</h2></div>
              <div className="p-6">
                <div className={`${securityRisk.bg} rounded-xl p-4 text-center mb-4`}>
                  <div className={`text-3xl font-bold ${securityRisk.color}`}>{securityRisk.level}</div>
                  <div className="text-slate-500 font-bold">{securityRisk.score}/100</div>
                </div>
                <div className="space-y-2">
                  {securityRisk.details.map((d, i) => <div key={i} className="text-xl font-bold text-(--primary)">⚠️ {d}</div>)}
                </div>
              </div>
            </div>

            {/* Card 3: Network Info */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
              <div className="bg-teal-500 px-6 py-4"><h2 className="text-white font-bold">ℹ️ IP Info</h2></div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Timezone</span><span className="text-xs">{domainData.timezone}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Currency</span><span>{domainData.currency}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Calling Code</span><span>+{domainData.country_calling_code}</span></div>
              </div>
            </div>

            {/* Card 4: Map */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
              <div className="bg-green-600 px-6 py-4 text-white font-bold">🗺️ Google Maps Location</div>
              <div className="p-4">
                <div ref={mapRef} className="w-full h-80 rounded-lg bg-slate-100 flex items-center justify-center">
                  {!mapLoaded && <p>Loading Map...</p>}
                </div>
              </div>
            </div>

            {/* Card 5: Device Info */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
              <div className="bg-purple-600 px-6 py-4 text-white font-bold">💻 Device Details</div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Browser</span><span>{navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Platform</span><span>{navigator.platform}</span></div>
                <div className="flex justify-between border-b pb-2 font-bold text-(--primary)"><span>Screen</span><span>{window.screen.width}x{window.screen.height}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!domainData && !loading && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-slate-400">Enter an IP to see magic</h2>
          </div>
        )}
      </div>
    </div>
  );
}
