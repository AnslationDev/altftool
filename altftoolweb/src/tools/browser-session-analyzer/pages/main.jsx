"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, Button, EmptyState } from "@altftool/ui";
import {
  LayoutDashboard, Download, Search, Filter, ArrowUpDown,
  ExternalLink, Trash2, X, Globe, History, AlertTriangle, CheckCircle,
} from "lucide-react";
import { useSessionAnalyzer } from "../hooks/useSessionAnalyzer";
import UploadPanel from "../components/UploadPanel";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import DomainTable from "../components/DomainTable";
import CategoryPanel from "../components/CategoryPanel";
import GroupManager from "../components/GroupManager";
import ExportDialog from "../components/ExportDialog";

export default function BrowserSessionMain() {
  const analyzer = useSessionAnalyzer();
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Browser Session Analyzer</h1>
            <p className="text-sm text-(--muted-foreground) mt-1">
              Analyze browser tabs, detect duplicates, categorize domains, and get productivity insights.
            </p>
          </div>
          <div className="flex gap-1.5">
            {analyzer.tabs.length > 0 && (
              <>
                <button onClick={() => setShowExport(true)} aria-label="Export session" className="p-2 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)" title="Export">
                  <Download size="18" />
                </button>
                <button onClick={analyzer.clearAll} aria-label="Clear all tabs" className="p-2 min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) hover:text-(--danger) transition active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)" title="Clear">
                  <Trash2 size="18" />
                </button>
              </>
            )}
          </div>
        </div>

        <UploadPanel onProcess={analyzer.processInput} onManualAdd={analyzer.addManualUrl} />

        {analyzer.stats && (
          <AnalyticsDashboard stats={analyzer.stats} />
        )}

        {analyzer.tabs.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
                <input
                  value={analyzer.search}
                  onChange={(e) => analyzer.setSearch(e.target.value)}
                  placeholder="Search URLs, domains, categories..."
                  aria-label="Search tabs"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
                />
              </div>
              <select
                value={analyzer.sortBy}
                onChange={(e) => analyzer.setSortBy(e.target.value)}
                aria-label="Sort tabs by"
                className="px-3 py-2 text-sm rounded-xl border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
              >
                <option value="openOrder">Order</option>
                <option value="domain">Domain</option>
                <option value="category">Category</option>
              </select>
            </div>

            <CategoryPanel
              categories={analyzer.categories}
              active={analyzer.categoryFilter}
              onSelect={analyzer.setCategoryFilter}
            />
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            {analyzer.filteredTabs.length === 0 ? (
              <EmptyState
                icon={<LayoutDashboard size="32" />}
                title={analyzer.tabs.length === 0 ? "No session data" : "No matching tabs"}
                description={analyzer.tabs.length === 0 ? "Import session data to analyze your browsing" : "Try adjusting your filters"}
              />
            ) : (
              <div className="rounded-xl border border-(--border) overflow-hidden">
                <div className="px-3 py-2 bg-(--muted) border-b border-(--border) flex items-center justify-between">
                  <span className="text-xs font-semibold text-(--foreground)">
                    {analyzer.filteredTabs.length} of {analyzer.tabs.length} tabs
                  </span>
                  <div className="flex gap-2 text-[10px] text-(--muted-foreground)">
                    <span className="flex items-center gap-1"><CheckCircle size="10" className="text-green-500" /> HTTPS</span>
                    <span className="flex items-center gap-1"><AlertTriangle size="10" className="text-amber-500" /> Duplicate</span>
                    <span className="flex items-center gap-1"><AlertTriangle size="10" className="text-red-500" /> Broken</span>
                  </div>
                </div>
                <div className="divide-y divide-(--border) max-h-[500px] overflow-y-auto custom-scrollbar">
                  {analyzer.filteredTabs.map((tab) => (
                    <div
                      key={tab.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-(--muted) transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-(--muted-foreground) font-mono">{tab.domain}</span>
                          {!tab.isHttps && <AlertTriangle size="10" className="text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-(--foreground) truncate">{tab.url}</p>
                        {tab.title && <p className="text-[10px] text-(--muted-foreground) truncate">{tab.title}</p>}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                        tab.category === "Other" ? "bg-(--muted) text-(--muted-foreground)" : "bg-(--primary-soft) text-(--primary)"
                      }`}>
                        {tab.category}
                      </span>
                      <a href={tab.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${tab.domain} in new tab`} className="p-1 rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-(--muted-foreground) hover:text-(--primary) transition" title="Open URL">
                        <ExternalLink size="14" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            {analyzer.stats && <DomainTable tabs={analyzer.tabs} filteredTabs={analyzer.filteredTabs} stats={analyzer.stats} />}
            <GroupManager
              tabs={analyzer.tabs}
              groups={analyzer.groups}
              onGroupCreate={analyzer.createGroup}
              onGroupToggle={analyzer.toggleGroupCollapse}
              onGroupDelete={analyzer.deleteGroup}
              onGroupRename={analyzer.renameGroup}
            />
            {analyzer.history.length > 0 && (
              <Card className="p-3">
                <h4 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider mb-2">
                  <History size="14" className="inline mr-1" /> Recent Sessions
                </h4>
                <div className="space-y-1">
                  {analyzer.history.map((h) => (
                    <div key={h.id} className="flex justify-between text-xs px-2 py-1 rounded bg-(--muted)">
                      <span className="text-(--foreground)">{h.count} tabs</span>
                      <span className="text-(--muted-foreground)">{h.domains} domains</span>
                      <span className="text-(--muted-foreground)">{new Date(h.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-2">How to Use</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-(--muted-foreground)">
              <li>Paste a JSON export of your browser tabs or session data.</li>
              <li>Alternatively, import a CSV, bookmark file, or add URLs manually.</li>
              <li>Tabs are automatically analyzed, categorized, and deduplicated.</li>
              <li>Use groups, filters, and search to organize your session.</li>
              <li>Export the analysis as JSON, CSV, or TXT.</li>
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "How do I export tabs from my browser?", a: "Use browser extensions like OneTab, Session Buddy, or Tab Manager to export sessions as JSON." },
                { q: "What is the Health Score?", a: "A metric that accounts for duplicates, broken URLs, and total tab count to assess session health." },
                { q: "Is my data private?", a: "Yes. All analysis is done locally in your browser. No data is sent to any server." },
              ].map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-sm font-semibold text-(--foreground)">{faq.q}</h3>
                  <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        tabs={analyzer.filteredTabs}
      />
    </div>
  );
}
