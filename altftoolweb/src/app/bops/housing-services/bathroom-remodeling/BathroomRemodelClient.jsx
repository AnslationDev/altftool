"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Bath, Check, Droplets, FileText, Home, ImageIcon, Lightbulb, MessageSquare, Palette, RefreshCw, ShieldCheck, Sparkles, Star, Users, Wrench } from "lucide-react";

// No phone line is live for this page, so every contact CTA points at the
// site's real contact route.
const contactUrl = "/policypages/contact";
const contactLabel = "Contact us";
const formSrc = "https://api.leadconnectorhq.com/widget/form/YZr1FGoPxQjSdeBdbOjL";
const bathroomGallery = [
  "https://images.unsplash.com/photo-1756079664354-34944e001f6d?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1754522711595-84428937b07a?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1641870538417-c83e621d1425?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1717497043540-d45bf85e5d38?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1754574741164-a41418029cfb?auto=format&fit=crop&w=1200&q=82",
];

const heroChecks = [
  "Bathroom remodeling in Austin and Dallas",
  "Master bathrooms, guest bathrooms & powder rooms",
  "3D design before construction begins",
  "Tile, vanities, fixtures, showers, flooring & lighting",
  "Licensed, bonded, and insured remodeling team",
];

const trustRatings = [
  {
    brand: "Google",
    label: "Google Rating",
    tone: "google",
  },
  {
    brand: "Angi",
    label: "Angi Rating",
    tone: "angi",
  },
  {
    brand: "HomeAdvisor",
    label: "HomeAdvisor",
    tone: "homeadvisor",
  },
  {
    brand: "Houzz",
    label: "Houzz Rating",
    tone: "houzz",
  },
  {
    brand: "Thumbtack",
    label: "Thumbtack",
    tone: "thumbtack",
  },
];

const painPoints = [
  {
    icon: MessageSquare,
    title: '"The contractor went silent mid-project."',
    text: "We assign a dedicated project manager to every job. You get daily updates and direct contact — 7 days a week.",
  },
  {
    icon: FileText,
    title: '"The final bill was way higher than the quote."',
    text: "We itemize every line — materials, labor, and timeline — before a single nail is touched. The number we quote is the number you pay.",
  },
  {
    icon: ImageIcon,
    title: '"It looked nothing like what I was sold."',
    text: "Our AI 3D design tool shows you a photorealistic render of your finished bathroom before any work begins. You approve it first.",
  },
];

const whyItems = [
  {
    icon: Sparkles,
    title: "3D design helps you preview the bathroom",
  },
  {
    icon: Palette,
    title: "Showroom support for tile, fixtures, and finishes",
  },
  {
    icon: Droplets,
    title: "Proper planning for showers and wet areas",
  },
  {
    icon: Users,
    title: "One team coordinates the full project",
  },
  {
    icon: ShieldCheck,
    title: "Licensed, bonded, and insured contractors",
  },
  {
    icon: BadgeCheck,
    title: "Warranty coverage available",
  },
];

const services = [
  {
    icon: Bath,
    title: "Full bathroom remodeling",
  },
  {
    icon: Sparkles,
    title: "Master bathroom upgrades",
  },
  {
    icon: Home,
    title: "Guest bathroom remodels",
  },
  {
    icon: RefreshCw,
    title: "Tub-to-shower conversions",
  },
  {
    icon: Palette,
    title: "Custom tile showers",
  },
  {
    icon: Lightbulb,
    title: "Vanities, fixtures, flooring, and lighting",
  },
  {
    icon: Wrench,
    title: "Accessible bathroom updates",
  },
];

const steps = [
  {
    number: "01",
    title: "Consultation",
    text: "We look at your current bathroom and talk through what you want to improve.",
  },
  {
    number: "02",
    title: "Design and Material Selection",
    text: "You choose tile, fixtures, vanity options, flooring, lighting, and finishes with support from our team.",
  },
  {
    number: "03",
    title: "Construction and Installation",
    text: "We handle the remodeling work, including demo, prep, installation, and finishing details.",
  },
  {
    number: "04",
    title: "Final Walkthrough",
    text: "We review the finished bathroom with you and make sure everything is ready to use.",
  },
];

