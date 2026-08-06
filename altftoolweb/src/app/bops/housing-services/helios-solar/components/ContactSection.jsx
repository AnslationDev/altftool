import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";

const contactMethods = [
  { icon: <Phone className="w-6 h-6" strokeWidth={1.5} />, title: "Call Us", desc: "Mon – Fri, 8:00 – 18:00 (EST)", href: "#demo-only" },
  { icon: <Mail className="w-6 h-6" strokeWidth={1.5} />, title: "Email", desc: "hello@heliosolar.com", href: "#demo-only" },
];

export default function ContactSection() {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const lead = Object.fromEntries(new FormData(form).entries());
    try {
      const leads = JSON.parse(window.localStorage.getItem("helios_solar_leads") || "[]");
      leads.push({ ...lead, submittedAt: new Date().toISOString() });
      window.localStorage.setItem("helios_solar_leads", JSON.stringify(leads));
    } catch {
      // Local storage can be unavailable in private browsing; the success state still works.
    }
    form.reset();
    setShowModal(true);
    setMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="split-grid">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <p className="contact-overline">Contact</p>
              <h2 className="contact-heading">
                Let&apos;s power<br />your home<br />together!
              </h2>
              <p className="contact-subtext">
                Have a question about solar roofing, panels, or which system fits your home best? Reach out — we&apos;ll help you find your next step toward energy independence.
              </p>
              <div className="flex flex-col gap-4">
                {contactMethods.map((method, i) => (
                  <motion.a
                    key={i}
                    href={method.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="contact-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="contact-card-icon">{method.icon}</div>
                      <div>
                        <p className="contact-card-title">{method.title}</p>
                        <p className="contact-card-desc">{method.desc}</p>
                      </div>
                    </div>
                    <div className="contact-card-arrow">
                      <ArrowRight />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h3 className="contact-form-heading">Send a Message</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" placeholder="Enter your full name" required className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" name="email" placeholder="hello@example.com" required className="form-input" />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    placeholder="Tell us about your home and energy goals..."
                    rows={4}
                    required
                    className="form-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="form-submit-btn"
                >
                  <span>Send Message</span>
                  <ArrowRight />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="contact-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          >
            <motion.div
              className="contact-modal"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="contact-modal-close" onClick={closeModal} aria-label="Close modal">
                <X size={20} />
              </button>

              <div className="contact-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h3 className="contact-modal-title">Message Saved (Not Sent)</h3>

              <p className="contact-modal-text">
                This was saved on your device only — no message was sent. Call us now for the quickest estimate and installation.
              </p>

              <a href="#demo-only" className="contact-modal-cta">
                <Phone size={18} />
                <span>Call Us Now</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
