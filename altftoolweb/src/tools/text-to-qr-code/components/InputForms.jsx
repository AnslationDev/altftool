"use client";

import { Globe, User, Mail, Phone, MessageSquare, MessageCircle, Wifi, MapPin, Calendar, FileText } from "lucide-react";

function Field({ id, label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-(--primary) font-medium transition-all placeholder:text-(--muted-foreground)"
      />
    </div>
  );
}

function TextArea({ id, label, value, onChange, placeholder, maxLength, charCount }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
          {label}
        </label>
        {maxLength > 0 && (
          <span className="text-xs font-medium text-(--muted-foreground)">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength || undefined}
        rows={4}
        className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-(--primary) font-medium transition-all placeholder:text-(--muted-foreground) resize-none"
      />
    </div>
  );
}

function Select({ id, label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-(--primary) font-medium transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function InputForms({ activeType, formData, setFormData }) {
  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  if (activeType === "TEXT") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <FileText size={18} />
          <h3 className="font-semibold text-sm">Plain Text Content</h3>
        </div>
        <TextArea
          id="qr-text"
          label="Your Text"
          value={formData.text || ""}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Enter any text content to encode in the QR code..."
          maxLength={2000}
          charCount={(formData.text || "").length}
        />
      </div>
    );
  }

  if (activeType === "URL") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <Globe size={18} />
          <h3 className="font-semibold text-sm">Website URL</h3>
        </div>
        <Field
          id="qr-url"
          label="URL"
          value={formData.url || ""}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>
    );
  }

  if (activeType === "EMAIL") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <Mail size={18} />
          <h3 className="font-semibold text-sm">Email Address</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-email"
            label="Email"
            value={formData.email || ""}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@example.com"
            type="email"
          />
          <Field
            id="qr-emailSubject"
            label="Subject"
            value={formData.emailSubject || ""}
            onChange={(e) => update("emailSubject", e.target.value)}
            placeholder="Subject line"
          />
        </div>
        <TextArea
          id="qr-emailBody"
          label="Body"
          value={formData.emailBody || ""}
          onChange={(e) => update("emailBody", e.target.value)}
          placeholder="Email body text..."
          maxLength={500}
          charCount={(formData.emailBody || "").length}
        />
      </div>
    );
  }

  if (activeType === "PHONE") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <Phone size={18} />
          <h3 className="font-semibold text-sm">Phone Number</h3>
        </div>
        <Field
          id="qr-phone"
          label="Phone Number"
          value={formData.phone || ""}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 234 567 8900"
          type="tel"
        />
      </div>
    );
  }

  if (activeType === "SMS") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <MessageSquare size={18} />
          <h3 className="font-semibold text-sm">SMS Message</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-smsPhone"
            label="Phone Number"
            value={formData.smsPhone || ""}
            onChange={(e) => update("smsPhone", e.target.value)}
            placeholder="+1 234 567 8900"
            type="tel"
          />
        </div>
        <TextArea
          id="qr-smsMessage"
          label="Message"
          value={formData.smsMessage || ""}
          onChange={(e) => update("smsMessage", e.target.value)}
          placeholder="Your SMS message..."
          maxLength={300}
          charCount={(formData.smsMessage || "").length}
        />
      </div>
    );
  }

  if (activeType === "WHATSAPP") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <MessageCircle size={18} />
          <h3 className="font-semibold text-sm">WhatsApp Link</h3>
        </div>
        <Field
          id="qr-whatsappPhone"
          label="Phone Number (with country code)"
          value={formData.whatsappPhone || ""}
          onChange={(e) => update("whatsappPhone", e.target.value)}
          placeholder="1234567890"
          type="tel"
        />
        <TextArea
          id="qr-whatsappMessage"
          label="Pre-filled Message"
          value={formData.whatsappMessage || ""}
          onChange={(e) => update("whatsappMessage", e.target.value)}
          placeholder="Optional pre-filled message..."
          maxLength={500}
          charCount={(formData.whatsappMessage || "").length}
        />
      </div>
    );
  }

  if (activeType === "WIFI") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <Wifi size={18} />
          <h3 className="font-semibold text-sm">Wi-Fi Credentials</h3>
        </div>
        <Field
          id="qr-wifiSsid"
          label="Network Name (SSID)"
          value={formData.wifiSsid || ""}
          onChange={(e) => update("wifiSsid", e.target.value)}
          placeholder="MyWiFiNetwork"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-wifiPass"
            label="Password"
            value={formData.wifiPass || ""}
            onChange={(e) => update("wifiPass", e.target.value)}
            placeholder="Password"
            type="password"
          />
          <Select
            id="qr-wifiEnc"
            label="Encryption"
            value={formData.wifiEnc || "WPA"}
            onChange={(e) => update("wifiEnc", e.target.value)}
            options={[
              { value: "WPA", label: "WPA/WPA2" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: "None" },
            ]}
          />
        </div>
      </div>
    );
  }

  if (activeType === "VCARD") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <User size={18} />
          <h3 className="font-semibold text-sm">Contact Information (vCard)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-vcardFn"
            label="First Name"
            value={formData.vcardFn || ""}
            onChange={(e) => update("vcardFn", e.target.value)}
            placeholder="John"
          />
          <Field
            id="qr-vcardLn"
            label="Last Name"
            value={formData.vcardLn || ""}
            onChange={(e) => update("vcardLn", e.target.value)}
            placeholder="Doe"
          />
          <Field
            id="qr-vcardTel"
            label="Phone"
            value={formData.vcardTel || ""}
            onChange={(e) => update("vcardTel", e.target.value)}
            placeholder="+1 234 567 8900"
            type="tel"
          />
          <Field
            id="qr-vcardEmail"
            label="Email"
            value={formData.vcardEmail || ""}
            onChange={(e) => update("vcardEmail", e.target.value)}
            placeholder="john@example.com"
            type="email"
          />
          <Field
            id="qr-vcardOrg"
            label="Company"
            value={formData.vcardOrg || ""}
            onChange={(e) => update("vcardOrg", e.target.value)}
            placeholder="Company name"
            className="sm:col-span-2"
          />
          <Field
            id="qr-vcardUrl"
            label="Website"
            value={formData.vcardUrl || ""}
            onChange={(e) => update("vcardUrl", e.target.value)}
            placeholder="https://example.com"
            className="sm:col-span-2"
          />
        </div>
      </div>
    );
  }

  if (activeType === "LOCATION") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <MapPin size={18} />
          <h3 className="font-semibold text-sm">Geographic Location</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-lat"
            label="Latitude"
            value={formData.lat || ""}
            onChange={(e) => update("lat", e.target.value)}
            placeholder="28.6139"
          />
          <Field
            id="qr-lng"
            label="Longitude"
            value={formData.lng || ""}
            onChange={(e) => update("lng", e.target.value)}
            placeholder="77.2090"
          />
        </div>
        <Field
          id="qr-locationLabel"
          label="Label (optional)"
          value={formData.locationLabel || ""}
          onChange={(e) => update("locationLabel", e.target.value)}
          placeholder="Office, Home, etc."
        />
      </div>
    );
  }

  if (activeType === "CALENDAR") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-(--primary)">
          <Calendar size={18} />
          <h3 className="font-semibold text-sm">Calendar Event</h3>
        </div>
        <Field
          id="qr-calTitle"
          label="Event Title"
          value={formData.calTitle || ""}
          onChange={(e) => update("calTitle", e.target.value)}
          placeholder="Team Meeting"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="qr-calStart"
            label="Start Date & Time"
            value={formData.calStart || ""}
            onChange={(e) => update("calStart", e.target.value)}
            type="datetime-local"
          />
          <Field
            id="qr-calEnd"
            label="End Date & Time"
            value={formData.calEnd || ""}
            onChange={(e) => update("calEnd", e.target.value)}
            type="datetime-local"
          />
        </div>
        <TextArea
          id="qr-calDesc"
          label="Description"
          value={formData.calDesc || ""}
          onChange={(e) => update("calDesc", e.target.value)}
          placeholder="Event details..."
          maxLength={500}
          charCount={(formData.calDesc || "").length}
        />
        <Field
          id="qr-calLocation"
          label="Location"
          value={formData.calLocation || ""}
          onChange={(e) => update("calLocation", e.target.value)}
          placeholder="Conference room or address"
        />
      </div>
    );
  }

  return null;
}
