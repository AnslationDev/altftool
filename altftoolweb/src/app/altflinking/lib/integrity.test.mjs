import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const altfRoot = fileURLToPath(new URL("../", import.meta.url));
const appRoot = fileURLToPath(new URL("../../", import.meta.url));

function read(relativePath) {
  return readFileSync(`${altfRoot}/${relativePath}`, "utf8");
}

test("order clients identify the persisted listing and never supply a client price", () => {
  const pageView = read("PageView.jsx");
  const preview = read("components/marketplace/QuickPreviewDrawer.jsx");
  const clientOrderSources = `${pageView}\n${preview}`;

  assert.match(clientOrderSources, /listingId:/);
  assert.doesNotMatch(clientOrderSources, /websiteId\s*:/);
  assert.doesNotMatch(clientOrderSources, /\bprice\s*:/);
});

test("production UI has no local mutation or mock marketplace fallback", () => {
  const pageView = read("PageView.jsx");
  const firebaseService = read("services/firebaseService.js");

  assert.doesNotMatch(pageView, /firebase(?:CreateOrder|SubmitWebsite|CreateCampaign|UpdateOrder)/);
  assert.doesNotMatch(firebaseService, /mockMarketplaceData|localStorage.*(?:order|listing|campaign)/is);
  assert.equal(existsSync(`${altfRoot}/data/mockMarketplaceData.js`), false);
});

test("server derives the exact order-type price and validates listing prices", () => {
  const orderRoute = readFileSync(`${appRoot}/api/altflinking/orders/route.js`, "utf8");
  const listingRoute = readFileSync(`${appRoot}/api/altflinking/listings/route.js`, "utf8");
  const listingUpdateRoute = readFileSync(`${appRoot}/api/altflinking/listings/[id]/route.js`, "utf8");

  assert.match(orderRoute, /resolveOrderPrice\(listing, body\.type\)/);
  assert.match(orderRoute, /if \(price === null\)/);
  assert.doesNotMatch(orderRoute, /body\.price/);
  assert.match(listingRoute, /validateListingPrices\(body\.prices\)/);
  assert.match(listingUpdateRoute, /validateListingPrices\(/);
});

test("active AltFLinking surfaces exclude retired fabricated claims", () => {
  const activeSources = [
    "PageView.jsx",
    "page.jsx",
    "components/buyer/BuyerDashboard.jsx",
    "components/buyer/DisputeResolutionModal.jsx",
    "components/marketplace/CartCheckoutDrawer.jsx",
    "components/marketplace/GuestPostsDirectoryView.jsx",
    "components/navigation/AppSidebar.jsx",
    "components/navigation/SearchModal.jsx",
    "components/navigation/TopHeader.jsx",
    "components/publisher/PublisherDashboard.jsx",
    "components/landing/ContactUsSection.jsx",
    "components/landing/EnterpriseFooter.jsx",
    "components/landing/FeatureHighlights.jsx",
    "components/landing/FinalCtaBanner.jsx",
    "components/landing/PlatformArchitectureShowcase.jsx",
    "components/landing/PricingPreview.jsx",
    "components/landing/WhyChooseAltF.jsx",
  ].map(read).join("\n");

  assert.doesNotMatch(
    activeSources,
    /1,400\+|1,420\+?|500K\+|100% Escrow|Protected via Escrow|Escrow Payment|24\/7|Under 2 Hours|Guaranteed Google|Google Index Guarantee|\$1,240|TechCrunch|Forbes|Business Insider|0% commission/i
  );
});
