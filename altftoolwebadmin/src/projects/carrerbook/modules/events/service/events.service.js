import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "carrerbook";
const EVENTS_PATH = ["projects", PROJECT_ID, "event", "events"];

export const DEFAULT_EVENTS_PAGE = {
  active: true,
  hero: {
    eyebrow: "CareerBook Events",
    heading: "Events & Product Showcases",
    subtitle:
      "Explore CareerBook launches, partner sessions, product walkthroughs, and live conversations designed for advertisers, publishers, and growth teams.",
  },
  heroInfoCard: {
    active: true,
    eyebrow: "Featured Program",
    title: "CareerBook Partner Growth Week",
    description:
      "A focused showcase covering product updates, campaign workflows, lead quality insights, and partner success playbooks.",
    ctaLabel: "View Upcoming Events",
    ctaLink: "#events",
    chips: [
      { id: "chip-live", label: "Live Sessions", active: true, sortOrder: 1 },
      { id: "chip-product", label: "Product Demos", active: true, sortOrder: 2 },
      { id: "chip-partners", label: "Partner Stories", active: true, sortOrder: 3 },
    ],
  },
  events: [
    {
      id: "event-growth-week",
      title: "Partner Growth Week",
      slug: "partner-growth-week",
      active: true,
      sortOrder: 1,
      imageUrl: "",
      imagePath: "",
      imageAlt: "CareerBook partner growth event",
      topImageBadge: "Featured",
      category: "Product Showcase",
      secondaryTag: "Advertisers",
      dateLabel: "Date",
      dateValue: "Aug 20, 2026",
      timeLabel: "Time",
      timeValue: "4:00 PM IST",
      locationLabel: "Location",
      locationValue: "Online",
      organizerLabel: "Host",
      organizerValue: "CareerBook Team",
      description:
        "A practical product showcase for teams building campaign funnels, improving lead quality, and scaling publisher partnerships.",
      productFocusLabel: "Product Focus",
      productFocus:
        "Campaign setup, conversion tracking, partner reporting, publisher discovery, and lead quality controls.",
      buttonLabel: "View Details",
      modalTitle: "Partner Growth Week",
      modalSubtitle:
        "Join CareerBook product and growth teams for a guided walkthrough of the latest advertiser and publisher workflows.",
      modalBadges: [
        { id: "badge-demo", label: "Live demo", active: true, sortOrder: 1 },
        { id: "badge-qna", label: "Q&A", active: true, sortOrder: 2 },
      ],
      modalProductTitle: "What You Will See",
      modalProductDescription:
        "A complete campaign journey from offer creation to publisher activation and lead performance review.",
      modalWhyTitle: "Why Attend",
      modalWhyDescription:
        "Understand the workflow decisions that help partners launch faster, monitor quality, and keep growth measurable.",
      modalAudienceTitle: "Best For",
      modalAudienceDescription:
        "Advertisers, publishers, affiliate managers, agencies, and performance marketing teams.",
      highlights: [
        { id: "highlight-campaign", text: "Create and manage campaigns with clearer operational controls.", active: true, sortOrder: 1 },
        { id: "highlight-quality", text: "Review lead quality signals and publisher performance in one place.", active: true, sortOrder: 2 },
        { id: "highlight-growth", text: "Learn playbooks for scaling partner activity without losing visibility.", active: true, sortOrder: 3 },
      ],
    },
    {
      id: "event-publisher-demo",
      title: "Publisher Success Demo",
      slug: "publisher-success-demo",
      active: true,
      sortOrder: 2,
      imageUrl: "",
      imagePath: "",
      imageAlt: "CareerBook publisher product demo",
      topImageBadge: "Online",
      category: "Webinar",
      secondaryTag: "Publishers",
      dateLabel: "Date",
      dateValue: "Sep 05, 2026",
      timeLabel: "Time",
      timeValue: "5:30 PM IST",
      locationLabel: "Location",
      locationValue: "Online",
      organizerLabel: "Host",
      organizerValue: "Publisher Success Team",
      description:
        "A workflow session for publishers who want to discover offers, compare campaign details, and manage lead submissions.",
      productFocusLabel: "Product Focus",
      productFocus: "Offer discovery, campaign eligibility, submission tracking, payout visibility, and account support.",
      buttonLabel: "View Details",
      modalTitle: "Publisher Success Demo",
      modalSubtitle:
        "A hands-on walkthrough showing how publishers can use CareerBook to find the right campaigns and track performance.",
      modalBadges: [
        { id: "badge-publishers", label: "Publishers", active: true, sortOrder: 1 },
        { id: "badge-workflow", label: "Workflow", active: true, sortOrder: 2 },
      ],
      modalProductTitle: "Demo Coverage",
      modalProductDescription: "The session covers offer browsing, campaign terms, lead status checks, and payout visibility.",
      modalWhyTitle: "Why Attend",
      modalWhyDescription: "See how CareerBook helps publishers reduce manual follow-up and focus on qualified campaigns.",
      modalAudienceTitle: "Best For",
      modalAudienceDescription: "Publishers, media buyers, content partners, and affiliate operators.",
      highlights: [
        { id: "highlight-offers", text: "Find campaigns that match your audience and traffic sources.", active: true, sortOrder: 1 },
        { id: "highlight-status", text: "Track submissions and performance without scattered spreadsheets.", active: true, sortOrder: 2 },
      ],
    },
  ],
};

