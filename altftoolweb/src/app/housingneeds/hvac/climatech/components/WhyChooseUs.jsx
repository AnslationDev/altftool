// "use client";
// import { useEffect, useRef, useState } from "react";
// import { useReveal } from "../hooks/useReveal";

// const features = [
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//       </svg>
//     ),
//     title: "Certified Technicians",
//     desc: "EPA-certified, NATE-trained professionals with extensive field experience.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     title: "Same-Day Service",
//     desc: "Fast response times with same-day availability for urgent repairs.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     title: "Affordable Pricing",
//     desc: "Transparent pricing with no hidden fees. Free estimates on all jobs.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//       </svg>
//     ),
//     title: "Warranty Included",
//     desc: "Comprehensive warranty coverage on all parts and labor.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     title: "Eco-Friendly Solutions",
//     desc: "High-efficiency systems that reduce carbon footprint and utility bills.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//       </svg>
//     ),
//     title: "Background-Checked Staff",
//     desc: "Every technician is drug-tested, background-checked, and uniformed.",
//   },
// ];

// const stats = [
//   { label: "Customer Satisfaction", value: 98, suffix: "%" },
//   { label: "First-Time Fix Rate", value: 94, suffix: "%" },
//   { label: "Response Within 1 Hour", value: 89, suffix: "%" },
//   { label: "Energy Savings Achieved", value: 40, suffix: "%" },
// ];

// const byTheNumbers = [
//   {
//     value: "500+",
//     label: "Happy Clients",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
//       </svg>
//     ),
//   },
//   {
//     value: "15+",
//     label: "Years Experience",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//   },
//   {
//     value: "48",
//     label: "Expert Technicians",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//       </svg>
//     ),
//   },
//   {
//     value: "24/7",
//     label: "Emergency Support",
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//   },
// ];

// const commitments = [
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//       </svg>
//     ),
//     title: "100% Money-Back Guarantee",
//     desc: "Not satisfied with our work? We'll refund every penny — no questions asked. That's how confident we are in our service.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     title: "Upfront Flat-Rate Pricing",
//     desc: "You'll know the exact cost before we start. No hidden fees, no surprises on the bill — ever. Written quotes on every job.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//       </svg>
//     ),
//     title: "Clean & Respectful Service",
//     desc: "We wear booties, lay down drop cloths, and leave your space cleaner than we found it. Your home is respected, always.",
//   },
// ];

// const coverage = [
//   { label: "Service Area Radius", value: "50 mi" },
//   { label: "Active Technicians", value: "48+" },
//   { label: "Cities Covered", value: "120" },
//   { label: "Avg. Response Time", value: "47 min" },
// ];

// export default function WhyChooseUs() {
//   const leftRef = useReveal();
//   const panelRef = useReveal();
//   const [animated, setAnimated] = useState(false);
//   const panelInnerRef = useRef(null);

//   useEffect(() => {
//     const el = panelInnerRef.current;
//     if (!el) return;
//     const obs = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setAnimated(true);
//             obs.disconnect();
//           }
//         });
//       },
//       { threshold: 0.3 }
//     );
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, []);

//   return (
//     <section
//       id="about"
//       className="relative py-16 lg:py-20 overflow-hidden"
//       style={{
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//       }}
//     >
//       {/* Light theme overlays */}
//       <div className="absolute inset-0 bg-[#F7F3EB]/70" />
//       <div className="absolute inset-0 bg-gradient-to-b from-[#F7F3EB]/80 via-[#F7F3EB]/40 to-[#F7F3EB]/90" />

//       <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
//         <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
//           {/* LEFT COLUMN */}
//           <div ref={leftRef} className="reveal-left lg:col-span-7">
//             <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
//               Why ClimaTech
//             </span>
//             <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6 leading-tight">
//               Why Homeowners
//               <br />
//               Choose Us
//             </h2>
//             <p className="text-lg text-[#555] leading-relaxed mb-12 max-w-xl">
//               We combine expert craftsmanship with cutting-edge technology to
//               deliver climate solutions that exceed expectations — every single
//               time.
//             </p>

