import React from 'react';
import ContactForm from '../components/ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div>
      <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-12">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div>
              <div className="text-[#1D7A43] font-semibold tracking-widest text-xs">GET IN TOUCH</div>
              <h1 className="section-title tracking-[-1.5px] mt-3 mb-2">Contact PestX Miami</h1>
              <p className="text-lg text-[#374151]">Have questions? Need a quote? We're here to help 7 days a week.</p>
            </div>

            <div className="mt-8 card p-8 md:p-10">
              <ContactForm />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <div className="card p-8 mb-5">
              <div className="font-semibold mb-5">Our Location</div>
              <div className="space-y-5 text-sm">
                <a href="https://maps.google.com" target="_blank" className="flex gap-4 group">
                  <MapPin className="text-[#1D7A43] mt-0.5" size={21} />
                  <div>
                    <div className="font-medium">PestX Miami Headquarters</div>
                    <div className="text-[#374151]">1420 SW 8th Street, Miami, FL 33135</div>
                  </div>
                </a>
                <div className="flex gap-4">
                  <Phone className="text-[#1D7A43] mt-0.5" size={21} />
                  <div>
                    <a href="#demo-only" className="font-semibold block hover:underline">(786) 567-9554</a>
                    <div className="text-xs text-[#64748b]">Main Line • 24/7 Emergencies</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="text-[#1D7A43] mt-0.5" size={21} />
                  <a href="#demo-only" className="hover:underline">info@pestxmiami.com</a>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-center gap-3 font-semibold mb-4"><Clock size={19} /> Business Hours</div>
              <div className="text-sm space-y-[5px] text-[#374151]">
                <div className="flex justify-between"><span>Monday – Friday</span><span>7:00 AM – 7:00 PM</span></div>
                <div className="flex justify-between"><span>Saturday</span><span>8:00 AM – 5:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span>9:00 AM – 3:00 PM</span></div>
                <div className="pt-1.5 text-xs text-[#1D7A43] font-semibold">Emergency service available 24 hours</div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F8FAFC] px-6 py-5 text-sm">
              <span className="font-semibold">Emergency?</span> Call our 24/7 line. A live technician is always available for urgent situations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
