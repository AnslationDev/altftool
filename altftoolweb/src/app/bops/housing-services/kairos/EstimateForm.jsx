import { ShieldCheck } from "lucide-react";

export default function EstimateForm() {
  return (
    <div className="kairos-premium-form" aria-label="Disabled fictional enquiry form preview">
      <div className="kairos-form-success" role="note">
        <ShieldCheck size={32} className="kairos-success-icon" aria-hidden="true" />
        <div className="kairos-success-text">
          <h3>Demo Form Disabled</h3>
          <p>
            This fictional preview does not request, save or send personal information. No enquiry or booking can be submitted.
          </p>
        </div>
      </div>

      <button className="kairos-form-submit-btn" type="button" disabled>
        NO LIVE SUBMISSION
      </button>

      <div className="kairos-form-footer-trust">
        <ShieldCheck size={14} className="kairos-trust-shield-icon" aria-hidden="true" />
        <span>No personal-data fields are present.</span>
      </div>
    </div>
  );
}
