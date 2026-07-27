/**
 * Publisher Website Submission Modal (PENDING_REVIEW state workflow)
 * Location: src/app/altflinking/components/publisher/SubmitListingModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, Globe, DollarSign, FileText, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { NICHES } from "../../types";

export default function SubmitListingModal({ isOpen, onClose, onSubmitSuccess }) {
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [niche, setNiche] = useState(NICHES[0] || "Technology");
  const [dr, setDr] = useState("50");
  const [da, setDa] = useState("45");
  const [traffic, setTraffic] = useState("25000");
  const [tatDays, setTatDays] = useState("3");
  const [guestPostPrice, setGuestPostPrice] = useState("150");
  const [linkInsertionPrice, setLinkInsertionPrice] = useState("90");
  const [guidelines, setGuidelines] = useState("");
  const [sampleUrl, setSampleUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const payload = {
        domain: domain.trim().toLowerCase(),
        name: name.trim() || domain.trim(),
        niche,
        dr: Number(dr),
        da: Number(da),
        traffic: Number(traffic),
        tatDays: Number(tatDays),
        prices: {
          guestPost: Number(guestPostPrice),
          linkInsertion: Number(linkInsertionPrice),
        },
        guidelines: guidelines.trim(),
        sampleUrls: sampleUrl.trim() ? [sampleUrl.trim()] : [],
      };

      await onSubmitSuccess(payload);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit website listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="altf-drawer-overlay flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              Submit Website for Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              List your blog/publication. All submissions are manually verified by admins before going live.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Listing Submitted Successfully!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your website status is now <span className="text-amber-400 font-semibold">Pending Review</span>. Admin will verify DNS ownership and metrics before publishing to the marketplace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Domain Name *</label>
                <input
                  type="text"
                  placeholder="example.com"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Website Brand / Name</label>
                <input
                  type="text"
                  placeholder="Tech Blog Daily"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Niche *</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="altf-input text-xs bg-white"
                >
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Turnaround Time (Days) *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={tatDays}
                  onChange={(e) => setTatDays(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Domain Rating (DR)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={dr}
                  onChange={(e) => setDr(e.target.value)}
                  className="altf-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Domain Auth (DA)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={da}
                  onChange={(e) => setDa(e.target.value)}
                  className="altf-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Monthly Traffic</label>
                <input
                  type="number"
                  min="0"
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="altf-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Post Price ($)</label>
                <input
                  type="number"
                  min="0"
                  value={guestPostPrice}
                  onChange={(e) => setGuestPostPrice(e.target.value)}
                  className="altf-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Link Insertion Price ($)</label>
                <input
                  type="number"
                  min="0"
                  value={linkInsertionPrice}
                  onChange={(e) => setLinkInsertionPrice(e.target.value)}
                  className="altf-input text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Editorial Guidelines & Rules</label>
              <textarea
                rows="2"
                placeholder="Minimum 800 words, maximum 2 dofollow links, no gambling or casino content..."
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="altf-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sample Published URL</label>
              <input
                type="url"
                placeholder="https://example.com/sample-article"
                value={sampleUrl}
                onChange={(e) => setSampleUrl(e.target.value)}
                className="altf-input text-xs"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Submission workflow: Your domain will enter <strong>Pending Review</strong>. Admin will verify DNS ownership and check metric authenticity before it appears on the public marketplace.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="altf-btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-60"
            >
              {isLoading ? "Submitting for Verification..." : "Submit Listing for Admin Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
