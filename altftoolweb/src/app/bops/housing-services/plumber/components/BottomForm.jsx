import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, ChevronDown,
  Phone, User, Wrench, Clock, MapPin, FileText, Star,
  Shield, Lock, Award,
} from 'lucide-react';
import '../styles/BottomForm.css';

const services = [
  'Emergency Repair','Drain Cleaning','Water Heater','Pipe Repair',
  'Bathroom Plumbing','Faucet & Fixtures','Sewer Line','Gas Line',
  'Water Filtration','Hydro Jetting','Camera Inspection','Other',
];
const slots = ['ASAP – Emergency','Today (morning)','Today (afternoon)','Tomorrow (morning)','Tomorrow (afternoon)','This weekend','Flexible – any time'];

function BookingForm() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', slot: '', address: '' });
  const [status, setStatus] = useState('idle');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    const lead = { ...form };
    setTimeout(() => {
      try {
        const leads = JSON.parse(window.localStorage.getItem('plumber_leads') || '[]');
        leads.push({ ...lead, formType: 'booking', submittedAt: new Date().toISOString() });
        window.localStorage.setItem('plumber_leads', JSON.stringify(leads));
      } catch {
        // Local storage can be unavailable in private browsing; the success state still works.
      }
      setStatus('success');
      setForm({ name: '', phone: '', service: '', slot: '', address: '' });
    }, 900);
  };

  if (status === 'success') {
    return (
      <div className="fp-bform__success">
        <div className="fp-bform__success-icon"><Check size={20} /></div>
        <p className="fp-bform__success-title">Booking saved on this device</p>
        <p className="fp-bform__success-text">No booking was actually made — call us now to lock in your time slot.</p>
        <button type="button" className="fp-bform__alt" onClick={() => setStatus('idle')}>Book another</button>
      </div>
    );
  }

  return (
    <form className="fp-bform__form" onSubmit={submit}>
      <div className="fp-bform__field">
        <User size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="name" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="fp-bform__field">
        <Phone size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="phone" placeholder="Phone number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />
      </div>
      <div className="fp-bform__field">
        <Wrench size={16} className="fp-bform__field-icon" />
        <select className="fp-bform__select" name="service" value={form.service} onChange={e => set('service', e.target.value)} required>
          <option value="">Select service</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={16} className="fp-bform__select-chevron" />
      </div>
      <div className="fp-bform__field">
        <Clock size={16} className="fp-bform__field-icon" />
        <select className="fp-bform__select" name="slot" value={form.slot} onChange={e => set('slot', e.target.value)} required>
          <option value="">Preferred time</option>
          {slots.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={16} className="fp-bform__select-chevron" />
      </div>
      <div className="fp-bform__field">
        <MapPin size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="address" placeholder="Address or zip code" value={form.address} onChange={e => set('address', e.target.value)} required />
      </div>
      <button type="submit" className="fp-bform__submit" disabled={status === 'submitting'}>
        <span>{status === 'submitting' ? 'Confirming…' : 'Confirm Booking'}</span><ArrowRight size={16} />
      </button>
      <p className="fp-bform__note">No credit card required · Free to book · Cancel anytime</p>
    </form>
  );
}

function EstimateForm() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', details: '', address: '' });
  const [status, setStatus] = useState('idle');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    const lead = { ...form };
    setTimeout(() => {
      try {
        const leads = JSON.parse(window.localStorage.getItem('plumber_leads') || '[]');
        leads.push({ ...lead, formType: 'estimate', submittedAt: new Date().toISOString() });
        window.localStorage.setItem('plumber_leads', JSON.stringify(leads));
      } catch {
        // Local storage can be unavailable in private browsing; the success state still works.
      }
      setStatus('success');
      setForm({ name: '', phone: '', service: '', details: '', address: '' });
    }, 900);
  };

  if (status === 'success') {
    return (
      <div className="fp-bform__success">
        <div className="fp-bform__success-icon"><Check size={20} /></div>
        <p className="fp-bform__success-title">Estimate request saved on this device</p>
        <p className="fp-bform__success-text">No request was actually sent — call us now for an upfront price.</p>
        <button type="button" className="fp-bform__alt" onClick={() => setStatus('idle')}>Request another</button>
      </div>
    );
  }

  return (
    <form className="fp-bform__form" onSubmit={submit}>
      <div className="fp-bform__field">
        <User size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="name" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>
      <div className="fp-bform__field">
        <Phone size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="phone" placeholder="Phone number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />
      </div>
      <div className="fp-bform__field">
        <Wrench size={16} className="fp-bform__field-icon" />
        <select className="fp-bform__select" name="service" value={form.service} onChange={e => set('service', e.target.value)} required>
          <option value="">Select service type</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={16} className="fp-bform__select-chevron" />
      </div>
      <div className="fp-bform__field">
        <MapPin size={16} className="fp-bform__field-icon" />
        <input className="fp-bform__input" name="address" placeholder="Address or zip code" value={form.address} onChange={e => set('address', e.target.value)} required />
      </div>
      <div className="fp-bform__field">
        <FileText size={16} className="fp-bform__field-icon fp-bform__field-icon--top" />
        <textarea className="fp-bform__textarea" name="details" style={{ paddingLeft: '2.5rem' }} placeholder="Describe the issue (optional)" rows={3} value={form.details} onChange={e => set('details', e.target.value)} />
      </div>
      <button type="submit" className="fp-bform__submit" disabled={status === 'submitting'}>
        <span>{status === 'submitting' ? 'Sending…' : 'Get Free Estimate'}</span><ArrowRight size={16} />
      </button>
      <div className="fp-bform__divider">
        <span className="fp-bform__divider-line" />
        <span className="fp-bform__divider-text">or</span>
        <span className="fp-bform__divider-line" />
      </div>
      <a href="tel:8005550100" className="fp-bform__alt">
        <Phone size={16} /> Call (800) 555-0100
      </a>
      <p className="fp-bform__note">No credit card required · 100% free · No obligation</p>
    </form>
  );
}

