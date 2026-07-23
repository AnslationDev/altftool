import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Jennifer Morales",
    location: "Coral Gables",
    rating: 5,
    date: "Jan 9, 2026",
    text: "PestX eliminated our rodent problem in two visits. Extremely professional, clean, and the technician explained everything. Highly recommend for anyone in Miami dealing with pests.",
  },
  {
    id: 2,
    name: "Carlos & Maria Hernandez",
    location: "Kendall",
    rating: 5,
    date: "Dec 22, 2025",
    text: "We had a bad termite issue. The team was thorough and the 5-year warranty gave us total peace of mind. Our home feels safe again. Excellent service from start to finish.",
  },
  {
    id: 3,
    name: "David Kim",
    location: "Brickell",
    rating: 5,
    date: "Jan 3, 2026",
    text: "Fast response for a bee hive emergency. They arrived the same afternoon, removed it safely and even helped relocate the bees. Very impressed with the care and professionalism.",
  },
  {
    id: 4,
    name: "The Ramirez Family",
    location: "Miami Beach",
    rating: 5,
    date: "Dec 17, 2025",
    text: "Monthly mosquito service has completely changed our backyard experience. No more bites during dinner on the patio. The techs are always on time and friendly.",
  },
  {
    id: 5,
    name: "Samantha Torres",
    location: "Doral",
    rating: 5,
    date: "Jan 5, 2026",
    text: "The team treated for bed bugs in our condo. They were incredibly discreet and the results were incredible. We haven't seen a single bug since the second treatment. Worth every penny.",
  }
];

const TestimonialSlider = () => {
  return (
    <div className="relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={28}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4800, disableOnInteraction: false }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!pb-12"
      >
        {testimonials.map((t) => (
          <SwiperSlide key={t.id}>
            <div className="card h-full p-7 flex flex-col">
              <div className="flex mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={17} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="flex-1 text-[15px] leading-relaxed text-[#374151] mb-6">“{t.text}”</p>
              <div className="border-t pt-4 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-[#111827]">{t.name}</div>
                  <div className="text-xs text-[#64748b]">{t.location}</div>
                </div>
                <div className="text-right text-xs text-[#64748b]">{t.date}</div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TestimonialSlider;
