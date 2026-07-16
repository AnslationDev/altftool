import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';

const EstimationChart = ({ oneRepMax, weight, reps }) => {
    if (!oneRepMax) return null;

    // Calculate estimations for different rep ranges
    const brzycki = (w, r) => w * (36 / (37 - r));
    const generateData = () => {
        const data = [];
        for (let r = 1; r <= 12; r++) {
            data.push({
                reps: r,
                estimated: (weight * (36 / (37 - r))).toFixed(1),
            });
        }
        return data;
    };

    const data = generateData();

    // Percentage data for training zones
    const percentageData = [
        { zone: '95%', weight: (oneRepMax * 0.95).toFixed(1), color: '#EF4444' },
        { zone: '90%', weight: (oneRepMax * 0.9).toFixed(1), color: '#F59E0B' },
        { zone: '85%', weight: (oneRepMax * 0.85).toFixed(1), color: '#F59E0B' },
        { zone: '80%', weight: (oneRepMax * 0.8).toFixed(1), color: '#3B82F6' },
        { zone: '75%', weight: (oneRepMax * 0.75).toFixed(1), color: '#3B82F6' },
        { zone: '70%', weight: (oneRepMax * 0.7).toFixed(1), color: '#10B981' },
    ];

    return (
        <div className="orm-card">
            <div className="orm-card-title">
                <BarChart3 size={20} />
                Estimation Charts
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', marginTop: '16px' }}>
                1RM Estimation by Reps
            </h3>
            <div className="orm-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--orm-border)" />
                        <XAxis dataKey="reps" stroke="var(--orm-text-sub)" label={{ value: 'Reps', position: 'right', offset: -10 }} />
                        <YAxis stroke="var(--orm-text-sub)" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--orm-surface)',
                                border: `1px solid var(--orm-border)`,
                                borderRadius: '8px',
                            }}
                            formatter={(value) => `${value} kg`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="estimated"
                            stroke="var(--orm-primary)"
                            dot={{ fill: 'var(--orm-primary)', r: 4 }}
                            name="Estimated 1RM"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', marginTop: '24px' }}>
                Training Zones Distribution
            </h3>
            <div className="orm-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={percentageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--orm-border)" />
                        <XAxis dataKey="zone" stroke="var(--orm-text-sub)" />
                        <YAxis stroke="var(--orm-text-sub)" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--orm-surface)',
                                border: `1px solid var(--orm-border)`,
                                borderRadius: '8px',
                            }}
                            formatter={(value) => `${value} kg`}
                        />
                        <Bar dataKey="weight" fill="var(--orm-primary)" name="Weight" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EstimationChart;
