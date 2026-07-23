
"use client";
import { useReveal } from "../hooks/useReveal";

const testimonials = [
  {
    quote:
      "ClimaTech transformed our home comfort. Their team installed a new HVAC system in one day, and our energy bills dropped by 35%. Truly premium service.",
    name: "Sarah Mitchell",
    role: "Homeowner, Austin TX",
    initial: "S",
    image: "/personality/testimonials/image1.jpg",
  },
  {
    quote:
      "We needed emergency AC repair on a Saturday, and they were at our office within an hour. Professional, fast, and fairly priced. Highly recommend.",
    name: "James Rodriguez",
    role: "Office Manager, Dallas TX",
    initial: "J",
    image: "/personality/testimonials/image2.jpg",
  },
  {
    quote:
      "As a developer, I need reliable HVAC partners. ClimaTech handles all our commercial projects with precision and quality that our clients love.",
    name: "Emily Chen",
    role: "Property Developer",
    initial: "E",
    image: "/personality/testimonials/image3.jpg",
  },
];

export default function Testimonials() {
  const headerRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="testimonials" className="relative py-16 lg:py-20 bg-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            Client Reviews
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            Hear from homeowners and businesses who trust ClimaTech for their
            climate comfort needs.
          </p>
        </div>

        <div
          ref={gridRef}
          className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative bg-[#EFE6D6] border border-[#D4C9B5]/60 rounded-2xl overflow-hidden transition-all duration-500 hover-lift hover:border-[#A8BCD6] flex flex-col h-full"
            >
              {/* --- Image on top (full width) --- */}
              <img
                src={t.image}
                alt={t.name}
                className="w-full h-50 sm:h-56 object-cover"
              />

              {/* --- Content below the image --- */}
              <div className="p-8 flex flex-col flex-grow">
                {/* Quote mark */}
                <div className="mb-4">
                  <svg
                    className="w-10 h-10 text-black/80"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-balck/80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-[#333] leading-relaxed mb-6 text-sm flex-grow">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-5 border-t border-[#D4C9B5]/40">
                  <div className="w-10 h-10 rounded-full bg-[#C5D2E8]/30 border border-[#C5D2E8]/50 text-[#5a6f8a] flex items-center justify-center font-semibold">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-[#1a1a1a] font-medium text-sm">{t.name}</p>
                    <p className="text-[#6b6b6b] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
