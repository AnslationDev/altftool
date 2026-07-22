"use client";

/**
 * Wallet Page — a tabbed CMS module managing the Anternet app's Wallet
 * screen top to bottom on one page. "Wallet" is the single settings/wallet
 * doc (card background, coin/₹ conversion, buttons, payment icons, footer
 * text); "Earn More" is the wallet_earnmore collection of cards. Mirrors
 * Kho Kho's self-contained tab-bar pattern.
 */

import { useCallback, useState } from "react";
import { isFirebaseConfigured } from "../../lib/firebase";
import { COLLECTIONS, SETTINGS } from "../../lib/schemas";
import CollectionManager from "../../components/CollectionManager";
import SettingsManager from "../../components/SettingsManager";
import { Toast } from "../../components/ui";
import css from "../../styles";

/** Settings-doc fallback defaults — kept in sync with the app-side fallbacks
 * in Anternet_V2's Wallet.jsx/RedeemCoinsModal.jsx so nothing looks blank or
 * broken before the first save. */
const WALLETPAGE_DEFAULTS = {
  wallet: {
    cardBackground: { mode: "image" },
    cardBorderRadius: 30,
    coinToInrRate: 0.1,
    conversionTextTemplate: "1 Coin = ₹{rate}",
    minWithdrawal: 500,
    progressCaption: "Minimum Withdrawal",
    withdrawalStatusText: "Withdrawals processed within 24 hrs",
    redeemButtonText: "Redeem Cash",
    transferButtonText: "Transfer UPI",
    paymentIcons: [],
    bottomInfoText: "",
  },
};

const TABS = [
  { id: "wallet", label: "Wallet", set: "wallet" },
  { id: "earnmore", label: "Earn More", col: "wallet_earnmore" },
];

export default function Page() {
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("wallet");

  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="mla-root mla-embed">
        <style>{css}</style>
        <div className="mla-panelcard">
          <header className="mla-pagehead"><div><h1>Firebase not configured</h1></div></header>
          <p className="mla-muted">
            Set the host app&apos;s <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables and restart.
          </p>
        </div>
      </div>
    );
  }

  const active = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="mla-root mla-embed">
      <style>{css}</style>

      <div className="mla-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {active.col && (
        <CollectionManager key={active.col} schema={COLLECTIONS[active.col]} lookups={{}} notify={notify} />
      )}

      {active.set && (
        <SettingsManager key={active.set} schema={SETTINGS[active.set]}
          defaults={WALLETPAGE_DEFAULTS[active.set]} lookups={{}} notify={notify} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
