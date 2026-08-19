const seo = {
  title: "Holiday Photo Sharing: Score Empty-House Risk",
  metaDescription:
    "Score how many nights of an empty house your posting advertises. Live posting, public audience, dates and tags weighed; mitigations capped at 60%.",
  steps: [
    "Under \"1. When you post\", set Nights away and \"Day of the trip your first post goes up\", or tick \"Nothing gets posted until everyone is home\".",
    "Tick what applies across the groups — Who can see it, What the post says, Location data, What is in frame and Automatic sharing — then the items under \"What the house has going for it\", such as a house-sitter, post held, an alarm or a close-friends list.",
    "\"Exposure after mitigations\" gives a percentage and a band, a Group / Active / Points table and a \"Change these first\" list; the mitigations can remove at most 60% because a published absence cannot be un-published, and Copy result copies the summary.",
  ],
  intro:
    "The Family Holiday Photo Sharing Guide scores how much your trip posting advertises an empty house, weighing the things that actually matter — posting live rather than after you return, a public audience, stated dates, location tags, and a house or number plate in frame — against the arrangements you have made at home. It reports the number of nights your absence is publicised, and caps how much any mitigation can reduce that, because a published post cannot be recalled. Written for families who want to share the holiday without turning it into a notice board.",
  useCases: [
    "Decide whether to post the beach album now or when you land back, and see exactly what the difference is worth.",
    "Audit an account before a long trip: location tags, story auto-sharing, reshare permissions and the email autoresponder.",
    "Agree one posting rule with everyone travelling, including the relatives who tag you from their own public profiles.",
    "Check what is in frame before posting a photo taken at home — the front door, the street sign, the car registration.",
  ],
  benefits: [
    [
      "Counts the nights, not the photos",
      "The score is driven by how long the absence is public, which is the number a burglar would actually use.",
    ],
    [
      "Separates EXIF from location tags",
      "Social uploads usually strip GPS data; emailed originals and cloud links do not, and a platform location tag is deliberate either way.",
    ],
    [
      "Mitigations are capped honestly",
      "A house-sitter and an alarm reduce the score by at most 60%, because they change the consequences, not the disclosure.",
    ],
  ],
  faqs: [
    [
      "Do photos posted on social media reveal my location?",
      "The big platforms re-encode uploads and strip most EXIF, including GPS coordinates, so an Instagram or Facebook post usually does not carry the raw location. Sending the original file does — email attachments, cloud share links, and messages sent as a document keep the coordinates, timestamp and device model. A location tag you add yourself is separate and always visible.",
    ],
    [
      "Should I post holiday photos while I am away or after I get back?",
      "After you get back, if you have a choice. Posting live is the single largest factor in the exposure score, because it publishes not just where you are but for how long the house will be empty. If you do post while away, keep the return date, the location tag and any view of your home out of it, and post to a curated list rather than to everyone.",
    ],
    [
      "Can posting holiday photos affect my home insurance claim?",
      "Insurers have publicly warned that advertising an absence on social media can be raised when a burglary claim is assessed, and some policies contain clauses about reasonable care. Whether it affects a specific claim depends entirely on your policy wording and the circumstances, so read your own policy and ask your insurer rather than relying on general guidance.",
    ],
    [
      "What should I avoid showing in photos of my children?",
      "Full names, school uniforms and school crests, in any combination — together they identify where a child is on every weekday. Also avoid house numbers, street signs and the front door in the same album, and check whether the platform is auto-tagging faces. If you want relatives to see the photos, a private shared album with named participants is far better than a public post.",
    ],
  ],
};

export default seo;
