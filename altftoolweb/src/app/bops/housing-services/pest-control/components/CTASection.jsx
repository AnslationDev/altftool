import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <div className="bg-[#14532D] py-14 text-white">
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="uppercase tracking-[3px] text-[#4ADE80] text-xs mb-3 font-semibold">PROTECT YOUR HOME TODAY</div>
          <h2 className="text-white text-4xl md:text-[42px] font-bold tracking-[-1.5px] leading-none mb-4">Need Pest Control Today?</h2>
          <p className="text-white/75 text-lg mb-8">Our team is ready to help. Get a free quote or speak to a specialist right away.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/book" className="btn bg-white text-[#14532D] hover:bg-[#F8FAFC] px-10 text-base">Book Service Now</Link>
            <a href="#demo-only" className="btn border-2 border-white/70 hover:bg-white/10 text-white px-9 text-base">Call (786) 567-9554</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
