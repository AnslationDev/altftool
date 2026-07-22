import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({ service }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="service-card card overflow-hidden group flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-[#F8FAFC]">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-4 right-4 bg-white/95 text-[#1D7A43] font-semibold text-sm px-3.5 py-1 rounded-full shadow">
          From ${service.startingPrice}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div>
          <div className="uppercase tracking-[1px] text-xs font-semibold text-[#1D7A43] mb-1">{service.category}</div>
          <h3 className="text-xl font-bold tracking-[-0.3px] mb-2 text-[#111827]">{service.title}</h3>
          <p className="text-sm text-[#374151] line-clamp-2 leading-relaxed mb-5">{service.description}</p>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2.5 border-t">
          <Link
            to={`/services/${service.slug}`}
            className="flex-1 text-sm font-semibold text-[#1D7A43] flex items-center hover:underline"
          >
            Read More <ArrowRight size={15} className="ml-1" />
          </Link>
          <Link
            to="/book"
            state={{ service: service.slug }}
            className="btn btn-primary text-xs px-5 py-2"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