const galleryImages = [
  {
    src: bathroomGallery[0],
    alt: "Luxury bathroom remodel Austin TX",
    width: 900,
    height: 1349,
  },
  {
    src: bathroomGallery[1],
    alt: "Clean white bathroom renovation Austin",
    width: 800,
    height: 533,
  },
  {
    src: bathroomGallery[2],
    alt: "Elegant master bath Austin remodeling contractor",
    width: 800,
    height: 533,
  },
  {
    src: bathroomGallery[3],
    alt: "Modern bathroom design build Austin",
    width: 800,
    height: 1200,
  },
  {
    src: bathroomGallery[4],
    alt: "Luxury marble and gold bathroom Austin TX",
    width: 900,
    height: 613,
  },
  {
    src: bathroomGallery[5],
    alt: "Luxury marble and gold bathroom Austin TX",
    width: 1696,
    height: 2560,
  },
];

const testimonials = [
  {
    source: "Google ★",
    text: "Our master bathroom looks like something out of a luxury hotel magazine. The communication from TDB was unlike any contractor experience we've had. Daily updates, always on time, and the 3D design preview was exact — what we approved is what we got. Worth every single penny.",
    name: "Tanya & Marcus W.",
    detail: "Master Bath Remodel · Tarrytown, Austin TX",
    avatar: "T",
  },
  {
    source: "Google ★",
    text: "We converted our tub into a large walk-in shower and TDB made it completely painless. They showed up every day, finished in 3 weeks, and came in exactly on budget. The tile work is flawless. I've already recommended them to two friends who are now also remodeling with TDB.",
    name: "Amanda F.",
    detail: "Tub-to-Shower Conversion · South Austin, TX",
    avatar: "A",
  },
  {
    source: "Google ★",
    text: "I was burned by a contractor a few years ago so I was very cautious this time. From the very first call TDB was different — professional, transparent, no pressure. The itemized quote was exactly right. The final bathroom is incredible and I finally have the bathroom I always wanted. 10/10.",
    name: "Robert H.",
    detail: "Full Bathroom Renovation · Round Rock, TX",
    avatar: "R",
  },
];

const comparisonRows = [
  ["Dedicated project manager, 7 days/week", "yes", "no"],
  ["AI 3D design preview before build starts", "yes", "no"],
  ["Fully itemized, fixed-price quote", "yes", "sometimes"],
  ["Licensed & insured in Texas", "yes", "maybe"],
  ["Background-checked crew in your home", "yes", "no"],
  ["Full design + build under one company", "yes", "no"],
  ["Daily progress updates during build", "yes", "no"],
  ["In-house plumbers & electricians", "yes", "varies"],
];

const faqItems = [
  {
    question: "How much does a bathroom remodel cost in Austin, TX?",
    answer:
      "Our Austin bathroom remodels start at $40,000 for a full renovation. Master bathrooms typically range $40K–$80K depending on size, materials, and custom features. We provide a fully itemized quote after your free in-home consultation — no ballpark guesses, no vague estimates.",
  },
  {
    question: "How long does a bathroom remodel take?",
    answer:
      "A full bathroom remodel typically takes 3–6 weeks. Targeted upgrades (tub-to-shower, vanity replacement) can be done in 2–3 weeks. We give you a specific schedule before we start and hold to it — with daily progress updates throughout the build.",
  },
  {
    question: "Do you handle both design and construction?",
    answer:
      "Yes — we're a full design-build firm. Our in-house team handles everything: AI 3D design, material selection, permitting, demo, plumbing, electrical, tile, and finish work. You work with one company, not a disconnected chain of subs and designers.",
  },
  {
    question: "Can you convert my bathtub into a walk-in shower?",
    answer:
      "Absolutely. Tub-to-shower conversions are one of our most popular services. We handle all plumbing reconfiguration, waterproofing, custom tile work, and frameless glass installation. The result is a spacious, completely custom walk-in shower.",
  },
  {
    question: "Are you licensed and insured in Texas?",
    answer:
      "Yes. Together Design & Build is fully licensed and insured in Texas. We carry general liability and workers' compensation coverage. Proof of insurance is available before any work begins.",
  },
  {
    question: "What areas near Austin do you serve?",
    answer:
      "We serve all of Austin and the surrounding areas: Cedar Park, Round Rock, Georgetown, Pflugerville, Leander, Westlake Hills, Dripping Springs, Buda, Kyle, Lakeway, and more. Contact us to confirm your specific location.",
  },
];

