import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

const SalaryChart = ({ offers }) => {
    if (offers.length === 0) return null;

    const data = offers.map((offer) => ({
        company: offer.companyName || 'Company',
        base: offer.baseSalary / 100000,
        bonus: (offer.baseSalary * offer.bonus) / 100 / 100000,
        esop: (offer.baseSalary * offer.esop) / 100 / 100000,
        joining: offer.joiningBonus / 100000,
    }));

    return (
        <div className="job-comparison-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={24} style={{ color: 'var(--job-primary)' }} />
                <h2 className="job-section-title" style={{ margin: 0 }}>
                    Salary Breakdown
                </h2>
            </div>

            <div className="job-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--job-border)" />
                        <XAxis dataKey="company" stroke="var(--job-text-sub)" />
                        <YAxis stroke="var(--job-text-sub)" label={{ value: 'Amount (Lakhs)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--job-surface)',
                                border: `1px solid var(--job-border)`,
                                borderRadius: '8px',
                            }}
                            cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="base" stackId="a" fill="#2563EB" name="Base Salary" />
                        <Bar dataKey="bonus" stackId="a" fill="#7C3AED" name="Bonus" />
                        <Bar dataKey="esop" stackId="a" fill="#10B981" name="ESOP" />
                        <Bar dataKey="joining" stackId="a" fill="#F59E0B" name="Joining Bonus" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalaryChart;
