import { CreditCard, Eye, KeyRound, ShieldCheck, Users } from "lucide-react";

import ReportAdDialog from "./ReportAdDialog";
import { T } from "../i18n/T";

/**
 * Buyer-safety guidance for the ad detail page.
 *
 * Server component on purpose. Advance-fee and OTP fraud are the two things
 * that actually hurt people on a classifieds site, so this copy has to be in
 * the prerendered HTML — visible before hydration, and readable with
 * JavaScript disabled entirely. Only the report control is interactive.
 *
 * That control is `ReportAdDialog`, not the older `ReportAdButton` inline
 * confirm: a single "are you sure?" collects nothing a moderator could act
 * on. `ReportAdButton` is still exported from ItemActions and still works —
 * it is simply no longer what this section renders.
 */

// `id` is the catalogue key; `text` stays the English source of truth and the
// fallback. Safety copy is translated in full — advance-fee and OTP fraud are
// exactly where an English-only warning can cost a Hindi reader money.
const TIPS = [
  {
    icon: Users,
    id: "safety.tip.meet",
    text: "Meet the seller in a public place during daylight. Take someone with you for anything expensive.",
  },
  {
    icon: Eye,
    id: "safety.tip.inspect",
    text: "Inspect the item properly before you pay. Switch it on, check the paperwork, take your time.",
  },
  {
    icon: CreditCard,
    id: "safety.tip.advance",
    text: "Never pay in advance — not a token, not a booking fee, not a delivery charge. Pay when you collect.",
  },
  {
    icon: KeyRound,
    id: "safety.tip.otp",
    text: "Never share an OTP, UPI PIN, card number or bank password. No genuine buyer or seller needs them.",
  },
  {
    icon: ShieldCheck,
    id: "safety.tip.report",
    text: "Report ads that ask for money up front, refuse to meet, or push you onto another app.",
  },
];

export default function SafetyTips({ title = "this ad" }) {
  return (
    <section aria-labelledby="safety-heading">
      <h2 id="safety-heading" className="bzr-section-title mb-3">
        <T id="safety.heading" fallback="Stay safe on AltF Bazaar" />
      </h2>

      <ul className="flex flex-col gap-2">
        {TIPS.map((tip) => {
          const Icon = tip.icon;
          return (
            <li key={tip.id} className="bzr-note">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
              <span>
                <T id={tip.id} fallback={tip.text} />
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3">
        <ReportAdDialog title={title} />
      </div>
    </section>
  );
}
