const seo = {
  intro:
    "The Date of Birth Exposure Checklist scores two things at once: how dangerous your leak is once the birth date is combined with whatever else was exposed, and how much of the 17-step response you have finished. A date of birth cannot be rotated like a password, so the work is removing it from credentials — PINs, security answers — and replacing it in the telephone identity checks banks and mobile operators still run on name, address and date of birth. Tick what else leaked and the combination score shows whether you are dealing with a nuisance or an application-grade identity set.",
  useCases: [
    "A retailer or app you signed up to years ago was breached and the dump includes name, email and date of birth.",
    "Your date of birth appeared with your ID number, which is the set a credit application actually asks for.",
    "You want to check whether your card PIN, phone unlock code or locker code is still built from a family birthday.",
    "You are helping a parent replace date-of-birth security answers across their bank and insurance accounts.",
  ],
  benefits: [
    [
      "Combination scoring",
      "Ranks the leak by what travelled with the date, because a birth date on its own proves very little.",
    ],
    [
      "Credential-first weighting",
      "The steps that stop the date working as a PIN or a security answer carry the highest weight and cap the score.",
    ],
    [
      "No data collected",
      "You never type your actual date of birth — you tick which categories leaked, and nothing leaves the browser.",
    ],
  ],
  faqs: [
    [
      "How bad is it if my date of birth is leaked?",
      "On its own, mild — a birth date proves almost nothing. It becomes serious in combination: name plus address plus date of birth is the classic knowledge-based set that telephone identity checks accept, and adding a government ID number makes it enough to apply for credit in your name.",
    ],
    [
      "Can I change my date of birth after a breach?",
      "No, and that is the whole problem. Because the field is permanent, the response is to stop relying on it: change any PIN built from the date, replace date-of-birth security answers with an unrelated stored phrase, and add a verbal password or port-out PIN so call centres stop using the date as proof.",
    ],
    [
      "Why does a leaked birthday matter for my phone number?",
      "Date of birth is a standard mobile-operator identity question, and passing it can authorise a SIM swap that captures every SMS one-time code you receive. Setting a separate port-out PIN or account password with the operator removes the date from that conversation.",
    ],
    [
      "Should I freeze my credit after a date of birth leak?",
      "Freeze if the date leaked alongside a government ID number or an account number, since that combination supports a credit application. If only a name and email leaked with it, bureau alerts and careful statement checks are usually proportionate. This is general information — a financial adviser or the bureau itself can confirm what applies where you live.",
    ],
  ],
};

export default seo;
