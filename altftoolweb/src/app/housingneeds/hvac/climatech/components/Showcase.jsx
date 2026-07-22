// "use client";
// import { useReveal } from "../hooks/useReveal";

// export default function Showcase() {
//   const headerRef = useReveal();
//   const row1Ref = useReveal();
//   const row2aRef = useReveal();
//   const row2bRef = useReveal();

//   return (
//     <section id="portfolio" className="relative py-16 lg:py-20 bg-[#F7F3EB]">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8">
//         {/* Header */}
//         <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16">
//           <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
//             Our Work
//           </span>
//           <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
//             Before &amp; After Showcase
//           </h2>
//           <p className="text-lg text-[#555] leading-relaxed">
//             See the transformative difference our premium HVAC installations
//             deliver.
//           </p>
//         </div>

//         {/* Top row: 2 images */}
//         <div ref={row1Ref} className="reveal-stagger grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
//           <ShowcaseCard
//             label="Before"
//             labelColor="bg-red-500"
//             tag="Outdated System"
//             desc="15-year-old unit, high energy bills"
//             fallback="https://images.pexels.com/photos/27427771/pexels-photo-27427771.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
//           />
//           <ShowcaseCard
//             label="After"
//             labelColor="bg-[#C5D2E8]"
//             tag="Premium Installation"
//             desc="Energy-efficient, 40% cost savings"
//             fallback="https://images.pexels.com/photos/27134985/pexels-photo-27134985.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
//           />
//         </div>

//         {/* Bottom row: large + small */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           <div
//             ref={row2aRef}
//             className="reveal-scale lg:col-span-2 relative rounded-2xl overflow-hidden aspect-[2/1] group"
//           >
//             <img
//               src="https://images.pexels.com/photos/14982942/pexels-photo-14982942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
//               alt="Commercial HVAC"
//               className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-[#1a1a1a]/20 to-transparent" />
//             <div className="absolute bottom-0 left-0 p-8 transition-transform duration-500 group-hover:translate-y-[-8px]">
//               <span className="inline-block text-xs font-semibold text-[#C5D2E8] uppercase tracking-widest mb-3">
//                 Commercial
//               </span>
//               <h3 className="font-serif-display text-2xl md:text-3xl font-semibold text-white mb-2">
//                 Enterprise HVAC Solutions
//               </h3>
//               <p className="text-white/90 max-w-md">
//                 Large-scale climate control for offices, warehouses, and retail
//                 spaces.
//               </p>
//             </div>
//           </div>
//           <div
//             ref={row2bRef}
//             className="reveal-scale relative rounded-2xl overflow-hidden aspect-[2/1] lg:aspect-auto group"
//           >
//             <img
//               src="https://images.pexels.com/photos/36818203/pexels-photo-36818203.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200"
//               alt="Smart thermostat"
//               className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-[#1a1a1a]/20 to-transparent" />
//             <div className="absolute bottom-0 left-0 p-6 transition-transform duration-500 group-hover:translate-y-[-8px]">
//               <span className="inline-block text-xs font-semibold text-[#C5D2E8] uppercase tracking-widest mb-3">
//                 Smart Home
//               </span>
//               <h3 className="font-serif-display text-xl md:text-2xl font-semibold text-white">
//                 Intelligent Climate Control
//               </h3>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function ShowcaseCard({ label, labelColor, tag, desc, fallback }) {
//   return (
//     <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
//       <img
//         src={fallback}
//         alt={tag}
//         className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/70 via-[#1a1a1a]/20 to-transparent" />
//       <div className="absolute bottom-0 left-0 p-8 transition-transform duration-500 group-hover:translate-y-[-8px]">
//         <span
//           className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 ${labelColor}`}
//         >
//           {label}
//         </span>
//         <h3 className="font-serif-display text-2xl md:text-3xl font-semibold text-white mb-2">
//           {tag}
//         </h3>
//         <p className="text-white/90">{desc}</p>
//       </div>
//     </div>
//   );
// }


"use client";
import { useReveal } from "../hooks/useReveal";

const projects = [
  {
    id: 1,
    type: "before",
    label: "BEFORE",
    tag: "Outdated System",
    desc: "15-year-old unit, high energy bills",
    location: "Austin, TX",
    image: "https://images.pexels.com/photos/27427771/pexels-photo-27427771.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  },
  {
    id: 2,
    type: "after",
    label: "AFTER",
    tag: "Premium Installation",
    desc: "Energy-efficient, 40% cost savings",
    location: "Austin, TX",
    image: "https://images.pexels.com/photos/27134985/pexels-photo-27134985.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  },
  {
    id: 3,
    type: "commercial",
    label: "COMMERCIAL",
    tag: "Enterprise HVAC Solutions",
    desc: "Large-scale climate control for offices & retail",
    location: "Dallas, TX",
    image: "https://images.pexels.com/photos/14982942/pexels-photo-14982942.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
    fullWidth: true,
  },
  {
    id: 4,
    type: "smart",
    label: "SMART HOME",
    tag: "Intelligent Climate Control",
    desc: "Energy monitoring & remote scheduling",
    location: "Houston, TX",
    image: "https://images.pexels.com/photos/36818203/pexels-photo-36818203.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
    fullWidth: true,
  },
];

export default function Showcase() {
  const headerRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="portfolio" className="relative py-8 lg:py-10 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            Our Work
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            Before &amp; After Showcase
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            See the transformative difference our premium HVAC installations
            deliver.
          </p>
        </div>

        {/* Grid – 2 columns on desktop, full‑width items fill empty space */}
        <div
          ref={gridRef}
          className="reveal-stagger grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-[280px] lg:auto-rows-[320px]"
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className={`project-card rounded-2xl overflow-hidden relative group transition-all duration-500 hover:shadow-xl hover:shadow-[#C5D2E8]/30 ${project.fullWidth ? "md:col-span-2" : ""
                }`}
              style={{ animationDelay: `${(project.id - 1) * 0.1}s` }}
            >
              {/* Image */}
              <img
                src={project.image}
                alt={project.tag}
                className="w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Badge */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow-lg z-10 transition-all duration-300 group-hover:scale-105 ${project.type === "before"
                    ? "bg-red-500/80"
                    : project.type === "after"
                      ? "bg-[#5a6f8a]/80"
                      : "bg-[#C5D2E8]/80"
                  }`}
              >
                {project.label}
              </span>

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 z-10 w-full transform transition-all duration-500 group-hover:translate-y-[-8px]">
                <h3 className="font-serif-display text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-1">
                  {project.tag}
                </h3>
                <p className="text-white/90 text-sm md:text-base max-w-md">
                  {project.desc}
                </p>
                <p className="text-[#C5D2E8] text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {project.location}
                </p>

                {/* Call‑to‑action button (appears on hover) */}
                <div className="mt-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                  >
                    Discuss This Project
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M5 12h16" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .project-card {
          opacity: 0;
          transform: translateY(40px);
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .project-card:nth-child(1) { animation-delay: 0.05s; }
        .project-card:nth-child(2) { animation-delay: 0.15s; }
        .project-card:nth-child(3) { animation-delay: 0.25s; }
        .project-card:nth-child(4) { animation-delay: 0.35s; }

        .project-card:hover {
          box-shadow: 0 20px 40px -12px rgba(90, 111, 138, 0.3);
        }

        .project-card .absolute.top-4.right-4 {
          animation: badgePulse 2s infinite ease-in-out;
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .project-card {
            aspect-ratio: 4/3;
          }
        }
      `}</style>
    </section>
  );
}
