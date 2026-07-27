/**
 * Buyer Dashboard & Campaign Management Portal
 * Location: src/app/altflinking/components/buyer/BuyerDashboard.jsx
 */

"use client";

import React, { useState } from "react";
import { Plus, ShoppingBag, TrendingUp, CheckCircle2, Clock, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import OrderStatusStepperVisual from "../visuals/OrderStatusStepperVisual";

export default function BuyerDashboard({ orders = [], campaigns = [], onCreateCampaign, onFileDispute }) {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campName, setCampName] = useState("");
  const [campDomain, setCampDomain] = useState("");
  const [campBudget, setCampBudget] = useState("2000");

  const totalSpent = orders.reduce((acc, o) => acc + (o.price || 0), 0);
  const verifiedCount = orders.filter((o) => o.status === "VERIFIED_LIVE").length;
  const pendingCount = orders.filter((o) => o.status !== "VERIFIED_LIVE").length;

  const handleCampaignSubmit = (e) => {
    e.preventDefault();
    if (!campName || !campDomain) return;
    onCreateCampaign({
      name: campName,
      targetDomain: campDomain,
      budget: Number(campBudget),
    });
    setCampName("");
    setCampDomain("");
    setShowCampaignModal(false);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Buyer Campaign Dashboard</h1>
          <p className="text-xs text-slate-500">Track active backlink orders, campaign budgets, and live indexation status</p>
        </div>

        <button
          onClick={() => setShowCampaignModal(true)}
          className="altf-btn-primary py-2 px-4 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Link Campaign</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Total Backlink Spend</p>
          <p className="text-2xl font-extrabold text-white font-mono">${totalSpent.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Protected via Escrow</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Active Orders</p>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono">{orders.length}</p>
          <span className="text-[10px] text-indigo-300 font-semibold">{pendingCount} pending fulfillment</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Verified Live Links</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{verifiedCount}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Confirmed dofollow & indexed</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Active Campaigns</p>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono">{campaigns.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Organized targets</span>
        </div>
      </div>

      {/* Order Fulfillment Milestone Stepper Visual */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Standard Escrow Milestone Workflow</h3>
        <OrderStatusStepperVisual currentStep={3} />
      </div>

      {/* Active Campaigns Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Active Link Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="altf-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{camp.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{camp.targetDomain}</p>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                  ${camp.spent || 0} / ${camp.budget}
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((camp.spent || 0) / (camp.budget || 1000)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="altf-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Escrow Backlink Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="p-3">Order ID</th>
                <th className="p-3">Publisher Domain</th>
                <th className="p-3">Type</th>
                <th className="p-3">Target URL</th>
                <th className="p-3">Price</th>
                <th className="p-3">Escrow Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white">
                  <td className="p-3 font-mono font-bold text-indigo-400">{ord.id}</td>
                  <td className="p-3 font-bold text-white font-mono">{ord.websiteDomain}</td>
                  <td className="p-3 text-slate-600">{ord.type}</td>
                  <td className="p-3 text-slate-500 font-mono truncate max-w-[150px]">{ord.targetUrl}</td>
                  <td className="p-3 font-mono font-bold text-white">${ord.price}</td>
                  <td className="p-3">
                    {ord.status === "VERIFIED_LIVE" ? (
                      <span className="altf-badge altf-badge-verified">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Released
                      </span>
                    ) : (
                      <span className="altf-badge altf-badge-pending">
                        <Clock className="h-3.5 w-3.5 text-amber-400" /> Held in Escrow
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {ord.liveUrl ? (
                      <a
                        href={ord.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">In Progress</span>
                    )}

                    {onFileDispute && (
                      <button
                        onClick={() => onFileDispute(ord)}
                        className="text-[11px] font-bold text-rose-400 hover:underline"
                      >
                        Dispute
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm">
          <div className="altf-card w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Backlink Campaign</h3>
            <form onSubmit={handleCampaignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 SaaS Growth Push"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Website Domain *</label>
                <input
                  type="text"
                  placeholder="e.g. mycompany.com"
                  required
                  value={campDomain}
                  onChange={(e) => setCampDomain(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Budget ($)</label>
                <input
                  type="number"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="altf-btn-secondary py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="altf-btn-primary py-1.5 px-4 text-xs font-bold">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
