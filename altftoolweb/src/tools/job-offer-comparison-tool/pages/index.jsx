"use client";

import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import OfferCard from '../components/OfferCard';
import ComparisonTable from '../components/ComparisonTable';
import SalaryChart from '../components/SalaryChart';
import ScorePanel from '../components/ScorePanel';
import PreferencesPanel from '../components/PreferencesPanel';
import RecommendationBox from '../components/RecommendationBox';
import FinancialBreakdown from '../components/FinancialBreakdown';
import ExportPanel from '../components/ExportPanel';
import { Menu, Briefcase } from 'lucide-react';

const emptyOffer = {
    companyName: '',
    jobRole: '',
    baseSalary: 0,
    bonus: 0,
    esop: 0,
    joiningBonus: 0,
    location: '',
    workMode: 'hybrid',
    workLifeBalance: 7,
    growthOpportunities: 7,
    learningOpportunities: 7,
    companyStability: 7,
    leavePolicy: '20 days',
    insurance: 'Health, Dental',
    techStack: '',
};

const defaultPreferences = {
    salaryWeight: 30,
    remoteWeight: 20,
    growthWeight: 25,
    stabilityWeight: 15,
    learningWeight: 10,
    brandWeight: 0,
};

const Index = () => {
    const [offers, setOffers] = useState([]);
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [preferences, setPreferences] = useState(defaultPreferences);
    const [toast, setToast] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('job-tool-theme');
        setTheme(savedTheme || document.documentElement.dataset.theme || 'light');

        const savedOffers = localStorage.getItem('job-tool-offers');
        if (savedOffers) {
            try {
                setOffers(JSON.parse(savedOffers));
            } catch (e) {
                console.log('Could not load saved offers');
            }
        }

        const savedPreferences = localStorage.getItem('job-tool-preferences');
        if (savedPreferences) {
            try {
                setPreferences(JSON.parse(savedPreferences));
            } catch (e) {
                console.log('Could not load saved preferences');
            }
        }
    }, []);

    // Save to localStorage whenever offers change
    useEffect(() => {
        localStorage.setItem('job-tool-offers', JSON.stringify(offers));
    }, [offers]);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('job-tool-preferences', JSON.stringify(preferences));
    }, [preferences]);

    // Save theme preference
    useEffect(() => {
        localStorage.setItem('job-tool-theme', theme);
    }, [theme]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddOffer = () => {
        setOffers([...offers, { ...emptyOffer }]);
        showToast('New offer added');
    };

    const handleUpdateOffer = (index, updatedOffer) => {
        const newOffers = [...offers];
        newOffers[index] = updatedOffer;
        setOffers(newOffers);
    };

    const handleDeleteOffer = (index) => {
        const newOffers = offers.filter((_, i) => i !== index);
        setOffers(newOffers);
        showToast('Offer removed');
    };

    const handleExport = () => {
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
        showToast('Comparison exported');
    };

    return (
        <div className={`job-tool-shell job-tool-${theme}`}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="job-main-content">
                <Header
                    theme={theme}
                    setTheme={setTheme}
                    onAddOffer={handleAddOffer}
                    onExport={handleExport}
                />

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '24px',
                            }}
                        >
                            <Menu
                                size={24}
                                style={{ cursor: 'pointer', color: 'var(--job-text-sub)' }}
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            />
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Dashboard Overview</h2>
                        </div>

                        {offers.length === 0 ? (
                            <div className="job-empty-state">
                                <div className="job-empty-icon">
                                    <Briefcase size={48} />
                                </div>
                                <h3 className="job-empty-title">No Offers Yet</h3>
                                <p className="job-empty-text">
                                    Add your first job offer to get started with the comparison tool.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="job-offers-grid">
                                    {offers.map((offer, idx) => (
                                        <OfferCard
                                            key={idx}
                                            offer={offer}
                                            index={idx}
                                            onUpdate={handleUpdateOffer}
                                            onDelete={handleDeleteOffer}
                                        />
                                    ))}
                                </div>

                                <ComparisonTable offers={offers} />
                                <SalaryChart offers={offers} />
                                <ScorePanel offers={offers} />
                            </>
                        )}
                    </>
                )}

                {/* Comparison Tab */}
                {activeTab === 'comparison' && (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Detailed Comparison</h2>

                        {offers.length < 2 ? (
                            <div className="job-empty-state">
                                <p className="job-empty-text">Add at least 2 offers to compare them side by side.</p>
                            </div>
                        ) : (
                            <>
                                <RecommendationBox offers={offers} preferences={preferences} />
                                <FinancialBreakdown offers={offers} />
                            </>
                        )}
                    </>
                )}

                {/* Saved Offers Tab */}
                {activeTab === 'saved' && (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Saved Comparisons</h2>
                        <div className="job-empty-state">
                            <p className="job-empty-text">Your current comparison is automatically saved in your browser.</p>
                            <p className="job-empty-text" style={{ marginTop: '12px', fontSize: '13px' }}>
                                Use the Export option to save additional comparisons or download them.
                            </p>
                        </div>
                    </>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Set Your Preferences</h2>
                        <div style={{ maxWidth: '600px' }}>
                            <PreferencesPanel preferences={preferences} setPreferences={setPreferences} />
                        </div>
                    </>
                )}

                {/* Export Tab */}
                {activeTab === 'export' && (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Export & Save</h2>
                        <div style={{ maxWidth: '600px' }}>
                            {offers.length === 0 ? (
                                <div className="job-empty-state">
                                    <p className="job-empty-text">Add offers first before exporting.</p>
                                </div>
                            ) : (
                                <>
                                    <ExportPanel offers={offers} preferences={preferences} />
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* Help Tab */}
                {activeTab === 'help' && (
                    <>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Help & Guide</h2>
                        <div className="job-comparison-section" style={{ maxWidth: '800px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>How to Use</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>1. Add Offers</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--job-text-sub)', margin: 0 }}>
                                        Click "Add Offer" to add job offers. Fill in company name, role, salary details, and optional information.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>2. Set Preferences</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--job-text-sub)', margin: 0 }}>
                                        Go to Preferences and adjust weights based on what matters most to you (salary, remote, growth, etc.).
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>3. Review Comparison</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--job-text-sub)', margin: 0 }}>
                                        Check the comparison table, charts, and recommendations. The tool calculates scores based on your preferences.
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>4. Export Results</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--job-text-sub)', margin: 0 }}>
                                        Export as JSON, CSV, or save locally. Your data is stored only in your browser.
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Score Calculation</h4>
                                <p style={{ fontSize: '14px', color: 'var(--job-text-sub)', margin: 0 }}>
                                    The overall score combines salary (20%), bonus (20%), ESOP (15%), work-life balance (15%), growth (15%), stability (10%), and learning (5%).
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="job-toast">
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background:
                                toast.type === 'success'
                                    ? 'var(--job-success)'
                                    : toast.type === 'error'
                                        ? 'var(--job-danger)'
                                        : 'var(--job-warning)',
                        }}
                    />
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Index;
