import React from 'react';
import { TrendingUp } from 'lucide-react';

const ComparisonTable = ({ offers }) => {
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

    const getMaxValue = (key) => {
        return Math.max(...offers.map((o) => o[key] || 0));
    };

    const formatCurrency = (value) => {
        return `₹${(value / 100000).toFixed(1)}L`;
    };

    return (
        <div className="job-comparison-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <TrendingUp size={24} style={{ color: 'var(--job-primary)' }} />
                <h2 className="job-section-title" style={{ margin: 0 }}>
                    Comparison Summary
                </h2>
            </div>

            <div className="job-table-wrapper">
                <table className="job-table">
                    <thead className="job-table-header">
                        <tr>
                            <th>Company</th>
                            <th>Role</th>
                            <th>Base Salary</th>
                            <th>Bonus</th>
                            <th>ESOP</th>
                            <th>Joining</th>
                            <th>Location</th>
                            <th>Mode</th>
                            <th>Overall Score</th>
                        </tr>
                    </thead>
                    <tbody className="job-table-body">
                        {offers.map((offer, idx) => {
                            const score = calculateScore(offer);
                            const maxScore = Math.max(...offers.map(calculateScore));
                            const isHighest = score === maxScore;

                            return (
                                <tr
                                    key={idx}
                                    className={isHighest ? 'job-table-highlight' : ''}
                                    style={{
                                        background: isHighest ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                    }}
                                >
                                    <td>{offer.companyName}</td>
                                    <td>{offer.jobRole}</td>
                                    <td>{formatCurrency(offer.baseSalary)}</td>
                                    <td>{offer.bonus}%</td>
                                    <td>{offer.esop}%</td>
                                    <td>{formatCurrency(offer.joiningBonus)}</td>
                                    <td>{offer.location}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{offer.workMode}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--job-primary)' }}>{score}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
