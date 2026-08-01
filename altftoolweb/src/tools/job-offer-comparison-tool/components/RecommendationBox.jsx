import React from 'react';
import { Star, TrendingUp, Award } from 'lucide-react';

const RecommendationBox = ({ offers, preferences }) => {
    if (offers.length === 0) return null;

    const calculateWeightedScore = (offer) => {
        const salaryScore = Math.min(offer.baseSalary / 200000, 1) * 100;
        const remoteScore = offer.workMode === 'remote' ? 100 : offer.workMode === 'hybrid' ? 60 : 20;
        const growthScore = offer.growthOpportunities * 10;
        const stabilityScore = offer.companyStability * 10;
        const learningScore = offer.learningOpportunities * 10;

        const totalWeight =
            preferences.salaryWeight +
            preferences.remoteWeight +
            preferences.growthWeight +
            preferences.stabilityWeight +
            preferences.learningWeight;

        const weightedScore =
            (salaryScore * preferences.salaryWeight +
                remoteScore * preferences.remoteWeight +
                growthScore * preferences.growthWeight +
                stabilityScore * preferences.stabilityWeight +
                learningScore * preferences.learningWeight) /
            totalWeight;

        return Math.round(weightedScore);
    };

    const scores = offers.map((o, idx) => ({
        company: o.companyName,
        score: calculateWeightedScore(o),
        index: idx,
        offer: o,
    }));

    const best = scores.reduce((a, b) => (a.score > b.score ? a : b));

    let recommendation = `${best.company} appears to be the best fit based on your preferences.`;

    if (best.offer.baseSalary > 0 && preferences.salaryWeight > 50) {
        recommendation += ` With a competitive salary package and your focus on financial benefits, this is a strong choice.`;
    }

    if (best.offer.workMode === 'remote' && preferences.remoteWeight > 50) {
        recommendation += ` The remote flexibility aligns perfectly with your priorities.`;
    }

    if (best.offer.growthOpportunities > 7 && preferences.growthWeight > 50) {
        recommendation += ` Excellent growth opportunities make this ideal for career advancement.`;
    }

    return (
        <div className="job-recommendation-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} style={{ color: 'var(--job-primary)' }} />
                <div className="job-recommendation-title">Top Recommendation</div>
            </div>
            <div className="job-recommendation-text">{recommendation}</div>
            <div
                style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}
            >
                <Award size={18} />
                <span style={{ fontWeight: 700 }}>
                    Match Score: {best.score}%
                </span>
            </div>
        </div>
    );
};

export default RecommendationBox;
