"use client";

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import '../styles/PayPerCallOverlay.css';

const CONTACT_URL = '/policypages/contact';

export default function PayPerCallOverlay() {
  const [phase, setPhase] = useState('idle');
  const phaseRef = useRef('idle');
  const timer = useRef(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const triggerOverlay = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      phaseRef.current = 'loading';
      setPhase('loading');
      timer.current = window.setTimeout(() => {
        phaseRef.current = 'popup';
        setPhase('popup');
      }, 3000);
    };

    const handleClick = (event) => {
      if (phaseRef.current !== 'idle') return;

      const target = event.target;
      const button = target instanceof Element
        ? target.closest('button, [role="button"], .fp-footer__cta-btn, .fp-feature__cta')
        : null;

      if (!button || button.closest('[data-pcall-ignore="true"]')) return;
      if (button.closest('.fp-bform__tab')) return;
      if (button.closest('.fp-nav, .fp-blog, .fp-blog-modal')) return;
      if (button.closest('.fp-faq') && !button.closest('.fp-faq__cta-btn')) return;
      if (button.closest('.fp-footer') && !button.closest('.fp-footer__cta-btn')) return;

      const buttonType = button.getAttribute('type') || 'submit';
      const form = buttonType === 'submit' ? button.closest('form') : null;

      if (form && !form.reportValidity()) return;

      triggerOverlay(event);
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const close = () => {
    if (timer.current) window.clearTimeout(timer.current);
    phaseRef.current = 'idle';
    setPhase('idle');
  };

  if (phase === 'idle') return null;

  return (
    <div className={`fp-pcall fp-pcall--${phase}`} data-pcall-ignore="true">
      {phase === 'loading' ? (
        <div className="fp-pcall-loading" aria-live="polite">
          <div className="fp-pcall-spinner" aria-label="Loading" />
          <p>Checking plumber availability near you...</p>
        </div>
      ) : (
        <div className="fp-pcall__card" role="dialog" aria-modal="true" aria-labelledby="fp-pcall-title">
          <button type="button" className="fp-pcall__close" onClick={close} aria-label="Close">
            <X size={20} />
          </button>

          <h2 id="fp-pcall-title">Sorry! No Plumbers Available Right Now.</h2>
          <p className="fp-pcall__sub">
            Let our support team help you find the next available plumber near your area.
          </p>

          <div className="fp-pcall__illustration" aria-hidden="true">
            <span className="fp-pcall__shape fp-pcall__shape--one" />
            <span className="fp-pcall__shape fp-pcall__shape--two" />
            <span className="fp-pcall__agent">
              <span className="fp-pcall__hair" />
              <span className="fp-pcall__face" />
              <span className="fp-pcall__ear fp-pcall__ear--left" />
              <span className="fp-pcall__ear fp-pcall__ear--right" />
              <span className="fp-pcall__mic" />
            </span>
            <span className="fp-pcall__screen" />
            <span className="fp-pcall__dots"><i /><i /><i /></span>
          </div>

          <h3>Send us your job</h3>
          <a href={CONTACT_URL} className="fp-pcall__phone">
            <MessageSquare size={33} />
            <span>Contact us</span>
          </a>
        </div>
      )}
    </div>
  );
}