const footerLinks = {
  services: [
    ["Full bathroom remodeling", "#services"],
    ["Tub-to-shower conversions", "#services"],
    ["Custom tile showers", "#services"],
    ["Accessible updates", "#services"],
  ],
  company: [
    ["About the process", "#process"],
    ["Project gallery", "#gallery"],
    ["Client reviews", "#reviews"],
    ["FAQ", "#faq"],
  ],
};

function LeadFormFrame({ title }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div style={{ position: "relative", minHeight: "350px", width: "100%" }}>
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: "#ffffff",
            zIndex: 2,
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              padding: "8px 0",
            }}
          >
            <div
              className="remodel-skeleton-pulse"
              style={{
                height: "44px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                width: "100%",
              }}
            />
            <div
              className="remodel-skeleton-pulse"
              style={{
                height: "44px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                width: "100%",
              }}
            />
            <div
              className="remodel-skeleton-pulse"
              style={{
                height: "44px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                width: "100%",
              }}
            />
            <div
              className="remodel-skeleton-pulse"
              style={{
                height: "44px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                width: "100%",
              }}
            />
            <div
              className="remodel-skeleton-pulse"
              style={{
                height: "48px",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                width: "100%",
                marginTop: "8px",
              }}
            />
          </div>
        </div>
      )}
      <iframe
        src={formSrc}
        title={title}
        className="bathroom-remodel-formFrame"
        loading="lazy"
        scrolling="no"
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
}

function ComparisonCell({ value }) {
  if (value === "yes") {
    return (
      <span className="bathroom-remodel-tableValue bathroom-remodel-tableValueYes">✓</span>
    );
  }

  if (value === "no") {
    return <span className="bathroom-remodel-tableValue bathroom-remodel-tableValueNo">✗</span>;
  }

  return <span className="bathroom-remodel-tableValue bathroom-remodel-tableValueMaybe">{value}</span>;
}

