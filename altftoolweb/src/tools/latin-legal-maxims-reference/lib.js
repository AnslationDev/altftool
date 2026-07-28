/**
 * Latin legal maxims reference.
 *
 * Each entry carries the maxim, a literal translation, what it actually means
 * in practice, and a short worked example. The maxims are the standard ones
 * taught in common-law jurisdictions and used in Indian, English and other
 * common-law judgments; several also appear as statutory rules of construction.
 *
 * This is a reference for study and drafting, not legal advice. A maxim is a
 * shorthand for a principle, and the principle almost always has exceptions
 * that the maxim does not mention.
 *
 * Search scoring: a query is split into words, and each word is scored against
 * the fields of every entry. The weights below are ordered so that a hit on the
 * Latin phrase itself outranks a hit buried in an explanatory sentence.
 */

export const SCORE_EXACT_LATIN = 100;
export const SCORE_LATIN_PREFIX = 60;
export const SCORE_LATIN_CONTAINS = 40;
export const SCORE_MEANING = 25;
export const SCORE_LITERAL = 20;
export const SCORE_EXAMPLE = 8;
export const SCORE_AREA = 10;

export const MAX_RESULTS_LIMIT = 100;

export const AREAS = [
  "Natural justice",
  "Criminal law",
  "Constitutional law",
  "Contract",
  "Tort",
  "Procedure",
  "Interpretation",
  "Evidence",
  "Property",
  "General",
];

