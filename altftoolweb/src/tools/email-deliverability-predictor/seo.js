const seo = {
  title: "Email Deliverability Predictor: Check Before Sending",
  metaDescription:
    "Scores content 30%, subject 20%, HTML 20%, links 15% and best practices 15%, with a spam-risk figure and an inbox estimate capped at 97%.",
  intro:
    "Email Deliverability Predictor audits a subject line, sender address and message body against a fixed set of content rules — spam-trigger phrases, stacked urgency, shouting caps, repeated punctuation, insecure or shortened links, missing unsubscribe and postal address, HTML that email clients cannot render — and scores five weighted categories: content 30%, subject 20%, HTML structure 20%, links 15% and best practices 15%. Each finding carries a penalty of 20 points for an error, 10 for a warning and 4 for an info note, producing an overall score, a spam-risk figure and an inbox-probability estimate deliberately capped at 97%. It is for marketers and developers who want to fix the content half of deliverability before hitting send; it cannot see sender reputation or your SPF, DKIM and DMARC setup.",
  useCases: [
    "You have written a launch email and want to know which phrases are the spam triggers before it goes to 40,000 subscribers, with a suggested replacement for each one.",
    "A campaign underperformed and you need to check whether the HTML uses flexbox, grid or CSS animations that Outlook silently drops.",
    "You are reviewing a colleague's draft and want an objective list of the CAN-SPAM basics it is missing — unsubscribe link, postal address, a monitored reply-to instead of no-reply.",
  ],
  benefits: [
    [
      "Every point deducted is traceable",
      "There is no black-box score: each issue names the rule, the severity, why it matters and the exact fix, and the penalties are fixed at 20 / 10 / 4 by severity.",
    ],
    [
      "Flagged phrases highlighted in place",
      "Spam and urgency phrases are marked in the rendered copy with suggested alternatives, so you edit the sentence rather than hunt for the word.",
    ],
    [
      "Plain-text and HTML modes are scored differently",
      "In plain-text mode the HTML structure category is dropped and its 20% weight redistributed, so a text email is not punished for lacking markup it should not have.",
    ],
  ],
  faqs: [
    [
      "How long should an email subject line be?",
      "Aim for 30 to 50 characters — long enough to carry the value proposition, short enough to avoid truncation in most inbox previews. Subjects outside that band are flagged as an info note here, and anything over 70 characters is raised to a warning.",
    ],
    [
      "Can this tool guarantee my email reaches the inbox?",
      "No, and it caps its own inbox-probability estimate at 97% for that reason. Actual placement also depends on sender reputation, list hygiene, engagement history and SPF/DKIM/DMARC authentication — none of which are visible from the message content alone.",
    ],
    [
      "What actually triggers spam filters in email content?",
      "The strongest content signals it checks are stacked urgency and spam-trigger phrasing, excessive capitalisation, repeated punctuation like '!!!', URL shorteners, non-HTTPS links, more than 10 links in one message, and image-heavy emails with almost no text. Each of these is marked as a spam signal and feeds a separate spam-risk figure alongside the quality score.",
    ],
    [
      "What do the score bands mean?",
      "85 and above reads as Excellent, 70–84 Good, 50–69 Moderate, 30–49 Risky and below 30 Likely Spam. The band is calculated from 70% of the structural quality score plus 30% of the inverse spam risk, so an email cannot earn a comfortable label on tidy formatting while stacking spam signals.",
    ],
  ],
};

export default seo;
