import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "anslic";
const HOME_SECTION_PATH = (key) => ["projects", PROJECT_ID, "homesection", key];
const TESTIMONIAL_ITEMS_PATH = ["projects", PROJECT_ID, "homesection", "testimonials", "items"];

/**
 * Metadata for the hub index page — one card per sub-section, each linking
 * to its own route.
 */
export const HOME_SECTIONS = [
  {
    key: "hero",
    label: "Hero",
    description: "Manage the homepage hero eyebrow, headline, stats, and CTAs.",
    route: "/anslic/home/hero",
  },
  {
    key: "about-preview",
    label: "About Preview",
    description: "Manage the \"why choose Anslic\" summary and bullet points.",
    route: "/anslic/home/about-preview",
  },
  {
    key: "services-preview",
    label: "Services Preview",
    description: "Manage the services section intro copy shown above the service cards.",
    route: "/anslic/home/services-preview",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Manage testimonials intro copy and the client testimonial cards.",
    route: "/anslic/home/testimonials",
  },
  {
    key: "team-preview",
    label: "Team Preview",
    description: "Manage the team section intro copy shown above the team cards.",
    route: "/anslic/home/team-preview",
  },
  {
    key: "cta",
    label: "CTA",
    description: "Manage the closing call-to-action banner heading, copy, and button.",
    route: "/anslic/home/cta",
  },
  {
    key: "blog-preview",
    label: "Blog Preview",
    description: "Manage the blog section intro copy shown above the latest posts.",
    route: "/anslic/home/blog-preview",
  },
];

export const DEFAULT_HOME_SECTIONS = {
  hero: {
    eyebrow: "Digital growth partner",
    headline: "Anslic Digital Solutions",
    subtitle:
      "We build marketing systems that compound — strategy, design, and engineering under one roof.",
    stat1Value: "80%",
    stat1Label: "Technology Efficiency",
    stat2Value: "240+",
    stat2Label: "Agency Partners",
    button1Text: "Start a project",
    button1Link: "/contact",
    button2Text: "View services",
    button2Link: "/services",
    active: true,
  },
  "about-preview": {
    eyebrow: "Why Anslic",
    title: "Leading digital marketing agency for ambitious brands",
    items: [
      "Conversion-focused strategy for every campaign",
      "Dedicated pod of strategists, designers, and engineers",
      "Transparent reporting and weekly check-ins",
      "Built to scale from launch through growth stage",
    ],
    active: true,
  },
  "services-preview": {
    eyebrow: "What we do",
    title: "Our Services",
    subtitle: "Full-funnel systems, built for growth-stage brands.",
    active: true,
  },
  testimonials: {
    eyebrow: "Client voices",
    title: "What our partners say",
    subtitle: "Real results from real growth partnerships.",
    active: true,
  },
  "team-preview": {
    eyebrow: "Our people",
    title: "Meet the team",
    subtitle: "The people behind every Anslic engagement.",
    active: true,
  },
  cta: {
    heading: "Ready to build your next growth system?",
    paragraph: "Tell us where you want to go and we'll map the fastest path there.",
    buttonText: "Start a project",
    buttonLink: "/contact",
    active: true,
  },
  "blog-preview": {
    eyebrow: "Insights",
    title: "From the blog",
    subtitle: "Playbooks and perspectives from the Anslic team.",
    active: true,
  },
};

const cleanText = (value = "") => String(value).trim();

// One createSingletonDocService instance per section, keyed off HOME_SECTION_PATH.
const sectionServices = Object.fromEntries(
  Object.entries(DEFAULT_HOME_SECTIONS).map(([key, defaults]) => [
    key,
    createSingletonDocService(HOME_SECTION_PATH(key), defaults),
  ]),
);

export function subscribeHomeSection(key, onNext, onError) {
  return sectionServices[key].subscribe(onNext, onError);
}

export function saveHomeSection(key, payload) {
  return sectionServices[key].save(payload);
}

export function resetHomeSection(key) {
  return sectionServices[key].reset();
}

function normalizeTestimonialItem(payload) {
  return {
    quote: cleanText(payload.quote),
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const testimonialItemsService = createCollectionCrudService(TESTIMONIAL_ITEMS_PATH, {
  normalize: normalizeTestimonialItem,
  orderByField: "order",
});

export const subscribeTestimonialItems = testimonialItemsService.subscribe;
export const createTestimonialItem = testimonialItemsService.create;
export const updateTestimonialItem = testimonialItemsService.update;
export const deleteTestimonialItem = testimonialItemsService.remove;
export const toggleTestimonialItemStatus = testimonialItemsService.toggleActive;

const testimonialImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/home/testimonial` });

export const uploadTestimonialImage = testimonialImageUploader.upload;
export const deleteTestimonialImage = testimonialImageUploader.remove;
