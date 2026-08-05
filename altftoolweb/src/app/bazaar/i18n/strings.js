/**
 * AltF Bazaar — interface string catalogue (en / hi).
 *
 * WHAT IS IN SCOPE
 * ----------------
 * This file translates the **interface**: shell and navigation labels, filter
 * legends, sort options, CTAs, section headings, empty states, safety copy,
 * post-wizard field labels and errors, and the category / sub-category NAMES
 * from `data/categories.js`.
 *
 * WHAT IS DELIBERATELY NOT IN SCOPE
 * ---------------------------------
 * Listing titles and descriptions, seller bios, city and locality names, and
 * brand/model strings are **user-generated or proper nouns**. A real
 * marketplace shows them exactly as the seller wrote them; machine-translating
 * them would invent inventory that does not exist ("Maruti Swift VXi" is not
 * "मारुति स्विफ़्ट वीएक्सआई" in any seller's ad). `locale.ugcNote` states this
 * in the UI so a Hindi reader is not surprised by English ad copy, and it is
 * the reason this feature is described as a bilingual interface rather than a
 * Hindi site.
 *
 * SHAPE
 * -----
 * `STRINGS = { en: { "<dot.id>": "text" }, hi: { … } }` — flat, so a lookup is
 * one property access and a missing key is trivially detectable. Every id
 * exists in `en`; `hi` may be partial. `translate()` resolves
 * `hi → en → caller fallback → ""` and therefore can never render a raw key.
 *
 * The `en` values mirror the copy that is actually in the components today.
 * Keep them in sync: wiring a component to `t("empty.title")` must not change
 * the English page.
 *
 * TAXONOMY NAMES
 * --------------
 * Category and sub-category names are keyed `category.<slug>` /
 * `subcategory.<slug>` and are present **only in `hi`**. The English name is
 * already the single source of truth in `data/categories.js`, so copying all
 * 200 of them here would create two places to edit and guarantee drift.
 * `categoryName(slug, englishName)` passes the data-layer name through as the
 * fallback, which is exactly the behaviour we want for both locales.
 *
 * DEVANAGARI
 * ----------
 * Hindi renders taller and usually a little wider than the equivalent Latin
 * string, so translations are kept short where they sit inside a chip, a badge
 * or a 360px-wide button. Where a Latin acronym is what people actually read
 * and search for it is transliterated rather than expanded (एसयूवी, बीपीओ,
 * आईटी, वीआर, एसी) — nobody looks for a Sanskritised coinage.
 */

/** Locale codes this catalogue knows about, in display order. */
export const LOCALES = ["en", "hi"];

/** The locale the server renders. Also the fallback for every lookup. */
export const DEFAULT_LOCALE = "en";

/**
 * Switcher labels. English stays "EN" (an abbreviation everyone reads) and
 * Hindi is written in its own script, which is the only label a Hindi reader
 * can spot without reading English first.
 */
export const LOCALE_LABELS = { en: "EN", hi: "हिन्दी" };

/**
 * BCP-47 tags for the `lang` attribute. Regional tags because both locales
 * here are the default market's own (`data/market.js`): en-IN English and
 * hi-IN Hindi. Locale tables — and these tags — are part of a market's
 * content layer; see the blueprint's "Adding a market" section.
 */
export const LOCALE_HTML_LANG = { en: "en-IN", hi: "hi-IN" };

export function isLocale(value) {
  return LOCALES.includes(value);
}

/* -------------------------------------------------------------------------
   English — the source copy. Every id must exist here.
   ---------------------------------------------------------------------- */

