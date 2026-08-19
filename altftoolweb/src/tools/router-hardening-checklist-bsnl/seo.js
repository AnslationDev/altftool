const seo = {
  title: "BSNL Router Hardening Checklist: 17 Settings",
  metaDescription:
    "Work through 17 BSNL ONT/ADSL steps — admin/admin accounts, Telnet, TR-069, WPS, UPnP — scored 0-100 with the band capped while criticals stay open.",
  steps: [
    "Mark each of the 17 BSNL-specific steps 'Done' or 'Not applicable' — factory admin accounts, Telnet, the WAN-facing admin page, TR-069, WPS, WPA2-AES, UPnP, port forwards and more.",
    "Watch the Hardening score out of 100: while any critical step stays open the band is capped at 'Weak', and the panel shows critical-open count plus estimated minutes to finish.",
    "Click 'Copy summary' for a plain-text plan listing every open step with its how-to instruction.",
  ],
  intro:
    "The BSNL Broadband Router Hardening Checklist scores Bharat Fiber and older ADSL routers for the controls that are most often missed: factory admin accounts, Telnet, WAN-facing web UI, TR-069/CWMP review, WPS, WPA2-AES, UPnP, stale port forwards, guest SSID, DNS and firmware records.",
  useCases: [
    "Audit a BSNL ONT after installation, exchange visit, factory reset or router replacement.",
    "Create a step-by-step hardening list for a family member running a BSNL fibre or ADSL connection.",
    "Check whether Telnet, WPS, UPnP or remote web administration are still exposing the router.",
    "Record model and firmware information before escalating an old router to the BSNL exchange.",
  ],
  benefits: [
    ["BSNL-specific risk model", "The copy covers Telnet, TR-069/CWMP and multi-account defaults seen on BSNL-supplied routers."],
    ["Critical-step cap", "The score cannot look healthy while critical controls remain open."],
    ["Copyable action plan", "Export the score, open critical items and remaining setup time as a plain-text checklist."],
  ],
  faqs: [
    [
      "What is the usual BSNL router login address?",
      "Most BSNL Bharat Fiber ONTs and older ADSL modems answer at 192.168.1.1, but the sticker or installation slip should be treated as the final source for your model.",
    ],
    [
      "Should I turn off TR-069 on a BSNL router?",
      "On an ISP-managed ONT, TR-069/CWMP may be needed for provisioning. The checklist asks you to record it and then make sure extra WAN services such as Telnet, FTP, HTTP and UPnP are not open beside it.",
    ],
    [
      "Why does Telnet matter?",
      "Telnet sends credentials without encryption and is a common path for router botnets. If the router offers Telnet, disable it for both LAN and WAN unless you have a controlled maintenance need.",
    ],
    [
      "What is the default username and password for a BSNL router?",
      "Most BSNL-supplied modems and ONTs use admin/admin for the customer account, with the actual value printed on the label. Many units also carry a second, higher-privilege technician account that is not shown on the sticker, so change the password on every account the user-management page lists and note any you cannot edit so you can raise it with the exchange.",
    ],
  ],
};

export default seo;
