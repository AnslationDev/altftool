import React from 'react';
import { Link } from 'react-router-dom';
import { serviceAreas } from '../data/services';
import { MapPin } from 'lucide-react';

const ServiceAreas = () => {
  return (
    <div>
      <div className="bg-[#14532D] py-16 text-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-xl">
            <div className="tracking-[2.5px] font-semibold text-[#4ADE80] text-sm mb-1">COVERAGE</div>
            <h1 className="text-6xl font-bold tracking-[-2px] leading-none">Service Areas</h1>
            <p className="mt-4 text-lg text-white/80">Fast, reliable pest control across major Indian cities and surrounding communities.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {serviceAreas.map((area, index) => (
            <div key={index} className="area-card flex items-center gap-3.5 border border-[#E5E7EB] rounded-2xl px-6 py-5 hover:border-[#1D7A43]">
              <MapPin className="text-[#1D7A43]" size={20} />
              <span className="font-medium">{area}</span>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-[#F8FAFC] p-9 md:p-12">
          <div className="max-w-2xl">
            <h3 className="font-bold text-3xl tracking-tight mb-3">Don't see your city?</h3>
            <p className="text-[#374151] mb-5">We serve many additional neighborhoods across India. Call us - chances are we're already in your area.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/book" className="btn btn-primary">Check Availability</Link>
              <a href="#demo-only" className="btn btn-secondary">Call (786) 567-9554</a>
            </div>
          </div>
        </div>

        <div className="text-sm text-[#64748b] mt-10">Same-day and next-day service available throughout our coverage area. Emergency response within hours for urgent situations.</div>
      </div>
    </div>
  );
};

export default ServiceAreas;
