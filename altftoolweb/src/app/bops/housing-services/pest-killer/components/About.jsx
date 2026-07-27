import { useEffect, useRef, useState } from 'react';
import about1Img from '../assets/about1.png';
import about2Img from '../assets/about2.png';
import './About.css';

const CONTACT_URL = '/policypages/contact';

export default function About() {
  const [count, setCount] = useState(0);
  const badgeRef = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          let start = 0;
          const end = 28;
          const duration = 1500; // 1.5 seconds
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentVal = Math.floor(easeProgress * end);
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-images reveal">
          <div className="about-img-main"><img src={about1Img?.src || about1Img} alt="Pest Control Professional" /></div>
          <div className="about-img-sub"><img src={about2Img?.src || about2Img} alt="Pest Control Team" /></div>
          <div className="about-badge" ref={badgeRef}>
            <h2>{count}+</h2>
            <p>Years Of Experience</p>
          </div>
        </div>

        <div className="about-content reveal">
          <div className="section-title">
            <span className="section-sub-title">About Our Company</span>
            <h2>Protecting Your Home &amp; Business from Harmful Pests</h2>
          </div>
          <p>With 28 years of experience, we are an <strong>ISO certified and government recognised company</strong> providing safe, effective, and long-lasting pest control solutions. Our expert team ensures complete protection from termites, cockroaches, rodents, bed bugs, and other harmful pests using advanced and eco-friendly methods.</p>

          <div className="about-features">
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fa-solid fa-shield-halved"></i></div>
              <div>
                <h3>Trained &amp; Certified Experts</h3>
                <p>Our experienced professionals use modern techniques to eliminate pests safely and effectively.</p>
              </div>
            </div>
            <div className="about-feature">
              <div className="about-feature-icon"><i className="fa-solid fa-leaf"></i></div>
              <div>
                <h3>Safe &amp; Customized Treatment</h3>
                <p>We offer tailored pest control solutions that are safe for your family, pets, and environment.</p>
              </div>
            </div>
          </div>
          <a href={CONTACT_URL} className="btn-green">Contact Us</a>
        </div>
      </div>
    </section>
  );
}
