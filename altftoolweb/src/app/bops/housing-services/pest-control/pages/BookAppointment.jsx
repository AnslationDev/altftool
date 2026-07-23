import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const BookAppointment = () => {
  const location = useLocation();
  const preselected = location.state?.service;

  return (
    <div className="bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-20">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-xs font-semibold tracking-widest border mb-3">FREE INSPECTION INCLUDED</div>
          <h1 className="section-title tracking-[-1.5px]">Book Your Appointment</h1>
          <p className="text-[#374151] mt-3">Complete the form below. A specialist will call within 2 hours to confirm your appointment time.</p>
        </div>

        <div className="flex justify-center">
          <BookingForm initialService={preselected || ''} />
        </div>

        <div className="text-center mt-12">
          <Link to="/contact" className="text-sm text-[#1D7A43] underline">Prefer to speak with someone? Contact us directly</Link>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
