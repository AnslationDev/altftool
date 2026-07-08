# ALTFTool — Ad Banner Sizing & Device Guide

**For:** Admin / Super-Admin creating banners in the Ads section
**Purpose:** Exact upload size for every placement + how to make one banner render crisply on phone, laptop and desktop.
**Source of truth:** `altftoolwebadmin/src/config/placements.js` (each placement's `minSpec`) and the web render components in `altftoolweb/src/ads/layouts/*`.

---

## 1. Quick answer — what size to upload

Every placement in the admin already has a **defined target size** (`minSpec` in `placements.js`). Upload at that exact aspect ratio, or at **2× that size** for retina/desktop sharpness. Keep it **under 2 MB**, format **JPG / PNG / WebP**.

| Ad placement (admin label) | Upload size (min) | Aspect ratio | Recommended 2× upload |
|---|---|---|---|
| **Tools Listing** | 800 × 440 | ~1.8 : 1 (landscape) | 1600 × 880 |
| **Tool Detail – Left** | 320 × 1200 | portrait (tall) | 640 × 2400 |
| **Tool Detail – Right** | 320 × 1200 | portrait (tall) | 640 × 2400 |
| **Tool Detail – Bottom** | 1200 × 400 | 3 : 1 (wide banner) | 2400 × 800 |
| **Games Listing** | 800 × 600 | 4 : 3 | 1600 × 1200 |
| **Extensions Listing** | 900 × 600 | 3 : 2 | 1800 × 1200 |
| **News Feed** | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **News Side Ads** | 320 × 1200 | portrait (tall) | 640 × 2400 |
| **Categories Left** (BuySmart) | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Categories Right** (BuySmart) | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Trending Section** | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Blog List** | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Blog Detail** | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Academy** | 1200 × 800 | 3 : 2 | 2400 × 1600 |
| **Setting Support** | 1200 × 800 | 3 : 2 | 2400 × 1600 |

**File rules (enforced by the upload modal):** max **2 MB**, image only, formats **JPG / PNG / WebP**. WebP gives the best quality-per-KB — prefer it.

---

## 2. How ads currently render (why the aspect ratio matters)

The site does **not** show the banner at the pixel size you upload. Each placement drops the image into a **fixed-shape box** and scales the image to fill it. The box shape is what your artwork must match — if the ratio is wrong, the image gets **cropped or stretched**. This is the single most important thing for the team to understand.

Three render behaviours are in use:

**a) Sidebars — `object-contain` (safe, no crop).**
Tool Detail Left/Right and News Side Ads use a tall column that fits the image by height and keeps the whole picture visible. Portrait **320 × 1200** artwork fits perfectly. Nothing is cut — but if your art is the wrong shape it will show empty space on the sides.

**b) Cards & banners — fill a fixed-height box (crops edges).**
Tools Listing renders in a **220 px-tall** card; Tool Detail Bottom in a full-width **200 px** strip; News Feed in a **400 px** box; Games/Blog/Academy/BuySmart in their card boxes. The image is scaled to cover the box, so **anything outside the box shape is cropped**. Keep logos, text and the call-to-action **in the centre with a safe margin** so nothing important is lost on any screen.

**c) Blog Detail — `w-full h-auto` (fully fluid).**
This one keeps your exact aspect ratio and scales width to the container — the most forgiving placement.

### Why it already works on phone, laptop and desktop
The boxes are **width-fluid** (`w-full`) with **fixed heights**, so the same banner reflows to every screen automatically. You do **not** need separate phone/desktop files. You need **one correctly-shaped, high-resolution image**. The width shrinks on a phone and grows on desktop; the height stays constant, so a wide banner (Tool Detail Bottom, 3:1) will show more side-crop on a narrow phone. That's why centre-safe design matters.

---

## 3. Design rules for the creative team

1. **Match the aspect ratio exactly** from the table above — this prevents cropping/stretching. Ratio matters more than exact pixels.
2. **Upload at 2×** the min size so it stays sharp on retina laptops and large desktops.
3. **Safe zone:** keep logo, headline and CTA within the centre ~80%. Leave ~10% margin on all sides — edges may be cropped on phones.
4. **No tiny text.** On a phone the banner is physically small; use large, high-contrast type.
5. **Export as WebP**, quality ~80, and confirm the file is **under 2 MB**.
6. **Portrait placements (320×1200)** are tall skyscrapers — design them vertically, not as a landscape image squeezed in.
7. **Wide banners (3:1, Tool Detail Bottom)** — put everything dead-centre; the far left/right will crop on small screens.

---

## 4. Known issues to fix in code (so banners display 100% correctly)

While reading the code I found three defects that make banners look worse than they should. Recommend the dev team fix these:

1. **Upload modal shows "— × —px" instead of the size.**
   `CreateAdModal.jsx` reads `placement?.recommended?.width/height`, but `placements.js` defines the size under **`minSpec`**, not `recommended`. So the "Recommended size" line is blank for every placement and the team gets no guidance in the UI. **Fix:** read from `minSpec` (or add a `recommended` field), and show the exact px + ratio in the modal.

2. **Invalid CSS class `object-fit` used in several layouts.**
   `AdBottomBanner.jsx`, `AdNewsCard.jsx`, `AdGameCard.jsx`, `SideAd.jsx` set `className="… object-fit"`. `object-fit` is **not** a real Tailwind/CSS utility, so it's ignored and the image falls back to the CSS default (`fill`) — which **stretches/distorts** the banner. **Fix:** replace `object-fit` with `object-cover` (crop to fill) or `object-contain` (no crop).

3. **BuySmart side ad is a fixed pixel box, not fluid.**
   `SideAd.jsx` uses `w-[240px] h-[650px]` (hard-coded), so it does not scale down gracefully on small screens. **Fix:** make it responsive (e.g. `w-full max-w-[240px]` with an aspect ratio) so it behaves on phones.

Fixing #1 gives the team correct sizes in the UI; #2 and #3 make every uploaded banner render sharp and undistorted across phone, laptop and desktop.

---

## 5. One-line summary for the team

> Upload the exact size from the table (2× is better), keep it under 2 MB as WebP, match the aspect ratio, and keep all text/logo centred — the site auto-scales one image to all devices. Sidebars are portrait 320×1200; most cards are 1200×800 (3:2); the tool-detail bottom banner is 1200×400 (3:1).