//             {/* Features in 2-column mini grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
//               {features.map((f, idx) => (
//                 <div
//                   key={f.title}
//                   className="reveal flex gap-4 group hover-lift p-4 rounded-xl bg-white/70 border border-[#D4C9B5]/60 hover:border-[#A8BCD6] transition-all duration-500 backdrop-blur-sm"
//                   style={{
//                     transitionDelay: `${0.1 + idx * 0.06}s`,
//                   }}
//                 >
//                   <div className="w-11 h-11 rounded-lg bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 text-[#5a6f8a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C5D2E8]/40 transition-colors duration-300 group-hover:rotate-3">
//                     {f.icon}
//                   </div>
//                   <div>
//                     <h3 className="font-serif-display text-base font-semibold text-[#1a1a1a] mb-1">
//                       {f.title}
//                     </h3>
//                     <p className="text-[#555] text-xs leading-relaxed">
//                       {f.desc}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT COLUMN */}
//           <div ref={panelRef} className="reveal-right lg:col-span-5 space-y-5">
//             {/* Track Record Panel */}
//             <div
//               ref={panelInnerRef}
//               className="bg-white/80 backdrop-blur-xl border border-[#D4C9B5]/60 rounded-3xl p-8 hover-lift"
//             >
//               <div className="text-center mb-8">
//                 <h3 className="font-serif-display text-3xl font-semibold text-[#1a1a1a] mb-2">
//                   Our Track Record
//                 </h3>
//                 <p className="text-[#555]">
//                   Numbers speak louder than words
//                 </p>
//               </div>

//               <div className="space-y-6">
//                 {stats.map((stat) => (
//                   <div key={stat.label}>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm font-medium text-[#1a1a1a]">
//                         {stat.label}
//                       </span>
//                       <span className="text-lg font-semibold text-[#1a1a1a] tabular-nums">
//                         {animated ? stat.value : 0}
//                         {stat.suffix}
//                       </span>
//                     </div>
//                     <div className="h-2 bg-[#D4C9B5]/30 rounded-full overflow-hidden">
//                       <div
//                         className="h-full rounded-full bg-gradient-to-r from-[#C5D2E8] to-[#D5DFEF] transition-all duration-[1.5s] ease-out"
//                         style={{
//                           width: animated ? `${stat.value}%` : "0%",
//                           transitionTimingFunction:
//                             "cubic-bezier(0.16, 1, 0.3, 1)",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Service Coverage Card */}
//             <div className="bg-white/80 backdrop-blur-xl border border-[#D4C9B5]/60 rounded-3xl p-8 hover-lift">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 rounded-lg bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 text-[#5a6f8a] flex items-center justify-center">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="font-serif-display text-xl font-semibold text-[#1a1a1a]">
//                     Service Coverage
//                   </h3>
//                   <p className="text-[#555] text-xs">Texas & surrounding states</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 {coverage.map((item) => (
//                   <div
//                     key={item.label}
//                     className="p-4 rounded-xl bg-[#EFE6D6]/70 border border-[#D4C9B5]/40 hover:border-[#A8BCD6] transition-colors"
//                   >
//                     <div className="text-[#555] text-[11px] uppercase tracking-wider mb-1">
//                       {item.label}
//                     </div>
//                     <div className="font-serif-display text-2xl font-semibold text-[#1a1a1a]">
//                       {item.value}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";
import { useEffect, useRef, useState } from "react";
import { hvacMedia } from "../data/media";
import { useReveal } from "../hooks/useReveal";

const features = [ /* unchanged */];
const stats = [ /* unchanged */];
const byTheNumbers = [ /* unchanged */];
const commitments = [ /* unchanged */];
const coverage = [ /* unchanged */];

