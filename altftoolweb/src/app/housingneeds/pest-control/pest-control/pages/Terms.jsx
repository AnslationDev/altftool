import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => (
  <div className="max-w-[780px] mx-auto px-6 py-14">
    <Link to="/" className="text-sm text-[#1D7A43]">← Back to Home</Link>
    <h1 className="text-5xl font-bold tracking-tight mt-4 mb-3">Terms &amp; Conditions</h1>
    <div className="text-sm text-[#64748b] mb-8">Effective January 2026</div>

    <div className="prose prose-sm max-w-none text-[#374151]">
      <h3>Service Agreement</h3>
      <p>By booking a service with PestX Miami you agree to these terms. All services are provided subject to inspection and technician availability. Pricing is an estimate; final quotes are provided after on-site assessment.</p>

      <h3>Payment &amp; Warranties</h3>
      <p>Payment is due at time of service unless otherwise arranged. Warranties are service-specific and require full payment. Warranties are void if property conditions change significantly or if customer interferes with treated areas.</p>

      <h3>Cancellations</h3>
      <p>24-hour notice is required to avoid a cancellation fee. We make every effort to accommodate schedule changes.</p>

      <h3>Liability</h3>
      <p>PestX Miami carries full insurance. Our liability is limited to the cost of the service provided. We are not responsible for pre-existing damage discovered during treatment.</p>

      <p className="text-xs mt-9 text-[#64748b]">This is placeholder legal copy. A real business should have professionally drafted terms reviewed by an attorney.</p>
    </div>
  </div>
);

export default Terms;
