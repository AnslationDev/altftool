"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const { resolvedTheme, setThemeMode } = useTheme();

  return (
    <header
      className="h-16 w-full flex items-center z-50"
      style={{
        backgroundColor: 'var(--anslation-ds-footer)',
        borderBottom: '1px solid var(--anslation-ds-footer-border)',
        color: 'var(--anslation-ds-footer-text)',
      }}
    >
      <div className="w-full max-w-[1760px] mx-auto px-6 max-md:px-3 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <button
            className="md:hidden flex flex-col gap-[3px] p-1 bg-transparent border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded"
            aria-label="Toggle menu"
            style={{ color: 'var(--anslation-ds-footer-text)' }}
          >
            <Menu size={20} />
          </button>
          <Link
            href="/playbuzz"
            className="text-3xl max-md:text-2xl font-extrabold no-underline leading-none tracking-tight"
            style={{ color: 'var(--anslation-ds-footer-text)' }}
          >
            <span style={{ color: 'var(--secondary)' }}>AltFTool</span> Quizzes
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs font-bold tracking-wide focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded"
              style={{ color: 'var(--anslation-ds-footer-muted)' }}
            >
              ABOUT <ChevronDown size={10} />
            </button>
            {aboutDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2.5 min-w-[190px] overflow-hidden py-1.5 rounded-md z-50"
                style={{
                  backgroundColor: 'var(--anslation-ds-surface)',
                  border: '1px solid var(--anslation-ds-border)',
                  boxShadow: 'var(--anslation-ds-shadow-md)',
                }}
              >
                {['Privacy Policy', 'Online Terms', 'DMCA Notice'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block px-3.5 py-2.5 no-underline text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
                    style={{ color: 'var(--anslation-ds-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--anslation-ds-hover)';
                      e.currentTarget.style.color = 'var(--anslation-ds-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--anslation-ds-text)';
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Theme Toggle Button */}
        <button
          onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 flex items-center justify-center rounded-full border cursor-pointer transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--anslation-ds-footer-border)_30%,transparent)]"
          style={{
            borderColor: 'var(--anslation-ds-footer-border)',
            backgroundColor: 'transparent',
            color: 'var(--anslation-ds-footer-text)',
          }}
          aria-label="Toggle Theme"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={15} className="text-[var(--secondary)]" />
          ) : (
            <Moon size={15} className="text-[var(--secondary)]" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
