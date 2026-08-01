"use client";

import React from 'react';
import { Settings } from 'lucide-react';

const PreferencesPanel = ({ preferences, setPreferences }) => {
    const handleChange = (key, value) => {
        setPreferences({ ...preferences, [key]: value });
    };

    return (
        <div className="job-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Settings size={24} style={{ color: 'var(--job-primary)' }} />
                <h3 className="job-section-title" style={{ margin: 0 }}>
                    Weight Preferences
                </h3>
            </div>

            <div className="job-preference-item">
                <div className="job-preference-label">
                    <span className="job-preference-label-text">Salary Importance</span>
                    <span className="job-preference-value">{preferences.salaryWeight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.salaryWeight}
                    onChange={(e) => handleChange('salaryWeight', parseInt(e.target.value))}
                    className="job-slider"
                />
            </div>

            <div className="job-preference-item">
                <div className="job-preference-label">
                    <span className="job-preference-label-text">Remote Preference</span>
                    <span className="job-preference-value">{preferences.remoteWeight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.remoteWeight}
                    onChange={(e) => handleChange('remoteWeight', parseInt(e.target.value))}
                    className="job-slider"
                />
            </div>

            <div className="job-preference-item">
                <div className="job-preference-label">
                    <span className="job-preference-label-text">Career Growth</span>
                    <span className="job-preference-value">{preferences.growthWeight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.growthWeight}
                    onChange={(e) => handleChange('growthWeight', parseInt(e.target.value))}
                    className="job-slider"
                />
            </div>

            <div className="job-preference-item">
                <div className="job-preference-label">
                    <span className="job-preference-label-text">Company Stability</span>
                    <span className="job-preference-value">{preferences.stabilityWeight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.stabilityWeight}
                    onChange={(e) => handleChange('stabilityWeight', parseInt(e.target.value))}
                    className="job-slider"
                />
            </div>

            <div className="job-preference-item">
                <div className="job-preference-label">
                    <span className="job-preference-label-text">Learning Opportunities</span>
                    <span className="job-preference-value">{preferences.learningWeight}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.learningWeight}
                    onChange={(e) => handleChange('learningWeight', parseInt(e.target.value))}
                    className="job-slider"
                />
            </div>

        </div>
    );
};

export default PreferencesPanel;
