"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Bath,
  BadgeCheck,
  Check,
  Droplets,
  FileText,
  Home,
  ImageIcon,
  Lightbulb,
  MessageSquare,
  Palette,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

const phoneDisplay = "Demo only";
const phoneHref = "#demo-only";
const bathroomGallery = [
  "https://images.unsplash.com/photo-1756079664354-34944e001f6d?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1754522711595-84428937b07a?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1641870538417-c83e621d1425?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1717497043540-d45bf85e5d38?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1754574741164-a41418029cfb?auto=format&fit=crop&w=1200&q=82",
];

const heroChecks = [
  "Example service-area messaging",
  "Illustrative bathroom project categories",
  "Preview of a 3D-design workflow",
  "Sample materials and fixture checklist",
  "Placeholder credential area for a verified provider",
];

const painPoints = [
  {
    icon: MessageSquare,
    title: '"The contractor went silent mid-project."',
    text: "A service page could explain who owns project updates and how customers can reach a verified provider.",
  },
  {
    icon: FileText,
    title: '"The final bill was way higher than the quote."',
    text: "This demo shows where a provider could explain written estimates, change orders, and payment terms.",
  },
  {
    icon: ImageIcon,
    title: '"It looked nothing like what I was sold."',
    text: "This example highlights how a design preview could help homeowners discuss a proposed layout before work begins.",
  },
];

const whyItems = [
  {
    icon: Sparkles,
    title: "Example 3D-design preview messaging",
  },
  {
    icon: Palette,
    title: "Example material-selection guidance",
  },
  {
    icon: Droplets,
    title: "Example wet-area planning checklist",
  },
  {
    icon: Users,
    title: "Example project-coordination section",
  },
  {
    icon: ShieldCheck,
    title: "Placeholder for verified credentials",
  },
  {
    icon: BadgeCheck,
    title: "Placeholder for documented warranty terms",
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
    title: "Example Consultation",
    text: "A verified provider could review the space and document the homeowner's goals.",
  },
  {
    number: "02",
    title: "Example Design and Material Selection",
    text: "This step illustrates where tile, fixture, vanity, flooring, lighting, and finish choices could be recorded.",
  },
  {
    number: "03",
    title: "Example Construction Plan",
    text: "A real contractor would define demolition, preparation, installation, inspections, and finishing responsibilities here.",
  },
  {
    number: "04",
    title: "Example Final Walkthrough",
    text: "This step shows where completion checks and outstanding items could be documented.",
  },
];

const galleryImages = [
  {
    src: bathroomGallery[0],
    alt: "Bathroom design inspiration with neutral finishes",
    width: 900,
    height: 1349,
  },
  {
    src: bathroomGallery[1],
    alt: "White bathroom design inspiration",
    width: 800,
    height: 533,
  },
  {
    src: bathroomGallery[2],
    alt: "Bathroom layout and finish inspiration",
    width: 800,
    height: 533,
  },
  {
    src: bathroomGallery[3],
    alt: "Modern bathroom design inspiration",
    width: 800,
    height: 1200,
  },
  {
    src: bathroomGallery[4],
    alt: "Marble and gold bathroom design inspiration",
    width: 900,
    height: 613,
  },
  {
    src: bathroomGallery[5],
    alt: "Bathroom material and lighting inspiration",
    width: 1696,
    height: 2560,
  },
];

const faqItems = [
  {
    question: "How much does a bathroom remodel cost in Austin, TX?",
    answer:
      "This demo does not publish provider pricing. Real costs vary by scope, materials, permits, and location; compare written estimates from qualified local contractors before deciding.",
  },
  {
    question: "How long does a bathroom remodel take?",
    answer:
      "This demo does not promise a schedule. A qualified contractor should assess the space, permitting needs, material lead times, and project scope before providing a written timeline.",
  },
  {
    question: "Do you handle both design and construction?",
    answer:
      "The page illustrates a combined design-and-build workflow, but it is not an operating firm. Confirm each real provider's design, permitting, trade, and installation responsibilities in writing.",
  },
  {
    question: "Can you convert my bathtub into a walk-in shower?",
    answer:
      "The layout includes a tub-to-shower example. A qualified contractor must inspect plumbing, waterproofing, ventilation, access, and local code requirements before confirming feasibility.",
  },
  {
    question: "Are you licensed and insured in Texas?",
    answer:
      "No provider is represented by this demo. Verify a real contractor's current licence requirements, insurance certificates, references, and permit responsibilities with the relevant authorities.",
  },
  {
    question: "What areas near Austin do you serve?",
    answer:
      "This fictional page has no service area. Ask a verified contractor whether they serve your address and whether travel, permit, or delivery charges apply.",
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
    ["FAQ", "#faq"],
  ],
};