const en = {
  /* Locale switcher and the honest scope note ---------------------------- */
  "locale.group": "Interface language",
  "locale.switchTo.en": "Show the interface in English",
  "locale.switchTo.hi": "Show the interface in Hindi",
  "locale.current.en": "Interface language: English",
  "locale.current.hi": "Interface language: Hindi",
  "locale.ugcNote": "Ad titles, descriptions and place names appear exactly as posted.",
  "locale.scopeNote": "Interface only — ads are not translated.",

  /* Shell and navigation ------------------------------------------------- */
  "nav.home": "Bazaar Home",
  "nav.categories": "All Categories",
  "nav.cities": "Browse by City",
  "nav.post": "Post an Ad",
  "nav.trending": "Trending Now",
  "nav.favourites": "Saved Ads",
  "nav.myAds": "My Ads",
  "nav.chat": "Chats",
  "nav.savedSearches": "Saved Searches",
  "nav.priceGuide": "Price Guides",
  "nav.safety": "Safety Centre",
  "nav.help": "Help & FAQ",
  "nav.compare": "Compare",
  "nav.search": "Search",

  "shell.brand": "AltF Bazaar",
  "shell.tagline": "Buy. Sell. Nearby.",
  "shell.sell": "Sell",
  "shell.searchPlaceholder": "Find cars, phones, flats, jobs…",
  "shell.searchAria": "Search AltF Bazaar",
  "shell.searchSubmit": "Search",
  "shell.cityAria": "Choose a city",
  "shell.citySearchPlaceholder": "Search city",
  "shell.recentSearches": "Recent searches",
  "shell.clearRecent": "Clear recent searches",

  /* Home ----------------------------------------------------------------- */
  "home.hero.title": "Buy. Sell. Nearby.",
  // `{country}` is fed from `getMarket().countryName` at the call site
  // (HomeHero). For the default market it resolves to the exact sentence
  // that used to be written here: "Local classifieds for India — …".
  "home.hero.subtitle":
    "Local classifieds for {country} — find the thing you need a few streets away, and turn what you no longer use into cash. Free to list, no commission on the sale.",
  "home.hero.cta": "Post your ad — it’s free",
  "home.stat.ads": "live ads",
  "home.stat.categories": "categories",
  "home.stat.cities": "cities",

  "home.categories.title": "Browse by category",
  "home.categories.link": "Browse all categories",
  "home.fresh.title": "Fresh recommendations",
  "home.fresh.link": "See more ads",
  "home.fresh.emptyTitle": "No ads to show yet",
  "home.fresh.emptyMessage":
    "Nothing has been posted recently. Be the first — listing an ad takes about a minute.",
  "home.spotlight.title": "Spotlight ads",
  "home.popular.title": "Popular on AltF Bazaar",
  "home.popular.cities": "Popular cities",
  "home.popular.categories": "Popular categories",
  "home.popular.priceGuides": "Price guides",
  "home.popular.directory": "Browse the directory",
  "home.popular.adsIn": "Ads in {city}",
  // Suffix after a category name; both languages put the name first.
  "home.popular.pricesSuffix": "prices",
  "home.fresh.postCta": "Post your ad",
  "home.dir.trending": "Trending on Bazaar",
  "home.dir.categories": "All categories",
  "home.dir.cities": "All cities",
  "home.dir.priceGuides": "All price guides",
  "home.dir.safety": "Safety centre",
  "home.dir.help": "Help & FAQ",

  /* Trust band ----------------------------------------------------------- */
  "trust.title": "Safer by default",
  "trust.link": "Read the safety guide",
  "trust.verified.title": "Verified sellers",
  "trust.verified.body":
    "Phone and email checks, with the badge shown on the ad and the seller profile.",
  "trust.chat.title": "Chat in-platform",
  "trust.chat.body":
    "Agree the details in Bazaar chat. Nobody needs your number before you decide to meet.",
  "trust.meeting.title": "Meet-up safety tips",
  "trust.meeting.body": "Public place, daylight, inspect before you pay, and never send an advance.",
  "trust.report.title": "Report an ad",
  "trust.report.body":
    "One tap on any listing flags it for review — no account or explanation needed.",

  /* Filters -------------------------------------------------------------- */
  "filter.heading": "Filters",
  "filter.open": "Filters",
  "filter.close": "Close filters",
  "filter.apply": "Show results",
  "filter.clearAll": "Clear all",
  "filter.remove": "Remove filter {label}",
  "filter.any": "Any",
  "filter.category": "Category",
  "filter.allCategories": "All categories",
  "filter.price": "Price",
  "filter.city": "City",
  // The whole-country scope option ("All India"). `{country}` is fed from
  // `getMarket().countryName` at the call sites (FilterRail, BazaarSearchBar,
  // MapExplorerClient) — for the default market the resolved text is
  // byte-identical to the "All India" this id used to hardcode.
  "filter.allCountry": "All {country}",
  "filter.locality": "Locality",
  "filter.allOfCity": "All of {city}",
  "filter.min": "Min",
  "filter.max": "Max",
  "filter.minAria": "{legend} minimum",
  "filter.maxAria": "{legend} maximum",
  "filter.activeCount": "{count} filters applied",

  /* Sort ----------------------------------------------------------------- */
  "sort.label": "Sort",
  "sort.aria": "Sort results",
  // Keyed by the literal `SORTS` values in data/listings.js, so a component
  // can resolve `t("sort." + option.value, option.label)` with no mapping table.
  "sort.relevance": "Relevance",
  "sort.recent": "Newest first",
  "sort.price-low": "Price: low to high",
  "sort.price-high": "Price: high to low",
  "sort.popular": "Most viewed",

  /* Result counts and pagination ----------------------------------------
     `{range}` is left in the resolved string on purpose: the component splits
     on it and renders the bold `first–last` span there, so the emphasised
     numbers can sit at either end of the sentence per language. */
  "results.none": "No ads",
  "results.range": "{range} of {total} ads",
  "results.rangeOne": "{range} of {total} ad",
  "pagination.aria": "Pagination",
  "pagination.previous": "Previous",
  "pagination.next": "Next",
  // Relative posted-age labels — en mirrors data/listings.js formatPosted
  // branch for branch, so English output is byte-identical either path.
  "time.today": "Today",
  "time.yesterday": "Yesterday",
  "time.daysAgo": "{count} days ago",
  "time.oneWeek": "1 week ago",
  "time.weeksAgo": "{count} weeks ago",
  "time.oneMonth": "1 month ago",
  "time.monthsAgo": "{count} months ago",

  /* Section headings and shared primitives ------------------------------ */
  "section.seeAll": "See all",
  "section.breadcrumbAria": "Breadcrumb",
  "section.description": "Description",
  "section.details": "Details",
  "section.overview": "Overview",
  "section.similar": "Similar ads",
  "section.recentlyViewed": "Recently viewed",
  "section.moreFromSeller": "More from this seller",
  "section.priceInsight": "Price insight",
  "section.faq": "Frequently asked questions",
  "section.localities": "Popular localities",
  "section.adsCount": "{count} ads",
  "section.adsCountOne": "{count} ad",

  /* Empty states --------------------------------------------------------- */
  "empty.title": "No ads match those filters",
  "empty.message":
    "Try widening the price range, clearing a filter, or searching a nearby city.",
  "empty.saved.title": "Nothing saved yet",
  "empty.saved.message":
    "Tap the heart on any ad to keep it here. Saved ads stay in this browser so you can compare them later.",
  "empty.myAds.title": "You have not posted anything yet",
  "empty.myAds.message":
    "Post your first ad and it will show up here, with tools to edit the price, mark it sold or delete it.",
  "empty.savedSearches.title": "No saved searches yet",
  "empty.compare.title": "Nothing to compare yet",

  /* Ad card and badges --------------------------------------------------- */
  "card.free": "Free",
  "card.featured": "Featured",
  "card.spotlight": "Spotlight",
  "card.urgent": "Urgent",
  "card.verified": "Verified",
  "card.negotiable": "Negotiable",
  "card.save": "Save",
  "card.saved": "Saved",
  "card.saveAria": "Save {title}",
  "card.unsaveAria": "Remove {title} from saved ads",

  /* Ad detail actions ---------------------------------------------------- */
  "item.chat": "Chat with seller",
  "item.showPhone": "Show phone number",
  "item.share": "Share",
  "item.shareHeading": "Share this ad",
  "item.shareWhatsapp": "Share on WhatsApp",
  "item.copyLink": "Copy link",
  "item.copied": "Copied",
  "item.compare": "Compare",
  "item.report": "Report this ad",

  /* Seller --------------------------------------------------------------- */
  "seller.postedBy": "Posted by",
  "seller.itemsSold": "Items sold",
  "seller.replies": "Replies",
  "seller.business": "Business seller",
  "seller.individual": "Individual seller",
  "seller.joinedThisMonth": "Joined this month",
  "seller.viewProfile": "View profile",
  "seller.phoneVerified": "Phone verified",
  "seller.emailVerified": "Email verified",

  /* Safety — headings AND body copy. See the note in `hi` below. --------- */
  "safety.heading": "Stay safe on AltF Bazaar",
  "safety.tip.meet":
    "Meet the seller in a public place during daylight. Take someone with you for anything expensive.",
  "safety.tip.inspect":
    "Inspect the item properly before you pay. Switch it on, check the paperwork, take your time.",
  "safety.tip.advance":
    "Never pay in advance — not a token, not a booking fee, not a delivery charge. Pay when you collect.",
  "safety.tip.otp":
    "Never share an OTP, UPI PIN, card number or bank password. No genuine buyer or seller needs them.",
  "safety.tip.report":
    "Report ads that ask for money up front, refuse to meet, or push you onto another app.",

  "report.heading": "Report this ad",
  "report.reason.badContent": "Inappropriate or offensive",
  "report.reason.fraud": "Fraud or scam",
  "report.reason.duplicated": "Duplicate ad",
  "report.reason.sold": "Already sold",
  "report.reason.other": "Something else",
  "report.submit": "Submit report",
  "report.cancel": "Cancel",

  /* Post-ad wizard ------------------------------------------------------- */
  "post.heading": "Post an ad",
  "post.progressAria": "Post an ad progress",
  "post.step.category": "Category",
  "post.step.category.heading": "What are you selling?",
  "post.step.details": "Details",
  "post.step.details.heading": "Describe your item",
  "post.step.photos": "Photos",
  "post.step.photos.heading": "Add photos",
  "post.step.price": "Price",
  "post.step.price.heading": "Set your price",
  "post.step.location": "Location",
  "post.step.location.heading": "Where is it?",
  "post.step.review": "Review",
  "post.step.review.heading": "Review and post",

  "post.field.title": "Ad title",
  "post.field.description": "Description",
  "post.field.price": "Price",
  "post.field.city": "City",
  "post.field.locality": "Locality",
  "post.field.negotiable": "Price is negotiable",
  "post.selectCity": "Select a city",
  "post.selectLocality": "Select a locality",
  "post.chooseCityFirst": "Choose a city first",
  "post.next": "Next",
  "post.back": "Back",
  "post.publish": "Post ad",
  "post.summary": "Ad summary",
  "post.titleAndDescription": "Title and description",
  "post.preview": "How it will look",

  "post.error.category": "Pick a category to continue.",
  "post.error.subcategory": "Pick a subcategory to continue.",
  "post.error.title": "An ad title is required.",
  "post.error.description": "A description is required.",
  "post.error.price": "Enter a price. Put 0 if you are giving it away.",
  "post.error.priceNegative": "Enter a price of 0 or more.",
  "post.error.city": "Choose the city your item is in.",
  "post.error.locality": "Choose a locality so buyers nearby can find it.",

  /* Demo honesty note ---------------------------------------------------- */
  "demo.localOnly": "Demo — everything you save or post stays in this browser only.",

  /* Attribute labels — mirror `attributes[].label` in data/categories.js.
     Keyed by attribute `key`, so one entry covers every category that
     declares it (`condition` and `warranty` are shared by nine of them). */
  "attr.ageGroup": "Age group",
  "attr.ageYears": "Age",
  "attr.atHome": "Available at home",
  "attr.authenticated": "Provenance available",
  "attr.availableFor": "Available for",
  "attr.bachelorsAllowed": "Bachelors allowed",
  "attr.bathrooms": "Bathrooms",
  "attr.bhk": "Bedrooms",
  "attr.bill": "Original bill available",
  "attr.boxed": "Original box & cables",
  "attr.brand": "Brand",
  "attr.capacity": "Capacity",
  "attr.carpetArea": "Carpet area",
  "attr.collectOnly": "Collection only",
  "attr.condition": "Condition",
  "attr.constructionStatus": "Construction status",
  "attr.delivery": "Delivery available",
  "attr.deposit": "Security deposit",
  "attr.doorstep": "Doorstep delivery",
  "attr.engineCc": "Engine",
  "attr.eventType": "Event type",
  "attr.experience": "Experience",
  "attr.facing": "Facing",
  "attr.fuel": "Fuel",
  "attr.furnishing": "Furnishing",
  "attr.gender": "For",
  "attr.grade": "Refurb grade",
  "attr.handmade": "Handmade",
  "attr.inspected": "Inspected only",
  "attr.installation": "Installation included",
  "attr.insurance": "Insurance valid",
  "attr.kmDriven": "KM driven",
  "attr.language": "Language",
  "attr.listedBy": "Listed by",
  "attr.listingType": "Listing type",
  "attr.loadCapacity": "Load capacity",
  "attr.material": "Material",
  "attr.medium": "Medium",
  "attr.organicCertified": "Organic certified",
  "attr.owners": "Number of owners",
  "attr.parking": "Car parking",
  "attr.pedigree": "Pedigree certificate",
  "attr.permit": "National permit",
  "attr.petAge": "Age",
  "attr.platform": "Platform",
  "attr.positionType": "Position type",
  "attr.powerPhase": "Power",
  "attr.powerSource": "Power source",
  "attr.ram": "RAM",
  "attr.rateType": "Charged",
  "attr.rentalPeriod": "Minimum period",
  "attr.returnWindow": "7-day return",
  "attr.salaryPeriod": "Salary period",
  "attr.sanitised": "Professionally sanitised",
  "attr.serviceRadius": "Service radius",
  "attr.size": "Size",
  "attr.storage": "Storage",
  "attr.suitableAcreage": "Suitable for",
  "attr.superBuiltupArea": "Super builtup area",
  "attr.totalFloors": "Total floors",
  "attr.transferable": "Officially transferable",
  "attr.transmission": "Transmission",
  "attr.usageCount": "Times used",
  "attr.usageHours": "Approx. usage",
  "attr.vaccinated": "Vaccinated",
  "attr.warranty": "Under warranty",
  "attr.warrantyMonths": "Warranty",
  "attr.workMode": "Work mode",
  "attr.year": "Year",

  /* ---- Wiring wave: strings met while threading t() through components.
     Mirrors of the literal copy in those files — keep both in sync. -------- */
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.done": "Done",
  "common.clear": "Clear",
  "common.charCounter": "{count} of {max} characters",
  "common.limitReached": " — limit reached",

  "section.results": "Results",

  "filter.showAll": "Show all {count}",
  "filter.showLess": "Show less",
  "filter.searchOptions": "Search {legend}",
  "filter.searchOptionsAria": "Search {legend} options",
  "filter.noOptions": "No options match “{needle}”.",
  "filter.noMatchTitle": "{label} — no matching ads with the current filters",
  "filter.activeAria": "Active filters: {count}",
  "filter.clearAllFilters": "Clear all filters",
  "filter.showCount": "Show {count} ads",
  "filter.chip.search": "Search: {q}",
  "filter.chip.price": "Price: {low} – {high}",
  "browse.truncated":
    "Showing the first {shown} of {total} ads. Filtering runs in the browser on this demo corpus, so narrow by city or price for an exact count.",

  "compare.inCompare": "In compare",
  "compare.add": "Add {title} to compare",
  "compare.remove": "Remove {title} from compare",
  "compare.full": "Compare holds {limit} ads. Remove one to add this.",

  "offer.make": "Make an offer",
  "offer.yourOffer": "Your offer",
  "offer.quickPicks": "Common offers",
  "offer.messageOptional": "Message (optional)",
  "offer.notePlaceholder": "Can collect today, paying cash.",
  "offer.send": "Send offer",
  "offer.change": "Change offer",
  "offer.changeIt": "Change it",
  "offer.withdraw": "Withdraw",
  "offer.youOffered": "You offered {amount}",
  "offer.close": "Close offer dialog",
  // `{symbol}` in the ids below is fed from `getMarket().currencySymbol` at
  // the call sites. Unlike `{country}`, a currency symbol is not translated,
  // so the hi table uses the same placeholder.
  "offer.enterAmount": "Enter an amount above {symbol}0 to continue.",
  "offer.offering": "Offering {amount}. Nothing leaves this browser.",
  "offer.invalid": "Type a whole number above 0 — we have moved focus to the amount.",
  "offer.previewEmpty": "Enter an amount to see it in full.",
  "offer.demo.pre": "Demo only — an offer here is ",
  "offer.demo.strong": "not sent to anyone",
  "offer.demo.post": ". It is saved in this browser so you can see how negotiation would work.",

  "item.shareClose": "Close share options",
  "item.shareMore": "More apps on this device",
  "item.copiedStatus": "Link copied to clipboard",
  "item.copyFailed": "Copying failed. Select the address shown below instead.",
  "item.copyBlocked":
    "This browser blocked the clipboard — select the address above and copy it manually.",
  "item.phoneDemo":
    "Demo listing — this number is generated for the prototype and stays partly masked. On the live product the full number appears once you have verified your own.",

  "report.hint.badContent": "Adult, violent, hateful or otherwise unacceptable content.",
  "report.hint.fraud": "Asks for money up front, refuses to meet, or pushes you onto another app.",
  "report.hint.duplicated": "The same item is posted more than once.",
  "report.hint.sold": "The item is gone but the ad is still up.",
  "report.hint.other": "Tell us what is wrong with this ad.",
  "report.close": "Close report dialog",
  "report.whyHeading": "Why are you reporting it?",
  "report.whatWrong": "What is wrong with this ad?",
  "report.reasonRecorded": "Reason recorded: {label}",
  "report.reportingAs": "Reporting as “{label}”.",
  "report.pickReason": "Pick a reason above to enable Submit.",
  "report.chooseFirst": "Choose one of the five reasons first — we have moved focus to the list.",
  "report.detailsPlaceholder": "Optional — a sentence or two is plenty.",
  "report.demo.pre": "Demo only — this report is ",
  "report.demo.strong": "not sent anywhere",
  "report.demo.post": ". There is no moderation backend behind this prototype.",

  "search.saveSearch": "Save this search",
  "search.searchSaved": "Search saved",
  "search.noCityMatch": "No city matches that name.",
  "recent.clearAria": "Clear recently viewed ads",
  "recent.localNote": "Kept in this browser only — nothing is sent to an account.",

  "empty.savedSearches.message":
    "Filter a category the way you like it — brand, city, price band — then tap “Save this search”. It will wait for you here.",
  "empty.compare.message":
    "Tap Compare on any ad to line it up against up to three others — price, kilometres, year and every other spec side by side.",
  "empty.map.title": "Nothing in this part of the map",
  "empty.browse": "Browse Bazaar",
  "empty.myAds.postCta": "Post an ad",
  "empty.myAds.filteredMessage": "Switch the filter above to see the rest of your ads.",
  "empty.myAds.showAll": "Show all ads",
  "map.keyword": "Keyword",
  "map.viewToggle": "Choose map or list",
  "map.adsInView": "Ads in view",
  "map.loading": "Loading map…",
  "map.apply": "Apply",
  "map.map": "Map",
  "map.list": "List",
  "map.minRupee": "Min {symbol}",
  "map.maxRupee": "Max {symbol}",
  "empty.map.message": "Pan or zoom out to bring ads into view, or widen the filters above.",

  "post.stepAria": "Step {n} of {total}: {label}",
  "post.categoryIntro":
    "Choose the category that fits best — it decides which details buyers can filter on.",
  "post.categoriesAria": "Categories",
  "post.subcategoriesAria": "Subcategories",
  "post.subcategoryIn": "Subcategory in {category}",
  "post.selectAttr": "Select {label}",
  "post.categoryDetails": "{category} details",
  "post.detailsIntro":
    "These are the fields buyers filter on in {category}. Fill in what you know — only marked fields are required.",
  "post.titlePlaceholder": "e.g. {example} in great condition",
  "post.descPlaceholder":
    "Condition, age, what is included, why you are selling, and when buyers can see it.",
  "post.dragPhotos": "Drag photos here, or choose them from your device",
  "post.upTo": "Up to {max} images. {count} added.",
  "post.choosePhotos": "Choose photos",
  "post.choosePhotosAria": "Choose photos to attach to your ad",
  "post.coverPhoto": "Cover photo",
  "post.movePhotoEarlier": "Move {name} earlier",
  "post.movePhotoLater": "Move {name} later",
  "post.removePhoto": "Remove {name}",
  "post.photosLocal":
    "Nothing is uploaded. Photos stay in this browser tab only — they are previewed from memory and disappear when you close the tab.",
  // Thumbnail persistence (photoStorage.js). en mirrors the wizard's
  // fallbacks verbatim — diverging here would silently override what the
  // fix's verification actually tested.
  "post.photosKeptLocal":
    "Nothing is uploaded. Full-size photos preview from this tab's memory; posting saves small thumbnails in this browser so your ad keeps its pictures.",
  "post.photosUnpersisted":
    "This browser is not saving data right now (storage may be full or blocked), so this ad and its photos may not survive a reload.",
  "post.photosDropped":
    "This browser's local storage is full, so the ad was saved without photos.",
  "post.photosUnreadable":
    "The ad was posted without photos — none of the {total} could be stored in this browser.",
  "post.photosSaved": "Saved {saved} of {total} photos as thumbnails in this browser.",
  "post.photosBudgetTail": "The rest were left out to keep local storage light.",
  "post.photosShrunk": "They were shrunk further to fit the storage available.",
  "post.buyersWillSee": "Buyers will see:",
  "post.freeFixed": "Free & giveaway ads are always {symbol}0, so the price is fixed.",
  "post.sellsFor": "What {category} sells for on Bazaar",
  "post.medianPrice": "Median price",
  "post.mostAdsBetween": "Most ads sit between",
  "post.basedOn": "Based on",
  "post.liveAds": "{count} live ads",
  "post.aboveRange":
    "That is above the usual range for {category}. Expect fewer enquiries unless the condition is exceptional.",
  "post.belowRange": "Priced under the usual range — this should move quickly.",
  "post.noPriceHistory":
    "There is no price history for this category yet, so price it on condition and what comparable ads nearby are asking.",
  "post.localityNote":
    "Buyers filter by locality more than any other field. A precise neighbourhood gets you meetings; a city-wide ad gets you questions.",
  "post.demoBanner":
    "This is a demo marketplace. Ads you post here are stored only in this browser, no photo is uploaded anywhere, and no buyer will ever see them.",
  "post.negotiableTag": " · Negotiable",
  "post.today": "Today",
  "post.yes": "Yes",
  "post.previewNote": "This is the card buyers see in search results and category grids.",
  "post.liveHeading": "Your ad is live in this browser",
  "post.savedTail":
    "was saved to My ads at {price} in {place}. Nothing was uploaded to a server — clearing site data removes it.",
  "post.goToMyAds": "Go to My ads",
  "post.postAnother": "Post another ad",
  "post.backToBazaar": "Back to Bazaar",
  "post.ready": "Ready for the next step.",
  "post.allGood": "Everything checks out — posting saves the ad to this browser.",
  "post.error.titleMin": "Use at least {min} characters so buyers know what this is.",
  "post.error.titleMax": "Titles are limited to {max} characters.",
  "post.error.descMin": "Add at least {min} characters of detail — condition, age, reason for selling.",
  "post.error.descMax": "Descriptions are limited to {max} characters.",
  "post.error.attrRequired": "{label} is required.",
  "post.error.attrNumber": "{label} must be a number.",
  "post.error.attrRange": "{label} must be between {min} and {max}{unit}.",
  "post.error.priceMax": "Prices above {max} need a business account.",
  "post.error.photos": "Add at least one photo — ads with photos get far more replies.",
  "post.error.imagesOnly": "Only image files can be attached.",
  "post.error.tooManyPhotos": "You can attach up to {max} photos, so the extras were skipped.",
};

