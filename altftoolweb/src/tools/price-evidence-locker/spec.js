// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "price-evidence-locker",
  "title": "Price Evidence Locker",
  "description": "Product price aur offer claims ka timestamped evidence save kare.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Shopping",
    "Security & Privacy"
  ],
  "icon": "archive-restore",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "url",
      "label": "Product or offer URL",
      "type": "text",
      "default": "https://shop.example/product"
    },
    {
      "key": "seller",
      "label": "Seller",
      "type": "text",
      "default": "Example Seller"
    },
    {
      "key": "price",
      "label": "Observed price",
      "type": "text",
      "default": "₹2,499 including delivery"
    },
    {
      "key": "claim",
      "label": "Offer claim and conditions",
      "type": "textarea",
      "default": "30% off until 31 July; new customers only."
    },
    {
      "key": "captured",
      "label": "Capture date",
      "type": "date",
      "default": "2026-07-24"
    },
    {
      "key": "evidence",
      "label": "Screenshot or saved page",
      "type": "file",
      "default": "",
      "hint": "Optional local evidence file",
      "required": false
    }
  ],
  "presets": [
    {
      "label": "Example offer",
      "values": {
        "url": "https://shop.example/product",
        "seller": "Example Seller",
        "price": "₹2,499",
        "claim": "30% off until 31 July.",
        "captured": "2026-07-24",
        "evidence": null
      }
    }
  ],
  "outputLabel": "Evidence manifest",
  "note": "Creates a local evidence manifest and checksum; it does not independently timestamp, notarize, or prove what a remote page displayed. Preserve the original file and transaction records."
},
  compute: async (values) => {
      const file = values.evidence;
      const source = [values.url, values.seller, values.price, values.claim, values.captured, file?.name || "", file?.size || 0, file?.dataUrl || file?.text || ""].join("\n");
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
      const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      return { result: "Evidence manifest " + checksum.slice(0, 12), caption: file ? file.name + " included in local checksum" : "Metadata-only manifest; attach a saved file for stronger evidence", rows: [["Seller", values.seller], ["Observed price", values.price], ["Capture date", values.captured], ["File", file?.name || "Not attached"], ["SHA-256", checksum]], list: ["URL: " + values.url, "Claim: " + values.claim, "Keep the original evidence file unchanged alongside this downloaded manifest."] };
    },
};

export default spec;
