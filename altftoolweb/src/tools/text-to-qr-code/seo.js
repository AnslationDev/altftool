const seo = {
  title: "Text to QR Code — Wi-Fi, vCard & 8 More Payload",
  metaDescription:
    "Encode text, URLs, Wi-Fi, vCards and events as QR codes with colour, sizes to 512 px, L-H error correction and a centre logo — export PNG, SVG or JPEG.",
  steps: [
    "Pick a payload from the ten type tabs — Text, URL, Email, Phone, SMS, WhatsApp, Wi-Fi, Contact, Location or Event — and fill in its fields; the code redraws as you type.",
    "Under 'Customize QR Code', set the colours, a Size from Small (150) to Print (512), the Margin, Error Correction from Low (7%) to High (30%), and optionally Upload a centre logo.",
    "Choose PNG, SVG or JPEG in the Format selector and press 'Download QR Code' — the file saves as qr-code.png, qr-code.svg or qr-code.jpeg, with Copy, Print and Share below.",
  ],
  intro:
    "Text to QR Code encodes plain text, a URL, an email, a phone number, an SMS, a WhatsApp link, Wi-Fi credentials, a vCard contact, a geo location or a calendar event into a scannable QR code using the standard payload formats each phone camera already understands. Pick the payload type, fill the fields, and the code redraws live as you type. You control colour, size from 150 to 512 px, quiet-zone margin, error-correction level L/M/Q/H and an optional centre logo, then export PNG, SVG or JPEG.",
  useCases: [
    "Sticking a Wi-Fi code on the guest-room wall so visitors join the network without you reading out a 20-character password — the WIFI: payload carries the SSID, WPA/WEP type and passphrase, so the phone joins on scan.",
    "Printing a contact QR on a conference badge or business card: the vCard 3.0 payload holds name, organisation, phone, email and website, so a scan drops the whole card into the other person's address book instead of a typed URL.",
    "Adding a scannable event code to a poster — the iCalendar payload carries the title, start and end datetimes, location and description, so attendees add the event to their calendar in one tap.",
  ],
  benefits: [
    [
      "Ten real payload types, not just links",
      "Text, URL, mailto with subject and body, tel, SMS, wa.me, WIFI, vCard, geo and iCalendar are each built to their own spec rather than pasted as raw text.",
    ],
    [
      "Error correction you choose",
      "L, M, Q and H recover roughly 7%, 15%, 25% and 30% of a damaged or logo-covered code, so you can raise the level before adding a centre logo.",
    ],
    [
      "Print-ready vector output",
      "Export SVG for signage that scales without pixel edges, or PNG/JPEG at up to 512 px, with a transparent-background option for overlaying on artwork.",
    ],
  ],
  faqs: [
    [
      "What error correction level should I use for a QR code with a logo?",
      "Use H, which recovers about 30% of the code. The logo here covers roughly 18% of the code's width with the modules beneath it excavated, so levels L (7%) and M (15%) can leave too little redundancy to scan reliably; test the printed code before committing to a run.",
    ],
    [
      "How do I make a QR code that connects to my Wi-Fi?",
      "Choose the Wi-Fi type and enter the SSID, encryption (WPA, WEP or none) and password. The tool writes the standard WIFI:S:<ssid>;T:<type>;P:<password>;; payload that iOS and Android cameras recognise natively — no app needed. Anyone who can photograph the code can read the password, so keep it off public-facing walls.",
    ],
    [
      "Why is my QR code not scanning?",
      "Most failures come from too little contrast, too small a print size, or no quiet zone. Keep a dark foreground on a light background, keep the margin at 4 modules or more rather than 0, and size the print so the code is at least about 2 cm square at normal scanning distance — long payloads such as vCards make a denser grid that needs more physical area.",
    ],
    [
      "Should I download PNG or SVG?",
      "Download SVG for anything printed and PNG for anything on screen. SVG stays sharp at any size because it stores the modules as shapes, while PNG at the 512 px Print setting is ample for web, slides and small labels; JPEG is offered for legacy workflows but its compression can soften module edges.",
    ],
  ],
};

export default seo;