export const MAXIMS = [
  {
    id: "audi-alteram-partem",
    latin: "Audi alteram partem",
    literal: "Hear the other side",
    area: "Natural justice",
    meaning:
      "No one may be condemned unheard. A decision affecting someone's rights must be preceded by notice of the case against them and a real opportunity to answer it.",
    example:
      "An employee dismissed without being shown the complaint or allowed to reply has a strong ground of challenge, however solid the underlying evidence.",
  },
  {
    id: "nemo-judex-in-causa-sua",
    latin: "Nemo judex in causa sua",
    literal: "No one should be a judge in his own cause",
    area: "Natural justice",
    meaning:
      "A decision-maker with a personal, financial or institutional interest in the outcome must not decide. The test is usually the appearance of bias to a fair-minded observer, not proof of actual bias.",
    example:
      "A tender committee member holding shares in a bidding company should recuse, even if they would in fact have voted impartially.",
  },
  {
    id: "actus-reus-mens-rea",
    latin: "Actus reus non facit reum nisi mens sit rea",
    literal: "The act does not make a person guilty unless the mind is also guilty",
    area: "Criminal law",
    meaning:
      "Most crimes need both a prohibited act and a guilty mental state. Statutory offences of strict liability are the exception, and the exception has to be clear on the face of the statute.",
    example:
      "Taking someone else's identical umbrella from a stand is not theft without the intention to permanently deprive.",
  },
  {
    id: "nulla-poena-sine-lege",
    latin: "Nulla poena sine lege",
    literal: "No punishment without law",
    area: "Criminal law",
    meaning:
      "A person may only be punished under a law in force when the act was done, and penal statutes are not applied retrospectively. Article 20(1) of the Constitution of India states the same rule.",
    example:
      "Conduct made criminal in 2026 cannot support a conviction for something done in 2024.",
  },
  {
    id: "res-ipsa-loquitur",
    latin: "Res ipsa loquitur",
    literal: "The thing speaks for itself",
    area: "Tort",
    meaning:
      "Where an accident is of a kind that does not normally happen without negligence, and the thing causing it was under the defendant's control, negligence may be inferred without proving exactly what went wrong.",
    example:
      "A surgical instrument left inside a patient does not need the claimant to identify which member of the team dropped it.",
  },
  {
    id: "volenti-non-fit-injuria",
    latin: "Volenti non fit injuria",
    literal: "To one who consents, no injury is done",
    area: "Tort",
    meaning:
      "A claimant who freely and knowingly accepted the specific risk cannot then sue on it. Knowledge of a risk alone is not enough — there must be genuine, informed consent to run it.",
    example:
      "A boxer cannot sue an opponent for a lawful punch, but can sue for a deliberate blow after the bell.",
  },
  {
    id: "damnum-sine-injuria",
    latin: "Damnum sine injuria",
    literal: "Loss without legal injury",
    area: "Tort",
    meaning:
      "Real financial loss with no violation of a legal right gives no cause of action. Lawful competition is the classic instance.",
    example:
      "A new shop opening opposite yours and taking your customers causes loss, but breaches no right of yours.",
  },
  {
    id: "injuria-sine-damno",
    latin: "Injuria sine damno",
    literal: "Legal injury without loss",
    area: "Tort",
    meaning:
      "The violation of an absolute right is actionable even where no measurable loss follows. Damages may be nominal, but the claim stands.",
    example:
      "Being wrongfully turned away from voting is actionable even if your candidate wins anyway.",
  },
  {
    id: "ubi-jus-ibi-remedium",
    latin: "Ubi jus ibi remedium",
    literal: "Where there is a right, there is a remedy",
    area: "General",
    meaning:
      "A legal right without a means of enforcing it is not a right at all. Courts lean towards finding a remedy where a recognised right has been infringed.",
    example:
      "Courts have fashioned compensation in public law for constitutional violations where no statute provided for it.",
  },
  {
    id: "ignorantia-juris",
    latin: "Ignorantia juris non excusat",
    literal: "Ignorance of the law does not excuse",
    area: "General",
    meaning:
      "Not knowing the law is no defence, because the law is publicly ascertainable. Ignorance of fact, by contrast, can be a defence.",
    example:
      "Not knowing that a licence was required does not defend a prosecution for trading without one.",
  },
  {
    id: "stare-decisis",
    latin: "Stare decisis",
    literal: "To stand by things decided",
    area: "Procedure",
    meaning:
      "Courts follow the reasoning of earlier decisions of higher courts on the same point, so that like cases are decided alike. Departure is possible but has to be justified.",
    example:
      "A trial court is bound by the High Court's ruling on a section even if it thinks the ruling wrong.",
  },
  {
    id: "ratio-decidendi",
    latin: "Ratio decidendi",
    literal: "The reason for the decision",
    area: "Procedure",
    meaning:
      "The rule of law on which the outcome actually turned. This, and only this, is the binding part of a judgment.",
    example:
      "In citing a case, quote the ratio rather than a stray sentence that had nothing to do with the result.",
  },
  {
    id: "obiter-dicta",
    latin: "Obiter dicta",
    literal: "Things said by the way",
    area: "Procedure",
    meaning:
      "Observations in a judgment that were not necessary for the decision. They are persuasive, sometimes highly so, but not binding.",
    example:
      "A judge's remark about a hypothetical variation of the facts is obiter and can be distinguished.",
  },
  {
    id: "res-judicata",
    latin: "Res judicata",
    literal: "A matter already judged",
    area: "Procedure",
    meaning:
      "Once a competent court has finally decided an issue between the same parties, it cannot be litigated again. Section 11 of the Code of Civil Procedure, 1908 codifies it in India.",
    example:
      "Losing a title suit bars a fresh suit on the same title between the same parties, even on better evidence.",
  },
  {
    id: "sub-judice",
    latin: "Sub judice",
    literal: "Under judicial consideration",
    area: "Procedure",
    meaning:
      "A matter still before a court. Public comment that could prejudice a pending proceeding may amount to contempt.",
    example:
      "A press release asserting an accused's guilt while the trial runs risks contempt proceedings.",
  },
  {
    id: "suo-motu",
    latin: "Suo motu",
    literal: "On its own motion",
    area: "Procedure",
    meaning:
      "A court or authority acting without any party applying — on a newspaper report, a letter, or its own observation.",
    example:
      "A High Court registering a case on its own after a report of unsafe hospital conditions.",
  },
  {
    id: "ex-parte",
    latin: "Ex parte",
    literal: "From or by one party",
    area: "Procedure",
    meaning:
      "A proceeding or order made in the absence of the other side, usually because they did not appear or because urgency made notice impracticable. Such orders are normally open to being set aside.",
    example:
      "An urgent injunction granted overnight before the defendant is served is an ex parte order.",
  },
  {
    id: "prima-facie",
    latin: "Prima facie",
    literal: "At first sight",
    area: "Evidence",
    meaning:
      "Enough on the face of it to require an answer. A prima facie case shifts the practical burden to the other side, and is a much lower bar than proof.",
    example:
      "At the interim stage, a claimant needs a prima facie case, the balance of convenience and irreparable harm.",
  },
  {
    id: "onus-probandi",
    latin: "Actori incumbit onus probandi",
    literal: "The burden of proof lies on the one who asserts",
    area: "Evidence",
    meaning:
      "Whoever alleges must prove. Sections 101 to 103 of the Indian Evidence Act, and its 2023 successor, put it the same way.",
    example:
      "A party alleging fraud has to plead the particulars and prove them; the other side need not disprove it.",
  },
  {
    id: "falsus-in-uno",
    latin: "Falsus in uno, falsus in omnibus",
    literal: "False in one thing, false in everything",
    area: "Evidence",
    meaning:
      "A rule of caution, not a rule of law in India — Indian courts sift the truth from the exaggeration in a witness's account rather than rejecting the whole of it.",
    example:
      "A witness wrong about the time of an incident may still be believed about who was present.",
  },
  {
    id: "expressio-unius",
    latin: "Expressio unius est exclusio alterius",
    literal: "The express mention of one thing excludes the others",
    area: "Interpretation",
    meaning:
      "Where a statute lists specific items, things left off the list are usually taken to be deliberately excluded. It is a guide, not a command, and gives way to clear contrary intention.",
    example:
      "A rule granting an exemption to 'schools and colleges' does not usually extend to coaching centres.",
  },
  {
    id: "ejusdem-generis",
    latin: "Ejusdem generis",
    literal: "Of the same kind",
    area: "Interpretation",
    meaning:
      "General words following a list of specific ones are read as limited to the same class as the specific ones.",
    example:
      "'Cars, vans, lorries and other vehicles' is read as covering motor vehicles, not bicycles.",
  },
  {
    id: "noscitur-a-sociis",
    latin: "Noscitur a sociis",
    literal: "It is known by its associates",
    area: "Interpretation",
    meaning:
      "An ambiguous word takes colour from the words around it. Broader than ejusdem generis, because it does not need a list plus a general phrase.",
    example:
      "'Cleaning, painting and finishing' suggests that 'finishing' means surface work, not completing a contract.",
  },
  {
    id: "generalia-specialibus",
    latin: "Generalia specialibus non derogant",
    literal: "General provisions do not derogate from special ones",
    area: "Interpretation",
    meaning:
      "Where a general law and a special law conflict, the special one prevails on the subject it deals with, unless the general law clearly overrides it.",
    example:
      "A specific insolvency code governs a company's default even though general contract law also speaks to debts.",
  },
  {
    id: "ultra-vires",
    latin: "Ultra vires",
    literal: "Beyond the powers",
    area: "Constitutional law",
    meaning:
      "An act outside the authority conferred by the statute or constitution is void. It may be substantively ultra vires, or procedurally, where a required step was skipped.",
    example:
      "A rule imposing a fee the parent Act never authorised can be struck down as ultra vires.",
  },
  {
    id: "habeas-corpus",
    latin: "Habeas corpus",
    literal: "That you have the body",
    area: "Constitutional law",
    meaning:
      "A writ directing whoever holds a person to produce them before the court and justify the detention. It tests the legality of the detention, not the guilt of the detainee.",
    example:
      "Used to challenge a preventive detention order where the grounds were not communicated.",
  },
  {
    id: "mandamus",
    latin: "Mandamus",
    literal: "We command",
    area: "Constitutional law",
    meaning:
      "A writ commanding a public authority to perform a public duty it has refused or failed to perform. It cannot be used to direct how a discretion should be exercised.",
    example:
      "Directing a licensing authority to decide a long-pending application, without dictating the outcome.",
  },
  {
    id: "certiorari",
    latin: "Certiorari",
    literal: "To be certified or informed",
    area: "Constitutional law",
    meaning:
      "A writ quashing the decision of a lower court or tribunal that acted without jurisdiction, in breach of natural justice, or on an error apparent on the record.",
    example:
      "Quashing a tribunal order passed without hearing the affected party.",
  },
  {
    id: "quo-warranto",
    latin: "Quo warranto",
    literal: "By what authority",
    area: "Constitutional law",
    meaning:
      "A writ asking a person holding a public office to show the legal authority under which they hold it. It applies only to a substantive public office created by statute or the constitution.",
    example:
      "Challenging an appointment made in breach of the statutory eligibility conditions for the post.",
  },
  {
    id: "locus-standi",
    latin: "Locus standi",
    literal: "Place of standing",
    area: "Procedure",
    meaning:
      "The right to bring an action. Traditionally limited to a person whose own right is affected, though public interest litigation has relaxed it considerably in India.",
    example:
      "A stranger to a contract usually cannot sue on it, but a citizen may raise a public wrong in public interest.",
  },
  {
    id: "caveat-emptor",
    latin: "Caveat emptor",
    literal: "Let the buyer beware",
    area: "Contract",
    meaning:
      "The buyer inspects and bears the risk of defects they could have found. Heavily eroded by consumer protection law and by the implied conditions in sale-of-goods legislation.",
    example:
      "Buying second-hand goods 'as seen' shifts risk to the buyer, but not for a defect actively concealed.",
  },
  {
    id: "uberrima-fides",
    latin: "Uberrima fides",
    literal: "Utmost good faith",
    area: "Contract",
    meaning:
      "Some contracts, insurance above all, require each side to disclose every material fact, whether asked about or not. Non-disclosure can void the contract.",
    example:
      "Not mentioning a diagnosed condition on a health insurance proposal can defeat a later claim.",
  },
  {
    id: "quantum-meruit",
    latin: "Quantum meruit",
    literal: "As much as he has earned",
    area: "Contract",
    meaning:
      "Payment of a reasonable amount for work actually done, where there is no enforceable price term or the contract has been discharged part-way.",
    example:
      "A builder whose contract is wrongly terminated half-way can claim the value of the work completed.",
  },
  {
    id: "ex-turpi-causa",
    latin: "Ex turpi causa non oritur actio",
    literal: "No action arises from a disgraceful cause",
    area: "Contract",
    meaning:
      "Courts will not enforce a claim founded on the claimant's own illegal or immoral act.",
    example:
      "Partners in a smuggling venture cannot ask a court to divide the proceeds.",
  },
  {
    id: "in-pari-delicto",
    latin: "In pari delicto potior est conditio defendentis",
    literal: "Where both are equally at fault, the defendant is in the stronger position",
    area: "Contract",
    meaning:
      "Where both parties are equally implicated in an illegality, the loss lies where it falls and the court will not help either.",
    example:
      "Money paid under an illegal agreement is usually irrecoverable by the payer.",
  },
  {
    id: "nemo-dat",
    latin: "Nemo dat quod non habet",
    literal: "No one gives what he does not have",
    area: "Property",
    meaning:
      "A seller cannot pass better title than they hold, so a buyer from a thief gets nothing. Statutory exceptions protect some good-faith buyers.",
    example:
      "Buying a stolen car in good faith still leaves the true owner entitled to it back.",
  },
  {
    id: "res-nullius",
    latin: "Res nullius",
    literal: "A thing of no one",
    area: "Property",
    meaning:
      "Property with no owner, capable of being acquired by the first person to take possession of it, subject to any statute that says otherwise.",
    example:
      "Wild animals and abandoned goods were the classical examples; modern statutes now cover most of them.",
  },
  {
    id: "delegatus-non-potest-delegare",
    latin: "Delegatus non potest delegare",
    literal: "A delegate cannot delegate",
    area: "Constitutional law",
    meaning:
      "Someone entrusted with a power must exercise it themselves and cannot pass it on, unless the empowering instrument allows sub-delegation.",
    example:
      "A statutory authority cannot hand its licensing discretion to a private contractor without express power.",
  },
  {
    id: "actio-personalis",
    latin: "Actio personalis moritur cum persona",
    literal: "A personal action dies with the person",
    area: "Tort",
    meaning:
      "Purely personal claims such as defamation do not survive the death of either party. Statutes have carved out large exceptions, particularly for claims affecting the estate.",
    example:
      "A defamation claim generally abates on the claimant's death; a claim for damaged property does not.",
  },
  {
    id: "de-minimis",
    latin: "De minimis non curat lex",
    literal: "The law does not concern itself with trifles",
    area: "General",
    meaning:
      "Trivial infractions are ignored, so that courts are not occupied with matters of no practical consequence.",
    example:
      "A boundary encroachment of a few millimetres is unlikely to found a claim.",
  },
  {
    id: "functus-officio",
    latin: "Functus officio",
    literal: "Having discharged his office",
    area: "Procedure",
    meaning:
      "Once a decision-maker has finally decided, their authority over that matter is exhausted and they cannot reopen it, apart from correcting clerical slips.",
    example:
      "An arbitrator who has published the award cannot revisit the merits on a party's request.",
  },
  {
    id: "per-incuriam",
    latin: "Per incuriam",
    literal: "Through lack of care",
    area: "Procedure",
    meaning:
      "A decision given in ignorance of a binding statute or precedent. Such a decision is not binding, but only a court entitled to say so may treat it that way.",
    example:
      "A judgment that overlooked a governing section can be held per incuriam by a later bench.",
  },
  {
    id: "sine-qua-non",
    latin: "Sine qua non",
    literal: "Without which, not",
    area: "General",
    meaning:
      "An indispensable condition — the element without which the thing cannot exist.",
    example:
      "Consideration is a sine qua non of a simple contract in common law.",
  },
  {
    id: "amicus-curiae",
    latin: "Amicus curiae",
    literal: "Friend of the court",
    area: "Procedure",
    meaning:
      "A lawyer or expert appointed to assist the court impartially, particularly where a party is unrepresented or an issue affects people who are not before it.",
    example:
      "Senior counsel appointed to assist in a case about prison conditions where the prisoners are unrepresented.",
  },
  {
    id: "bona-fide",
    latin: "Bona fide",
    literal: "In good faith",
    area: "General",
    meaning:
      "Honestly and without intention to deceive. Many statutes protect an act done bona fide even where it turns out to be wrong.",
    example:
      "A bona fide purchaser for value without notice is protected against some prior equities.",
  },
  {
    id: "mala-fide",
    latin: "Mala fide",
    literal: "In bad faith",
    area: "General",
    meaning:
      "With a dishonest or improper purpose. Proving mala fides against an authority is difficult and requires specific pleading, not insinuation.",
    example:
      "A transfer ordered purely to punish an officer for a complaint may be set aside as mala fide.",
  },
  {
    id: "inter-alia",
    latin: "Inter alia",
    literal: "Among other things",
    area: "General",
    meaning:
      "Signals that what follows is a selection, not the whole. Useful in pleadings to avoid an implied concession that nothing else is relied on.",
    example:
      "'The notice was defective inter alia because it gave seven days instead of thirty.'",
  },
  {
    id: "pro-bono-publico",
    latin: "Pro bono publico",
    literal: "For the public good",
    area: "General",
    meaning:
      "Work done without a fee for the public benefit, usually shortened to pro bono.",
    example:
      "Representing an indigent accused without charge is pro bono work.",
  },
  {
    id: "salus-populi",
    latin: "Salus populi suprema lex esto",
    literal: "Let the welfare of the people be the supreme law",
    area: "Constitutional law",
    meaning:
      "The justification for state action that overrides private interest in a genuine public emergency. It is a principle of last resort, not a general licence.",
    example:
      "Cited to support requisition of private property during a public health emergency.",
  },
];

