"use client";
import { useReveal } from "../hooks/useReveal";

export default function About() {
  const imgRef = useReveal();
  const contentRef = useReveal();
  const statsRef = useReveal();

  return (
    <section className="relative py-16 lg:py-20 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image with badge */}
          <div ref={imgRef} className="reveal-left relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.pexels.com/photos/27427771/pexels-photo-27427771.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200"
                alt="ClimaTech HVAC team with service van"
                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 right-6 lg:right-10 bg-white border border-[#D4C9B5] rounded-2xl p-5 shadow-xl float-anim">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#5a6f8a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1a1a1a] font-semibold">EPA Certified</p>
                  <p className="text-[#555] text-sm">Fully licensed & bonded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div ref={contentRef} className="reveal-right">
            <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
              About ClimaTech
            </span>
            <h2 className="font-serif-display text-4xl md:text-5xl font-medium text-[#1a1a1a] mb-6 leading-tight">
              Your Trusted HVAC
              <br />
              Partner Since 2010
            </h2>
            <p className="text-[#555] leading-relaxed mb-4">
              ClimaTech was founded on a simple promise — deliver premium
              climate control solutions with unmatched reliability. From our
              first installation to our 500th satisfied client, we've stayed
              committed to craftsmanship, innovation, and customer comfort.
            </p>
            <p className="text-[#555] leading-relaxed mb-10">
              Our certified technicians use the latest technology and
              energy-efficient systems to keep your home or business at the
              perfect temperature, all year round.
            </p>

            {/* 4 stat cards */}
            <div ref={statsRef} className="reveal-stagger grid grid-cols-2 gap-4">
              {[
                { icon: "", value: "500+", label: "Happy Clients" },
                { icon: "", value: "15+", label: "Years Experience" },
                { icon: "", value: "200+", label: "Projects Done" },
                { icon: "", value: "98%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#EFE6D6] border border-[#D4C9B5]/60 rounded-xl p-6 text-center hover:border-[#A8BCD6] transition-colors duration-300 hover-lift"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="font-serif-display text-3xl font-semibold text-[#1a1a1a] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#555]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
