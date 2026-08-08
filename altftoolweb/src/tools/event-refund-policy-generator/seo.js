const seo = {
  title: "Event Refund Policy Generator with GST Split (India)",
  metaDescription:
    "Build a tiered event cancellation ladder by days before the event and price one booking — ticket, GST and booking fee — per CBIC Circular 178/10/2022.",
  steps: [
    "Build the Refund ladder — it opens at 100% from 30 days, 75% from 15, 50% from 7, 25% from 3 and 0% inside that — using Add tier and each row's Days before the event (from) and Refund percentage.",
    "Under \"Price one cancellation\" enter Ticket price before GST (INR), Number of tickets, Booking fee per ticket (INR), GST on the ticket (%), Event date and Cancellation date, and set \"Who is cancelling and why\" to whether the attendee or the organiser cancelled.",
    "Refund payable shows the amount with its tier and percentage, itemised into Refund of ticket price, Refund of GST, Refund of booking fees and Organiser retains; press Copy policy for the generated wording.",
  ],
  intro:
    "The Event Refund Policy Generator builds a tiered cancellation policy in which the refund percentage falls as the event date gets closer, and prices any single booking against that ladder. It counts the whole days between the cancellation date and the event date, picks the matching tier, and splits the money into ticket price, GST and booking fee. The GST split follows CBIC Circular No. 178/10/2022-GST of 3 August 2022, under which the amount an organiser keeps is a cancellation charge taxed at the same rate as the ticket, so tax comes back only on the refunded portion.",
  useCases: [
    "Print a defensible cancellation ladder on a conference or festival ticket page before sales open.",
    "Answer an attendee who cancelled 12 days out and wants to know precisely how much of their Rs 4,920 booking is coming back.",
    "Decide whether to refund the convenience fee, and see what that choice costs across a full house.",
    "Distinguish an attendee cancellation from an organiser postponement, where the whole amount including fees has to go back.",
  ],
  benefits: [
    ["Tier boundaries you can test", "Change a boundary and the calculator immediately shows which side a given cancellation date falls on."],
    ["Correct GST split", "Tax is returned only on the refunded slice, matching the CBIC circular on forfeiture and cancellation charges."],
    ["Flags one-sided terms", "A ladder that refunds nothing even at long notice triggers a warning, because such clauses are vulnerable under consumer law."],
  ],
  faqs: [
    [
      "What is a fair event cancellation and refund policy?",
      "A common ladder refunds 100% at 30 or more days before the event, 75% at 15 to 29 days, 50% at 7 to 14 days, 25% at 3 to 6 days and nothing inside 3 days, because the organiser's committed costs rise as the date approaches. There is no statutory ladder in India, so the test is whether the term is reasonable rather than one-sided.",
    ],
    [
      "Is GST refunded when an event ticket is partly refunded?",
      "GST comes back only on the portion of the ticket price actually refunded. Under CBIC Circular No. 178/10/2022-GST dated 3 August 2022, the amount the organiser retains is consideration for tolerating the cancellation and is taxed at the same rate as the ticket, so that tax has already been deposited and is not returned.",
    ],
    [
      "Does the organiser have to refund the booking or convenience fee?",
      "On an attendee cancellation most policies keep the booking fee because the payment-gateway and ticketing costs are already spent, and that is generally accepted if it is disclosed before payment. If the organiser cancels or postpones the event, the entire amount collected including the booking fee should be returned, because failure to hold the event is a deficiency in service under Section 2(11) of the Consumer Protection Act 2019.",
    ],
    [
      "Can an event say tickets are non-refundable under all circumstances?",
      "A blanket no-refund term is risky. It does not protect an organiser who cancels or fails to hold the event, and a one-sided contract term can be examined by a consumer commission under the unfair-contract provisions of the Consumer Protection Act 2019. Consumers have two years from the cause of action to file under Section 69. This is general information, not legal advice — have a lawyer review your final wording.",
    ],
  ],
};

export default seo;