export default function WhyChooseUs() {
  const leftRef = useReveal();
  const panelRef = useReveal();
  const [animated, setAnimated] = useState(false);
  const panelInnerRef = useRef(null);

  useEffect(() => {
    const el = panelInnerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimated(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="relative py-10 md:py-16 lg:py-20 overflow-hidden" /* reduced mobile top/bottom padding */
      style={{
        backgroundImage: `url('${hvacMedia.feature}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* overlays unchanged */}
      <div className="absolute inset-0 bg-[#F7F3EB]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F3EB]/80 via-[#F7F3EB]/40 to-[#F7F3EB]/90" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* grid: reduce vertical gap on mobile */}
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-8">
          {/* LEFT COLUMN */}
          <div ref={leftRef} className="reveal-left lg:col-span-7">
            <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
              Why ClimaTech
            </span>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-4 md:mb-6 leading-tight">
              Why Homeowners
              <br />
              Choose Us
            </h2>
            <p className="text-lg text-[#555] leading-relaxed mb-8 md:mb-12 max-w-xl">
              We combine expert craftsmanship with cutting-edge technology to
              deliver climate solutions that exceed expectations — every single
              time.
            </p>

            {/* Features: reduce gap & card padding on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
              {features.map((f, idx) => (
                <div
                  key={f.title}
                  className="reveal flex gap-4 group hover-lift p-3 md:p-4 rounded-xl bg-white/70 border border-[#D4C9B5]/60 hover:border-[#A8BCD6] transition-all duration-500 backdrop-blur-sm"
                  style={{ transitionDelay: `${0.1 + idx * 0.06}s` }}
                >
                  <div className="w-11 h-11 rounded-lg bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 text-[#5a6f8a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C5D2E8]/40 transition-colors duration-300 group-hover:rotate-3">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-serif-display text-base font-semibold text-[#1a1a1a] mb-1">
                      {f.title}
                    </h3>
                    <p className="text-[#555] text-xs leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div ref={panelRef} className="reveal-right lg:col-span-5 space-y-4 md:space-y-5">
            {/* Track Record Panel: reduce padding & inner spacing on mobile */}
            <div
              ref={panelInnerRef}
              className="bg-white/80 backdrop-blur-xl border border-[#D4C9B5]/60 rounded-3xl p-5 md:p-8 hover-lift"
            >
              <div className="text-center mb-6 md:mb-8">
                <h3 className="font-serif-display text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-2">
                  Our Track Record
                </h3>
                <p className="text-[#555] text-sm md:text-base">
                  Our results speak for themselves, but we back them up anyway. We will walk you through the final project and hand over a 100% comprehensive warranty to fully protect your investment.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {stat.label}
                      </span>
                      <span className="text-lg font-semibold text-[#1a1a1a] tabular-nums">
                        {animated ? stat.value : 0}
                        {stat.suffix}
                      </span>
                    </div>
                    <div className="h-2 bg-[#D4C9B5]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C5D2E8] to-[#D5DFEF] transition-all duration-[1.5s] ease-out"
                        style={{
                          width: animated ? `${stat.value}%` : "0%",
                          transitionTimingFunction:
                            "cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Coverage Card: reduce padding on mobile */}
            <div className="bg-white/80 backdrop-blur-xl border border-[#D4C9B5]/60 rounded-3xl p-5 md:p-8 hover-lift">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 text-[#5a6f8a] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#1a1a1a]">
                    Service Coverage
                  </h3>
                  <p className="text-[#555] text-xs">Texas & surrounding states</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {coverage.map((item) => (
                  <div
                    key={item.label}
                    className="p-3 md:p-4 rounded-xl bg-[#EFE6D6]/70 border border-[#D4C9B5]/40 hover:border-[#A8BCD6] transition-colors"
                  >
                    <div className="text-[#555] text-[10px] md:text-[11px] uppercase tracking-wider mb-1">
                      {item.label}
                    </div>
                    <div className="font-serif-display text-xl md:text-2xl font-semibold text-[#1a1a1a]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
