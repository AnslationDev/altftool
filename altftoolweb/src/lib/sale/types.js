/**
 * Shared JSDoc type definitions for the Sale Locator service layer.
 * Plain JS project — these typedefs exist purely for editor/IDE intellisense
 * and documentation; nothing here executes at runtime.
 *
 * @typedef {Object} GeocodeResult
 * @property {string} query           — the original location string requested
 * @property {string} formattedAddress
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} [placeId]
 * @property {string} [country]
 *
 * @typedef {Object} PlaceResult
 * @property {string} placeId
 * @property {string} name
 * @property {string} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {number|null} rating
 * @property {string} businessStatus
 * @property {boolean|null} openNow
 * @property {string[]} openingHours   — weekday_text lines, if available
 * @property {string|null} photoReference
 * @property {string|null} website
 * @property {string|null} phoneNumber
 * @property {string} category         — the Places "type" it was matched under
 * @property {string} source           — always "openstreetmap"
 *
 * @typedef {Object} ShoppingResult
 * @property {string} id
 * @property {string} title
 * @property {number|null} price
 * @property {number|null} originalPrice
 * @property {string|null} discount
 * @property {string} seller
 * @property {string} image
 * @property {number|null} rating
 * @property {number|null} reviews
 * @property {string} shoppingSource    — e.g. "serpapi", "amazon", "flipkart"
 * @property {string|null} delivery
 * @property {string} productUrl
 *
 * @typedef {Object} AffiliateOffer
 * @property {string} id
 * @property {string} title
 * @property {string} store
 * @property {string} description
 * @property {string} url
 * @property {string|null} code
 * @property {string|null} discount
 * @property {string} offerType        — "deal" | "coupon" | "cashback"
 * @property {string|null} expiresAt
 * @property {string} provider         — e.g. "admitad", "impact", "cj", "awin"
 *
 * @typedef {Object} Deal
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} store
 * @property {number|null} price
 * @property {number|null} originalPrice
 * @property {number|null} discount     — percentage off, 0-100
 * @property {string} image
 * @property {string} url
 * @property {number|null} latitude
 * @property {number|null} longitude
 * @property {number|null} distance     — km from the reference point, if known
 * @property {string} category
 * @property {number|null} rating
 * @property {string} source            — provider/API this Deal originated from
 * @property {string} offerType         — "deal" | "coupon" | "cashback" | "store"
 * @property {string|null} expiresAt
 *
 * @typedef {Object} SaleApiErrorShape
 * @property {string} message
 * @property {number} status
 * @property {string} code              — "missing_api_key" | "quota_exceeded" | "unauthorized" | "not_found" | "timeout" | "upstream_error"
 */

export {};
