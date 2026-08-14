const seo = {
  title: "Tenda Router Hardening Checklist: 18 Scored Steps",
  intro:
    "An eighteen-step, severity-weighted hardening pass for Tenda AC, F and N series routers and Nova mesh kits, built around the two things that make budget hardware different. First, Tenda's setup wizard offers to reuse the Wi-Fi password as the router login password, so on a default install everyone with the Wi-Fi key is an administrator. Second, the web interface has a long published record of buffer-overflow and command-injection flaws, several of which need no login at all, which makes firmware currency and WAN exposure the highest-value fixes. WPS, UPnP, port forwards, the cloud app account and the guest network are all scored, and the result stays capped while any critical item is open.",
  useCases: [
    "You accepted the Tenda setup wizard's defaults and want to check whether your Wi-Fi password is also your admin password.",
    "A cheap Tenda router has been running for years untouched, and you need to find out whether it still receives firmware at all.",
    "You are securing a rented room or a small office where other people can physically reach the router and its reset button.",
    "You want visitors and smart-home gadgets on an isolated guest network instead of alongside your laptop and network storage.",
  ],
  benefits: [
    ["Catches the shared-password trap", "The first critical step is separating the admin login from the Wi-Fi key, which the setup wizard actively encourages you to merge."],
    ["Treats end-of-life as a finding", "If Tenda no longer publishes firmware for your model, the checklist says so rather than pretending a toggle fixes it."],
    ["Tests from the outside", "One step has you check your public IP from mobile data, which catches services a firmware update quietly turned back on."],
  ],
  faqs: [
    [
      "What is the default IP and login for a Tenda router?",
      "Tenda routers conventionally answer at http://192.168.0.1, or at tendawifi.com from a device on the network. There is often no separate factory admin password: the first-run wizard sets one, and it offers to reuse the Wi-Fi password for it, which is why separating the two is the first thing to fix.",
    ],
    [
      "Is my Wi-Fi password the same as my Tenda router password?",
      "It very often is, because Tenda's setup wizard offers exactly that and most people accept. The consequence is that every guest, tenant or neighbour holding the Wi-Fi key can log into the router and change anything, and rotating the Wi-Fi key alone does not lock them out of the admin page. Set a distinct login password under System Settings.",
    ],
    [
      "Are Tenda routers safe to use?",
      "They are usable if the firmware is current, remote web management is off and the model still receives updates. The concern is that Tenda's web interface has accumulated a long run of published buffer-overflow and command-injection vulnerabilities, a number of which require no authentication, and Mirai-family botnets scan for them. On a model that no longer gets firmware, replacement is the only real fix.",
    ],
    [
      "How do I stop my router being reachable from the internet?",
      "Disable Remote Web Management under Advanced Settings, clear any allowed remote IP, then verify from outside: turn Wi-Fi off on your phone, look up your home public IP, and try to open it over http and https on mobile data. Nothing should answer. Repeat that check after each firmware update, because an update can restore a default you had changed.",
    ],
  ],
};

export default seo;
