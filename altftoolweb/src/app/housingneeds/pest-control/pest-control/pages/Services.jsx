import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { services } from '../data/services';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Residential', 'Outdoor', 'Commercial'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#14532D] py-16 text-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-2xl">
            <div className="text-[#4ADE80] font-semibold tracking-[2.5px] text-sm">OUR EXPERTISE</div>
            <h1 className="text-6xl tracking-[-2.5px] font-bold mt-2 mb-3">All Pest Control Services</h1>
            <p className="text-xl text-white/75">Professional solutions for every pest problem in South Florida homes and businesses.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pt-11 pb-16">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-[#64748b]" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-sm font-medium rounded-2xl border transition ${activeCategory === cat ? 'bg-[#1D7A43] border-[#1D7A43] text-white' : 'border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#64748b]">No services matched your search. <button onClick={() => {setSearchTerm(''); setActiveCategory('All');}} className="underline text-[#1D7A43]">Clear filters</button></div>
        )}

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="mb-4 text-[#374151]">Can't find what you need? We handle almost every pest problem.</p>
          <Link to="/book" className="btn btn-primary px-10">Book a Free Inspection</Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