const normalise = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * True when any whole word in `text` begins with `term`.
 * Matching on word starts rather than raw substrings stops "res" from
 * matching the middle of "ultra vires".
 */
function hasWordStartingWith(text, term) {
  return normalise(text)
    .split(" ")
    .some((word) => word.startsWith(term));
}

/**
 * Score one maxim against one normalised query word.
 * Exported so the weighting can be checked directly.
 */
export function scoreMaximForTerm(maxim, term) {
  if (!term) return 0;
  const latin = normalise(maxim.latin);
  let score = 0;

  if (latin === term) score += SCORE_EXACT_LATIN;
  else if (latin.startsWith(term)) score += SCORE_LATIN_PREFIX;
  else if (hasWordStartingWith(latin, term)) score += SCORE_LATIN_CONTAINS;

  if (hasWordStartingWith(maxim.meaning, term)) score += SCORE_MEANING;
  if (hasWordStartingWith(maxim.literal, term)) score += SCORE_LITERAL;
  if (hasWordStartingWith(maxim.example, term)) score += SCORE_EXAMPLE;
  if (hasWordStartingWith(maxim.area, term)) score += SCORE_AREA;

  return score;
}

/**
 * Search the collection.
 *
 * @param {object} input
 * @param {string} input.query  free text; empty returns everything
 * @param {string} input.area   an entry from AREAS, or "" for all
 * @param {number} input.limit  maximum results
 * @returns {object} results and counts — or { error }
 */
