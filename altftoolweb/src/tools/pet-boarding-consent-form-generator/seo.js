const seo = {
  title: "Pet Boarding Consent Form + Daily Food Portions",
  metaDescription:
    "Build a kennel consent form with vet treatment authority and a spend cap, plus daily grams from RER = 70 x kg^0.75 and your food's kcal per 100 g.",
  steps: [
    "Fill the 'Owner, pet and facility' block — owner and alternative contact, facility, pet, breed, microchip and the drop-off and collection dates — and tick 'Vaccinations are in date and the certificate is available'.",
    "Under Feeding pick 'Species and life stage' (each option shows its x RER factor) and enter 'Weight (kg)', 'Food energy (kcal per 100 g)' and 'Meals per day'.",
    "Set the vet, 'Treatment authorised without calling me' cap and the group play, grooming and photo permissions, then press 'Copy form' to take the finished agreement.",
  ],
  intro:
    "A pet boarding consent form is the document a kennel needs before it can feed, exercise and, if things go wrong, get veterinary treatment for an animal in its care. This generator writes that agreement and works out the feeding sheet alongside it, using the standard small-animal energy equation RER = 70 x bodyweight(kg)^0.75 multiplied by the life-stage factor for your pet, then converting the result to grams using the calories printed on the food bag. Useful to owners filling in a booking and to boarding facilities that want one form covering vet authority, medication handover, activity permissions and charges.",
  useCases: [
    "Work out exactly how much food to pack for a seven-night stay, with a buffer in case the return flight slips.",
    "Set a treatment spending limit so the kennel can act fast in an emergency without waiting for a call you may not answer.",
    "Record that group play is not permitted for a nervous dog, and have that written into the signed agreement.",
    "Hand over medication with a written count-in and count-out so nobody argues about missed doses later.",
  ],
  benefits: [
    [
      "Portions from a real formula",
      "Daily grams come from resting energy, the life-stage multiplier and the food's own calorie density, not a guess.",
    ],
    [
      "Emergency authority that works",
      "A named vet, a named alternative, a spending cap and a rule that pain relief is never withheld while people are being called.",
    ],
    [
      "Nothing left implied",
      "Vaccination status, group play, grooming, photos, late collection and uncollected animals are each answered on the form.",
    ],
  ],
  faqs: [
    [
      "How much should I feed my dog per day?",
      "Start from resting energy: RER = 70 x bodyweight in kg raised to the power 0.75, then multiply by the life-stage factor - about 1.6 for a neutered adult dog, 1.8 entire, 2.0-3.0 for puppies and 1.0 on a weight-loss plan. An 18 kg neutered dog works out at roughly 979 kcal a day, which is about 272 g of a food labelled 360 kcal per 100 g. Confirm the amount with your vet, especially for a prescription diet.",
    ],
    [
      "What vaccinations does a boarding kennel require?",
      "For dogs, rabies plus DHPP or DHLPP (distemper, adenovirus-hepatitis, parvovirus, parainfluenza), and almost always Bordetella for kennel cough given within the last 6-12 months. For cats, rabies plus FVRCP (rhinotracheitis, calicivirus, panleukopenia). Bring the certificate - most facilities will refuse admission without it.",
    ],
    [
      "Should I set a limit on veterinary spending while my pet is boarded?",
      "Yes, and make it high enough to cover a real emergency. A zero limit means staff must reach you before any treatment, which is exactly the wrong constraint at 2 a.m. Give a figure you would authorise without discussion, name a second contact, and make clear the facility should never delay pain relief while trying to reach you.",
    ],
    [
      "How much food should I send with my pet?",
      "The daily amount times the number of feeding days, plus about 20% spare. Both the drop-off day and the collection day involve at least one meal, so a seven-night stay is eight feeding days. Sending the pet's own food matters: an abrupt diet change is one of the commonest causes of boarding-related stomach upset.",
    ],
  ],
};

export default seo;
