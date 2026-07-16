import React from 'react';
import { Award } from 'lucide-react';

const ScorePanel = ({ offers }) => {
    if (offers.length === 0) return null;

    const calculateScore = (o) => {
        const salaryScore = Math.min(o.baseSalary / 200000, 1) * 20;
        const bonusScore = (o.bonus / o.baseSalary) * 20;
        const esopScore = (o.esop / o.baseSalary) * 15;
        const workLifeScore = o.workLifeBalance * 15;
        const growthScore = o.growthOpportunities * 15;
        const stabilityScore = o.companyStability * 10;
        const learningScore = o.learningOpportunities * 5;

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

    const scores = offers.map((o, idx) => ({
        company: o.companyName,
        score: calculateScore(o),
        index: idx,
    }));

    scores.sort((a, b) => b.score - a.score);

    return (
        <div className="job-comparison-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Award size={24} style={{ color: 'var(--job-primary)' }} />
                <h2 className="job-section-title" style={{ margin: 0 }}>
                    Score Rankings
                </h2>
            </div>

            {scores.map((item, idx) => (
                <div key={idx} className="job-score-item">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--job-primary), var(--job-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '14px',
                            }}
                        >
                            {idx + 1}
                        </div>
                        <span className="job-score-label">{item.company}</span>
                    </div>
                    <div className="job-score-bar">
                        <div
                            className="job-score-bar-fill"
                            style={{
                                width: `${(item.score / 100) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="job-score-number">{item.score}</span>
                </div>
            ))}
        </div>
    );
};

export default ScorePanel;