/* -------------------------------------------------------------------------
   Hindi.

   Register: everyday spoken Hindi as an Indian classifieds user reads it, not
   formal literary Hindi. Where the loanword is what people say and search for
   it wins over a Sanskritised coinage — मोबाइल not चलदूरभाष, फ़र्नीचर not
   सज्जासामग्री, कार not मोटरगाड़ी. Nukta is used (फ़, ज़, ख़, क़) because that is
   how these words are conventionally set in Devanagari.

   Safety copy is translated in full rather than heading-only. Everything else
   here is convenience; an English-only fraud warning is the one case where an
   untranslated paragraph can actually cost a Hindi reader money.
   ---------------------------------------------------------------------- */

const hi = {
  /* Locale switcher and scope note -------------------------------------- */
  "locale.group": "इंटरफ़ेस की भाषा",
  "locale.switchTo.en": "इंटरफ़ेस अंग्रेज़ी में देखें",
  "locale.switchTo.hi": "इंटरफ़ेस हिन्दी में देखें",
  "locale.current.en": "इंटरफ़ेस की भाषा: अंग्रेज़ी",
  "locale.current.hi": "इंटरफ़ेस की भाषा: हिन्दी",
  "locale.ugcNote": "विज्ञापन के शीर्षक, विवरण और जगहों के नाम वैसे ही दिखते हैं जैसे डाले गए थे।",
  "locale.scopeNote": "सिर्फ़ इंटरफ़ेस — विज्ञापनों का अनुवाद नहीं होता।",

  /* Shell and navigation ------------------------------------------------- */
  "nav.home": "बाज़ार होम",
  "nav.categories": "सभी श्रेणियाँ",
  "nav.cities": "शहर से देखें",
  "nav.post": "विज्ञापन डालें",
  "nav.trending": "अभी ट्रेंडिंग",
  "nav.favourites": "सहेजे विज्ञापन",
  "nav.myAds": "मेरे विज्ञापन",
  "nav.chat": "चैट",
  "nav.savedSearches": "सहेजी खोजें",
  "nav.priceGuide": "कीमत गाइड",
  "nav.safety": "सुरक्षा केंद्र",
  "nav.help": "मदद और सवाल-जवाब",
  "nav.compare": "तुलना",
  "nav.search": "खोजें",

  "shell.tagline": "ख़रीदें. बेचें. आस-पास.",
  "shell.sell": "बेचें",
  "shell.searchPlaceholder": "कार, फ़ोन, फ़्लैट, नौकरी खोजें…",
  "shell.searchAria": "AltF बाज़ार में खोजें",
  "shell.searchSubmit": "खोजें",
  "shell.cityAria": "शहर चुनें",
  "shell.citySearchPlaceholder": "शहर खोजें",
  "shell.recentSearches": "हाल की खोजें",
  "shell.clearRecent": "हाल की खोजें हटाएँ",

  /* Home ----------------------------------------------------------------- */
  "home.hero.title": "ख़रीदें. बेचें. आस-पास.",
  // भारत is written out rather than taking the `{country}` param the en
  // string uses: params carry `getMarket().countryName`, which is the
  // ENGLISH name — interpolating it here would render "India के लिए…".
  // This hi table is itself India-market content (see data/market.js);
  // another market ships its own locale tables naming its own country.
  "home.hero.subtitle":
    "भारत के लिए लोकल क्लासिफ़ाइड्स — जो चाहिए वह कुछ गलियों की दूरी पर ढूँढें, और जो इस्तेमाल नहीं होता उसे पैसे में बदलें। विज्ञापन डालना मुफ़्त, बिक्री पर कोई कमीशन नहीं।",
  "home.hero.cta": "अपना विज्ञापन डालें — मुफ़्त है",
  "home.stat.ads": "लाइव विज्ञापन",
  "home.stat.categories": "श्रेणियाँ",
  "home.stat.cities": "शहर",

  "home.categories.title": "श्रेणी से देखें",
  "home.categories.link": "सभी श्रेणियाँ देखें",
  "home.fresh.title": "नए सुझाव",
  "home.fresh.link": "और विज्ञापन देखें",
  "home.fresh.emptyTitle": "अभी दिखाने के लिए कोई विज्ञापन नहीं",
  "home.fresh.emptyMessage":
    "हाल में कुछ नहीं डाला गया। सबसे पहले आप डालें — विज्ञापन बनाने में लगभग एक मिनट लगता है।",
  "home.spotlight.title": "स्पॉटलाइट विज्ञापन",
  "home.popular.title": "AltF बाज़ार पर लोकप्रिय",
  "home.popular.cities": "लोकप्रिय शहर",
  "home.popular.categories": "लोकप्रिय श्रेणियाँ",
  "home.popular.priceGuides": "कीमत गाइड",
  "home.popular.directory": "डायरेक्टरी देखें",
  "home.popular.adsIn": "{city} में विज्ञापन",
  "home.popular.pricesSuffix": "की कीमतें",
  "home.fresh.postCta": "अपना विज्ञापन डालें",
  "home.dir.trending": "बाज़ार पर ट्रेंडिंग",
  "home.dir.categories": "सभी श्रेणियाँ",
  "home.dir.cities": "सभी शहर",
  "home.dir.priceGuides": "सभी कीमत गाइड",
  "home.dir.safety": "सुरक्षा केंद्र",
  "home.dir.help": "मदद और सवाल-जवाब",

  /* Trust band ----------------------------------------------------------- */
  "trust.title": "सुरक्षा, शुरू से ही",
  "trust.link": "सुरक्षा गाइड पढ़ें",
  "trust.verified.title": "वेरिफ़ाइड विक्रेता",
  "trust.verified.body":
    "फ़ोन और ईमेल की जाँच, और बैज विज्ञापन तथा विक्रेता की प्रोफ़ाइल दोनों पर दिखता है।",
  "trust.chat.title": "प्लैटफ़ॉर्म पर ही चैट",
  "trust.chat.body":
    "बात बाज़ार चैट में ही तय करें। मिलने का फ़ैसला करने से पहले किसी को आपका नंबर देने की ज़रूरत नहीं।",
  "trust.meeting.title": "मिलने के सुरक्षा सुझाव",
  "trust.meeting.body":
    "सार्वजनिक जगह, दिन का उजाला, पैसे देने से पहले जाँच, और एडवांस कभी न भेजें।",
  "trust.report.title": "विज्ञापन की शिकायत करें",
  "trust.report.body":
    "किसी भी विज्ञापन पर एक टैप उसे जाँच के लिए भेज देता है — न अकाउंट चाहिए, न सफ़ाई।",

  /* Filters -------------------------------------------------------------- */
  "filter.heading": "फ़िल्टर",
  "filter.open": "फ़िल्टर",
  "filter.close": "फ़िल्टर बंद करें",
  "filter.apply": "नतीजे दिखाएँ",
  "filter.clearAll": "सब हटाएँ",
  "filter.remove": "फ़िल्टर हटाएँ: {label}",
  "filter.any": "कोई भी",
  "filter.category": "श्रेणी",
  "filter.allCategories": "सभी श्रेणियाँ",
  "filter.price": "कीमत",
  "filter.city": "शहर",
  // No `{country}` param here — see the note on `home.hero.subtitle` above.
  "filter.allCountry": "पूरा भारत",
  "filter.locality": "इलाक़ा",
  "filter.allOfCity": "{city} के सभी इलाक़े",
  "filter.min": "कम से कम",
  "filter.max": "ज़्यादा से ज़्यादा",
  "filter.minAria": "{legend} — कम से कम",
  "filter.maxAria": "{legend} — ज़्यादा से ज़्यादा",
  "filter.activeCount": "{count} फ़िल्टर लगे हैं",

  /* Sort ----------------------------------------------------------------- */
  "sort.label": "क्रम",
  "sort.aria": "नतीजों का क्रम",
  "sort.relevance": "प्रासंगिकता",
  "sort.recent": "नए पहले",
  "sort.price-low": "कीमत: कम से ज़्यादा",
  "sort.price-high": "कीमत: ज़्यादा से कम",
  "sort.popular": "सबसे ज़्यादा देखे गए",

  /* Result counts and pagination ---------------------------------------- */
  "results.none": "कोई विज्ञापन नहीं",
  "results.range": "{total} विज्ञापनों में से {range}",
  "results.rangeOne": "{total} विज्ञापन में से {range}",
  "pagination.aria": "पेज नेविगेशन",
  "pagination.previous": "पिछला",
  "pagination.next": "अगला",
  "time.today": "आज",
  "time.yesterday": "कल",
  "time.daysAgo": "{count} दिन पहले",
  "time.oneWeek": "1 हफ़्ता पहले",
  "time.weeksAgo": "{count} हफ़्ते पहले",
  "time.oneMonth": "1 महीना पहले",
  "time.monthsAgo": "{count} महीने पहले",

  /* Section headings ----------------------------------------------------- */
  "section.seeAll": "सभी देखें",
  "section.breadcrumbAria": "पेज का पथ",
  "section.description": "विवरण",
  "section.details": "जानकारी",
  "section.overview": "एक नज़र में",
  "section.similar": "मिलते-जुलते विज्ञापन",
  "section.recentlyViewed": "हाल में देखे गए",
  "section.moreFromSeller": "इसी विक्रेता के और विज्ञापन",
  "section.priceInsight": "कीमत की जानकारी",
  "section.faq": "अक्सर पूछे जाने वाले सवाल",
  "section.localities": "लोकप्रिय इलाक़े",
  "section.adsCount": "{count} विज्ञापन",
  "section.adsCountOne": "{count} विज्ञापन",

  /* Empty states --------------------------------------------------------- */
  "empty.title": "इन फ़िल्टरों से कोई विज्ञापन नहीं मिला",
  "empty.message":
    "कीमत की रेंज बढ़ाएँ, कोई फ़िल्टर हटाएँ, या आस-पास का कोई शहर देखें।",
  "empty.saved.title": "अभी कुछ सहेजा नहीं गया",
  "empty.saved.message":
    "किसी भी विज्ञापन पर दिल के निशान को टैप करें और वह यहाँ रह जाएगा। सहेजे गए विज्ञापन इसी ब्राउज़र में रहते हैं, ताकि आप बाद में उनकी तुलना कर सकें।",
  "empty.myAds.title": "आपने अभी कुछ नहीं डाला",
  "empty.myAds.message":
    "पहला विज्ञापन डालें और वह यहाँ दिखने लगेगा — कीमत बदलने, बिका हुआ बताने या हटाने के विकल्प के साथ।",
  "empty.savedSearches.title": "अभी कोई खोज सहेजी नहीं गई",
  "empty.compare.title": "तुलना के लिए अभी कुछ नहीं",

  /* Ad card and badges --------------------------------------------------- */
  "card.free": "मुफ़्त",
  "card.featured": "फ़ीचर्ड",
  "card.spotlight": "स्पॉटलाइट",
  "card.urgent": "अर्जेंट",
  "card.verified": "वेरिफ़ाइड",
  "card.negotiable": "मोल-भाव हो सकता है",
  "card.save": "सहेजें",
  "card.saved": "सहेजा गया",
  "card.saveAria": "{title} सहेजें",
  "card.unsaveAria": "{title} को सहेजे गए विज्ञापनों से हटाएँ",

  /* Ad detail actions ---------------------------------------------------- */
  "item.chat": "विक्रेता से चैट करें",
  "item.showPhone": "फ़ोन नंबर देखें",
  "item.share": "शेयर करें",
  "item.shareHeading": "यह विज्ञापन शेयर करें",
  "item.shareWhatsapp": "WhatsApp पर शेयर करें",
  "item.copyLink": "लिंक कॉपी करें",
  "item.copied": "कॉपी हो गया",
  "item.compare": "तुलना करें",
  "item.report": "इस विज्ञापन की शिकायत करें",

  /* Seller --------------------------------------------------------------- */
  "seller.postedBy": "विक्रेता",
  "seller.itemsSold": "बेची गई चीज़ें",
  "seller.replies": "जवाब",
  "seller.business": "कारोबारी विक्रेता",
  "seller.individual": "निजी विक्रेता",
  "seller.joinedThisMonth": "इसी महीने जुड़े",
  "seller.viewProfile": "प्रोफ़ाइल देखें",
  "seller.phoneVerified": "फ़ोन वेरिफ़ाइड",
  "seller.emailVerified": "ईमेल वेरिफ़ाइड",

  /* Safety --------------------------------------------------------------- */
  "safety.heading": "AltF बाज़ार पर सुरक्षित रहें",
  "safety.tip.meet":
    "विक्रेता से दिन के उजाले में किसी सार्वजनिक जगह पर मिलें। महँगी चीज़ के लिए किसी को साथ ले जाएँ।",
  "safety.tip.inspect":
    "पैसे देने से पहले सामान ठीक से जाँच लें। चालू करके देखें, कागज़ात देखें, जल्दबाज़ी न करें।",
  "safety.tip.advance":
    "पहले पैसे कभी न दें — न टोकन, न बुकिंग फ़ीस, न डिलीवरी चार्ज। पैसे तभी दें जब सामान हाथ में लें।",
  "safety.tip.otp":
    "OTP, UPI पिन, कार्ड नंबर या बैंक पासवर्ड किसी को न बताएँ। किसी सच्चे ख़रीदार या विक्रेता को इनकी ज़रूरत नहीं होती।",
  "safety.tip.report":
    "जो विज्ञापन पहले पैसे माँगें, मिलने से मना करें, या आपको किसी दूसरे ऐप पर ले जाएँ — उनकी शिकायत करें।",

  "report.heading": "इस विज्ञापन की शिकायत करें",
  "report.reason.badContent": "आपत्तिजनक या अश्लील",
  "report.reason.fraud": "धोखाधड़ी या ठगी",
  "report.reason.duplicated": "दोहराया गया विज्ञापन",
  "report.reason.sold": "पहले ही बिक चुका",
  "report.reason.other": "कुछ और",
  "report.submit": "शिकायत भेजें",
  "report.cancel": "रद्द करें",

  /* Post-ad wizard ------------------------------------------------------- */
  "post.heading": "विज्ञापन डालें",
  "post.progressAria": "विज्ञापन डालने की प्रगति",
  "post.step.category": "श्रेणी",
  "post.step.category.heading": "आप क्या बेच रहे हैं?",
  "post.step.details": "जानकारी",
  "post.step.details.heading": "अपनी चीज़ के बारे में बताएँ",
  "post.step.photos": "फ़ोटो",
  "post.step.photos.heading": "फ़ोटो जोड़ें",
  "post.step.price": "कीमत",
  "post.step.price.heading": "अपनी कीमत तय करें",
  "post.step.location": "जगह",
  "post.step.location.heading": "यह कहाँ है?",
  "post.step.review": "जाँच",
  "post.step.review.heading": "जाँचें और डालें",

  "post.field.title": "विज्ञापन का शीर्षक",
  "post.field.description": "विवरण",
  "post.field.price": "कीमत",
  "post.field.city": "शहर",
  "post.field.locality": "इलाक़ा",
  "post.field.negotiable": "कीमत में मोल-भाव हो सकता है",
  "post.selectCity": "शहर चुनें",
  "post.selectLocality": "इलाक़ा चुनें",
  "post.chooseCityFirst": "पहले शहर चुनें",
  "post.next": "आगे",
  "post.back": "पीछे",
  "post.publish": "विज्ञापन डालें",
  "post.summary": "विज्ञापन का सार",
  "post.titleAndDescription": "शीर्षक और विवरण",
  "post.preview": "यह कैसा दिखेगा",

  "post.error.category": "आगे बढ़ने के लिए श्रेणी चुनें।",
  "post.error.subcategory": "आगे बढ़ने के लिए उप-श्रेणी चुनें।",
  "post.error.title": "विज्ञापन का शीर्षक ज़रूरी है।",
  "post.error.description": "विवरण ज़रूरी है।",
  "post.error.price": "कीमत डालें। मुफ़्त दे रहे हैं तो 0 डालें।",
  "post.error.priceNegative": "0 या उससे ज़्यादा कीमत डालें।",
  "post.error.city": "वह शहर चुनें जहाँ आपका सामान है।",
  "post.error.locality": "इलाक़ा चुनें, ताकि आस-पास के ख़रीदार इसे ढूँढ सकें।",

  /* Demo honesty note ---------------------------------------------------- */
  "demo.localOnly": "डेमो — आप जो सहेजते या डालते हैं वह सिर्फ़ इसी ब्राउज़र में रहता है।",

  /* Attribute labels ----------------------------------------------------- */
  "attr.ageGroup": "आयु वर्ग",
  "attr.ageYears": "उम्र",
  "attr.atHome": "घर पर उपलब्ध",
  "attr.authenticated": "मूल का प्रमाण उपलब्ध",
  "attr.availableFor": "किसके लिए उपलब्ध",
  "attr.bachelorsAllowed": "बैचलर्स की अनुमति",
  "attr.bathrooms": "बाथरूम",
  "attr.bhk": "बेडरूम",
  "attr.bill": "ओरिजिनल बिल उपलब्ध",
  "attr.boxed": "ओरिजिनल डिब्बा और केबल",
  "attr.brand": "ब्रांड",
  "attr.capacity": "क्षमता",
  "attr.carpetArea": "कारपेट एरिया",
  "attr.collectOnly": "सिर्फ़ ख़ुद लेकर जाना है",
  "attr.condition": "हालत",
  "attr.constructionStatus": "निर्माण की स्थिति",
  "attr.delivery": "डिलीवरी उपलब्ध",
  "attr.deposit": "सिक्योरिटी डिपॉज़िट",
  "attr.doorstep": "घर तक डिलीवरी",
  "attr.engineCc": "इंजन",
  "attr.eventType": "इवेंट का प्रकार",
  "attr.experience": "अनुभव",
  "attr.facing": "दिशा",
  "attr.fuel": "ईंधन",
  "attr.furnishing": "फ़र्निशिंग",
  "attr.gender": "किसके लिए",
  "attr.grade": "रीफ़र्ब ग्रेड",
  "attr.handmade": "हस्तनिर्मित",
  "attr.inspected": "सिर्फ़ जाँचे हुए",
  "attr.installation": "इंस्टॉलेशन शामिल",
  "attr.insurance": "बीमा वैध है",
  "attr.kmDriven": "किलोमीटर चली",
  "attr.language": "भाषा",
  "attr.listedBy": "किसने डाला",
  "attr.listingType": "लिस्टिंग का प्रकार",
  "attr.loadCapacity": "लोड क्षमता",
  "attr.material": "मटीरियल",
  "attr.medium": "माध्यम",
  "attr.organicCertified": "ऑर्गैनिक सर्टिफ़ाइड",
  "attr.owners": "कितने मालिक रहे",
  "attr.parking": "कार पार्किंग",
  "attr.pedigree": "पेडिग्री सर्टिफ़िकेट",
  "attr.permit": "नैशनल परमिट",
  "attr.petAge": "उम्र",
  "attr.platform": "प्लैटफ़ॉर्म",
  "attr.positionType": "पद का प्रकार",
  "attr.powerPhase": "पावर",
  "attr.powerSource": "पावर का स्रोत",
  "attr.ram": "रैम",
  "attr.rateType": "शुल्क",
  "attr.rentalPeriod": "कम से कम अवधि",
  "attr.returnWindow": "7 दिन में वापसी",
  "attr.salaryPeriod": "वेतन की अवधि",
  "attr.sanitised": "पेशेवर तरीक़े से सैनिटाइज़्ड",
  "attr.serviceRadius": "सेवा का दायरा",
  "attr.size": "साइज़",
  "attr.storage": "स्टोरेज",
  "attr.suitableAcreage": "कितने एकड़ के लिए",
  "attr.superBuiltupArea": "सुपर बिल्टअप एरिया",
  "attr.totalFloors": "कुल मंज़िलें",
  "attr.transferable": "आधिकारिक रूप से ट्रांसफ़र हो सकता है",
  "attr.transmission": "ट्रांसमिशन",
  "attr.usageCount": "कितनी बार इस्तेमाल हुआ",
  "attr.usageHours": "अनुमानित इस्तेमाल",
  "attr.vaccinated": "टीका लगा हुआ",
  "attr.warranty": "वारंटी में",
  "attr.warrantyMonths": "वारंटी",
  "attr.workMode": "काम का तरीक़ा",
  "attr.year": "साल",

  /* ---- Wiring wave ------------------------------------------------------ */
  "common.cancel": "रद्द करें",
  "common.close": "बंद करें",
  "common.done": "हो गया",
  "common.clear": "हटाएँ",
  "common.charCounter": "{max} में से {count} अक्षर",
  "common.limitReached": " — सीमा पूरी",

  "section.results": "नतीजे",

  "filter.showAll": "सभी {count} दिखाएँ",
  "filter.showLess": "कम दिखाएँ",
  "filter.searchOptions": "{legend} खोजें",
  "filter.searchOptionsAria": "{legend} के विकल्प खोजें",
  "filter.noOptions": "“{needle}” से मिलता कोई विकल्प नहीं।",
  "filter.noMatchTitle": "{label} — मौजूदा फ़िल्टर में कोई मिलता विज्ञापन नहीं",
  "filter.activeAria": "लगे हुए फ़िल्टर: {count}",
  "filter.clearAllFilters": "सभी फ़िल्टर हटाएँ",
  "filter.showCount": "{count} विज्ञापन दिखाएँ",
  "filter.chip.search": "खोज: {q}",
  "filter.chip.price": "कीमत: {low} – {high}",
  "browse.truncated":
    "कुल {total} में से पहले {shown} विज्ञापन दिख रहे हैं। इस डेमो में फ़िल्टरिंग ब्राउज़र में चलती है, इसलिए सटीक गिनती के लिए शहर या कीमत से दायरा घटाएँ।",

  "compare.inCompare": "तुलना में",
  "compare.add": "{title} को तुलना में जोड़ें",
  "compare.remove": "{title} को तुलना से हटाएँ",
  "compare.full": "तुलना में ज़्यादा से ज़्यादा {limit} विज्ञापन आते हैं। इसे जोड़ने के लिए एक हटाएँ।",

  "offer.make": "ऑफ़र दें",
  "offer.yourOffer": "आपका ऑफ़र",
  "offer.quickPicks": "आम ऑफ़र",
  "offer.messageOptional": "संदेश (वैकल्पिक)",
  "offer.notePlaceholder": "आज ही ले जा सकता हूँ, नक़द दूँगा।",
  "offer.send": "ऑफ़र भेजें",
  "offer.change": "ऑफ़र बदलें",
  "offer.changeIt": "बदलें",
  "offer.withdraw": "वापस लें",
  "offer.youOffered": "आपने {amount} का ऑफ़र दिया",
  "offer.close": "ऑफ़र डायलॉग बंद करें",
  "offer.enterAmount": "आगे बढ़ने के लिए {symbol}0 से ज़्यादा की रक़म डालें।",
  "offer.offering": "{amount} का ऑफ़र। कुछ भी इस ब्राउज़र से बाहर नहीं जाता।",
  "offer.invalid": "0 से ज़्यादा की पूरी संख्या लिखें — कर्सर रक़म वाले खाने में है।",
  "offer.previewEmpty": "रक़म डालें — पूरा आँकड़ा यहीं दिखेगा।",
  "offer.demo.pre": "सिर्फ़ डेमो — यहाँ दिया ऑफ़र ",
  "offer.demo.strong": "किसी को नहीं भेजा जाता",
  "offer.demo.post": "। यह इसी ब्राउज़र में सहेजा जाता है, ताकि आप देख सकें कि मोल-भाव कैसे चलेगा।",

  "item.shareClose": "शेयर के विकल्प बंद करें",
  "item.shareMore": "इस डिवाइस के और ऐप",
  "item.copiedStatus": "लिंक क्लिपबोर्ड पर कॉपी हो गया",
  "item.copyFailed": "कॉपी नहीं हो पाया। नीचे दिख रहा पता चुनकर कॉपी करें।",
  "item.copyBlocked": "इस ब्राउज़र ने क्लिपबोर्ड रोक दिया — ऊपर दिख रहा पता चुनकर ख़ुद कॉपी करें।",
  "item.phoneDemo":
    "डेमो विज्ञापन — यह नंबर प्रोटोटाइप के लिए बनाया गया है और आंशिक रूप से छिपा रहता है। लाइव प्रोडक्ट पर पूरा नंबर तभी दिखेगा जब आप अपना नंबर वेरिफ़ाई कर लेंगे।",

  "report.hint.badContent": "अश्लील, हिंसक, नफ़रत भरा या अन्य आपत्तिजनक कॉन्टेंट।",
  "report.hint.fraud": "पहले पैसे माँगता है, मिलने से मना करता है, या किसी दूसरे ऐप पर ले जाता है।",
  "report.hint.duplicated": "एक ही चीज़ एक से ज़्यादा बार डाली गई है।",
  "report.hint.sold": "चीज़ बिक चुकी है पर विज्ञापन अब भी लगा है।",
  "report.hint.other": "बताएँ कि इस विज्ञापन में क्या गड़बड़ है।",
  "report.close": "शिकायत डायलॉग बंद करें",
  "report.whyHeading": "आप इसकी शिकायत क्यों कर रहे हैं?",
  "report.whatWrong": "इस विज्ञापन में क्या गड़बड़ है?",
  "report.reasonRecorded": "कारण दर्ज: {label}",
  "report.reportingAs": "“{label}” के तौर पर शिकायत हो रही है।",
  "report.pickReason": "भेजने के लिए ऊपर कोई कारण चुनें।",
  "report.chooseFirst": "पहले पाँच में से एक कारण चुनें — कर्सर सूची पर पहुँचा दिया गया है।",
  "report.detailsPlaceholder": "वैकल्पिक — एक-दो वाक्य काफ़ी हैं।",
  "report.demo.pre": "सिर्फ़ डेमो — यह शिकायत ",
  "report.demo.strong": "कहीं नहीं भेजी जाती",
  "report.demo.post": "। इस प्रोटोटाइप के पीछे कोई मॉडरेशन बैकएंड नहीं है।",

  "search.saveSearch": "यह खोज सहेजें",
  "search.searchSaved": "खोज सहेज ली गई",
  "search.noCityMatch": "इस नाम का कोई शहर नहीं मिला।",
  "recent.clearAria": "हाल में देखे गए विज्ञापन हटाएँ",
  "recent.localNote": "सिर्फ़ इसी ब्राउज़र में रहता है — किसी अकाउंट पर कुछ नहीं जाता।",

  "empty.savedSearches.message":
    "किसी श्रेणी को अपनी पसंद से फ़िल्टर करें — ब्रांड, शहर, कीमत — फिर “यह खोज सहेजें” पर टैप करें। वह यहाँ मिलेगी।",
  "empty.compare.message":
    "किसी भी विज्ञापन पर ‘तुलना’ टैप करें और उसे तीन और विज्ञापनों के साथ आमने-सामने देखें — कीमत, किलोमीटर, साल और हर स्पेक।",
  "empty.map.title": "नक़्शे के इस हिस्से में कुछ नहीं",
  "empty.browse": "बाज़ार देखें",
  "empty.myAds.postCta": "विज्ञापन डालें",
  "empty.myAds.filteredMessage": "अपने बाक़ी विज्ञापन देखने के लिए ऊपर का फ़िल्टर बदलें।",
  "empty.myAds.showAll": "सभी विज्ञापन दिखाएँ",
  "map.keyword": "कीवर्ड",
  "map.viewToggle": "नक़्शा या सूची चुनें",
  "map.adsInView": "दिख रहे विज्ञापन",
  "map.loading": "नक़्शा लोड हो रहा है…",
  "map.apply": "लागू करें",
  "map.map": "नक़्शा",
  "map.list": "सूची",
  "map.minRupee": "कम से कम {symbol}",
  "map.maxRupee": "ज़्यादा से ज़्यादा {symbol}",
  "empty.map.message": "विज्ञापन देखने के लिए नक़्शा खिसकाएँ या ज़ूम आउट करें, या ऊपर के फ़िल्टर ढीले करें।",

  "post.stepAria": "{total} में से चरण {n}: {label}",
  "post.categoryIntro":
    "वही श्रेणी चुनें जो सबसे सही बैठे — इसी से तय होता है कि ख़रीदार किन जानकारियों पर फ़िल्टर कर पाएँगे।",
  "post.categoriesAria": "श्रेणियाँ",
  "post.subcategoriesAria": "उप-श्रेणियाँ",
  "post.subcategoryIn": "{category} में उप-श्रेणी",
  "post.selectAttr": "{label} चुनें",
  "post.categoryDetails": "{category} की जानकारी",
  "post.detailsIntro":
    "{category} में ख़रीदार इन्हीं फ़ील्ड पर फ़िल्टर करते हैं। जो पता है वह भरें — सिर्फ़ * लगे फ़ील्ड ज़रूरी हैं।",
  "post.titlePlaceholder": "जैसे: {example}, बढ़िया हालत में",
  "post.descPlaceholder": "हालत, उम्र, साथ में क्या मिलेगा, बेचने की वजह, और ख़रीदार कब देख सकते हैं।",
  "post.dragPhotos": "फ़ोटो यहाँ खींचकर छोड़ें, या अपने डिवाइस से चुनें",
  "post.upTo": "ज़्यादा से ज़्यादा {max} फ़ोटो। {count} जुड़ चुकी हैं।",
  "post.choosePhotos": "फ़ोटो चुनें",
  "post.choosePhotosAria": "अपने विज्ञापन में जोड़ने के लिए फ़ोटो चुनें",
  "post.coverPhoto": "कवर फ़ोटो",
  "post.movePhotoEarlier": "{name} को पहले लाएँ",
  "post.movePhotoLater": "{name} को बाद में ले जाएँ",
  "post.removePhoto": "{name} हटाएँ",
  "post.photosLocal":
    "कुछ भी अपलोड नहीं होता। फ़ोटो सिर्फ़ इसी ब्राउज़र टैब में रहती हैं — मेमोरी से दिखाई जाती हैं और टैब बंद करते ही मिट जाती हैं।",
  "post.photosKeptLocal":
    "कुछ भी अपलोड नहीं होता। पूरे आकार की फ़ोटो इसी टैब की मेमोरी से दिखती हैं; पोस्ट करने पर छोटे थंबनेल इसी ब्राउज़र में सहेज लिए जाते हैं, ताकि आपके विज्ञापन की तस्वीरें बनी रहें।",
  "post.photosUnpersisted":
    "यह ब्राउज़र अभी डेटा सहेज नहीं पा रहा (स्टोरेज भरा या ब्लॉक हो सकता है), इसलिए हो सकता है कि रीलोड के बाद यह विज्ञापन और इसकी फ़ोटो न बचें।",
  "post.photosDropped":
    "इस ब्राउज़र का लोकल स्टोरेज भर गया है, इसलिए विज्ञापन बिना फ़ोटो के सहेजा गया।",
  "post.photosUnreadable":
    "विज्ञापन बिना फ़ोटो के पोस्ट हुआ — {total} में से कोई भी इस ब्राउज़र में सहेजी नहीं जा सकी।",
  "post.photosSaved": "{total} में से {saved} फ़ोटो थंबनेल के रूप में इसी ब्राउज़र में सहेज ली गईं।",
  "post.photosBudgetTail": "बाक़ी को लोकल स्टोरेज हल्का रखने के लिए छोड़ दिया गया।",
  "post.photosShrunk": "उपलब्ध स्टोरेज में समाने के लिए उन्हें और छोटा किया गया।",
  "post.buyersWillSee": "ख़रीदारों को दिखेगा:",
  "post.freeFixed": "मुफ़्त वाले विज्ञापन हमेशा {symbol}0 के होते हैं, इसलिए कीमत तय है।",
  "post.sellsFor": "बाज़ार पर {category} किस भाव बिकता है",
  "post.medianPrice": "मीडियन कीमत",
  "post.mostAdsBetween": "ज़्यादातर विज्ञापन इस बीच",
  "post.basedOn": "आधार",
  "post.liveAds": "{count} लाइव विज्ञापन",
  "post.aboveRange":
    "यह {category} की आम रेंज से ऊपर है। हालत असाधारण न हो तो कम पूछताछ की उम्मीद रखें।",
  "post.belowRange": "आम रेंज से कम कीमत — यह जल्दी बिक जाना चाहिए।",
  "post.noPriceHistory":
    "इस श्रेणी का कोई कीमत इतिहास अभी नहीं है, इसलिए हालत और आस-पास के मिलते-जुलते विज्ञापनों के भाव देखकर कीमत रखें।",
  "post.localityNote":
    "ख़रीदार सबसे ज़्यादा इलाक़े से फ़िल्टर करते हैं। सटीक मोहल्ला बताएँगे तो मुलाक़ातें होंगी; पूरे शहर का विज्ञापन सिर्फ़ सवाल लाएगा।",
  "post.demoBanner":
    "यह एक डेमो मार्केटप्लेस है। यहाँ डाले विज्ञापन सिर्फ़ इसी ब्राउज़र में सहेजे जाते हैं, कोई फ़ोटो कहीं अपलोड नहीं होती, और कोई ख़रीदार इन्हें कभी नहीं देखेगा।",
  "post.negotiableTag": " · मोल-भाव संभव",
  "post.today": "आज",
  "post.yes": "हाँ",
  "post.previewNote": "खोज नतीजों और श्रेणी ग्रिड में ख़रीदारों को यही कार्ड दिखता है।",
  "post.liveHeading": "आपका विज्ञापन इस ब्राउज़र में लाइव है",
  "post.savedTail":
    "मेरे विज्ञापनों में {price} पर, {place} में सहेज लिया गया। कुछ भी सर्वर पर अपलोड नहीं हुआ — साइट डेटा हटाते ही यह मिट जाएगा।",
  "post.goToMyAds": "मेरे विज्ञापनों पर जाएँ",
  "post.postAnother": "एक और विज्ञापन डालें",
  "post.backToBazaar": "वापस बाज़ार पर",
  "post.ready": "अगला चरण शुरू करने के लिए तैयार।",
  "post.allGood": "सब ठीक है — पोस्ट करने पर विज्ञापन इसी ब्राउज़र में सहेज लिया जाएगा।",
  "post.error.titleMin": "कम से कम {min} अक्षर लिखें, ताकि ख़रीदार समझ सकें कि यह क्या है।",
  "post.error.titleMax": "शीर्षक ज़्यादा से ज़्यादा {max} अक्षरों का हो सकता है।",
  "post.error.descMin": "कम से कम {min} अक्षरों में जानकारी दें — हालत, उम्र, बेचने की वजह।",
  "post.error.descMax": "विवरण ज़्यादा से ज़्यादा {max} अक्षरों का हो सकता है।",
  "post.error.attrRequired": "{label} ज़रूरी है।",
  "post.error.attrNumber": "{label} एक संख्या होनी चाहिए।",
  "post.error.attrRange": "{label} {min} और {max}{unit} के बीच होनी चाहिए।",
  "post.error.priceMax": "{max} से ऊपर की कीमतों के लिए बिज़नेस अकाउंट चाहिए।",
  "post.error.photos": "कम से कम एक फ़ोटो जोड़ें — फ़ोटो वाले विज्ञापनों को कहीं ज़्यादा जवाब मिलते हैं।",
  "post.error.imagesOnly": "सिर्फ़ इमेज फ़ाइलें जोड़ी जा सकती हैं।",
  "post.error.tooManyPhotos": "ज़्यादा से ज़्यादा {max} फ़ोटो जोड़ सकते हैं, इसलिए बाक़ी छोड़ दी गईं।",

  /* Category names — all 24. `category.<slug>`. -------------------------- */
  "category.cars": "कार",
  "category.properties": "प्रॉपर्टी",
  "category.mobiles": "मोबाइल",
  "category.bikes": "बाइक",
  "category.electronics-appliances": "इलेक्ट्रॉनिक्स और उपकरण",
  "category.jobs": "नौकरियाँ",
  "category.commercial-vehicles-spares": "कमर्शियल वाहन और पुर्ज़े",
  "category.furniture": "फ़र्नीचर",
  "category.fashion": "फ़ैशन",
  "category.books-sports-hobbies": "किताबें, खेल और शौक़",
  "category.pets": "पालतू जानवर",
  "category.services": "सेवाएँ",
  "category.kids-baby": "बच्चे और शिशु",
  "category.gaming": "गेमिंग और कंसोल",
  "category.health-wellness": "सेहत और फ़िटनेस",
  "category.industrial-business": "औद्योगिक और कारोबारी",
  "category.agriculture-farming": "खेती-किसानी",
  "category.art-collectibles": "कला और संग्रह",
  "category.tools-hardware": "औज़ार और हार्डवेयर",
  "category.events-tickets": "इवेंट और टिकट",
  "category.rentals": "किराए पर लें",
  "category.free-giveaway": "मुफ़्त में लें",
  "category.refurbished": "रीफ़र्बिश्ड स्टोर",
  "category.travel-outdoor": "सफ़र और आउटडोर",

  /* Sub-category names. `subcategory.<slug>` — slugs are unique across all
     24 categories (verified), so a flat key is safe. --------------------- */

  // cars
  "subcategory.hatchback": "हैचबैक",
  "subcategory.sedan": "सेडान",
  "subcategory.suv": "एसयूवी",
  "subcategory.muv-mpv": "MUV और MPV",
  "subcategory.luxury-cars": "लग्ज़री कार",
  "subcategory.electric-cars": "इलेक्ट्रिक कार",
  "subcategory.vintage-classic-cars": "विंटेज और क्लासिक कार",
  "subcategory.car-accessories": "कार एक्सेसरीज़",
  "subcategory.other-vehicles": "अन्य वाहन",

  // properties
  "subcategory.for-sale-houses-apartments": "बिक्री: घर और फ़्लैट",
  "subcategory.for-sale-new-projects": "बिक्री: नए प्रोजेक्ट और प्रॉपर्टी",
  "subcategory.for-rent-houses-apartments": "किराया: घर और फ़्लैट",
  "subcategory.lands-plots": "ज़मीन और प्लॉट",
  "subcategory.for-rent-shops-offices": "किराया: दुकान और ऑफ़िस",
  "subcategory.for-sale-shops-offices": "बिक्री: दुकान और ऑफ़िस",
  "subcategory.pg-guest-houses": "पीजी और गेस्ट हाउस",
  "subcategory.farmhouses-villas": "फ़ार्महाउस और विला",
  "subcategory.warehouses-godowns": "गोदाम और वेयरहाउस",

  // mobiles
  "subcategory.mobile-phones": "मोबाइल फ़ोन",
  "subcategory.accessories": "एक्सेसरीज़",
  "subcategory.tablets": "टैबलेट",
  "subcategory.smart-watches": "स्मार्ट वॉच",
  "subcategory.mobile-repair-services": "मोबाइल रिपेयर और सेवाएँ",

  // bikes
  "subcategory.motorcycles": "मोटरसाइकिल",
  "subcategory.scooters": "स्कूटर",
  "subcategory.electric-two-wheelers": "इलेक्ट्रिक टू-व्हीलर",
  "subcategory.bicycles": "साइकिल",
  "subcategory.spare-parts": "स्पेयर पार्ट्स",

  // electronics-appliances
  "subcategory.tvs-video-audio": "टीवी, वीडियो और ऑडियो",
  "subcategory.computers-laptops": "कंप्यूटर और लैपटॉप",
  "subcategory.acs": "एसी",
  "subcategory.fridges": "फ़्रिज",
  "subcategory.washing-machines": "वॉशिंग मशीन",
  "subcategory.kitchen-appliances": "किचन और अन्य उपकरण",
  "subcategory.cameras-lenses": "कैमरा और लेंस",
  "subcategory.computer-accessories": "कंप्यूटर एक्सेसरीज़",
  "subcategory.hard-disks-printers-monitors": "हार्ड डिस्क, प्रिंटर और मॉनिटर",
  "subcategory.games-entertainment": "गेम्स और मनोरंजन",

  // jobs
  "subcategory.data-entry-back-office": "डेटा एंट्री और बैक ऑफ़िस",
  "subcategory.sales-marketing": "सेल्स और मार्केटिंग",
  "subcategory.bpo-telecaller": "बीपीओ और टेलीकॉलर",
  "subcategory.driver": "ड्राइवर",
  "subcategory.office-assistant": "ऑफ़िस असिस्टेंट",
  "subcategory.delivery-collection": "डिलीवरी और कलेक्शन",
  "subcategory.teacher": "शिक्षक",
  "subcategory.cook": "रसोइया",
  "subcategory.receptionist-front-office": "रिसेप्शनिस्ट और फ़्रंट ऑफ़िस",
  "subcategory.operator-technician": "ऑपरेटर और टेक्नीशियन",
  "subcategory.it-engineer-developer": "आईटी इंजीनियर और डेवलपर",
  "subcategory.hotel-travel-executive": "होटल और ट्रैवल एग्ज़ीक्यूटिव",
  "subcategory.accountant": "अकाउंटेंट",
  "subcategory.designer": "डिज़ाइनर",
  "subcategory.security-guard": "सिक्योरिटी गार्ड",
  "subcategory.housekeeping": "हाउसकीपिंग",
  "subcategory.other-jobs": "अन्य नौकरियाँ",

  // commercial-vehicles-spares
  "subcategory.commercial-heavy-vehicles": "कमर्शियल और भारी वाहन",
  "subcategory.vehicle-spare-parts": "वाहन के स्पेयर पार्ट्स",
  "subcategory.commercial-heavy-machinery": "कमर्शियल और भारी मशीनरी",
  "subcategory.tractors": "ट्रैक्टर",
  "subcategory.auto-rickshaws-taxis": "ऑटो रिक्शा और टैक्सी",
  "subcategory.buses-vans": "बस और वैन",

  // furniture
  "subcategory.sofa-dining": "सोफ़ा और डाइनिंग",
  "subcategory.beds-wardrobes": "बेड और अलमारी",
  "subcategory.home-decor-garden": "घर की सजावट और बग़ीचा",
  "subcategory.kids-furniture": "बच्चों का फ़र्नीचर",
  "subcategory.office-furniture": "ऑफ़िस फ़र्नीचर",
  "subcategory.mattresses": "गद्दे",
  "subcategory.curtains-furnishing": "पर्दे और फ़र्निशिंग",
  "subcategory.other-household-items": "घर का अन्य सामान",

  // fashion
  "subcategory.mens-fashion": "पुरुषों का फ़ैशन",
  "subcategory.womens-fashion": "महिलाओं का फ़ैशन",
  "subcategory.kids-fashion": "बच्चों का फ़ैशन",
  "subcategory.footwear": "जूते-चप्पल",
  "subcategory.watches": "घड़ियाँ",
  "subcategory.bags-luggage": "बैग और सामान",
  "subcategory.jewellery": "ज्वेलरी",
  "subcategory.ethnic-wear": "एथनिक और शादी के कपड़े",

  // books-sports-hobbies
  "subcategory.books": "किताबें",
  "subcategory.gym-fitness": "जिम और फ़िटनेस",
  "subcategory.musical-instruments": "वाद्य यंत्र",
  "subcategory.sports-equipment": "खेल का सामान",
  "subcategory.other-hobbies": "अन्य शौक़",
  "subcategory.board-games-puzzles": "बोर्ड गेम और पहेलियाँ",
  "subcategory.cycling-gear": "साइकिलिंग का सामान",

  // pets
  "subcategory.fishes-aquarium": "मछलियाँ और एक्वेरियम",
  "subcategory.pet-food-accessories": "पेट फ़ूड और एक्सेसरीज़",
  "subcategory.dogs": "कुत्ते",
  "subcategory.cats": "बिल्लियाँ",
  "subcategory.birds": "पक्षी",
  "subcategory.other-pets": "अन्य पालतू जानवर",

  // services
  "subcategory.education-classes": "शिक्षा और क्लासेज़",
  "subcategory.tours-travel": "टूर और ट्रैवल",
  "subcategory.electronics-repair": "इलेक्ट्रॉनिक्स रिपेयर और सेवाएँ",
  "subcategory.health-beauty": "सेहत और सौंदर्य",
  "subcategory.home-renovation": "घर की मरम्मत और रेनोवेशन",
  "subcategory.cleaning-pest-control": "साफ़-सफ़ाई और पेस्ट कंट्रोल",
  "subcategory.legal-documentation": "कानूनी और दस्तावेज़ी काम",
  "subcategory.packers-movers": "पैकर्स और मूवर्स",
  "subcategory.event-services": "इवेंट सेवाएँ",
  "subcategory.driver-chauffeur": "ड्राइवर और शोफ़र",
  "subcategory.other-services": "अन्य सेवाएँ",

  // kids-baby
  "subcategory.prams-strollers": "प्रैम और स्ट्रोलर",
  "subcategory.cots-cribs": "पालना और कॉट",
  "subcategory.toys-games": "खिलौने और गेम्स",
  "subcategory.kids-clothing": "बच्चों के कपड़े",
  "subcategory.school-supplies": "स्कूल का सामान",
  "subcategory.car-seats-carriers": "कार सीट और कैरियर",
  "subcategory.feeding-nursery": "फ़ीडिंग और नर्सरी",

  // gaming
  "subcategory.consoles": "कंसोल",
  "subcategory.gaming-pcs": "गेमिंग पीसी और रिग",
  "subcategory.graphics-cards": "ग्राफ़िक्स कार्ड",
  "subcategory.games-titles": "गेम्स और टाइटल",
  "subcategory.controllers-accessories": "कंट्रोलर और एक्सेसरीज़",
  "subcategory.vr-headsets": "वीआर हेडसेट",
  "subcategory.streaming-gear": "स्ट्रीमिंग का सामान",

  // health-wellness
  "subcategory.home-gym": "होम जिम का सामान",
  "subcategory.treadmills-cardio": "ट्रेडमिल और कार्डियो",
  "subcategory.mobility-aids": "चलने-फिरने के सहारे",
  "subcategory.medical-devices": "मेडिकल डिवाइस",
  "subcategory.yoga-recovery": "योग और रिकवरी",
  "subcategory.supplements-nutrition": "सप्लीमेंट और पोषण",

  // industrial-business
  "subcategory.restaurant-kitchen": "रेस्टोरेंट और किचन उपकरण",
  "subcategory.workshop-machinery": "वर्कशॉप मशीनरी",
  "subcategory.retail-shop-fittings": "दुकान की फ़िटिंग",
  "subcategory.printing-packaging": "प्रिंटिंग और पैकेजिंग",
  "subcategory.generators-power": "जेनरेटर और पावर",
  "subcategory.business-for-sale": "चलता कारोबार बिक्री के लिए",
  "subcategory.medical-lab-equipment": "मेडिकल और लैब उपकरण",

  // agriculture-farming
  "subcategory.farm-implements": "खेती के औज़ार",
  "subcategory.irrigation-pumps": "सिंचाई और पंप",
  "subcategory.seeds-saplings": "बीज और पौधे",
  "subcategory.livestock-dairy": "पशुधन और डेयरी",
  "subcategory.harvest-storage": "फ़सल और भंडारण",
  "subcategory.poultry": "मुर्गीपालन",

  // art-collectibles
  "subcategory.paintings-originals": "पेंटिंग और मूल कलाकृतियाँ",
  "subcategory.prints-posters": "प्रिंट और पोस्टर",
  "subcategory.sculptures-handicraft": "मूर्तियाँ और हस्तशिल्प",
  "subcategory.coins-currency": "सिक्के और नोट",
  "subcategory.stamps-philately": "डाक टिकट",
  "subcategory.memorabilia": "यादगार चीज़ें",
  "subcategory.antiques": "पुरानी दुर्लभ चीज़ें",

  // tools-hardware
  "subcategory.power-tools": "पावर टूल्स",
  "subcategory.hand-tools": "हाथ के औज़ार",
  "subcategory.ladders-scaffolding": "सीढ़ी और स्कैफ़ोल्डिंग",
  "subcategory.building-material": "निर्माण सामग्री",
  "subcategory.plumbing-electrical": "प्लंबिंग और बिजली का सामान",
  "subcategory.safety-gear": "सुरक्षा उपकरण",

  // events-tickets
  "subcategory.wedding-decor": "शादी की सजावट",
  "subcategory.sound-lighting": "साउंड और लाइटिंग",
  "subcategory.tents-marquees": "टेंट और शामियाना",
  "subcategory.event-tickets": "इवेंट टिकट",
  "subcategory.catering-equipment": "कैटरिंग का सामान",
  "subcategory.costumes-props": "कॉस्ट्यूम और प्रॉप्स",

  // rentals
  "subcategory.cameras-drones": "कैमरा और ड्रोन",
  "subcategory.party-event-gear": "पार्टी और इवेंट का सामान",
  "subcategory.tools-machinery-rental": "औज़ार और मशीनरी",
  "subcategory.appliances-rental": "उपकरण",
  "subcategory.furniture-rental": "फ़र्नीचर",
  "subcategory.vehicles-rental": "वाहन",

  // free-giveaway
  "subcategory.furniture-giveaway": "फ़र्नीचर",
  "subcategory.appliances-giveaway": "उपकरण",
  "subcategory.books-giveaway": "किताबें और पढ़ाई का सामान",
  "subcategory.building-scrap": "निर्माण सामग्री और स्क्रैप",
  "subcategory.plants-cuttings": "पौधे और कलम",
  "subcategory.misc-giveaway": "बाक़ी सब कुछ",

  // refurbished
  "subcategory.refurbished-phones": "रीफ़र्बिश्ड फ़ोन",
  "subcategory.refurbished-laptops": "रीफ़र्बिश्ड लैपटॉप",
  "subcategory.refurbished-appliances": "रीफ़र्बिश्ड उपकरण",
  "subcategory.refurbished-audio": "रीफ़र्बिश्ड ऑडियो",
  "subcategory.open-box": "ओपन बॉक्स डील",

  // travel-outdoor
  "subcategory.tents-camping": "टेंट और कैंपिंग",
  "subcategory.trekking-backpacks": "ट्रेकिंग और बैकपैक",
  "subcategory.travel-luggage": "ट्रैवल लगेज",
  "subcategory.outdoor-cooking": "आउटडोर कुकिंग",
  "subcategory.water-sports": "वॉटर स्पोर्ट्स",
  "subcategory.climbing-gear": "क्लाइम्बिंग का सामान",
};

