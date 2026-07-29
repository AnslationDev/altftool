import termiteImg from '../assets/services/termite.webp';
import generalImg from '../assets/services/general.webp';
import cockroachImg from '../assets/services/cockroach.webp';
import mosquitoImg from '../assets/services/mosquito.webp';
import antImg from '../assets/services/ant.webp';
import bedbugImg from '../assets/services/bedbug.webp';
import sectionBg from '../assets/services/section-bg-1 (2).webp';
import './Services.css';

const services = [
  { img: termiteImg, title: 'Termite Treatment', desc: 'Protect your property from termite damage with long-lasting treatment that safeguards walls, furniture, and structure completely.' },
  { img: generalImg, title: 'Pest Control Solution', desc: 'Our general pest control service protects your space from multiple pests and keeps your environment clean always.' },
  { img: cockroachImg, title: 'Cockroach Control', desc: 'We remove stubborn cockroaches from kitchens and bathrooms using safe treatments that keep your space hygienic.' },
  { img: mosquitoImg, title: 'Mosquito Control', desc: 'Protect your family from mosquitoes with treatments that reduce breeding and lower risk of harmful diseases.' },
  { img: antImg, title: 'Ant Control', desc: 'We target ant colonies at the source to completely stop infestations and protect your home long-term.' },
  { img: bedbugImg, title: 'Bed Bug Control', desc: 'Get rid of bed bugs completely with our deep treatment that ensures peaceful, bite-free sleep every night.' },
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="services-bg"><img src={sectionBg?.src || sectionBg} alt="" /></div>
      <div className="services-overlay"></div>
      <div className="container">
        <div className="services-header reveal">
          <div className="section-title">
            <span className="section-sub-title">Our Services</span>
            <h2>Complete Pest Control Solutions for Homes &amp; Businesses</h2>
          </div>
          <div className="services-desc">
            <p>We provide safe, effective, and long-lasting pest control services to protect your home and workplace from all types of pests.</p>
            <a href="tel:+919711177747" className="btn-green">Get Free Quote</a>
          </div>
        </div>

        <div className="services-grid">
          {services.map((s, index) => (
            <div className="service-card reveal" key={s.title} style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="service-card-img">
                <img src={s.img?.src || s.img} alt={s.title} />
              </div>
              <div className="service-card-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <a href="tel:+919711177747" className="btn-green">
                  <i className="fa-solid fa-shield-heart" style={{marginRight:'7px'}}></i> Book Service
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
