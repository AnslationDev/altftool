import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { services } from '../data/services';
import { ArrowRight, Check } from 'lucide-react';
import FAQAccordion from '../components/FAQAccordion';
import CTASection from '../components/CTASection';

// This SPA lives inside a Next route; the site-wide contact page is outside the
// router, so it's a full navigation rather than a react-router <Link>.
const CONTACT_URL = '/policypages/contact';

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = services.find(s => s.slug === slug) || services[0];

  const relatedServices = services.filter(s => service.related?.includes(s.slug)).slice(0, 3);
  const afterImages = {
    "rodent-control": "https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=800",
    "termite-control": "https://images.pexels.com/photos/5974396/pexels-photo-5974396.jpeg?auto=compress&cs=tinysrgb&w=800",
    "bee-removal": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "wasp-removal": "https://images.pexels.com/photos/6444249/pexels-photo-6444249.jpeg?auto=compress&cs=tinysrgb&w=800",
    "mosquito-control": "https://images.pexels.com/photos/5997993/pexels-photo-5997993.jpeg?auto=compress&cs=tinysrgb&w=800",
    "tick-control": "https://images.pexels.com/photos/6231766/pexels-photo-6231766.jpeg?auto=compress&cs=tinysrgb&w=800",
    "flea-control": "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=800",
    "bed-bug-removal": "https://images.pexels.com/photos/6585756/pexels-photo-6585756.jpeg?auto=compress&cs=tinysrgb&w=800",
    "wildlife-removal": "https://images.pexels.com/photos/5490361/pexels-photo-5490361.jpeg?auto=compress&cs=tinysrgb&w=800",
    "ant-control": "https://images.pexels.com/photos/8134731/pexels-photo-8134731.jpeg?auto=compress&cs=tinysrgb&w=800"
  };
  const afterImage = afterImages[service.slug] || "https://images.pexels.com/photos/6585758/pexels-photo-6585758.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Build FAQ for this service
  const serviceFaqs = service.faqs && service.faqs.length > 0
    ? service.faqs.map((f, i) => ({ id: i + 100, question: f.q, answer: f.a }))
    : [
        { id: 200, question: `How long does ${service.title.toLowerCase()} take?`, answer: "Most services are completed within 1–3 visits depending on severity. We provide a detailed timeline during your free inspection." },
        { id: 201, question: "Is treatment safe around my family and pets?", answer: "Yes. All products used are EPA-approved. Your technician will explain any precautions and re-entry times." },
      ];

  return (
    <div>
      {/* HERO BANNER */}
      <div className="relative h-[460px] flex items-end bg-[#111827]">
        <img src={service.image} alt={service.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />

        <div className="relative max-w-[1280px] mx-auto px-6 pb-14 text-white w-full">
          <div className="uppercase tracking-[2.5px] text-xs text-[#4ADE80] mb-1">{service.category} • STARTING AT ${service.startingPrice}</div>
          <h1 className="text-white text-[52px] md:text-[62px] font-bold tracking-[-2.5px] leading-none mb-4">{service.title}</h1>
          <p className="max-w-lg text-lg text-white/90">{service.longDescription}</p>

          <div className="flex gap-3 mt-8">
            <Link to="/book" state={{ service: service.slug }} className="btn btn-primary px-8">Book This Service</Link>
            <a href={CONTACT_URL} className="btn bg-white/10 border border-white/30 text-white px-7">Contact Us</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        {/* Overview */}
        <div className="grid md:grid-cols-12 gap-x-12 py-16">
          <div className="md:col-span-7">
            <div className="uppercase text-xs tracking-[2px] text-[#1D7A43] font-semibold">SERVICE OVERVIEW</div>
            <h2 className="text-[38px] tracking-[-1.6px] font-bold mt-2 mb-4">Professional {service.title} in Miami</h2>
            <div className="text-[#374151] text-[15px] leading-relaxed space-y-4">
              <p>{service.longDescription}</p>
              <p>Our certified technicians use advanced inspection techniques, targeted treatments, and proven exclusion methods to completely solve your pest problem and prevent future issues.</p>
            </div>
          </div>
          <div className="md:col-span-5 mt-9 md:mt-0">
            <div className="card p-8 bg-[#F8FAFC]">
              <div className="font-semibold mb-4">Quick Facts</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-[#64748b]">Starting Price</span> <span className="font-semibold">${service.startingPrice}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-[#64748b]">Treatment Duration</span> <span className="font-semibold">{service.duration}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-[#64748b]">Service Type</span> <span className="font-semibold">{service.category}</span></div>
                <div className="flex justify-between py-1"><span className="text-[#64748b]">Warranty</span> <span className="font-semibold">30–90 Days + Extensions</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Problems + Signs */}
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-9 pb-16">
          <div>
            <h3 className="font-semibold text-xl mb-4">Common Problems We Solve</h3>
            <ul className="space-y-2.5">
              {service.problems.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm"><Check size={17} className="text-[#1D7A43] mt-0.5 flex-shrink-0" /> {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-4">Signs of Infestation</h3>
            <ul className="space-y-2.5">
              {service.signs.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm"><Check size={17} className="text-[#1D7A43] mt-0.5 flex-shrink-0" /> {s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Treatment Process */}
        <div className="pb-16">
          <div className="mb-7">
            <div className="uppercase text-xs text-[#1D7A43] font-bold tracking-widest">OUR APPROACH</div>
            <h3 className="text-3xl font-bold tracking-tight mt-1">Treatment Process</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.process.map((step, idx) => (
              <div key={idx} className="card p-7">
                <div className="font-mono text-[#1D7A43] font-bold text-xs tracking-[2px] mb-1">STEP {step.step}</div>
                <div className="font-semibold text-xl mb-2">{step.title}</div>
                <p className="text-sm text-[#374151]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="pb-16">
          <h3 className="font-bold text-2xl mb-5">Benefits of Professional {service.title}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {service.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center bg-[#F8FAFC] rounded-2xl px-6 py-4 text-sm font-medium">{benefit}</div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-9 mb-16 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-5">
            <div>
              <div className="text-[#1D7A43] font-medium text-sm">STARTING AT</div>
              <div className="text-6xl font-bold tracking-[-1.5px] text-[#1D7A43] mt-1">${service.startingPrice}</div>
              <div className="text-sm mt-1 text-[#64748b]">Custom pricing available after inspection</div>
            </div>
            <div>
              <Link to="/book" state={{ service: service.slug }} className="btn btn-primary text-base px-10 py-[17px]">Book {service.shortTitle} Service</Link>
              <div className="mt-3 text-xs text-[#64748b]">Free inspection &amp; written quote included</div>
            </div>
          </div>
        </div>

        {/* Before / After - Simple Visual */}
        <div className="pb-16">
          <h3 className="font-bold text-2xl mb-6">Real Results in Indian Homes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-3xl overflow-hidden relative h-72 bg-[#111827]">
              <img src={service.image} className="w-full h-full object-cover opacity-80" alt="Before" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6">
                <div className="uppercase text-xs tracking-[2px] text-[#4ADE80]">BEFORE</div>
                <div className="text-white font-semibold">Active infestation visible</div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden relative h-72 bg-[#F8FAFC]">
              <img src={afterImage} className="w-full h-full object-cover" alt={`After ${service.title}`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-6">
                <div className="uppercase text-xs tracking-[2px] text-[#4ADE80]">AFTER</div>
                <div className="text-white font-semibold">Clean, pest-free environment</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pb-14">
          <h3 className="font-bold text-2xl mb-6">Frequently Asked Questions</h3>
          <FAQAccordion faqs={serviceFaqs} />
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="pb-16">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="font-bold text-2xl">Related Services</h3>
              <Link to="/services" className="text-sm text-[#1D7A43]">View all →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {relatedServices.map(svc => (
                <Link key={svc.id} to={`/services/${svc.slug}`} className="card p-6 group">
                  <div className="font-semibold group-hover:text-[#1D7A43]">{svc.title}</div>
                  <div className="text-sm text-[#64748b] mt-1 line-clamp-2">{svc.description}</div>
                  <div className="flex mt-6 text-sm text-[#1D7A43] items-center">Learn more <ArrowRight size={15} className="ml-1.5 group-hover:translate-x-0.5 transition" /></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <CTASection />
    </div>
  );
};

export default ServiceDetail;
