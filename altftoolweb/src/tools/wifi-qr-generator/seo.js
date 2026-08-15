const seo = {
  title: "WiFi QR Code Generator with Printable Table Card",
  metaDescription:
    "Encodes SSID and password into the WIFI: format phones scan to join. Download a 256px PNG or print a table card — generated in your browser.",
  steps: [
    "Enter the Network name (SSID), choose the Security type (WPA/WPA2/WPA3, WEP or none) and type the password; tick 'Hidden network' if the SSID is not broadcast.",
    "Optionally add a Card label heading, then click 'Download PNG' for a 256-pixel wifi-qr-<network>.png, or 'Print card' for the printable table card.",
    "Guests point a phone camera at the code and tap the join prompt; 'Copy code text' copies the raw WIFI:T:...;S:...;P:...;; payload.",
  ],
  intro:
    "A WiFi QR code generator encodes your network name, security type and password into the standard WIFI:T:WPA;S:<ssid>;P:<password>;; payload that phone cameras recognise as a join-network request. Enter the SSID, pick WPA/WPA2/WPA3, WEP or open, and you get a scannable code you can download as a 256-pixel PNG or send to a printer as a table card. The code is drawn in the browser, so the password is never transmitted to build it.",
  useCases: [
    "You run a cafe or a guest room and are tired of reading out a 20-character password — print the card, put it on the table, and guests join by pointing a camera at it",
    "You just changed the router password and want a fresh code taped inside the cupboard so the family can rejoin without hunting for the new one",
    "You are setting up a hidden network for an event and need a code that carries the H:true flag so phones can still find and join the SSID it does not broadcast",
  ],
  benefits: [
    ["Correct escaping for awkward passwords", "Backslashes, semicolons, commas, colons and quotes in the SSID or password are escaped so the payload does not break mid-scan."],
    ["Print-ready card, not just an image", "A separate print layout renders the code with your own heading, the network name and a scan hint, sized for a table tent."],
    ["Handles hidden and open networks", "Choose WPA, WEP or no password, and flag the network as hidden so the join still works when the SSID is not broadcast."],
  ],
  faqs: [
    [
      "How do I scan a WiFi QR code?",
      "Open the normal camera app and point it at the code — iOS 11 and later and Android 10 and later both recognise the WIFI: payload and offer a Join Network prompt. Older Androids may need a QR scanner app or the WiFi settings screen, which on Android 10+ has its own scan option under Add network.",
    ],
    [
      "Why does it warn me that my password is too short?",
      "WPA and WPA2 personal keys must be between 8 and 63 characters, so anything under 8 will not be accepted by the router even though the code will still encode it. The warning only appears for WPA — WEP and open networks have different rules.",
    ],
    [
      "Is my WiFi password sent anywhere?",
      "No. The payload string and the QR image are built in the page and the downloaded PNG is produced from the on-page canvas, so the password never leaves the device. Do keep in mind that the printed code itself contains the password in plain form — anyone who scans it can read it.",
    ],
    [
      "Does the code still scan if I shrink or print it small?",
      "Usually yes. The code uses error-correction level M, which tolerates roughly 15% of the symbol being damaged or obscured, and it is rendered with a quiet-zone margin. As a practical floor, print it at least 2 cm across and keep the white border intact; longer passwords make a denser code that needs more size.",
    ],
  ],
};

export default seo;
