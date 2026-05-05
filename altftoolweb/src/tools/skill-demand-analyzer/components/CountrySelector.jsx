import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Adzuna API supported countries/regions
export const SUPPORTED_COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', value: 'gb' },
  { code: 'US', name: 'United States', value: 'us' },
  { code: 'IN', name: 'India', value: 'in' },
  { code: 'CA', name: 'Canada', value: 'ca' },
  { code: 'AU', name: 'Australia', value: 'au' },
  { code: 'NL', name: 'Netherlands', value: 'nl' },
  { code: 'DE', name: 'Germany', value: 'de' },
  { code: 'FR', name: 'France', value: 'fr' },
  { code: 'BR', name: 'Brazil', value: 'br' },
  { code: 'MX', name: 'Mexico', value: 'mx' },
  { code: 'SG', name: 'Singapore', value: 'sg' },
  { code: 'NZ', name: 'New Zealand', value: 'nz' },
];

export function CountrySelector({ selectedCountry, onCountryChange }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountryObj = SUPPORTED_COUNTRIES.find(
    (c) => c.value === selectedCountry
  );

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3
          bg-(--card) rounded-lg border-2
          text-(--foreground) transition-all duration-300
          ${isOpen
            ? 'border-blue-500 shadow-lg shadow-blue-100'
            : 'border-(--border) hover:border-blue-300'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="font-medium">
            {selectedCountryObj?.name}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 right-0 mt-2 bg-(--card) rounded-lg
            border border-(--border) shadow-xl z-50 max-h-64 overflow-y-auto
          `}
        >
          {SUPPORTED_COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                onCountryChange(country.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left transition-colors duration-200
                flex items-center justify-between hover:bg-(--muted)
                ${selectedCountry === country.value
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                  : 'text-(--foreground)'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{country.code}</span>
                <span>{country.name}</span>
              </div>
              {selectedCountry === country.value && (
                <span className="text-blue-600 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
