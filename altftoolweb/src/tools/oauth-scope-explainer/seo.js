const seo = {
  title: "OAuth Scope Explainer: What a Permission Grants",
  metaDescription:
    "Paste a scope list or consent URL — each Google, Graph, GitHub or Slack scope expanded into read/write, reach and deletion, plus PKCE and state checks.",
  steps: [
    "Paste into \"Scope list or authorization URL\" — either a bare scope list or the whole authorization URL from a consent screen's address bar — or load the Google consent URL, GitHub scope list, Microsoft Graph list or Slack scope list sample.",
    "Read \"What each scope grants\": every scope gets a Low, Medium, High or Critical level plus its Access, Reach (your account, or every account in the organisation), Data sensitivity, and whether permanent deletion is included.",
    "Check the \"Over-collection\" list for scopes a wider one already covers, review \"The authorization request itself\" for PKCE, state and redirect_uri findings, then press \"Copy review\".",
  ],
  intro:
    "An OAuth consent screen tells you an app wants to \"see, edit, create and delete all of your Google Drive files\" and then hides the actual scope strings behind a caret. This tool takes the other route: paste the scope list, or the whole authorization URL out of the address bar while the consent screen is open, and every scope is expanded into what it actually grants — read or write, your account only or every account in the organisation, and whether permanent deletion is included. The levels come from a published rubric over those properties, not from a score. Scopes for Google, Microsoft Graph, GitHub, Slack and standard OpenID Connect are held in a catalogue that ships with the page, so nothing is uploaded and no provider is contacted.",
  useCases: [
    "Before clicking Allow on a consent screen, copy the authorization URL from the address bar and see the full scope list expanded — including the ones the screen summarised into a single friendly sentence.",
    "Reviewing a third-party integration request at work: check whether it is asking for tenant-wide Graph permissions such as Mail.ReadWrite.All when your account only needs Mail.Read.",
    "Trimming your own app's scope list before submitting for verification, using the redundancy check to find scopes that a wider one already covers.",
  ],
  benefits: [
    [
      "Levels you can audit",
      "Each scope declares its access, reach, sensitivity and whether it is destructive; a stated rubric turns those into Low, Medium, High or Critical. There is no hidden score, and the rules are printed on the page.",
    ],
    [
      "Finds over-collection",
      "Asking for both repo and public_repo, or drive alongside drive.file, adds nothing but widens the grant. Pairs where one scope already covers another are listed explicitly.",
    ],
    [
      "Checks the request, not just the scopes",
      "Paste an authorization URL and the flow itself is reviewed: implicit grant, missing PKCE, code_challenge_method=plain, absent state, plaintext or wildcard redirect_uri, and whether a refresh token will be issued.",
    ],
  ],
  faqs: [
    [
      "What does offline_access or access_type=offline actually mean?",
      "It asks for a refresh token. Without it, an app's access dies when the short-lived access token expires — usually within an hour. With it, the app can mint fresh tokens for as long as the grant stands, whether or not you are present. Signing out of the app does not end that: you have to revoke the grant on the provider's own third-party-apps page.",
    ],
    [
      "Why is a read-only scope sometimes rated High?",
      "Because read-only describes the verb, not the reach. https://www.googleapis.com/auth/drive.readonly cannot change anything, but it can download every file in your Drive, and Contacts.Read exposes personal data about people who never consented to anything. The rubric rates reading your content and communications above writing inside a folder the app itself created.",
    ],
    [
      "Can this tell me whether an app is safe?",
      "No, and it does not try. It never contacts the provider, has no reputation data and cannot see who published the app or what they do with the data. It tells you exactly what is being requested and how far each grant reaches — the decision about whether this particular app should have it stays with you.",
    ],
    [
      "What happens with a scope the tool has never seen?",
      "It gets no risk level. If the string matches a documented provider naming convention — the Microsoft Graph Resource.Verb.All pattern, GitHub's verb:resource form, a googleapis.com/auth URL — the read/write direction and tenant-wide reach are described and labelled as inferred from the name. Anything else is reported as unrecognised, because a fabricated level would be worse than none.",
    ],
  ],
};

export default seo;
