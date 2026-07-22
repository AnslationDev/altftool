// Rating → display text helpers for the brandrating UI.
// Ratings are entered in the admin panel on a 0–5 scale.

export function clampRating(rating) {
    return Math.max(0, Math.min(5, Number(rating) || 0));
}

export function formatRating(rating) {
    const value = clampRating(rating);
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function getRatingLabel(rating) {
    const value = clampRating(rating);

    if (value >= 4.8) return "Exceptional";
    if (value >= 4.5) return "Excellent";
    if (value >= 4.0) return "Very Good";
    if (value >= 3.5) return "Good";
    if (value >= 3.0) return "Average";
    if (value > 0) return "Fair";
    return "Not yet rated";
}

// One-line tagline for brand cards: prefer admin-entered copy, then
// fall back to text generated from the admin-entered rating.
export function getBrandTagline(brand = {}) {
    const review = typeof brand?.review === "string" ? brand.review.trim() : "";
    if (review) return review;

    const trust = typeof brand?.trust === "string" ? brand.trust.trim() : "";
    if (trust) return trust;

    const heading = typeof brand?.heading === "string" ? brand.heading.trim() : "";
    if (heading) return heading;

    const value = clampRating(brand?.rating);
    if (value > 0) {
        return `${getRatingLabel(value)} · ${formatRating(value)}/5 overall rating`;
    }

    return "Rating coming soon";
}
