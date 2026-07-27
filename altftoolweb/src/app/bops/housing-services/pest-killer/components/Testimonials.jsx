import { useEffect, useRef, useState } from 'react';
import './Testimonials.css';

const CONTACT_URL = '/policypages/contact';

const testimonials = [
  { text: '"We had a serious cockroach problem, but their team handled it quickly. Now our home feels completely clean and safe."', name: 'Rahul Sharma', role: 'Homeowner' },
  { text: '"Very professional service. They explained everything clearly and solved our termite issue without any hassle. Highly recommended."', name: 'Pooja Verma', role: 'Shop Owner' },
  { text: '"Their mosquito treatment worked really well. We noticed a big difference within days. Great service and friendly staff."', name: 'Amit Kumar', role: 'Office Manager' },
  { text: '"Excellent work! They came on time and did a thorough job. Our office has been pest-free since their treatment."', name: 'Sneha Gupta', role: 'Business Owner' },
  { text: '"I was worried about chemicals, but they used eco-friendly products. Safe for kids and pets. Very satisfied!"', name: 'Vikram Singh', role: 'Homeowner' },
];

function Stars({ count = 5 }) {
  return <div className="stars">{Array(count).fill(0).map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}</div>;
}

function TestimonialCard({ t }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-stars"><Stars /></div>
      <p>{t.text}</p>
      <div className="testimonial-author">
        <h4>{t.name}</h4>
        <span>{t.role}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isHovered) return;

    let animationId;
    const scroll = () => {
      if (el) {
        el.scrollLeft += 1;
        // If we've scrolled past half the content (the original list), jump back to start
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isHovered]);

  return (
    <section className="testimonials" id="testimonial">
      <div className="container">
        <div className="testimonials-grid">

          <div className="testimonials-left reveal">
            <div className="section-title">
              <span className="section-sub-title"><span className="dot"></span> Our Testimonials</span>
              <h2>Real experiences from customers who trust our pest control services</h2>
            </div>

            <a href={CONTACT_URL} className="btn-green btn-icon">
              Contact Us <i className="fa-solid fa-arrow-right"></i>
            </a>

            <div className="rating-box">
              <div className="rating-box-top">
                <span className="rating-score">4.9/5</span>
                <Stars />
              </div>
              <div className="rating-box-bottom">
                <div className="avatar-stack">
                  <div className="avatar"><i className="fa-solid fa-user"></i></div>
                  <div className="avatar"><i className="fa-solid fa-user"></i></div>
                  <div className="avatar"><i className="fa-solid fa-user"></i></div>
                  <div className="avatar plus"><i className="fa-solid fa-plus"></i></div>
                </div>
                <p><strong>1.2lakh+ Happy Customers</strong> Trust Our Pest Control Services</p>
              </div>
            </div>
          </div>

          <div className="testimonials-right reveal">
            <div
              className="testimonial-marquee"
              ref={scrollRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="testimonial-track">
                {testimonials.map((t) => (
                  <TestimonialCard key={t.name} t={t} />
                ))}
                {/* Duplicate for seamless infinite loop */}
                {testimonials.map((t) => (
                  <TestimonialCard key={t.name + '-dup'} t={t} />
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="testimonials-footer reveal">
          <div className="footer-left">
            <div className="footer-icon-wrap">
              <i className="fa-solid fa-comment-dots"></i>
            </div>
            <p>Trusted pest control solutions that keep your home safe and pest-free – <a href={CONTACT_URL}>Contact Us Today</a></p>
          </div>
          <div className="footer-right">
            <span className="footer-score">4.9/5</span>
            <Stars />
            <p><strong>Over 4000+</strong> Happy Customer Reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}
