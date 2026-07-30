const seo = {
  intro:
    "A fake student portal works by putting your university's name somewhere in a web address where it carries no authority — a subdomain, a path, or the text before an @ sign — while the registrable domain belongs to the attacker. This page splits a link into scheme, user info, subdomain, registrable domain, port, path, query and fragment, marks the one part that decides where the browser connects, and compares it with the domain you already know. It also lists what the harvesting page itself gets wrong, from a silent password manager to a browser-in-the-browser popup.",
  useCases: [
    "A 'your account will be deactivated' email arrives during exam week and you want to check the link before touching it.",
    "Explaining to a first-year student why sso.university.edu.login-verify.com is not the university.",
    "IT service desks triaging a reported message and needing a plain-English breakdown to send back to the reporter.",
    "Building an induction session on credential phishing with worked examples students can try themselves.",
  ],
  benefits: [
    ["Points at the deciding part", "The registrable domain is marked explicitly, so the lesson survives after you close the page: read the host right to left."],
    ["Catches the classic tricks", "The @ sign, punycode look-alikes, long subdomain chains, plain HTTP sign-in pages and redirect parameters are all called out by name."],
    ["Nothing is fetched", "The link is analysed as text in your browser. It is never opened, resolved or reported anywhere, so checking a live phishing link is safe."],
  ],
  faqs: [
    [
      "Is bank.university.edu.login-portal.com the university's website?",
      "No. The browser reads the host from right to left, so the owner here is login-portal.com and everything to its left is a label that owner invented. A domain you can trust ends with the institution's own registrable domain immediately before the first single slash.",
    ],
    [
      "Can anyone register a .edu or .ac.uk domain?",
      "No, and that is why fake portals avoid them. The .edu namespace is limited to US postsecondary institutions accredited by an agency recognised by the US Department of Education, with the registry operated by Educause, and .ac.uk names are issued by Jisc only to eligible UK institutions. A commercial .com claiming to be a campus portal has skipped that check entirely.",
    ],
    [
      "The page had a padlock and a valid certificate — doesn't that mean it is genuine?",
      "No. A certificate proves you are talking to the domain in the address bar and that the connection is encrypted; it says nothing about who owns that domain or whether they are honest. Free certificates are issued in seconds to any domain the requester controls, including phishing domains.",
    ],
    [
      "I entered my student password on a fake portal — what should I do?",
      "Change the password on the real portal immediately, from a bookmark or an address you type yourself, then sign out all active sessions and check that no forwarding rule has been added to your mailbox. Report it to your university IT service desk the same day so the page can be blocked and any access reviewed.",
    ],
  ],
};

export default seo;
