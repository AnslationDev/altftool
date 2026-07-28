const seo = {
  title: "QR Code Generator — URL, WiFi, vCard & UPI",
  h1: "QR Code Generator with Logo, WiFi, vCard and UPI",
  metaDescription:
    "Make QR codes for links, WiFi logins, vCard contacts, UPI IDs or a bulk CSV. Level-H error correction, centre logo, PNG download — all in your browser.",
  intro:
    "This QR Generator builds Model 2 QR codes with qrcode.react 4.2, which wraps Nayuki's qrcodegen encoder and paints the module matrix onto an HTML canvas at your display's device pixel ratio. Every code is fixed at error-correction level H — the highest of the four levels, with roughly 30% of the symbol recoverable — and includes the spec's 4-module quiet zone, which is what lets a logo sit in the centre without killing the scan. Encoding, logo compositing and PNG export all run on your own device via canvas.toDataURL(); the tool makes no network requests, so your URLs, WiFi passwords and contact details never leave the page and there is no signup.",
  useCases: [
    "Print a guest WiFi card: the WiFi tab writes the standard WIFI:S:<ssid>;T:WPA;P:<password>;; payload that iOS and Android camera apps join automatically.",
    "Put a scannable contact on a business card or event badge using the vCard 3.0 output with name, phone and email fields.",
    "Generate a batch of link QRs from a spreadsheet export — one URL per line in a CSV, downloaded as qr-bulk-1.png, qr-bulk-2.png and so on.",
  ],
  benefits: [
    [
      "Level H error correction on every code",
      "The encoder is locked to the highest of the four QR error-correction levels, so about 30% of the symbol can be smudged, printed over or covered by artwork and the code still reads.",
    ],
    [
      "Five payload types, one live preview",
      "Website URLs, WiFi credentials, vCard 3.0 contacts, UPI deep links (upi://pay?pa=…&cu=INR) and bulk CSV lists all render into the same canvas as you type — no mode switching or page reloads.",
    ],
    [
      "A centre logo that doesn't break the scan",
      "An uploaded image is drawn at 40x40 px in the middle with the modules beneath it excavated rather than painted over, so the reader sees clean whitespace instead of your artwork.",
    ],
    [
      "Nothing is uploaded",
      "There are no API calls anywhere in this tool. The logo you pick is held as a local blob URL, the QR matrix is computed in JavaScript, and the download comes straight off the canvas.",
    ],
  ],
  faqs: [
    [
      "Are these QR codes free and do they expire?",
      "Free, unlimited, and they never expire. Each code is static — your URL, text or WiFi string is encoded directly into the pattern, so there is no short link or redirect that can be shut off. The trade-off is that a printed code can't be edited later; a new destination means generating a new code.",
    ],
    [
      "How do I make a WiFi QR code phones can scan to join?",
      "Open the WiFi tab and enter the network name (SSID) and password. The tool builds the standard WIFI:S:<ssid>;T:WPA;P:<password>;; payload that iOS and Android camera apps recognise, with encryption set to WPA/WPA2. Download the PNG and print it — the password is encoded in plain text inside the code, so treat the printout the way you'd treat the password itself.",
    ],
    [
      "Can I add a logo to a QR code without breaking it?",
      "Yes. Upload any image under Customize Style and it is drawn at 40x40 pixels dead centre, with the QR modules underneath excavated instead of covered. Because every code here uses error-correction level H (~30% recoverable), a centre mark that size normally stays readable — still test-scan with two phones before sending anything to print.",
    ],
    [
      "What resolution PNG do I get?",
      "The size dropdown offers 140 px (Small), 220 px (Medium, the default) and 300 px (Large), and the canvas is drawn at your screen's device pixel ratio — so on a 2x retina display the Large setting exports a 600x600 PNG. Output is PNG only, named after the tab you used: qr-code-URL.png, qr-code-WIFI.png, and so on. For large-format print, scale the vector-free PNG up cautiously or generate at Large on a HiDPI screen.",
    ],
    [
      "Can I generate QR codes in bulk from a CSV?",
      "Yes. The Bulk tab reads a .csv or .txt file, treats every non-empty line as one QR value, and saves them one at a time as qr-bulk-1.png, qr-bulk-2.png and so on. It steps through at about 200 ms per code, so a 100-row file takes roughly 20 seconds, and your browser will ask permission to allow multiple downloads.",
    ],
    [
      "Is my data uploaded when I generate a QR code?",
      "No. The tool contains no fetch or API calls — encoding runs locally through qrcode.react's bundled qrcodegen encoder, the preview is an HTML canvas element, and the file is produced by canvas.toDataURL(\"image/png\"). WiFi passwords, phone numbers, UPI IDs, CSV rows and your logo file all stay inside the browser tab, and there is no account to create.",
    ],
    [
      "Can I track how many times my QR code is scanned?",
      "No — these are static codes with the data encoded directly into the pattern, so there is no redirect that could count scans. The figure in the analytics panel on this page is a display placeholder that ticks up when you download, not real scan data. Scan counting requires a dynamic short-link service that you own the redirect for.",
    ],
    [
      "How does the UPI QR code option work?",
      "The UPI tab assembles a upi://pay deep link in the form upi://pay?pa=<UPI ID>&pn=<merchant name>&cu=INR, which payment apps read to pre-fill the payee. The amount is left empty, so the person paying types it in. Verify the UPI ID with a test scan before printing or sharing — a typo still produces a perfectly valid QR code, just one that points at the wrong address.",
    ],
  ],
  steps: [
    "Pick a tab — Website, WiFi, Contact, UPI or Bulk — and fill in the fields. The preview canvas on the right re-renders as you type.",
    "Optionally set the QR colour, choose Small, Medium or Large (140, 220 or 300 px), and upload a centre logo.",
    "Click Download QR to save the PNG, or Download Batch to export one file per row of your CSV.",
  ],
};

export default seo;
