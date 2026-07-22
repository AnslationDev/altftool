'use client'

import { useState } from 'react'
import TabNav from './components/TabNav'
import NewspaperGenerator from './components/NewspaperGenerator'
import ClapperBoardGenerator from './components/ClapperBoardGenerator'
import WizardGenerator from './components/WizardGenerator'
import WantedPosterGenerator from './components/WantedPosterGenerator'
import TalkingCatGenerator from './components/TalkingCatGenerator'
import NinjaTextGenerator from './components/NinjaTextGenerator'
import { Layers, Activity, Terminal, Sparkles, Monitor } from 'lucide-react';
import './fodeyNew.css';
import AdSlot from './components/AdSlot';
import LandingInfo from './components/LandingInfo';

export default function MakerStudioPage() {
    const [activeTab, setActiveTab] = useState('landing')

    const tabs = [
        { id: 'landing', label: 'Home' },
        { id: 'newspaper', label: 'Newspaper' },
        { id: 'clapper', label: 'Clapper Board' },
        { id: 'wizard', label: 'Wizard Text' },
        { id: 'wanted', label: 'Wanted Poster' },
        { id: 'cat', label: 'Talking Cat' },
        { id: 'ninja', label: 'Ninja Text' },
    ]

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'newspaper': return <NewspaperGenerator />;
            case 'clapper': return <ClapperBoardGenerator />;
            case 'wizard': return <WizardGenerator />;
            case 'wanted': return <WantedPosterGenerator />;
            case 'cat': return <TalkingCatGenerator />;
            case 'ninja': return <NinjaTextGenerator />;
            default: return <LandingInfo onTabChange={setActiveTab} />;
        }
    }

    const currentTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Generator'

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground antialiased">

            {/* ── HIGH-END MODERN GLASSMORPHISM HEADER ── */}
            <header className="z-50 flex w-full shrink-0 flex-col gap-4 border-b border-border bg-surface/90 px-4 py-3 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 group">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <h1 className="font-mono text-xs font-black uppercase text-foreground">
                            ALTF Maker Studio<span className="font-normal text-muted"> / Creative Lab</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border border-success bg-success-soft px-2 py-0.5 font-mono text-[9px] font-black text-success shadow-sm">
                        <Activity className="h-2.5 w-2.5" />
                        ENGINE_ACTIVE
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface-soft px-3 py-1.5 font-mono text-[10px] text-muted shadow-sm sm:flex">
                        <Terminal className="h-3 w-3" />
                        <span>RENDER MODE:</span>
                        <span className="font-bold text-foreground">LOCAL</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-soft px-3 py-1 text-[11px] font-semibold text-muted shadow-sm">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="font-medium">Workspace:</span>
                        <span className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-black uppercase text-foreground shadow-sm">
                            {currentTabLabel.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim()}
                        </span>
                    </div>
                </div>
            </header>

            {/* ── CENTER ALIGNED INTEGRATED NAV DECK ZONE ── */}
            <div className="z-40 flex w-full shrink-0 items-center justify-center border-b border-border bg-surface px-4 py-2 shadow-sm sm:px-6">
                <TabNav activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
            </div>

            {/* ── RESPONSIVE WORKSPACE CONTAINER ── */}
            <div className="flex w-full flex-1 overflow-hidden bg-background">

                {/* Left Gutter Ad Buffer - Stretched Top to Bottom */}
                <aside className="hidden h-full w-64 shrink-0 select-none flex-col justify-stretch border-r border-border bg-surface/70 px-2 py-2 backdrop-blur-md xl:flex xl:w-72">
                    <div className="w-full h-full flex flex-col justify-stretch relative">
                        <AdSlot placement="left-gutter" maxHeight="h-full" className="h-full w-full overflow-hidden rounded-xl bg-surface" />
                    </div>
                </aside>

                {/* ── CENTER ACTIVE CANVAS STAGE ── */}
                <main className="flex-1 h-full overflow-hidden relative px-6 py-6 flex flex-col justify-stretch">
                    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                        {renderActiveComponent()}
                    </div>
                </main>

                {/* Right Gutter Ad Buffer - Stretched Top to Bottom */}
                <aside className="hidden h-full w-64 shrink-0 select-none flex-col justify-stretch border-l border-border bg-surface/70 px-2 py-2 backdrop-blur-md xl:flex xl:w-72">
                    <div className="w-full h-full flex flex-col justify-stretch relative">
                        <AdSlot placement="right-gutter" maxHeight="h-full" className="h-full w-full overflow-hidden rounded-xl bg-surface" />
                    </div>
                </aside>

            </div>
        </div>
    )
}