export const STRINGS = { en, hi };

/* -------------------------------------------------------------------------
   Resolution
   ---------------------------------------------------------------------- */

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * `"{total} में से {first}"` → filled. An unknown placeholder is left as-is
 * rather than blanked, so a wiring mistake is visible in review instead of
 * silently deleting half a sentence.
 */
function interpolate(text, params) {
  return text.replace(PLACEHOLDER, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
  );
}

/**
 * Resolve one id.
 *
 * Order: requested locale → `en` → caller-supplied fallback → `""`. A raw dot
 * id can therefore never reach the screen, which is the failure mode that
 * makes half-finished i18n look broken rather than merely untranslated.
 *
 * @param {string} locale
 * @param {string} id
 * @param {string|Record<string, unknown>} [fallbackOrParams] plain string
 *   fallback (used for taxonomy names, whose English lives in the data layer)
 *   or the interpolation params
 * @param {Record<string, unknown>} [maybeParams]
 * @returns {string}
 */
export function translate(locale, id, fallbackOrParams, maybeParams) {
  const fallbackIsParams = fallbackOrParams !== null && typeof fallbackOrParams === "object";
  const fallback = fallbackIsParams ? undefined : fallbackOrParams;
  const params = fallbackIsParams ? fallbackOrParams : maybeParams;

  const table = STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
  let text = table[id];
  if (typeof text !== "string") text = STRINGS[DEFAULT_LOCALE][id];
  if (typeof text !== "string") text = typeof fallback === "string" ? fallback : "";

  return params ? interpolate(text, params) : text;
}

