"use client";

import React from 'react';
import { LayoutDashboard, Clock, BarChart3, Settings, Download, HelpCircle, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'comparison', label: 'Comparison', icon: BarChart3 },
        { id: 'saved', label: 'Saved Offers', icon: Clock },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'export', label: 'Export', icon: Download },
        { id: 'help', label: 'Help', icon: HelpCircle },
    ];

    return (
        <>
            <div className={`job-sidebar${isOpen ? ' open' : ''}`}>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'none',
                    }}
                    className="mobile-close"
                >
                    <X size={24} />
                </button>

                <div className="job-sidebar-title">Main</div>

                {menuItems.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className={`job-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                            }}
                        >
                            <Icon size={18} />
                            {item.label}
                        </div>
                    );
                })}

                <div className="job-sidebar-title">Tools</div>

                {menuItems.slice(3).map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.id}
                            className={`job-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsOpen(false);
                            }}
                        >
                            <Icon size={18} />
                            {item.label}
                        </div>
                    );
                })}
            </div>

            <style>{`
        @media (max-width: 768px) {
          .job-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            z-index: 999;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
            overflow-y: auto;
          }

          .mobile-close {
            display: flex !important;
          }
        }
      `}</style>
        </>
    );
};

export default Sidebar;
