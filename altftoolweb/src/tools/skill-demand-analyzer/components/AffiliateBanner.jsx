import React from 'react';

/**
 * Monetization Hook - Affiliate Banner
 * This is currently hidden from the UI but ready for deployment.
 * It dynamically generates affiliate links based on the searched skill.
 */
export function AffiliateBanner({ skill }) {
  if (!skill) return null;

  // Placeholder affiliate link structure
  const affiliateLink = `https://click.linksynergy.com/fs-bin/click?id=YOUR_ID&offerid=YOUR_OFFER&type=3&subid=0&url=https://www.coursera.org/search?query=${encodeURIComponent(skill)}`;

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white mb-6 animate-pulse hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Master {skill.toUpperCase()} Today!</h3>
          <p className="text-white/90 text-sm">
            Top companies are actively hiring. Get certified and boost your salary by up to 25%.
          </p>
        </div>
        <a 
          href={affiliateLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-md whitespace-nowrap"
        >
          View Top Courses
        </a>
      </div>
    </div>
  );
}