export function searchMaxims({ query = "", area = "", limit = 50 } = {}) {
  const max = Number(limit);
  if (!Number.isInteger(max) || max < 1 || max > MAX_RESULTS_LIMIT) {
    return { error: `Show between 1 and ${MAX_RESULTS_LIMIT} results at a time.` };
  }

  const trimmedArea = String(area).trim();
  if (trimmedArea && !AREAS.includes(trimmedArea)) {
    return { error: "That area of law is not one of the categories in this reference." };
  }

  const pool = trimmedArea ? MAXIMS.filter((item) => item.area === trimmedArea) : MAXIMS;

  const terms = normalise(query).split(" ").filter(Boolean);

  if (terms.length === 0) {
    const results = [...pool]
      .sort((a, b) => a.latin.localeCompare(b.latin))
      .slice(0, max)
      .map((item) => ({ ...item, score: 0 }));
    return {
      results,
      matchCount: pool.length,
      shown: results.length,
      totalInReference: MAXIMS.length,
      areaFilter: trimmedArea,
      query: "",
    };
  }

  const scored = pool
    .map((item) => ({
      ...item,
      score: terms.reduce((sum, term) => sum + scoreMaximForTerm(item, term), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.latin.localeCompare(b.latin));

  return {
    results: scored.slice(0, max),
    matchCount: scored.length,
    shown: Math.min(scored.length, max),
    totalInReference: MAXIMS.length,
    areaFilter: trimmedArea,
    query: String(query).trim(),
  };
}

/** Count of maxims in each area, for the filter chips. */
export function countByArea() {
  return AREAS.map((area) => ({
    area,
    count: MAXIMS.filter((item) => item.area === area).length,
  })).filter((item) => item.count > 0);
}
