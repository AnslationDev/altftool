/**
 * Bulk Cart & Multi-Domain Placement Request Drawer Component
 * Location: src/app/altflinking/components/marketplace/CartCheckoutDrawer.jsx
 */

"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

import { resolveGuestPostPrice, formatPrice, isOrderable } from "../../lib/pricing";
export default function CartCheckoutDrawer({ isOpen, onClose, cartItems = [], onRemoveCartItem, onCheckout }) {
  const [targetUrl, setTargetUrl] = useState("https://mycompany.com/saas");
  const [anchorText, setAnchorText] = useState("best growth platform");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const hasUnknownPrices = cartItems.some((item) => !isOrderable(item));
  const totalPrice = cartItems.reduce((acc, item) => acc + (resolveGuestPostPrice(item) ?? 0), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || hasUnknownPrices) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onCheckout({
        items: cartItems,
        totalPrice,
        targetUrl,
        anchorText,
      });
      onClose();
    } catch (error) {
      setSubmitError(error.message || "Failed to submit order requests");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="altf-drawer-overlay" onClick={onClose} />
      <div className="altf-drawer space-y-6">

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Bulk Backlink Cart ({cartItems.length})</h2>
              <p className="text-xs text-slate-500">Submit placement requests to multiple publishers</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-10 text-center space-y-3 altf-card">
            <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">Your Backlink Cart is Empty</p>
            <p className="text-xs text-slate-500">Add approved listings from the directory to submit placement requests.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-5">
            {/* Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-white font-mono">{item.domain}</p>
                    <p className="text-[10px] text-slate-500">DR {item.dr} • {item.niche}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-400">{formatPrice(resolveGuestPostPrice(item))}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Inputs */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Landing Page URL *</label>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Anchor Text *</label>
                <input
                  type="text"
                  required
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                  className="altf-input text-xs"
                />
              </div>
            </div>

            {/* Total Price & Checkout */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Current Listed Total ({cartItems.length} Domains)</span>
                <span className="text-lg font-black text-indigo-700 font-mono">{formatPrice(totalPrice)}</span>
              </div>

              {hasUnknownPrices ? (
                <p className="text-xs text-rose-600">Remove listings with an unknown price before submitting.</p>
              ) : null}
              {submitError ? <p className="text-xs text-rose-600">{submitError}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting || hasUnknownPrices}
                className="altf-btn-primary w-full py-3 text-xs font-bold"
              >
                {isSubmitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <span>Submit Request ({formatPrice(totalPrice)})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}
