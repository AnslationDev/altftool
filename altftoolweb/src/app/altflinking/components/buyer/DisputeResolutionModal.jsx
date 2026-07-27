/**
 * Escrow Dispute Resolution & Refund Claim Modal Component
 * Location: src/app/altflinking/components/buyer/DisputeResolutionModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function DisputeResolutionModal({ isOpen, onClose, order, onFileDispute }) {
  const [reason, setReason] = useState("LINK_REMOVED");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description) return;

    onFileDispute({
      orderId: order.id,
      reason,
      description,
      date: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-md">
      <div className="altf-card w-full max-w-md p-6 space-y-5 border-rose-500/40">

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">File Escrow Dispute</h3>
              <p className="text-xs text-slate-500">Claim 100% refund for Order {order.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-white font-mono">{order.websiteDomain}</p>
              <p className="text-slate-500">Held in Escrow: <strong className="text-emerald-400 font-mono">${order.price}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dispute Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="altf-input text-xs font-bold"
              >
                <option value="LINK_REMOVED">Link Was Removed / Deleted by Publisher</option>
                <option value="NOFOLLOW_CHANGED">Link Rel Tag Changed to Nofollow / Sponsored</option>
                <option value="TAT_EXCEEDED">Publisher Exceeded Turnaround Deadline</option>
                <option value="CONTENT_POOR">Content Quality Violation / Article Not Indexed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Evidence / Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Provide URL link status details or crawler proof..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="altf-input text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="altf-btn-secondary py-2 px-4 text-xs">
                Cancel
              </button>
              <button type="submit" className="altf-btn-primary py-2 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-500">
                <span>File Escrow Dispute</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200 mx-auto animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Dispute Filed & Escrow Locked</h4>
            <p className="text-xs text-slate-500">Our automated crawler will re-verify the URL within 2 hours or process a 100% refund.</p>
          </div>
        )}

      </div>
    </div>
  );
}
