/**
 * Publisher Studio & Domain Verification Portal
 * Location: src/app/altflinking/components/publisher/PublisherDashboard.jsx
 */

"use client";

import React, { useState } from "react";
import { Globe, ShieldCheck, Plus, CheckCircle2, Clock, Wallet, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { NICHES } from "../../types";
import DnsVerificationFlowVisual from "../visuals/DnsVerificationFlowVisual";

export default function PublisherDashboard({
  websites = [],
  onSubmitWebsite,
  onOpenSubmitModal,
  onOpenWithdrawal,
  incomingOrders = [],
  onAcceptOrder,
  onSubmitLiveLink,
}) {
  const [showForm, setShowForm] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [nicheInput, setNicheInput] = useState(NICHES[0]);
  const [guestPrice, setGuestPrice] = useState("180");
  const [linkPrice, setLinkPrice] = useState("100");
  const [tat, setTat] = useState("3");
  const [guidelines, setGuidelines] = useState("Must be 1000+ words original content. Max 2 dofollow links.");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);

  const handleStartSubmit = (e) => {
    e.preventDefault();
    if (!domainInput) return;
    setIsVerifying(true);
    const token = `altftool-verify-${Math.random().toString(36).substring(2, 9)}`;
    setVerificationToken(token);
  };

  const handleConfirmVerification = () => {
    onSubmitWebsite({
      domain: domainInput.replace(/^https?:\/\//i, "").replace(/\/+$/, ""),
      name: domainInput.split(".")[0].toUpperCase() + " Media",
      niche: nicheInput,
      country: "United States",
      prices: {
        guestPost: Number(guestPrice),
        linkInsertion: Number(linkPrice),
      },
      tatDays: Number(tat),
      guidelines,
    });
    setIsVerifying(false);
    setShowForm(false);
    setDomainInput("");
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="altf-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Listed Domains</p>
          <p className="text-2xl font-black text-white font-mono">{websites.length}</p>
        </div>
        <div className="altf-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved Live</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {websites.filter((w) => w.status === "APPROVED" || w.verified).length}
          </p>
        </div>
        <div className="altf-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Admin Review</p>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {websites.filter((w) => w.status === "PENDING_REVIEW").length}
          </p>
        </div>
        <div className="altf-card p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</p>
            <p className="text-2xl font-black text-cyan-400 font-mono">$1,240.00</p>
          </div>
          {onOpenWithdrawal && (
            <button
              onClick={onOpenWithdrawal}
              className="altf-btn-primary py-1.5 px-3 text-xs font-bold shrink-0"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="altf-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <span>Publisher Domain Inventory</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage website listings, guest post pricing, and admin moderation status
            </p>
          </div>

          <button
            onClick={() => (onOpenSubmitModal ? onOpenSubmitModal() : setShowForm(true))}
            className="altf-btn-primary py-2 px-4 text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Website for Verification</span>
          </button>
        </div>

        {/* Websites Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="p-3">Domain Name</th>
                <th className="p-3">Niche</th>
                <th className="p-3">DR Metrics</th>
                <th className="p-3">Organic Traffic</th>
                <th className="p-3">Guest Post Price</th>
                <th className="p-3">Status / Verification</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {websites.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No domains listed yet. Click "Submit Website for Verification" to add your first publication.
                  </td>
                </tr>
              ) : (
                websites.map((site) => (
                  <tr key={site.id} className="hover:bg-white">
                    <td className="p-3 font-bold text-white font-mono">{site.domain}</td>
                    <td className="p-3 text-slate-600">{site.niche}</td>
                    <td className="p-3">
                      <span className="altf-badge altf-badge-dr-high font-mono">DR {site.dr}</span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {(site.traffic || 0).toLocaleString()}/mo
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-400">
                      ${site.prices?.guestPost || 0}
                    </td>
                    <td className="p-3">
                      {site.status === "APPROVED" ? (
                        <span className="altf-badge altf-badge-verified">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Approved &amp; Live
                        </span>
                      ) : site.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px]">
                          Rejected by Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                          <Clock className="h-3 w-3" /> Pending Admin Review
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button className="altf-btn-secondary py-1 px-3 text-[11px]">Manage</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Buyer Requests & Publishing Studio */}
      <div className="altf-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <span>Incoming Buyer Requests (Pending Acceptance & Publishing)</span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-500">
            {incomingOrders.length} Active Requests
          </span>
        </h3>

        {incomingOrders.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            No incoming requests yet. When buyers place guest post or link insertion requests, they will appear here for your approval.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 mr-2">
                      {ord.type}
                    </span>
                    <span className="text-xs font-bold text-white">{ord.websiteDomain}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    STATUS: {ord.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Webpage URL</span>
                    <p className="font-mono text-slate-600 truncate">{ord.targetUrl}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Anchor Text</span>
                    <p className="font-semibold text-indigo-400">"{ord.anchorText}"</p>
                  </div>
                </div>

                {ord.articleContent && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Buyer Article Draft / Instructions:</span>
                    <p className="text-slate-600 leading-relaxed italic">{ord.articleContent}</p>
                  </div>
                )}

                {/* Publisher Action Form */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  {ord.status === "PENDING_ACCEPTANCE" && onAcceptOrder && (
                    <button
                      onClick={() => onAcceptOrder(ord.id)}
                      className="altf-btn-primary py-1.5 px-3 text-xs font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Accept Request</span>
                    </button>
                  )}

                  {ord.status === "ACCEPTED" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const url = e.target.elements.liveUrl.value;
                        if (url && onSubmitLiveLink) onSubmitLiveLink(ord.id, url);
                      }}
                      className="flex-1 flex items-center gap-2"
                    >
                      <input
                        name="liveUrl"
                        type="url"
                        placeholder="https://yourwebsite.com/published-post"
                        required
                        className="altf-input text-xs py-1.5 flex-1"
                      />
                      <button type="submit" className="altf-btn-primary py-1.5 px-3 text-xs font-bold shrink-0">
                        Submit Published Link
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Submission Modal Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm">
          <div className="altf-card w-full max-w-lg p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              <span>List & Verify Publisher Website</span>
            </h3>

            {!isVerifying ? (
              <form onSubmit={handleStartSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Website Domain URL *</label>
                  <input
                    type="text"
                    placeholder="e.g. techradar-insights.com"
                    required
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="altf-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Niche Category</label>
                    <select
                      value={nicheInput}
                      onChange={(e) => setNicheInput(e.target.value)}
                      className="altf-input text-xs"
                    >
                      {NICHES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Max Turnaround (Days)</label>
                    <input
                      type="number"
                      value={tat}
                      onChange={(e) => setTat(e.target.value)}
                      className="altf-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Guest Post Price ($)</label>
                    <input
                      type="number"
                      value={guestPrice}
                      onChange={(e) => setGuestPrice(e.target.value)}
                      className="altf-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Link Insertion Price ($)</label>
                    <input
                      type="number"
                      value={linkPrice}
                      onChange={(e) => setLinkPrice(e.target.value)}
                      className="altf-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="altf-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="altf-btn-primary py-1.5 px-4 text-xs font-bold">
                    Generate DNS Verification Token
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-indigo-500/30 space-y-2">
                  <p className="text-xs font-semibold text-indigo-300">Add DNS TXT Record to {domainInput}:</p>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-xs text-white">
                    <span>{verificationToken}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(verificationToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="text-indigo-400 hover:text-indigo-600"
                    >
                      {copiedToken ? "Copied!" : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* DNS Setup Flow Vector Visual */}
                <DnsVerificationFlowVisual domain={domainInput} token={verificationToken} />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsVerifying(false)}
                    className="altf-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmVerification}
                    className="altf-btn-primary py-1.5 px-4 text-xs font-bold"
                  >
                    Confirm & Publish Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
