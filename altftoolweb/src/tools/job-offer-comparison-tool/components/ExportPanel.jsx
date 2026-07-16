import React from 'react';
import { FileJson, Download, Share2 } from 'lucide-react';

const ExportPanel = ({ offers, preferences }) => {
    const exportJSON = () => {
        const data = {
            offers,
            preferences,
            exportDate: new Date().toISOString(),
        };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-comparison-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        const headers = [
            'Company',
            'Role',
            'Base Salary',
            'Bonus %',
            'ESOP %',
            'Joining Bonus',
            'Location',
            'Work Mode',
            'Work-life Balance',
            'Growth',
            'Learning',
            'Stability',
        ];

        const rows = offers.map((offer) => [
            offer.companyName,
            offer.jobRole,
            offer.baseSalary,
            offer.bonus,
            offer.esop,
            offer.joiningBonus,
            offer.location,
            offer.workMode,
            offer.workLifeBalance,
            offer.growthOpportunities,
            offer.learningOpportunities,
            offer.companyStability,
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-comparison-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const saveToLocalStorage = () => {
        const data = {
            offers,
            preferences,
            savedDate: new Date().toISOString(),
        };
        localStorage.setItem(`job-comparison-${Date.now()}`, JSON.stringify(data));
        alert('Comparison saved successfully!');
    };

    return (
        <div className="job-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Download size={24} style={{ color: 'var(--job-primary)' }} />
                <h3 className="job-section-title" style={{ margin: 0 }}>
                    Export & Save
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={exportJSON}
                    style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, var(--job-primary), var(--job-secondary))',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    <FileJson size={18} />
                    Export as JSON
                </button>

                <button
                    onClick={exportCSV}
                    style={{
                        padding: '12px 16px',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--job-primary)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'var(--job-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'var(--job-surface-hover)';
                        e.target.style.color = 'var(--job-text-heading)';
                        e.target.style.borderColor = 'var(--job-border)';
                    }}
                >
                    <Download size={18} />
                    Export as CSV
                </button>

                <button
                    onClick={saveToLocalStorage}
                    style={{
                        padding: '12px 16px',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'var(--job-secondary)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'var(--job-secondary)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'var(--job-surface-hover)';
                        e.target.style.color = 'var(--job-text-heading)';
                        e.target.style.borderColor = 'var(--job-border)';
                    }}
                >
                    <Share2 size={18} />
                    Save Locally
                </button>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--job-text-sub)', margin: 0 }}>
                    Save your comparison locally and access it anytime. All data is stored in your browser only.
                </p>
            </div>
        </div>
    );
};

export default ExportPanel;
