import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Droplets, Thermometer, Wrench, Bath, Waves,
  Flame, Filter, ShieldCheck, Wind, Settings,
  ChefHat, CheckCircle, HardHat, Eye, GitBranch,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import '../styles/ServicesGrid.css';

const serviceImage = (query, lock) => `https://loremflickr.com/900/620/${query}?lock=${lock}`;
const serviceImageFallback = '/assets/og-default.png';

function handleServiceImageError(event) {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = serviceImageFallback;
}

const services = [
  { icon: Zap, title: 'Emergency Repair', desc: 'Burst pipes, floods, and active leaks handled fast with clean damage control.', detail: 'Immediate shutoff, temporary control, water removal guidance, and permanent repair options.', badge: '24/7', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRma9mP8H0y7wi5ixV6wzzHuvzaEuuw6wKsYQ&s' },
  { icon: Droplets, title: 'Drain Cleaning', desc: 'Hydro-jetting and snaking clear slow drains, grease buildup, and repeat clogs.', detail: 'We remove grease, hair, sludge, and root intrusion without harsh chemicals.', image: 'https://lh4.googleusercontent.com/proxy/-CvQd_RAr9_A9QRcG1OF3I_OAmNE-aZffMyhJHIio_p7Mx0IIZJR-nisJCEl73f1ZzeGp6NVKkb0__bZm7F40JVqZBg1if9BJ8Uo4z_A4RqFAZ9-1JXB1WdsDo85B8jGTk24JvEcALU4-euZDYgjKf6KKj3ni9x5pIlkRXwlQ9JqF3fJMt2wu8glj8Jcd_8YkcX93YOGgaeG2V7N1BOX8Q' },
  { icon: Thermometer, title: 'Water Heater', desc: 'Same-day diagnosis, repair, and replacement for tank or tankless systems.', detail: 'Safety checks, capacity advice, warranty options, and full hot-water testing.', image: serviceImage('water-heater,plumbing', 1103) },
  { icon: Wrench, title: 'Pipe Repair', desc: 'From pinhole leaks to full repipes, we repair water lines with minimal disruption.', detail: 'Copper, PEX, PVC, and drain piping repaired with clean wall access.', image: 'https://content.jdmagicbox.com/v2/comp/chittoor/w3/9999p8572.8572.220516163527.l6w3/catalogue/kumar-electrical-and-plumbing-service-kanipakam-chittoor-plumbers-w8un849u5h-250.jpg' },
  { icon: Bath, title: 'Bathroom Plumbing', desc: 'Toilets, tubs, showers, valves, and bathroom rough-ins installed correctly.', detail: 'Fixture swaps, drain repairs, valve upgrades, and leak-free finish work.', image: 'https://www.uniqueheatingandcooling.com/wp-content/uploads/2025/04/bathroom-plumbing.jpg' },
  { icon: Settings, title: 'Faucet & Fixtures', desc: 'Repair or replace faucets, showerheads, valves, cartridges, and shutoffs.', detail: 'Stops drips, pressure problems, loose handles, and worn cartridges.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXSNgMx5uZ8jhGx4TeaION1Zy2xLpS8vSuxg&s'},
  { icon: GitBranch, title: 'Sewer Line', desc: 'Camera inspection, cleaning, and repair for main sewer line problems.', detail: 'Finds bellies, cracks, roots, offsets, and blockages before digging starts.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzb70TO_53PRo9hQ_uh9i9wPrBO67U-k_99Q&s' },
  { icon: Flame, title: 'Gas Line', desc: 'Licensed gas line installation, leak checks, and appliance hookups.', detail: 'Code-compliant pressure tests, shutoff valves, and safe connections.', badge: 'Licensed', image: 'https://allkindplumbing.com.au/wp-content/uploads/2025/06/How-to-Detect-Gas-Leaks-in-Your-Home-4-1024x682.jpg'},
  { icon: Filter, title: 'Water Filtration', desc: 'Whole-house filters, softeners, and RO systems for cleaner daily water.', detail: 'Protects fixtures, appliances, drinking water, and bathing comfort.', image: 'https://thumbs.dreamstime.com/b/plumber-work-installing-water-filter-system-house-water-system-maintenance-plumber-installing-replacing-filter-158814216.jpg' },
  { icon: Wind, title: 'Hydro Jetting', desc: 'High-pressure cleaning restores pipe flow by washing the full drain wall.', detail: 'Ideal for grease, roots, sludge, scale, and stubborn commercial clogs.', image: 'https://limric.com/wp-content/uploads/2024/08/hydro-jetting-services.webp' },
  { icon: Eye, title: 'Camera Inspection', desc: 'See exactly what is inside your pipes before repairs are recommended.', detail: 'Video diagnosis helps avoid guesswork and unnecessary repairs.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd1R0SX_s_vzA5F6bsYCloQTqieqBejpK4Pg&s' },
  { icon: Waves, title: 'Sump Pump', desc: 'Install, service, or replace sump pumps before heavy rain becomes a problem.', detail: 'Battery backups, float switches, discharge lines, and pit cleaning included.', image: serviceImage('basement,pump', 1112) },
  { icon: ShieldCheck, title: 'Backflow Prevention', desc: 'Certified testing and repair for backflow prevention devices.', detail: 'Protects drinking water with annual testing, repair, and documentation.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6y-8-3cDZ7q76DwFnfUzX6j-98nK7fUMcZQ&s' },
  { icon: ChefHat, title: 'Kitchen Plumbing', desc: 'Kitchen sinks, disposals, dishwasher lines, and shutoff valves installed neatly.', detail: 'Leak-free sink setups, supply lines, drains, disposal swaps, and shutoffs.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiKFR8KFND7fqc9mqfnJU4U2PZ72bg5miSsw&s' },
  { icon: CheckCircle, title: 'Preventive Maintenance', desc: 'Annual inspections help catch hidden leaks before they become emergencies.', detail: 'Catch corrosion, slow drains, weak valves, and hidden leaks early.', image: 'https://reedplumbingsolutions.com.au/wp-content/uploads/2021/03/Best-Preventative-Maintenance-Plumbing-Melbourne.jpg' },
  { icon: HardHat, title: 'Remodeling', desc: 'Rough-in and finish plumbing for bathrooms, kitchens, and whole-home upgrades.', detail: 'Layout planning, fixture placement, inspections, and clean final trim.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSptcalXdnNEMijyTn_BmGY7Njm55psWFHyg&s' },
];

function scrollToForm() {
  const el = document.getElementById('book-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function getCardOffset(index, activeIndex) {
  const total = services.length;
  let offset = index - activeIndex;

  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  return Math.max(-3, Math.min(3, offset));
}

export default function ServicesGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef(null);
  const wheelLocked = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % services.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setActiveIndex((index) => (index - 1 + services.length) % services.length);
  };

  const goToNext = () => {
    setActiveIndex((index) => (index + 1) % services.length);
  };

  const handleWheel = (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (Math.abs(delta) < 8 || wheelLocked.current) return;

    wheelLocked.current = true;
    if (delta > 0) goToNext();
    else goToPrev();

    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 520);
  };

  const handlePointerDown = (event) => {
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (dragStartX.current === null) return;

    const diff = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(diff) < 45) return;
    if (diff < 0) goToNext();
    else goToPrev();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') goToPrev();
    if (event.key === 'ArrowRight') goToNext();
  };

  return (
    <section className="fp-services">
      <div className="fp-services__backdrop" />

      <div className="fp-services__header">
        <motion.span className="fp-services__label"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>
          Expert Solutions
        </motion.span>
        <motion.h2 className="fp-services__h2"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.07, ease: [0.16,1,0.3,1] }}>
          Our Services
        </motion.h2>
        <motion.p className="fp-services__sub"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
          FlowPro provides emergency repair, drain cleaning, water heaters, pipe work, fixtures, sewer service, and whole-home plumbing support. Our licensed team handles each visit with clean workmanship, clear pricing, and practical solutions that protect your home.
        </motion.p>
      </div>

      <div className="fp-services__coverflow" aria-label="Plumbing service carousel">
        <button className="fp-services__arrow fp-services__arrow--prev" type="button" onClick={goToPrev} aria-label="Previous service">
          <ChevronLeft size={34} />
        </button>

        <div
          className="fp-services__stage"
          role="region"
          tabIndex={0}
          aria-label="Scroll, drag, or use arrow keys to browse services"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { dragStartX.current = null; }}
          onPointerLeave={() => { dragStartX.current = null; }}
          onKeyDown={handleKeyDown}
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const offset = getCardOffset(index, activeIndex);
            const isVisible = Math.abs(offset) <= 3;
            const isActive = offset === 0;

            return (
              <article
                key={service.title}
                className={`fp-services__card fp-services__card--offset-${offset}`}
                aria-hidden={!isActive}
                style={{ '--fp-card-offset': offset }}
              >
                {isVisible && (
                  <>
                    <div className="fp-services__image-wrap">
                      <img
                        src={service.image.src || service.image}
                        alt={service.title}
                        loading="lazy"
                        onError={handleServiceImageError}
                      />
                    </div>
                    <div className="fp-services__card-copy">
                      <div className="fp-services__card-top">
                        <div className="fp-services__icon-wrap">
                          <Icon size={18} className="fp-services__icon" />
                        </div>
                        {service.badge && <span className="fp-services__badge">{service.badge}</span>}
                      </div>
                      <h3 className="fp-services__card-title">{service.title}</h3>
                      <p className="fp-services__card-desc">{service.desc}</p>
                      <p className="fp-services__card-detail">{service.detail}</p>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>

        <button className="fp-services__arrow fp-services__arrow--next" type="button" onClick={goToNext} aria-label="Next service">
          <ChevronRight size={34} />
        </button>
      </div>

      <div className="fp-services__footer">
        <p className="fp-services__footer-note">Not sure what you need? We&apos;ll figure it out together.</p>
        <div className="fp-services__footer-btns">
          <button className="fp-services__btn-primary" onClick={scrollToForm}>Book a Plumber Now</button>
          <button className="fp-services__btn-secondary" onClick={scrollToForm}>Get Free Estimate</button>
        </div>
      </div>
    </section>
  );
}