export default function BathroomRemodelClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <main className="bathroom-remodel" id="top">
      <header className="bathroom-remodel-header">
        <a className="bathroom-remodel-logoLink" href="#top" aria-label="Together Design & Build home">
          <span className="bathroom-remodel-logoImage" aria-hidden="true">
            <Bath />
          </span>
          <span className="bathroom-remodel-logoText">
            <span>TOGETHER</span>
            <span>DESIGN & BUILD</span>
          </span>
        </a>

        <a className="bathroom-remodel-headerCall" href={contactUrl}>
          <MessageSquare size={16} aria-hidden="true" />
          <span>{contactLabel}</span>
        </a>
      </header>

      <div className="bathroom-remodel-urgency">
        <span className="bathroom-remodel-urgencyText">Limited slots available this month</span>
        <a className="bathroom-remodel-urgencyLink" href="#final-cta">
          <span>Book your free consultation before they fill up</span>
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>

      <section className="bathroom-remodel-hero bathroom-remodel-band" aria-labelledby="bathroom-remodel-hero-title">
        <div className="bathroom-remodel-shell bathroom-remodel-heroGrid">
          <div className="bathroom-remodel-heroContent">
            <div className="bathroom-remodel-eyebrow">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              <span>Austin&apos;s Top-Rated Bathroom Contractor</span>
            </div>

            <h1 className="bathroom-remodel-heroTitle" id="bathroom-remodel-hero-title">
              Bathroom Remodeling
              <br />
              That Feels Clean, Comfortable,
              <br />
              and Built Right
            </h1>

            <p className="bathroom-remodel-heroLead">
              Built for Homeowners Who Want a Better Bathroom Without a Messy Process.
            </p>

            <div className="bathroom-remodel-checkGrid">
              {heroChecks.map((item) => (
                <div className="bathroom-remodel-checkItem" key={item}>
                  <span className="bathroom-remodel-checkIcon" aria-hidden="true">
                    <Check size={12} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="bathroom-remodel-heroActions">
              <a className="bathroom-remodel-primaryButton" href="#final-cta">
                <span>Get My Free Quote</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>

              <a className="bathroom-remodel-secondaryButton" href={contactUrl}>
                <MessageSquare size={16} aria-hidden="true" />
                <span>{contactLabel}</span>
              </a>
            </div>
          </div>

          <aside className="bathroom-remodel-formCard">
            <div className="bathroom-remodel-formBadge">Free — No Obligation</div>
            <h2 className="bathroom-remodel-formTitle">Book Free Consultation</h2>
            <p className="bathroom-remodel-formCopy">
              Speak with an Austin bathroom remodeling expert today.
            </p>
            <LeadFormFrame title="Bathroom remodeling consultation form" />
          </aside>
        </div>
      </section>

      <section className="bathroom-remodel-trust bathroom-remodel-band" aria-label="Trust highlights">
        <div className="bathroom-remodel-shell bathroom-remodel-trustInner">
          {trustRatings.map((item, index) => (
            <div className="bathroom-remodel-trustCluster" key={item.label}>
              <div className="bathroom-remodel-trustItem">
                <div className={`bathroom-remodel-trustBrand bathroom-remodel-trustBrand--${item.tone}`}>
                  {item.brand}
                </div>
                <div>
                  <div className="bathroom-remodel-trustValue">
                    5<span>★</span>
                  </div>
                  <div className="bathroom-remodel-trustLabel">{item.label}</div>
                </div>
              </div>
              {index < trustRatings.length - 1 ? (
                <div className="bathroom-remodel-trustDivider" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="bathroom-remodel-pain bathroom-remodel-band" aria-labelledby="bathroom-remodel-pain-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">Sound Familiar?</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-pain-title">
            What Austin Homeowners Are Tired of Dealing With
          </h2>
          <p className="bathroom-remodel-sectionLead">
            These are the complaints we hear every day. This is exactly what we built TDB to solve.
          </p>

          <div className="bathroom-remodel-cardGrid bathroom-remodel-cardGridPain">
            {painPoints.map((item) => {
              const Icon = item.icon;
              return (
                <article className="bathroom-remodel-infoCard" key={item.title}>
                  <span className="bathroom-remodel-infoIcon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <div>
                    <h3 className="bathroom-remodel-cardTitle">{item.title}</h3>
                    <p className="bathroom-remodel-cardText">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-why bathroom-remodel-band" aria-labelledby="bathroom-remodel-why-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow">Why Together Design & Build</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-why-title">
            Turn Your Bathroom Into a Space You Actually Enjoy
          </h2>
          <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadWide">
            Your bathroom should feel clean, comfortable, and easy to use. If it feels outdated,
            cramped, dark, or worn out, a remodel can make a real difference in your daily routine.
            Together Design & Build helps homeowners remodel bathrooms with a clear plan, better
            materials, and careful installation. From the layout to the tile, fixtures, lighting,
            and final details, our team helps bring the whole project together.
          </p>

          <div className="bathroom-remodel-whyGrid">
            <div className="bathroom-remodel-whyImageWrap">
              <Image
                src="https://images.unsplash.com/photo-1754522711595-84428937b07a?auto=format&fit=crop&w=1400&q=82"
                alt="Custom Austin bathroom remodel"
                className="bathroom-remodel-whyImage"
                width={900}
                height={600}
                sizes="(max-width: 980px) 100vw, 48vw"
              />
              <div className="bathroom-remodel-whyBadge">
                <strong>300+</strong>
                <span>Happy Austin Homeowners</span>
              </div>
            </div>

            <div className="bathroom-remodel-whyList">
              {whyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="bathroom-remodel-whyItem" key={item.title}>
                    <span className="bathroom-remodel-whyIcon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h3>{item.title}</h3>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-services bathroom-remodel-band" id="services" aria-labelledby="bathroom-remodel-services-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">What We Offer</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-services-title">
            What We Can Help With
          </h2>
          <p className="bathroom-remodel-sectionLead">
            Bathroom remodeling has to be done right. A poor layout, bad waterproofing, or rushed
            tile work can lead to problems later. Our team focuses on planning, quality, and clear
            communication from start to finish.
          </p>

          <div className="bathroom-remodel-cardGrid bathroom-remodel-cardGridServices">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <article className="bathroom-remodel-serviceCard" key={item.title}>
                  <span className="bathroom-remodel-serviceIcon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <h3 className="bathroom-remodel-cardTitle">{item.title}</h3>
                  <a className="bathroom-remodel-inlineLink" href="#final-cta">
                    <span>Get a Quote</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-process bathroom-remodel-band" id="process" aria-labelledby="bathroom-remodel-process-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowOnDark">How It Works</div>
          <h2 className="bathroom-remodel-sectionTitle bathroom-remodel-sectionTitleOnDark" id="bathroom-remodel-process-title">
            Our Bathroom Remodeling Process
          </h2>
          <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadOnDark">
            A proven process designed to keep you in control, informed, and stress-free — from
            first call to final walkthrough.
          </p>

          <div className="bathroom-remodel-stepGrid">
            {steps.map((step) => (
              <article className="bathroom-remodel-stepCard" key={step.number}>
                <div className="bathroom-remodel-stepNumber">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-gallery bathroom-remodel-band" id="gallery" aria-labelledby="bathroom-remodel-gallery-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow">Our Portfolio</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-gallery-title">
            Austin Bathrooms We&apos;ve Built
          </h2>
          <p className="bathroom-remodel-sectionLead">
            Every bathroom below was designed and built by our Austin team. No stock photos — real
            projects, real homeowners.
          </p>

          <div className="bathroom-remodel-galleryGrid">
            {galleryImages.map((image) => (
              <div className="bathroom-remodel-galleryItem" key={image.src}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                  loading="eager"
                />
              </div>
            ))}
          </div>

          <div className="bathroom-remodel-centerAction">
            <a className="bathroom-remodel-primaryButton" href="#final-cta">
              <span>Get a Free Quote on Your Bathroom</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-testimonials bathroom-remodel-band" id="reviews" aria-labelledby="bathroom-remodel-reviews-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">Real Client Reviews</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-reviews-title">
            Austin Homeowners Love
            <br />
            Their New Bathrooms
          </h2>
          <p className="bathroom-remodel-sectionLead">
            Real names, real projects, real results from Austin families who trusted Together
            Design & Build.
          </p>

          <div className="bathroom-remodel-cardGrid bathroom-remodel-cardGridTestimonials">
            {testimonials.map((item) => (
              <article className="bathroom-remodel-testimonialCard" key={item.name}>
                <div className="bathroom-remodel-testimonialSource">{item.source}</div>
                <div className="bathroom-remodel-stars" aria-label="5 star review">
                  {"★★★★★"}
                </div>
                <p className="bathroom-remodel-testimonialText">{item.text}</p>
                <div className="bathroom-remodel-testimonialAuthor">
                  <span className="bathroom-remodel-avatar" aria-hidden="true">
                    {item.avatar}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-compare bathroom-remodel-band" aria-labelledby="bathroom-remodel-compare-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow">How We Compare</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-compare-title">
            Together Design & Build vs.
            <br />
            The Typical Austin Contractor
          </h2>

          <div className="bathroom-remodel-tableWrap">
            <table className="bathroom-remodel-table">
              <thead>
                <tr>
                  <th>What You Should Expect</th>
                  <th>Together Design & Build</th>
                  <th>Typical Contractor</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>
                      <ComparisonCell value={row[1]} />
                    </td>
                    <td>
                      <ComparisonCell value={row[2]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bathroom-remodel-faq bathroom-remodel-band" id="faq" aria-labelledby="bathroom-remodel-faq-title">
        <div className="bathroom-remodel-shell bathroom-remodel-faqGrid">
          <div>
            <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">Common Questions</div>
            <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-faq-title">
              Bathroom Remodeling FAQ
            </h2>

            <div className="bathroom-remodel-faqList">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    className={`bathroom-remodel-faqItem${isOpen ? " is-open" : ""}`}
                    key={item.question}
                  >
                    <button
                      type="button"
                      className="bathroom-remodel-faqButton"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    >
                      <span>{item.question}</span>
                      <span className="bathroom-remodel-faqIcon" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div className="bathroom-remodel-faqAnswer">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bathroom-remodel-faqSidebar">
            <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowOnDark">Still Have Questions?</div>
            <h3>Talk to an Austin Bathroom Expert</h3>
            <p>
              No sales script. No pressure. Just a real conversation about your bathroom project
              with a licensed contractor.
            </p>

            <a className="bathroom-remodel-sidebarCall" href={contactUrl}>
              <span className="bathroom-remodel-sidebarCallIcon" aria-hidden="true">
                <MessageSquare size={18} />
              </span>
              <span>
                <small>Tell us about your project</small>
                <strong>{contactLabel}</strong>
              </span>
            </a>

            <a className="bathroom-remodel-primaryButton bathroom-remodel-primaryButtonFull" href="#final-cta">
              <span>Get Free Quote</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>

            <div className="bathroom-remodel-hours">Mon–Sun · 8:30am–5:30pm</div>
          </aside>
        </div>
      </section>

      <section className="bathroom-remodel-final bathroom-remodel-band" id="final-cta" aria-labelledby="bathroom-remodel-final-title">
        <div className="bathroom-remodel-shell bathroom-remodel-finalGrid">
          <div className="bathroom-remodel-finalContent">
            <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowOnDark">Free In-Home Consultation</div>
            <h2 className="bathroom-remodel-sectionTitle bathroom-remodel-sectionTitleOnDark" id="bathroom-remodel-final-title">
              Get Your Bathroom
              <br />
              Remodeling Consultation
            </h2>
            <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadOnDark">
              Ready to upgrade your bathroom with a cleaner look and better function? Call now or
              fill out the form to get started with Together Design & Build.
            </p>

            <ul className="bathroom-remodel-featureList">
              <li>3D design available</li>
              <li>Financing options</li>
              <li>Austin and Dallas service areas</li>
              <li>Licensed, bonded, and insured team</li>
            </ul>

            <a className="bathroom-remodel-finalCall" href={contactUrl}>
              <span className="bathroom-remodel-finalCallIcon" aria-hidden="true">
                <MessageSquare size={18} />
              </span>
              <span>
                <small>Tell us about your project</small>
                <strong>{contactLabel}</strong>
              </span>
            </a>
          </div>

          <aside className="bathroom-remodel-formCard bathroom-remodel-formCardFinal">
            <h3 className="bathroom-remodel-formTitle">Start Your Free Quote</h3>
            <LeadFormFrame title="Bathroom remodeling final quote form" />
          </aside>
        </div>
      </section>

      <footer className="bathroom-remodel-siteFooter">
        <div className="bathroom-remodel-shell bathroom-remodel-footerGrid">
          <div className="bathroom-remodel-footerBrand">
            <div className="bathroom-remodel-logoLockup">
              <span className="bathroom-remodel-footerLogo" aria-hidden="true">
                <Bath />
              </span>
              <span className="bathroom-remodel-logoText bathroom-remodel-logoTextFooter">
                <span>TOGETHER</span>
                <span>DESIGN & BUILD</span>
              </span>
            </div>
            <p>
              Bathroom remodeling for Austin and Dallas homeowners who want better planning, better
              communication, and a better finished space.
            </p>
          </div>

          <div>
            <h3>Services</h3>
            <ul>
              {footerLinks.services.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Explore</h3>
            <ul>
              {footerLinks.company.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul className="bathroom-remodel-contactList">
              <li>
                <a href={contactUrl}>{contactLabel}</a>
              </li>
              <li>Austin and Dallas service areas</li>
              <li>Licensed, bonded, and insured</li>
            </ul>
          </div>
        </div>
      </footer>

      <div className="bathroom-remodel-mobileBar">
        <a className="bathroom-remodel-mobileCall" href={contactUrl}>
          <MessageSquare size={16} aria-hidden="true" />
          <span>Contact us</span>
        </a>
        <a className="bathroom-remodel-mobileQuote" href="#final-cta">
          <span>Free Quote</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
