// Shared "Overall Score" formula for an offer, out of 100 points, as
// documented in the Help tab (pages/index.jsx) and seo.js:
//   salary 20%, bonus 20%, ESOP 15%, work-life balance 15%, growth 15%,
//   stability 10%, learning 5%.
//
// bonus/esop are entered as 0-100 percentages (see the "Bonus (%)" /
// "ESOP/Stock (%)" inputs in OfferCard.jsx) and must be normalised against
// 100, not against baseSalary — dividing by baseSalary produced NaN for a
// freshly added offer (baseSalary starts at 0) and made the two fields
// contribute a near-zero amount once a real salary was entered.
//
// workLifeBalance/growthOpportunities/companyStability/learningOpportunities
// are 0-10 ratings (see the expanded rating sliders in OfferCard.jsx) and
// must be normalised against 10 before applying their percentage weight,
// otherwise a mid-range rating of 7 alone already exceeds the 100-point
// scale documented to users.
export const calculateScore = (offer) => {
    const baseSalary = Number(offer.baseSalary) || 0;
    const salaryScore = Math.min(baseSalary / 200000, 1) * 20;
    const bonusScore = (Number(offer.bonus) / 100) * 20;
    const esopScore = (Number(offer.esop) / 100) * 15;
    const workLifeScore = (Number(offer.workLifeBalance) / 10) * 15;
    const growthScore = (Number(offer.growthOpportunities) / 10) * 15;
    const stabilityScore = (Number(offer.companyStability) / 10) * 10;
    const learningScore = (Number(offer.learningOpportunities) / 10) * 5;

    return Math.round(
        salaryScore +
        bonusScore +
        esopScore +
        workLifeScore +
        growthScore +
        stabilityScore +
        learningScore
    );
};

export default calculateScore;