function LeadFormFrame({ title }) {
  return (
    <div
      className="bathroom-remodel-formFrame flex items-center justify-center border border-border bg-muted/40 p-6 text-center text-muted-foreground"
      role="note"
      aria-label={title}
    >
      <p>
        <strong className="text-foreground">Demo form disabled.</strong>{" "}
        This interface does not collect or send consultation requests.
      </p>
    </div>
  );
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

        <a className="bathroom-remodel-headerCall" href={phoneHref}>
          <Phone size={16} aria-hidden="true" />
          <span>{phoneDisplay}</span>
        </a>
      </header>

      <div className="bathroom-remodel-urgency" role="note">
        <span className="bathroom-remodel-urgencyText">
          Design demo — fictional provider; calls, forms, quotes, and services are disabled.
        </span>
      </div>

      <section className="bathroom-remodel-hero bathroom-remodel-band" aria-labelledby="bathroom-remodel-hero-title">
        <div className="bathroom-remodel-shell bathroom-remodel-heroGrid">
          <div className="bathroom-remodel-heroContent">
            <div className="bathroom-remodel-eyebrow">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Bathroom service-page design preview</span>
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
                <span>Preview Quote Section</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>

              <a className="bathroom-remodel-secondaryButton" href={phoneHref}>
                <Phone size={16} aria-hidden="true" />
                <span>{phoneDisplay}</span>
              </a>
            </div>
          </div>

          <aside className="bathroom-remodel-formCard">
            <div className="bathroom-remodel-formBadge">Demo — No Submission</div>
            <h2 className="bathroom-remodel-formTitle">Preview Consultation Form</h2>
            <p className="bathroom-remodel-formCopy">
              No provider or remodeling expert is connected to this preview.
            </p>
            <LeadFormFrame title="Bathroom remodeling consultation form" />
          </aside>
        </div>
      </section>

      {/*
        The trust band is gone. It rendered a perfect "5★" against five
        third-party platforms by name — Google, Angi, HomeAdvisor, Houzz and
        Thumbtack — for a notional Austin remodeler. There are no listings on any
        of those platforms and therefore no ratings, and reproducing their brand
        marks beside an invented score is worse than a bare unsupported claim.

        This lander is noindex and reachable only as a design preview. Its form
        frames do not contain fields and do not collect or send enquiry details.
      */}

      <section className="bathroom-remodel-pain bathroom-remodel-band" aria-labelledby="bathroom-remodel-pain-title">
        <div className="bathroom-remodel-shell">
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">Example Customer Concerns</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-pain-title">
            Questions a service page could address
          </h2>
          <p className="bathroom-remodel-sectionLead">
            These illustrative concerns show how a verified provider might explain its process.
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
          <div className="bathroom-remodel-eyebrow">Example Value Proposition</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-why-title">
            Preview a clear remodeling-service layout
          </h2>
          <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadWide">
            This fictional page demonstrates how a remodeling provider could organize planning,
            material, installation, and finish information. It does not represent a contractor,
            completed project, credential, warranty, or available service.
          </p>

          <div className="bathroom-remodel-whyGrid">
            <div className="bathroom-remodel-whyImageWrap">
              <Image
                src="https://images.unsplash.com/photo-1754522711595-84428937b07a?auto=format&fit=crop&w=1400&q=82"
                alt="Licensed stock photo illustrating a bathroom design concept"
                className="bathroom-remodel-whyImage"
                width={900}
                height={600}
                sizes="(max-width: 980px) 100vw, 48vw"
              />
              <div className="bathroom-remodel-whyBadge">
                <strong>Preview</strong>
                <span>Illustrative service layout</span>
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
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowDark">Example Categories</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-services-title">
            Illustrative remodeling service menu
          </h2>
          <p className="bathroom-remodel-sectionLead">
            These cards demonstrate information architecture only. They are not services offered by
            AltFTool or by an operating Together Design & Build provider.
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
                    <span>Preview CTA</span>
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
          <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowOnDark">Example Workflow</div>
          <h2 className="bathroom-remodel-sectionTitle bathroom-remodel-sectionTitleOnDark" id="bathroom-remodel-process-title">
            Illustrative bathroom remodeling process
          </h2>
          <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadOnDark">
            A sample sequence showing how a real provider could explain a project from initial
            discussion to completion checks.
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
          <div className="bathroom-remodel-eyebrow">Design Inspiration</div>
          <h2 className="bathroom-remodel-sectionTitle" id="bathroom-remodel-gallery-title">
            Bathroom layout and finish ideas
          </h2>
          <p className="bathroom-remodel-sectionLead">
            These licensed stock images illustrate possible design directions; they are not provider projects or client homes.
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
              <span>Preview Quote Section</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
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
            <h3>Preview contact panel</h3>
            <p>
              This interaction is disabled because the page is a fictional service-layout demo.
            </p>

            <a className="bathroom-remodel-sidebarCall" href={phoneHref}>
              <span className="bathroom-remodel-sidebarCallIcon" aria-hidden="true">
                <Phone size={18} />
              </span>
              <span>
                <small>Demo call disabled</small>
                <strong>{phoneDisplay}</strong>
              </span>
            </a>

            <a className="bathroom-remodel-primaryButton bathroom-remodel-primaryButtonFull" href="#final-cta">
              <span>Preview Quote Section</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>

            <div className="bathroom-remodel-hours">No live provider hours</div>
          </aside>
        </div>
      </section>

      <section className="bathroom-remodel-final bathroom-remodel-band" id="final-cta" aria-labelledby="bathroom-remodel-final-title">
        <div className="bathroom-remodel-shell bathroom-remodel-finalGrid">
          <div className="bathroom-remodel-finalContent">
            <div className="bathroom-remodel-eyebrow bathroom-remodel-eyebrowOnDark">Disabled Demo Form</div>
            <h2 className="bathroom-remodel-sectionTitle bathroom-remodel-sectionTitleOnDark" id="bathroom-remodel-final-title">
              Preview a bathroom
              <br />
              consultation layout
            </h2>
            <p className="bathroom-remodel-sectionLead bathroom-remodel-sectionLeadOnDark">
              This section demonstrates a possible service-page layout. It does not send a request,
              connect to a provider, or offer remodeling services.
            </p>

            <ul className="bathroom-remodel-featureList">
              <li>Illustrative service details</li>
              <li>Disabled contact controls</li>
              <li>No provider matching</li>
              <li>No personal data collection</li>
            </ul>

            <a className="bathroom-remodel-finalCall" href={phoneHref}>
              <span className="bathroom-remodel-finalCallIcon" aria-hidden="true">
                <Phone size={18} />
              </span>
              <span>
                <small>Demo call disabled</small>
                <strong>{phoneDisplay}</strong>
              </span>
            </a>
          </div>

          <aside className="bathroom-remodel-formCard bathroom-remodel-formCardFinal">
            <h3 className="bathroom-remodel-formTitle">Preview the disabled form</h3>
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
              Fictional bathroom-remodeling page used to demonstrate layout and content structure.
            </p>
          </div>

          <div>
            <h3>Example Services</h3>
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
            <h3>Demo Status</h3>
            <ul className="bathroom-remodel-contactList">
              <li>
                <a href={phoneHref}>{phoneDisplay}</a>
              </li>
              <li>No live service area</li>
              <li>No provider credentials claimed</li>
            </ul>
          </div>
        </div>
      </footer>

      <div className="bathroom-remodel-mobileBar">
        <a className="bathroom-remodel-mobileCall" href={phoneHref}>
          <Phone size={16} aria-hidden="true" />
          <span>Demo Call</span>
        </a>
        <a className="bathroom-remodel-mobileQuote" href="#final-cta">
          <span>Preview Quote</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
