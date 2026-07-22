"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { Database, Network } from 'lucide-react';
import IpConverter from '../components/IpConverter';
import MetricsDisplay from '../components/MetricsDisplay';
import BinaryDisplay from '../components/BinaryDisplay';
import ConversionGuide from '../components/ConversionGuide';
import {
  ipToNumber,
  numberToIp,
  isValidIp,
  getSampleIp,
  formatNumber,
} from '../utils/ipConverter';

export default function ToolHome() {
  const [ip, setIp] = useState(getSampleIp());
  const [number, setNumber] = useState('');

  const conversionMode = useMemo(() => {
    if (ip && !number) return 'ipToNumber';
    if (number && !ip) return 'numberToIp';
    return 'idle';
  }, [ip, number]);

  const displayIp = useMemo(() => {
    if (ip) return ip;
    if (number) {
      const num = parseInt(number.replace(/,/g, ''));
      if (!isNaN(num) && num >= 0 && num <= 4294967295) {
        return numberToIp(num) || '';
      }
    }
    return '';
  }, [ip, number]);

  const displayNumber = useMemo(() => {
    if (number) return number;
    if (ip && isValidIp(ip)) {
      return formatNumber(ipToNumber(ip));
    }
    return '';
  }, [ip, number]);

  const handleIpChange = useCallback((value) => {
    setIp(value);
    setNumber('');
  }, []);

  const handleNumberChange = useCallback((value) => {
    const num = value.replace(/,/g, '');
    setNumber(num);
    setIp('');
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Network className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">IP Address to Number</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Developer Tools</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Convert IP addresses to decimal numbers and back. Supports binary, hexadecimal, and detailed conversion analysis.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["IP to Number", "Number to IP", "Multi-format"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Network className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-4">
          <MetricsDisplay ip={displayIp} number={displayNumber} />

          <div className="grid gap-4">
            <IpConverter
              ip={ip}
              number={number}
              displayIp={displayIp}
              displayNumber={displayNumber}
              onIpChange={handleIpChange}
              onNumberChange={handleNumberChange}
            />
            <BinaryDisplay
              number={displayNumber ? parseInt(String(displayNumber).replace(/,/g, '')) : null}
              ip={displayIp}
            />
          </div>

          <ConversionGuide />
        </div>
      </div>
    </div>
  );
}
