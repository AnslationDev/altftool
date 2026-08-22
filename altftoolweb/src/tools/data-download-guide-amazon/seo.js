const seo = {
  title: "Download Your Amazon Data: Categories & Size",
  metaDescription:
    "Plan an Amazon data request: pick categories, estimate archive size from your usage, and catch the confirmation email that quietly cancels requests.",
  intro:
    "This guide plans an Amazon data request from Account → Data Privacy, estimating the archive size from your own order volume, Alexa usage and years as a customer, and rating each category for what it exposes. Amazon states a request can take up to 30 days, and it only queues the request after you click the confirmation link it emails you — the step most abandoned requests fail at. Categories range from orders and payments to Alexa voice recordings, advertising audiences and Kindle reading activity.",
  useCases: [
    "Request only the advertising audiences file to see which segments Amazon has placed you in and which third parties matched you.",
    "Estimate how many hours of Alexa audio the household has accumulated before deciding whether to export or simply delete the recordings.",
    "Pull the address book and orders files before closing an account, so past invoices and delivery addresses are not lost.",
    "Check Kindle reading activity and customer-service transcripts when auditing how much of your reading and support history Amazon retains.",
  ],
  benefits: [
    ["Flags the confirmation email", "Names the step that silently cancels a request when the link is never clicked."],
    ["Volume-driven sizing", "Estimates from your real order count and Alexa rate rather than a fixed guess."],
    ["Voice audio in hours", "Converts stored Alexa clips into hours of recorded household audio so the scale is obvious."],
  ],
  faqs: [
    [
      "How do I request my data from Amazon?",
      "Sign in, open Account → Data Privacy, choose 'Request Your Data', pick a category or 'Request All Your Data', and submit. Amazon then emails a confirmation link; the request is not processed until you click it.",
    ],
    [
      "How long does Amazon take to send my data?",
      "Amazon states a request may take up to 30 days, which matches the one-month deadline a controller has under GDPR and comparable rules. Small categories such as advertising audiences often come back within a day or two, while Alexa and device data take the longest.",
    ],
    [
      "Does the Amazon export include Alexa voice recordings?",
      "Yes — the Alexa category can include stored utterances as both audio and transcripts, along with smart-home device events and routines. Recordings capture anyone who was in the room, so review them before sharing the archive; you can also delete them directly in Alexa privacy settings without exporting anything.",
    ],
    [
      "Do I have to request data separately on amazon.in and amazon.com?",
      "Yes. Amazon treats each marketplace as a separate account, so an order placed on amazon.in is only returned by a request made on amazon.in. Make the request on every marketplace you have used. This page is informational only and not legal advice.",
    ],
  ],
};

export default seo;
