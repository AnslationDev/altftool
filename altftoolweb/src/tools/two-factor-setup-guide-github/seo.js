const seo = {
  "intro": "This guide is a weighted, 15-control checklist covering GitHub two-factor authentication and the developer-specific controls around it: recovery codes, passkeys, personal access token hygiene, SSH key cleanup, commit signing and secret-scanning push protection. GitHub already requires 2FA from accounts that contribute code on github.com, so the value here is in the rest: the tokens, keys and app grants that quietly keep push access to your repositories. Four controls are marked critical and the score is held at 69% until all four are done.",
  "useCases": [
    "Setting up a new GitHub account properly on day one instead of hitting the mandatory-2FA prompt later.",
    "Cleaning up after a leaked token alert, when you need to find every credential that still has repository access.",
    "Handing back a work laptop and removing the SSH keys, tokens and sessions tied to it.",
    "Getting an open-source project maintainer account to a state where a phishing page cannot take it over."
  ],
  "benefits": [
    [
      "Covers tokens, not just logins",
      "Personal access tokens and SSH keys bypass your password entirely, so they are scored alongside the second factor."
    ],
    [
      "Phishing-resistant path is explicit",
      "The checklist separates codes you can be tricked into typing from passkeys and security keys, which are bound to github.com."
    ],
    [
      "Runs locally",
      "No sign-in, no token, no account data leaves your browser; the page only tracks which boxes you ticked."
    ]
  ],
  "faqs": [
    [
      "Is two-factor authentication mandatory on GitHub?",
      "Yes for accounts that contribute code on github.com. GitHub rolled out a requirement covering all such users, so an account that has not enrolled is eventually restricted until it does. Enterprise and organisation owners can also enforce 2FA for every member of their organisation."
    ],
    [
      "How many GitHub recovery codes do I get and where do they go?",
      "GitHub generates 16 single-use recovery codes when you enable two-factor authentication and lets you download, print or copy them. Store them outside GitHub itself, such as in a password manager or on paper, and generate a fresh set from Settings > Password and authentication if you ever use or expose them."
    ],
    [
      "What is the difference between a classic and a fine-grained personal access token?",
      "A classic token carries broad scopes across every repository you can reach and can be set to never expire. A fine-grained token is restricted to chosen repositories with per-permission access and has a maximum lifetime of 366 days, which limits both the blast radius and the shelf life if it leaks."
    ],
    [
      "Does 2FA stop someone pushing to my repositories?",
      "Not on its own. SSH keys, deploy keys and personal access tokens authenticate without a second factor by design, so a stolen key or token still allows a push. That is why the checklist weights the token and SSH audit alongside the login controls."
    ]
  ]
};

export default seo;
