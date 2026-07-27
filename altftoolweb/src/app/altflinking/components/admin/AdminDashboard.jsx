/**
 * Admin Console & Marketplace Governance Portal
 * Location: src/app/altflinking/components/admin/AdminDashboard.jsx
 */

"use client";

import React from "react";
import { Shield, ShieldAlert, CheckCircle2, XCircle, DollarSign, Activity, FileCheck, RefreshCw } from "lucide-react";
import { MOCK_ADMIN_METRICS } from "../../data/mockMarketplaceData";

export default function AdminDashboard({ websites, orders }) {
  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span>ALTFTool Admin Console</span>
          </h1>
          <p className="text-xs text-slate-500">Governance center for domain approvals, escrow payouts, and link auditing</p>
        </div>

        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          SYSTEM HEALTH: 100%
        </span>
      </div>

      {/* Admin Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Total Escrow Volume</p>
          <p className="text-2xl font-extrabold text-white font-mono">
            ${MOCK_ADMIN_METRICS.totalVolumeEscrow.toLocaleString()}
          </p>
          <span className="text-[10px] text-indigo-300 font-semibold">Active market capital</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Active Listings</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">
            {websites.length} Verified
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">All DNS verified</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">
            {MOCK_ADMIN_METRICS.pendingVerificationCount} Queue
          </p>
          <span className="text-[10px] text-amber-300 font-semibold">Needs admin audit</span>
        </div>

        <div className="altf-card p-5 space-y-1">
          <p className="text-xs font-medium text-slate-500">Platform Commission (15%)</p>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono">
            ${MOCK_ADMIN_METRICS.platformRevenueCommission.toLocaleString()}
          </p>
          <span className="text-[10px] text-cyan-300 font-semibold">Net platform profit</span>
        </div>
      </div>

      {/* Admin Audit Queue Table */}
      <div className="altf-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Website Listing Approval Queue</span>
          <span className="text-xs font-mono text-slate-500">Showing {websites.length} domains</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Domain</th>
                <th className="pb-3">Niche</th>
                <th className="pb-3">DR / Traffic</th>
                <th className="pb-3">Guest Post Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {websites.map((site) => (
                <tr key={site.id} className="hover:bg-white">
                  <td className="py-3 font-bold text-white">{site.domain}</td>
                  <td className="py-3 text-slate-600">{site.niche}</td>
                  <td className="py-3 font-mono text-indigo-300">DR {site.dr} ({site.traffic.toLocaleString()}/mo)</td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">${site.prices.guestPost}</td>
                  <td className="py-3">
                    <span className="altf-badge altf-badge-verified">
                      APPROVED
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button className="altf-btn-secondary py-1 px-2.5 text-[11px]">Audit</button>
                    <button className="py-1 px-2.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                      Re-Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