export function subscribeEventsPage(onNext, onError) {
  return onSnapshot(
    doc(db, ...EVENTS_PATH),
    (snap) => onNext(mergeEventsPage(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveEventsPage(payload) {
  await setDoc(
    doc(db, ...EVENTS_PATH),
    {
      ...normalizeEventsPage(payload),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetEventsPage() {
  await setDoc(
    doc(db, ...EVENTS_PATH),
    {
      ...DEFAULT_EVENTS_PAGE,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function uploadEventImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/events/event-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve({ url: await getDownloadURL(task.snapshot.ref), path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteEventImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

function mergeEventsPage(data) {
  return normalizeEventsPage({
    ...DEFAULT_EVENTS_PAGE,
    ...data,
    hero: { ...DEFAULT_EVENTS_PAGE.hero, ...(data.hero || {}) },
    heroInfoCard: { ...DEFAULT_EVENTS_PAGE.heroInfoCard, ...(data.heroInfoCard || {}) },
    events: data.events || DEFAULT_EVENTS_PAGE.events,
  });
}

export function normalizeEventsPage(payload) {
  return {
    active: payload.active !== false,
    hero: {
      eyebrow: clean(payload.hero?.eyebrow),
      heading: clean(payload.hero?.heading),
      subtitle: clean(payload.hero?.subtitle),
    },
    heroInfoCard: {
      active: payload.heroInfoCard?.active !== false,
      eyebrow: clean(payload.heroInfoCard?.eyebrow),
      title: clean(payload.heroInfoCard?.title),
      description: clean(payload.heroInfoCard?.description),
      ctaLabel: clean(payload.heroInfoCard?.ctaLabel),
      ctaLink: clean(payload.heroInfoCard?.ctaLink),
      chips: normalizeRepeater(payload.heroInfoCard?.chips || [], "chip", "label"),
    },
    events: normalizeEvents(payload.events || []),
  };
}

function normalizeEvents(events = []) {
  return events
    .map((event, index) => {
      const title = clean(event.title);
      return {
        id: event.id || `event-${Date.now()}-${index}`,
        title,
        slug: createSlug(event.slug || title || `event-${index + 1}`),
        active: event.active !== false,
        sortOrder: Number(event.sortOrder) || index + 1,
        imageUrl: event.imageUrl || "",
        imagePath: event.imagePath || "",
        imageAlt: clean(event.imageAlt),
        topImageBadge: clean(event.topImageBadge),
        category: clean(event.category),
        secondaryTag: clean(event.secondaryTag),
        dateLabel: clean(event.dateLabel) || "Date",
        dateValue: clean(event.dateValue),
        timeLabel: clean(event.timeLabel) || "Time",
        timeValue: clean(event.timeValue),
        locationLabel: clean(event.locationLabel) || "Location",
        locationValue: clean(event.locationValue),
        organizerLabel: clean(event.organizerLabel) || "Host",
        organizerValue: clean(event.organizerValue),
        description: clean(event.description),
        productFocusLabel: clean(event.productFocusLabel) || "Product Focus",
        productFocus: clean(event.productFocus),
        buttonLabel: clean(event.buttonLabel) || "View Details",
        modalTitle: clean(event.modalTitle) || title,
        modalSubtitle: clean(event.modalSubtitle),
        modalBadges: normalizeRepeater(event.modalBadges || [], "badge", "label"),
        modalProductTitle: clean(event.modalProductTitle),
        modalProductDescription: clean(event.modalProductDescription),
        modalWhyTitle: clean(event.modalWhyTitle),
        modalWhyDescription: clean(event.modalWhyDescription),
        modalAudienceTitle: clean(event.modalAudienceTitle),
        modalAudienceDescription: clean(event.modalAudienceDescription),
        highlights: normalizeRepeater(event.highlights || [], "highlight", "text"),
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeRepeater(items = [], prefix, textKey) {
  return items
    .map((item, index) => ({
      id: item.id || `${prefix}-${Date.now()}-${index}`,
      [textKey]: clean(item[textKey]),
      active: item.active !== false,
      sortOrder: Number(item.sortOrder) || index + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function clean(value) {
  return String(value || "").trim();
}

function createSlug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
