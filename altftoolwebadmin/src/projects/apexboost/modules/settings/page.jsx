"use client";

import React, { useState, useEffect } from "react";
import { Save, Globe, Mail, Phone, MapPin } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Apex Boost",
    siteUrl: "https://apexboost.com",
    contactEmail: "contact@apexboost.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
    metaDescription: "Apex Boost — Digital, Affiliate & Advertising Marketing Agency",
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/apexboost/data?section=settings')
      .then(r => r.json())
      .then(j => { if (j.success) setSettings(j.data); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/apexboost/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'settings', data: settings }),
      });
      if (res.ok) alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  const updateSocial = (key, value) => {
    setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Site Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Configure your website settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe size={20} className="text-(--primary)" /> General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
              <input type="text" value={settings.siteUrl} onChange={e => setSettings({...settings, siteUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Mail size={20} className="text-(--primary)" /> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input type="text" value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">SEO Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea value={settings.metaDescription} onChange={e => setSettings({...settings, metaDescription: e.target.value})} rows={3} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{platform}</label>
                <input type="text" value={settings.socialLinks[platform]} onChange={e => updateSocial(platform, e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
