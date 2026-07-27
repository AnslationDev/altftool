import { ArrowRight, BadgeCheck, ChevronDown, Lock } from "lucide-react";

import { HN_QUOTE_BASE } from "../_data/site";

/**
 * Service picker that hands off to the real contact flow.
 *
 * This was previously a client component that collected an email, discarded it
 * (the leads endpoint was still a TODO), and then told the visitor "Request
 * received! We'll email you free, no-obligation quotes from licensed pros near
 * you." None of that happened, and there is no pro network for it to happen
 * through — a success message for an event that never occurred is the one
 * thing a form must never show.
 *
 * So it now does the honest version of the same job: pick a service, land on
 * the contact page with that service pre-selected. That is a plain GET form,
 * which means no client JavaScript, no state, and it still works with
 * scripting disabled. Only the chosen service and the source tag travel in the
 * query string — never an email address or anything else personal.
 *
 * `services` is [{ slug, name }] passed from the server so this component
 * never imports the registry.
 */
export default function HnQuoteForm({ services = [], source = "hub-cta" }) {
  return (
    <form className="hn-quoteform" action={HN_QUOTE_BASE} method="get">
      <input type="hidden" name="topic" value="housingneeds" />
      <input type="hidden" name="source" value={source} />

      <p className="hn-quoteform-benefit">
        Tell us which job you are planning and the contact form picks it up from
        there — <strong>free, with no obligation to go ahead.</strong>
      </p>

      <div className="hn-quoteform-row">
        <span className="hn-quoteform-select">
          <label className="hn-sr-only" htmlFor={`hn-qf-service-${source}`}>
            Service
          </label>
          <select id={`hn-qf-service-${source}`} name="service" defaultValue="" required>
            <option value="" disabled>
              What does your home need?
            </option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>

        <button type="submit" className="hn-btn hn-btn--primary hn-btn--lg">
          Continue
          <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      {/* Claims here have to survive a reader checking them. The earlier row
          promised "Licensed & insured pros" and "14,000+ homeowners served";
          both were invented. */}
      <ul className="hn-quoteform-trust" aria-label="What to expect">
        <li>
          <Lock size={14} strokeWidth={2.3} aria-hidden="true" />
          No personal details in this step
        </li>
        <li>
          <BadgeCheck size={14} strokeWidth={2.3} aria-hidden="true" />
          Free to use
        </li>
      </ul>
    </form>
  );
}
