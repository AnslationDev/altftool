import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Star, Quote } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { testimonials } from "../../data/testimonials";

export default function Testimonials() {
  return (
    <section id="testimonials" className="sec">
      <Container>
        <SectionHeading 
          eyebrow="Testimonials" 
          title="Loved by founders & marketing leaders" 
          subtitle="Don't take our word for it — here's what our clients say about growing with ApexBoost." 
        />
        <div className="mt-14">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="!pb-14 h-full"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.name} className="h-auto">
                <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex">{[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-warning text-warning" />)}</div>
                    <Quote size={28} className="text-brand/20" />
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/5">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}>
                      <img
                        src={t.image}
                        alt={t.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t.role} · {t.company}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