/**
 * `"hi"` when this id genuinely resolved to Hindi, otherwise `undefined`.
 *
 * Components spread this onto `lang={…}` so the attribute marks only text that
 * is actually Devanagari. Tagging an English fallback as `lang="hi"` makes a
 * screen reader read English words with Hindi phonology — worse than no
 * attribute at all.
 */
export function langForId(locale, id) {
  if (locale === DEFAULT_LOCALE) return undefined;
  return typeof STRINGS[locale]?.[id] === "string" ? locale : undefined;
}

/**
 * A bound set of helpers for one locale. Cheap to build (it closes over the
 * locale and nothing else), so callers can memoise it per render.
 *
 * `categoryName` / `subcategoryName` take the English name straight from
 * `data/categories.js` as the fallback — the data layer stays the single
 * source of truth for English, and an untranslated slug degrades to the real
 * English name rather than to a key or an empty tile.
 */
export function createTranslator(locale) {
  const active = isLocale(locale) ? locale : DEFAULT_LOCALE;

  const t = (id, fallbackOrParams, params) =>
    translate(active, id, fallbackOrParams, params);

  return {
    locale: active,
    isHindi: active === "hi",
    htmlLang: LOCALE_HTML_LANG[active],
    t,
    /** `lang` attribute value for an id, or undefined. Spread, don't assign. */
    langOf: (id) => langForId(active, id),
    categoryName: (slug, englishName) => translate(active, `category.${slug}`, englishName),
    subcategoryName: (slug, englishName) =>
      translate(active, `subcategory.${slug}`, englishName),
    attributeLabel: (key, englishLabel) => translate(active, `attr.${key}`, englishLabel),
    langOfCategory: (slug) => langForId(active, `category.${slug}`),
    langOfSubcategory: (slug) => langForId(active, `subcategory.${slug}`),
  };
}

/** Coverage figures, so a report can quote a real number instead of a guess. */
export function localeCoverage(locale = "hi") {
  const table = STRINGS[locale] || {};
  const ids = Object.keys(table);
  const count = (prefix) => ids.filter((id) => id.startsWith(prefix)).length;
  return {
    total: ids.length,
    untranslated: Object.keys(en).filter((id) => typeof table[id] !== "string"),
    categories: count("category."),
    subcategories: count("subcategory."),
    attributes: count("attr."),
    interface: ids.length - count("category.") - count("subcategory."),
  };
}
