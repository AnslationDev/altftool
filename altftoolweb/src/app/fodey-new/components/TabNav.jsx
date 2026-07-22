'use client'

import React from "react";

export default function TabNav({ activeTab, onTabChange, tabs }) {
    if (!tabs || tabs.length === 0) return null;

    return (
        // Fixed: Added justify-center and max-w-7xl to perfectly align the menu tabs in the screen center
        <nav className="w-full max-w-7xl mx-auto" aria-label="Tabs Dashboard Navigation">
            <ul className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-4 pb-1">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon || null;
                    const isActive = activeTab === tab.id;

                    return (
                        <li key={tab.id} className="list-none">
                            <button
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none outline-none border ${isActive
                                        ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                                        : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                    }`}
                            >
                                <span>{tab.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}