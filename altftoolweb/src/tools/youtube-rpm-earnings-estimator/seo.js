const seo = {
  title: "YouTube RPM Earnings Estimator With CPM Cross-Check",
  metaDescription:
    "Views divided by 1,000 times RPM, run at conservative, expected and optimistic rates, with a CPM check using the 55% long-form or 45% Shorts share.",
  steps: [
    "Enter Monthly views and your Expected RPM (per 1,000 views), pick a Currency (INR, USD, GBP or EUR) and set the Period (months).",
    "Set Conservative RPM and Optimistic RPM so the Scenario band recalculates all three cases side by side as you type.",
    "Read Estimated monthly revenue with revenue over the chosen period, annualised revenue and revenue per single view, then use 'Cross-check from CPM' choosing 'Long-form watch page — creator keeps 55%' or 'Shorts creator pool — creator keeps 45%'; 'Copy result' copies the estimate.",
  ],
  intro:
    "This estimator turns monthly views and RPM into expected YouTube revenue using YouTube's own definition: RPM is the revenue a creator keeps per 1,000 total views, so revenue equals views divided by 1,000 multiplied by RPM. It shows a conservative, expected and optimistic band side by side, and converts an advertiser-side CPM into the RPM it implies using the 55% long-form or 45% Shorts creator share. It is aimed at creators budgeting a channel, and at brands sizing a sponsorship against a channel's ad income.",
  useCases: [
    "Work out whether 250,000 monthly views at your current RPM covers editing and gear costs before you go full time.",
    "Model a seasonal dip: run the same view count at your January RPM and your Q4 RPM to see the annual spread.",
    "Convert a media kit's CPM claim into a realistic creator-side RPM before agreeing a revenue-share deal.",
    "Compare a long-form strategy at 55% ad share against a Shorts-heavy one at 45% of the creator pool.",
  ],
  benefits: [
    ["Uses YouTube's real definition", "RPM is post-revenue-share and measured over total views, so the arithmetic is exact, not a guess."],
    ["Band, not a single number", "Conservative, expected and optimistic RPM run side by side so you plan against a range."],
    ["CPM to RPM cross-check", "Applies the monetized playback rate and the 55% or 45% creator share instead of treating CPM as take-home."],
  ],
  faqs: [
    [
      "How do I calculate YouTube earnings from RPM?",
      "Divide your views by 1,000 and multiply by your RPM. At 250,000 monthly views and an RPM of 120, that is 250 x 120 = 30,000 a month. RPM is already net of YouTube's cut, so no further deduction is needed.",
    ],
    [
      "What is the difference between CPM and RPM on YouTube?",
      "CPM is what advertisers pay per 1,000 ad impressions, measured only over monetized playbacks and before YouTube's share. RPM is what you actually keep per 1,000 total views across every revenue stream. RPM is always the lower and more useful number for budgeting.",
    ],
    [
      "How much of ad revenue does YouTube pay creators?",
      "For long-form watch-page ads the YouTube Partner Program pays creators 55% of the gross ad revenue. For Shorts, creators are allocated 45% of the Shorts Creator Pool after music licensing costs are deducted.",
    ],
    [
      "Why is my RPM lower than the CPM I see in Analytics?",
      "Two reasons compound. Only a fraction of your views are monetized playbacks that actually served an ad, and YouTube retains 45% of what advertisers pay. Multiply CPM by your monetized playback rate and by 0.55 to see the RPM it implies.",
    ],
  ],
};

export default seo;
