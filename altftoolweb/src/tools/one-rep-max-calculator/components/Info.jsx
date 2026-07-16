import React from 'react';
import { HelpCircle } from 'lucide-react';

const Info = () => {
    return (
        <div className="orm-card">
            <div className="orm-card-title">
                <HelpCircle size={20} />
                About Formulas
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Brzycki</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Most popular formula for strength training. Good accuracy for 1-10 reps.</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Lander</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Preferred in powerlifting circles. Accurate for lower rep ranges.</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Lombardi</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Simple exponential formula. Good for compound movements.</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Mayhew</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Better accuracy for higher rep ranges (5+).</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>O'Conner</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Linear approximation. Fast calculation, good for quick estimates.</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Wathan</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Highly accurate for moderate rep ranges (3-10 reps).</p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--orm-text-heading)' }}>Adams</h4>
                    <p style={{ margin: 0, color: 'var(--orm-text-sub)' }}>Advanced formula with good overall accuracy across rep ranges.</p>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--orm-text-sub)' }}>
                    Results are estimates. Actual 1RM can vary based on technique, experience, and individual factors. Test conservatively.
                </p>
            </div>
        </div>
    );
};

export default Info;