const COPY = {
  booking:  { h2: 'Book Your Plumber', desc: 'Pick a time. We\'ll confirm within 5 minutes and have someone at your door fast.' },
  estimate: { h2: 'Get a Free Estimate', desc: 'Tell us about the job. We\'ll give you an honest, upfront price — no pressure.' },
};

export default function BottomForm() {
  const [tab,     setTab]     = useState('booking');
  const [flipped, setFlipped] = useState(false);

  // expose global hook for CTAs
  useEffect(() => {
    window.switchBookingTab = (mode) => {
      if (mode === 'estimate') {
        setTab('estimate');
        setFlipped(true);
      } else {
        setTab('booking');
        setFlipped(false);
      }
    };
    return () => { delete window.switchBookingTab; };
  }, []);

  const switchTab = (t) => {
    if (t === tab) return;
    setTab(t);
    setFlipped(t === 'estimate');
  };

  const copy = COPY[tab];

  return (
    <section className="fp-bform" id="book-form">
      <div className="fp-bform__grid">

        {/* Left — copy */}
        <div className="fp-bform__left">
          <span className="fp-bform__label">Book a Plumber</span>
          <motion.h2 className="fp-bform__h2" key={`h-${tab}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>{copy.h2}</motion.h2>
          <motion.p className="fp-bform__desc" key={`d-${tab}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}>{copy.desc}</motion.p>

          <div className="fp-bform__checklist">
            {['Licensed & insured technicians', 'Upfront pricing — no surprises', '10-year workmanship warranty', 'Available 24/7 including holidays'].map((t, i) => (
              <div key={i} className="fp-bform__check">
                <div className="fp-bform__check-icon"><Check size={12} /></div>
                <span className="fp-bform__check-text">{t}</span>
              </div>
            ))}
          </div>

          <div className="fp-bform__stars">
            <div className="fp-bform__stars-row">
              {[...Array(5)].map((_,i) => <Star key={i} size={14} style={{ color: 'var(--fp-yellow-400)', fill: 'var(--fp-yellow-400)' }} />)}
            </div>
            <span className="fp-bform__stars-label">4.9 · 10,000+ customers</span>
          </div>
        </div>

        {/* Right — form */}
        <div className="fp-bform__right">
          <div className="fp-bform__tabs">
            <button className={`fp-bform__tab ${tab === 'booking' ? 'fp-bform__tab--active' : 'fp-bform__tab--inactive'}`} onClick={() => switchTab('booking')}>
              Book a Plumber
            </button>
            <button className={`fp-bform__tab ${tab === 'estimate' ? 'fp-bform__tab--active' : 'fp-bform__tab--inactive'}`} onClick={() => switchTab('estimate')}>
              Free Estimate
            </button>
          </div>

          <div className="fp-bform__flip-outer">
            <div className={`fp-bform__flip-inner${flipped ? ' fp-bform__flip-inner--flipped' : ''}`}>
              <div className="fp-bform__face-front">
                <BookingForm />
              </div>
              <div className="fp-bform__face-back">
                <EstimateForm />
              </div>
            </div>
          </div>

          <div className="fp-bform__trust">
            {[
              { icon: Shield, label: 'SSL Secured' },
              { icon: Lock,   label: 'Private & Safe' },
              { icon: Award,  label: '10-yr Warranty' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="fp-bform__trust-item">
                <Icon size={12} /> {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
