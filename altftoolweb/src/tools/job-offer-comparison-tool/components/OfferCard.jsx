"use client";

import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const OfferCard = ({ offer, index, onUpdate, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (field, value) => {
        onUpdate(index, { ...offer, [field]: value });
    };

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

    const score = calculateScore(offer);

    return (
        <div className="job-offer-card">
            <div className="job-offer-header">
                <div>
                    <h3 className="job-offer-company">{offer.companyName || 'Company'}</h3>
                    <p className="job-offer-role">{offer.jobRole || 'Job Role'}</p>
                </div>
                <div className="job-offer-score">{score}</div>
            </div>

            <div className="job-offer-field">
                <label className="job-offer-label">Company Name</label>
                <input
                    type="text"
                    placeholder="Enter company name"
                    value={offer.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <div className="job-offer-field">
                <label className="job-offer-label">Job Role</label>
                <input
                    type="text"
                    placeholder="Enter job role"
                    value={offer.jobRole}
                    onChange={(e) => handleChange('jobRole', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <div className="job-offer-divider" />

            <div className="job-slider-group">
                <div className="job-slider-label">
                    <span className="job-slider-label-text">Base Salary (₹)</span>
                    <span className="job-slider-value">{offer.baseSalary}</span>
                </div>
                <input
                    type="number"
                    placeholder="0"
                    value={offer.baseSalary}
                    onChange={(e) => handleChange('baseSalary', parseFloat(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <div className="job-slider-group">
                <div className="job-slider-label">
                    <span className="job-slider-label-text">Bonus (%)</span>
                    <span className="job-slider-value">{offer.bonus}%</span>
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={offer.bonus}
                    onChange={(e) => handleChange('bonus', parseFloat(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <div className="job-slider-group">
                <div className="job-slider-label">
                    <span className="job-slider-label-text">ESOP/Stock (%)</span>
                    <span className="job-slider-value">{offer.esop}%</span>
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={offer.esop}
                    onChange={(e) => handleChange('esop', parseFloat(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <div className="job-slider-group">
                <div className="job-slider-label">
                    <span className="job-slider-label-text">Joining Bonus (₹)</span>
                    <span className="job-slider-value">{offer.joiningBonus}</span>
                </div>
                <input
                    type="number"
                    placeholder="0"
                    value={offer.joiningBonus}
                    onChange={(e) => handleChange('joiningBonus', parseFloat(e.target.value) || 0)}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--job-border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--job-surface-hover)',
                        color: 'var(--job-text-heading)',
                    }}
                />
            </div>

            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    marginTop: '12px',
                    background: 'var(--job-surface-hover)',
                    border: '1px solid var(--job-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--job-text-heading)',
                    transition: 'all 0.2s ease',
                }}
            >
                {expanded ? 'Hide Details' : 'Show Details'}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expanded && (
                <>
                    <div className="job-offer-divider" />

                    <div className="job-slider-group">
                        <div className="job-slider-label">
                            <span className="job-slider-label-text">Work-life Balance</span>
                            <span className="job-slider-value">{Math.round(offer.workLifeBalance * 10)}/10</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={offer.workLifeBalance}
                            onChange={(e) => handleChange('workLifeBalance', parseFloat(e.target.value))}
                            className="job-slider"
                        />
                    </div>

                    <div className="job-slider-group">
                        <div className="job-slider-label">
                            <span className="job-slider-label-text">Growth Opportunities</span>
                            <span className="job-slider-value">{Math.round(offer.growthOpportunities * 10)}/10</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={offer.growthOpportunities}
                            onChange={(e) => handleChange('growthOpportunities', parseFloat(e.target.value))}
                            className="job-slider"
                        />
                    </div>

                    <div className="job-slider-group">
                        <div className="job-slider-label">
                            <span className="job-slider-label-text">Learning Opportunities</span>
                            <span className="job-slider-value">{Math.round(offer.learningOpportunities * 10)}/10</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={offer.learningOpportunities}
                            onChange={(e) => handleChange('learningOpportunities', parseFloat(e.target.value))}
                            className="job-slider"
                        />
                    </div>

                    <div className="job-slider-group">
                        <div className="job-slider-label">
                            <span className="job-slider-label-text">Company Stability</span>
                            <span className="job-slider-value">{Math.round(offer.companyStability * 10)}/10</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={offer.companyStability}
                            onChange={(e) => handleChange('companyStability', parseFloat(e.target.value))}
                            className="job-slider"
                        />
                    </div>

                    <div className="job-offer-field">
                        <label className="job-offer-label">Work Mode</label>
                        <select
                            value={offer.workMode}
                            onChange={(e) => handleChange('workMode', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--job-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--job-surface-hover)',
                                color: 'var(--job-text-heading)',
                            }}
                        >
                            <option value="onsite">Onsite</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>

                    <div className="job-offer-field">
                        <label className="job-offer-label">Location</label>
                        <input
                            type="text"
                            placeholder="Enter location"
                            value={offer.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--job-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--job-surface-hover)',
                                color: 'var(--job-text-heading)',
                            }}
                        />
                    </div>

                    <div className="job-offer-field">
                        <label className="job-offer-label">Leave Policy</label>
                        <input
                            type="text"
                            placeholder="e.g., 20 days/year"
                            value={offer.leavePolicy}
                            onChange={(e) => handleChange('leavePolicy', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--job-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--job-surface-hover)',
                                color: 'var(--job-text-heading)',
                            }}
                        />
                    </div>

                    <div className="job-offer-field">
                        <label className="job-offer-label">Insurance Benefits</label>
                        <input
                            type="text"
                            placeholder="e.g., Health, Dental, Vision"
                            value={offer.insurance}
                            onChange={(e) => handleChange('insurance', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--job-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--job-surface-hover)',
                                color: 'var(--job-text-heading)',
                            }}
                        />
                    </div>

                    <div className="job-offer-field">
                        <label className="job-offer-label">Tech Stack</label>
                        <input
                            type="text"
                            placeholder="e.g., React, Node.js, AWS"
                            value={offer.techStack}
                            onChange={(e) => handleChange('techStack', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid var(--job-border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                background: 'var(--job-surface-hover)',
                                color: 'var(--job-text-heading)',
                            }}
                        />
                    </div>
                </>
            )}

            <div className="job-offer-actions">
                <button
                    className="job-offer-btn delete"
                    onClick={() => onDelete(index)}
                    title="Delete this offer"
                >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Delete
                </button>
            </div>
        </div>
    );
};

export default OfferCard;
