// App.js
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Axios from 'axios';

const Map = dynamic(() => import('../service/service'), { ssr: false });

function IpFinder() {

    const [ipDetails, setIpDetails] = useState(null);
    const [lat, setLat] = useState(22.5726);
    const [lon, setLon] = useState(88.3832);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inputIp, setInputIp] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [isCustomIp, setIsCustomIp] = useState(false);

    // Fetch user's own IP on mount
    useEffect(() => {
        setLoading(true);
        Axios.get('https://ipapi.co/json/')
            .then((res) => {
                setIpDetails(res.data);
                setLat(res.data.latitude);
                setLon(res.data.longitude);
                setIsCustomIp(false);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch your IP info.');
                setLoading(false);
            });
    }, []);

    // Check if an IPv4 address falls in a private/reserved range
    const isReservedIp = (ip) => {
        const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = ip.match(ipv4Regex);
        if (!match) return false;
        const [, a, b, c, d] = match.map(Number);
        if (a === 0) return true;                                     // 0.0.0.0/8
        if (a === 10) return true;                                    // 10.0.0.0/8
        if (a === 127) return true;                                   // 127.0.0.0/8 loopback
        if (a === 169 && b === 254) return true;                      // 169.254.0.0/16 link-local
        if (a === 172 && b >= 16 && b <= 31) return true;            // 172.16.0.0/12
        if (a === 192 && b === 168) return true;                      // 192.168.0.0/16
        if (a === 192 && b === 0 && c === 0) return true;            // 192.0.0.0/24
        if (a === 198 && (b === 18 || b === 19)) return true;        // 198.18.0.0/15 benchmark
        if (a === 203 && b === 0 && c === 113) return true;          // 203.0.113.0/24 TEST-NET
        if (a === 100 && b >= 64 && b <= 127) return true;           // 100.64.0.0/10 shared
        if (a >= 224) return true;                                    // 224+ multicast / reserved / broadcast
        return false;
    };

    const handleLookup = () => {
        const ip = inputIp.trim();
        if (!ip) return;

        // Basic format validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^[0-9a-fA-F:]+$/;
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && !domainRegex.test(ip)) {
            setLookupError('Please enter a valid public IP address or domain (e.g. 8.8.8.8 or google.com).');
            return;
        }

        // Block private/reserved ranges before hitting the API
        if (ipv4Regex.test(ip) && isReservedIp(ip)) {
            setLookupError(
                `"${ip}" is a private or reserved IP address (used inside local networks). ` +
                `Enter a public IP like 8.8.8.8 or 1.1.1.1 to look it up on the map.`
            );
            return;
        }

        // Block loopback domain
        if (ip === 'localhost') {
            setLookupError('"localhost" is a local loopback address and has no public location. Try a public IP instead.');
            return;
        }

        setLookupError('');
        setLookupLoading(true);

        Axios.get(`https://ipapi.co/${ip}/json/`)
            .then((res) => {
                if (res.data.error) {
                    // Translate common API error reasons into friendly messages
                    const reason = (res.data.reason || '').toLowerCase();
                    if (reason.includes('reserved')) {
                        setLookupError(
                            `"${ip}" is a reserved/private IP address. Please enter a public IP or domain.`
                        );
                    } else if (reason.includes('invalid') || reason.includes('not found')) {
                        setLookupError(`"${ip}" is not a valid or recognised IP address. Please check and try again.`);
                    } else if (reason.includes('rate')) {
                        setLookupError('Too many requests. Please wait a moment and try again.');
                    } else {
                        setLookupError(res.data.reason || 'Could not look up this IP. Please try again.');
                    }
                    setLookupLoading(false);
                    return;
                }
                setIpDetails(res.data);
                setLat(res.data.latitude);
                setLon(res.data.longitude);
                setIsCustomIp(true);
                setLookupLoading(false);
            })
            .catch(() => {
                setLookupError('Network error — failed to fetch IP info. Please try again.');
                setLookupLoading(false);
            });
    };

    const handleReset = () => {
        setLoading(true);
        setInputIp('');
        setLookupError('');
        setIsCustomIp(false);
        Axios.get('https://ipapi.co/json/')
            .then((res) => {
                setIpDetails(res.data);
                setLat(res.data.latitude);
                setLon(res.data.longitude);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch your IP info.');
                setLoading(false);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLookup();
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 p-4">

            {/* Lookup bar */}
            <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-(--primary) mb-3">
                    🔍 Lookup any IP or domain
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative grow">
                        <input
                            type="text"
                            placeholder="e.g. 8.8.8.8 or google.com"
                            value={inputIp}
                            onChange={(e) => setInputIp(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={lookupLoading}
                            className="w-full py-2.5 px-4 rounded-lg bg-(--muted) text-(--foreground) placeholder:text-(--muted-foreground) border border-(--border) focus-visible:ring-2 focus-visible:ring-(--primary) outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>
                    <button
                        onClick={handleLookup}
                        disabled={lookupLoading || !inputIp.trim()}
                        className="py-2.5 px-6 rounded-lg font-medium bg-(--primary) text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {lookupLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Lookup'}
                    </button>
                    {isCustomIp && (
                        <button
                            onClick={handleReset}
                            title="Back to my IP"
                            className="py-2.5 px-4 rounded-lg border border-dashed border-(--border) text-(--foreground) hover:bg-(--muted) transition text-sm font-medium"
                        >
                            ↩ My IP
                        </button>
                    )}
                </div>
                {lookupError && (
                    <p className="mt-3 text-sm text-(--danger, #f87171)">{lookupError}</p>
                )}
            </div>

            {/* Main two-column panel */}
            <div className="rounded-xl border border-(--border) bg-(--card) shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row min-h-80">

                    {/* Left: Info panel */}
                    <div className="md:w-72 lg:w-80 shrink-0 p-6 border-b md:border-b-0 md:border-r border-(--border) flex flex-col gap-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-(--muted-foreground)">
                                <span className="inline-block w-8 h-8 border-[3px] border-(--muted) border-t-(--primary) rounded-full animate-spin" />
                                <p className="text-sm">Detecting your location…</p>
                            </div>
                        ) : error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : ipDetails ? (
                            <>
                                {/* Badge */}
                                {isCustomIp ? (
                                    <span className="self-start text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                                        🌐 Custom IP
                                    </span>
                                ) : (
                                    <span className="self-start text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800">
                                        📍 Your IP
                                    </span>
                                )}

                                {/* IP address hero */}
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-(--muted-foreground) mb-1">IP Address</p>
                                    <p className="text-2xl font-bold text-(--foreground) font-mono break-all">{ipDetails.ip}</p>
                                </div>

                                {/* Info rows */}
                                <div className="space-y-3 pt-2 border-t border-(--border)">
                                    <InfoRow label="Location" value={[ipDetails.city, ipDetails.region, ipDetails.country_name].filter(Boolean).join(', ')} />
                                    <InfoRow label="ISP" value={ipDetails.org || 'N/A'} />
                                    <InfoRow label="Timezone" value={ipDetails.timezone || 'N/A'} />
                                    <InfoRow
                                        label="Coordinates"
                                        value={`${ipDetails.latitude?.toFixed(4)}, ${ipDetails.longitude?.toFixed(4)}`}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* Right: Map */}
                    <div className="grow min-h-72 md:min-h-0">
                        <Map lat={lat} lon={lon} />
                    </div>

                </div>
            </div>

        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-(--muted-foreground)">{label}</p>
            <p className="text-sm text-(--foreground) mt-0.5 break-words">{value}</p>
        </div>
    );
}

export default IpFinder;