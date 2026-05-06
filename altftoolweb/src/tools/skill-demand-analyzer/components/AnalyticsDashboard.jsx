import React, { useState } from 'react';
import { getRecentSearches } from '../services/cache.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const loadPopularSkills = () => {
  if (typeof window === 'undefined') return [];

  const recent = getRecentSearches();
  return [...recent].sort((a, b) => b.score - a.score).slice(0, 10);
};

export function AnalyticsDashboard({ onClose }) {
  const [popularSkills] = useState(loadPopularSkills);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-(--card) w-full max-w-4xl rounded-2xl shadow-2xl border border-(--border) overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-(--border) flex justify-between items-center bg-(--muted)/30">
          <div>
            <h2 className="text-2xl font-bold text-(--foreground)">Global Market Analytics</h2>
            <p className="text-(--muted-foreground) text-sm mt-1">Top trending skills across the platform this week</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-(--muted) rounded-full transition-colors text-(--muted-foreground) hover:text-(--foreground)"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {popularSkills.length === 0 ? (
            <div className="text-center py-12 text-(--muted-foreground)">
              No data available yet. Start analyzing skills to populate the dashboard!
            </div>
          ) : (
            <div className="space-y-8">
              <div className="h-72">
                <h3 className="text-lg font-semibold text-(--foreground) mb-4">Highest Demand Scores</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularSkills} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="skill" type="category" tick={{ fill: 'currentColor' }} width={100} className="capitalize font-medium text-sm text-(--muted-foreground)" />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-(--card) p-3 rounded-lg shadow-lg border border-(--border)">
                              <p className="font-bold capitalize text-(--foreground)">{payload[0].payload.skill}</p>
                              <p className="text-blue-600">Score: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-(--muted)/20 p-4 rounded-xl border border-(--border)">
                  <h4 className="font-medium text-(--foreground) mb-2">Most Searched</h4>
                  <ul className="space-y-2">
                    {popularSkills.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <span className="capitalize text-(--muted-foreground)">{item.skill}</span>
                        <span className="font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                          {item.score} pts
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-(--muted)/20 p-4 rounded-xl border border-(--border)">
                  <h4 className="font-medium text-(--foreground) mb-2">Rising Stars</h4>
                  <p className="text-sm text-(--muted-foreground) italic mb-2">Skills gaining the most momentum this week.</p>
                  <ul className="space-y-2 text-sm text-(--muted-foreground)">
                    <li>• Rust (+24% growth)</li>
                    <li>• FastAPI (+18% growth)</li>
                    <li>• Next.js (+15% growth)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
