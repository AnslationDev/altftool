# AltFTool Route Map

This is the route naming contract for the public web app and admin app.

## Public Web

| Area | Canonical Route | Source |
| --- | --- | --- |
| Home | `/` | `altftoolweb/src/app/(marketing)/page.jsx` |
| Tools | `/tools/all` | `altftoolweb/src/app/tools/[category]/page.jsx` |
| Tool detail | `/tools/[category]/[slug]` | `altftoolweb/src/app/tools/[category]/[slug]/page.jsx` |
| API Stress Estimator | `/tools/all/api-stress-estimator` | static fast path |
| Extensions | `/extensions` | `altftoolweb/src/app/extensions/page.jsx` |
| Exclusive Deals | `/exclusivedeals` | `altftoolweb/src/app/exclusivedeals/page.jsx` |
| BuySmart | `/buysmart` | `altftoolweb/src/app/buysmart/page.jsx` |
| Sale Locator | `/sale` | `altftoolweb/src/app/sale/page.jsx` |
| Academy | `/academy` | `altftoolweb/src/app/academy/page.jsx` |
| Blog | `/blogs` | `altftoolweb/src/app/blogs/page.jsx` |
| Brand Ratings | `/brandrating` | `altftoolweb/src/app/brandrating/page.jsx` |
| News | `/news` | `altftoolweb/src/app/news/page.jsx` |
| Public Health API | `/api/health` | `altftoolweb/src/app/api/health/route.js` |
| Desktop Software | `/desktop` | `altftoolweb/src/app/desktop/page.jsx` |
| Trending Videos | `/trendingvids` | `altftoolweb/src/app/trendingvids/page.jsx` |
| Support | `/supportsetting` | `altftoolweb/src/app/supportsetting/page.jsx` |

Public navigation and footer labels live in:

```text
altftoolweb/src/platform/navigation/siteRoutes.js
```

Legacy redirects:

| Legacy | Canonical |
| --- | --- |
| `/blog` | `/blogs` |
| `/categories/*` | `/tools/all` |

## Admin

Project modules use internal module keys for permissions and imports, but public URLs should use the canonical route segment.

| Project | Module Key | Label | Canonical Route |
| --- | --- | --- | --- |
| `altftool` | `ads` | Ads | `/altftool/ads` |
| `altftool` | `buysmart` | BuySmart | `/altftool/buysmart` |
| `altftool` | `blogs` | Blogs | `/altftool/blogs` |
| `altftool` | `deals` | Deals | `/altftool/deals` |
| `altftool` | `consumerrating` | Consumer Rating | `/altftool/consumer-rating` |
| `altftool` | `extensions` | Extensions | `/altftool/extensions` |
| `altftool` | `images` | Media | `/altftool/images` |
| `altftool` | `academy` | Academy | `/altftool/academy` |
| `altftool` | `trendingVideos` | Trending Videos | `/altftool/trending-videos` |
| `altftool` | `salelocator` | Sale Locator | `/altftool/sale-locator` |
| `altftool` | `dynamic` | Dynamic | `/altftool/dynamic` |
| `leadtree` | `blogs` | Blogs | `/leadtree/blogs` |
| `leadtree` | `creditcard` | Credit Cards | `/leadtree/credit-cards` |
| `leadtree` | `expertvideos` | Expert Videos | `/leadtree/expert-videos` |

Admin route helpers live in:

```text
altftoolwebadmin/src/config/adminRoutes.js
altftoolwebadmin/src/lib/adminModuleRoute.jsx
```

Global admin system routes:

| Area | Canonical Route | Source |
| --- | --- | --- |
| System Health | `/health` | `altftoolwebadmin/src/app/(protected)/health/page.jsx` |
| Admin Health API | `/api/health` | `altftoolwebadmin/src/app/api/health/route.js` |

Legacy redirects:

| Legacy | Canonical |
| --- | --- |
| `/altftool/consumerrating/*` | `/altftool/consumer-rating/*` |
| `/altftool/salelocator/*` | `/altftool/sale-locator/*` |
| `/altftool/trendingVideos/*` | `/altftool/trending-videos/*` |
| `/leadtree/creditcard/*` | `/leadtree/credit-cards/*` |
| `/leadtree/expertvideos/*` | `/leadtree/expert-videos/*` |

Run this before finishing route or navigation work:

```bash
npm run routes:check
```
