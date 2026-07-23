import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => (
  <div className="max-w-[780px] mx-auto px-6 py-14">
    <Link to="/" className="text-sm text-[#1D7A43]">← Back to Home</Link>
    <h1 className="text-5xl font-bold tracking-tight mt-4 mb-3">Privacy Policy</h1>
    <div className="text-sm text-[#64748b] mb-8">Last updated: January 2026</div>

    <div className="prose prose-sm max-w-none text-[#374151]">
      <p>PestX Miami respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our website or services.</p>

      <h3>Information We Collect</h3>
      <p>We collect information you provide directly (name, address, phone, email) when requesting services, booking appointments, or contacting us. We may also collect basic usage data through cookies for improving site experience.</p>

      <h3>How We Use Your Information</h3>
      <ul>
        <li>To provide pest control services and schedule appointments</li>
        <li>To communicate with you about your service, quotes, or follow-ups</li>
        <li>To improve our services and website</li>
        <li>For legal compliance and safety records</li>
      </ul>

      <h3>Data Sharing</h3>
      <p>We never sell your information. We may share limited data with trusted service partners only as required to complete your requested service (e.g., technicians). We comply with all Florida privacy regulations.</p>

      <h3>Your Rights</h3>
      <p>You may request access to, correction of, or deletion of your personal data by contacting us at info@pestxmiami.com. We respond to all requests within 30 days.</p>

      <p className="text-xs mt-9 text-[#64748b]">This is a placeholder policy. For a real production site, consult a legal professional to customize this document.</p>
    </div>
  </div>
);

export default Privacy;
