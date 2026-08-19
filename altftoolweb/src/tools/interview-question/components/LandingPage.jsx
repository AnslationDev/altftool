"use client";

import React from 'react';
import { domains } from '../data/questions';

const LandingPage = ({ onSelectDomain }) => {
  return (
    <div className=" m-8 bg-(--background) text-(--foreground) border border-(--border) rounded-xl shadow-lg">
      <div className=" ">
        <p className="subheading m-5 ">Select your role to browse curated interview questions.</p>
      </div>
      
      <div className=" m-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8   ">
        {domains.map((domain) => (
          <div
            key={domain.id}
            role="button"
            tabIndex={0}
            className=" bg-(--card) p-8 rounded-2xl border border-(--border) font-semibold shadow-sm hover:animate-slide-up  cursor-pointer
            transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 "
            onClick={() => onSelectDomain(domain.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectDomain(domain.id);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <span className="">{domain.icon}</span>
            <h3>{domain.name}</h3>


              </div>
                <p className=" m-6 px-4 ">View Questions &rarr;</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;