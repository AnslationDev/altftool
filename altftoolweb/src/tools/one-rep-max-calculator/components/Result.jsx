import React from 'react';
import { TrendingUp } from 'lucide-react';

const Result = ({ oneRepMax, weight, reps, formula }) => {
    const getFormulaName = (f) => {
        const names = {
            brzycki: 'Brzycki',
            lander: 'Lander',
            lombardi: 'Lombardi',
            mayhew: 'Mayhew',
            oconner: "O'Conner",
            wathan: 'Wathan',
            adams: 'Adams',
        };
        return names[f];
    };

    if (!oneRepMax) {
        return (
            <div className="orm-card">
                <div className="orm-card-title">
                    <TrendingUp size={20} />
                    Your Result
                </div>
                <div className="orm-empty-state">
                    <div className="orm-empty-icon">📊</div>
                    <p className="orm-empty-title">No calculation yet</p>
                    <p className="orm-empty-text">Enter your weight and reps, then click Calculate to see your estimated 1RM</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orm-card">
            <div className="orm-card-title">
                <TrendingUp size={20} />
                Your One Rep Max
            </div>

            <div className="orm-result-box">
                <div className="orm-result-label">Estimated 1RM using {getFormulaName(formula)}</div>
                <div className="orm-result-value">{oneRepMax.toFixed(1)}</div>
                <div className="orm-result-unit">kilograms</div>
            </div>

            <div className="orm-stats-grid" style={{ marginTop: '20px' }}>
                <div className="orm-stat-box">
                    <div className="orm-stat-label">Working Weight</div>
                    <div className="orm-stat-value">{weight}</div>
                </div>
                <div className="orm-stat-box">
                    <div className="orm-stat-label">Reps</div>
                    <div className="orm-stat-value">{reps}</div>
                </div>
                <div className="orm-stat-box">
                    <div className="orm-stat-label">Increase</div>
                    <div className="orm-stat-value" style={{ color: 'var(--orm-success)' }}>
                        +{(oneRepMax - weight).toFixed(1)}
                    </div>
                </div>
                <div className="orm-stat-box">
                    <div className="orm-stat-label">Percentage</div>
                    <div className="orm-stat-value">
                        {((weight / oneRepMax) * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="orm-divider" />

            <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Suggested Training Weights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--orm-border)' }}>
                        <span>95% (Peak Performance)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.95).toFixed(1)} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--orm-border)' }}>
                        <span>90% (Strength Training)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.9).toFixed(1)} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--orm-border)' }}>
                        <span>85% (Heavy Sets)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.85).toFixed(1)} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--orm-border)' }}>
                        <span>80% (Main Work)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.8).toFixed(1)} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--orm-border)' }}>
                        <span>75% (Volume Training)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.75).toFixed(1)} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>70% (Assistance Work)</span>
                        <span style={{ fontWeight: 700, color: 'var(--orm-primary)' }}>{(oneRepMax * 0.7).toFixed(1)} kg</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
