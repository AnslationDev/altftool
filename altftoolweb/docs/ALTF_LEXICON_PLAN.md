# AltF Lexicon — product plan and build status

**Route root:** `/lexicon` · **Product line:** Reference, sibling to AltF Ideas and AltF Rabbithole
**Positioning:** *Every word, opened up — with its syllables and its stress marked.*

---

## 1. Competitive research

Ten sites were inventoried in full (dictionary.com, Merriam-Webster, Vocabulary.com, Cambridge,
Collins, Wordnik, YourDictionary, Thesaurus.com, Urban Dictionary, Etymonline). 215 distinct
published word-list categories and 170 distinct product features were catalogued.

| Site | Entries | Volume play | Weakness we exploit |
|---|---|---|---|
| **dictionary.com** | ~200k | 147 casual games, 790 articles | Word of the Day has **no dated permalink and no archive**; account system deleted in 2025 |
| **merriam-webster.com** | ~248k | **199,750** Word Finder pages | Pronunciation buried; no syllable/stress visualisation |
| **vocabulary.com** | 165k | Adaptive trainer, 12k lists | No A–Z browse at all; discovery is search-only |
| **collinsdictionary.com** | 732k senses | ~440 curated word lists | WOTD is one evergreen URL, no per-date pages |
| **wordnik.com** | 900k | 6 stacked sources, 12k lists | `/lists` returns HTTP 400 — 25k+ lists are undiscoverable |
| **yourdictionary.com** | ~1.3M | 33 solver tools, combinatorial lists | Six 301'd legacy subdomains still resolving |
| **thesaurus.com** | 3M relations | Match-strength ranking | `/e/` and `/articles/` run in parallel mid-migration |
| **etymonline.com** | ~50k | PIE root hub pages | Two-person operation; dates trapped in prose, unfilterable |

**The three openings, in order of softness:**

1. **Pronunciation has no owner.** Nobody renders stress and syllabification as a visual object.
   Every incumbent shows IPA in a small grey font and moves on. This is our wedge.
2. **Etymology has one weak incumbent** whose structured data (first-attested date, language of
   origin) is trapped in prose and cannot be filtered. Not addressed in v1 — noted for v2.
3. **India-specific vocabulary is unserved.** No dictionary brand credibly owns CAT, UPSC, SSC,
   IBPS or CLAT vocabulary, and "X meaning in Hindi" is enormous and fragmented.

**Two mistakes every incumbent made, that we avoid on day one:**
- **Duplicate URL namespaces.** One canonical URL form per object type, never forked.
- **Lists that exist but cannot be browsed.** Every collection and every generated list has an
  index page, a sitemap entry and a stable slug from the moment it exists.

---

## 2. The two signature devices

Both appear on every surface, so you learn them once and read them everywhere.

### The syllable line

```
ser · en · DIP · i · ty            /ˌsɛɹənˈdɪpɪti/       say it: ser-uhn-DIP-i-tee
```

The stressed syllable is inked, uppercased and raised 0.055em. That tiny vertical offset is what
makes stress legible at a glance rather than something you decode from a diacritic.

Syllable **counts** and **stress** come from the CMU Pronouncing Dictionary where it covers the
word (35,490 entries). Where it does not, the count comes from spelling rules and the page says
so — a guessed phonetic transcription is worse than none, so derived entries show the syllable
line alone with no IPA.

Syllable **breaks** are placed by a rule printed dictionaries use and nobody else implements: a
**stressed lax vowel closes its syllable** (BET-ter, HAP-py, BOX-es) while a tense one gives the
consonant up (WA-ter, O-pen, TA-ble). CMUdict is what makes the distinction knowable rather than
guessable. Measured against printed hyphenation on a 31-word control set: **27 exact**, and the
four misses are all words where printed dictionaries disagree with each other.

### The four part-of-speech hues

WordNet has exactly four open classes, so four hues cover the corpus with no "other" bucket:
noun indigo, verb emerald, adjective amber, adverb rose. Used identically in the sense list, the
POS chips, the relation rails, the collection cards and the letter tiles.

Backdrop motif is **ruled dictionary columns**, deliberately distinct from AltF Ideas' dotted grid
so the two products never read as one. The A–Z table uses **Scrabble-style letter tiles carrying
their own entry counts** — which turns navigation into information, because you can see the shape
of the language in it.

---

## 3. Data

Nothing is fabricated. Every definition, relation and pronunciation is primary data.

| Field | Source | Licence | Coverage |
|---|---|---|---|
| Definitions, senses | Princeton WordNet 3.x | Princeton (BSD-style, notice required) | 100% |
| Part of speech, semantic domain | WordNet lexicographer files | " | 100% |
| Synonyms | WordNet synsets | " | 75.0% |
| Broader / narrower / part-of | WordNet pointers | " | 84.9% / 20.1% |
| Usage examples | WordNet glosses | " | 23.2% (34,261 entries) |
| Antonyms | WordNet lexical pointers | " | 4.5% |
| Subject / region / register labels | WordNet domain pointers | " | 8.3% |
| IPA, respelling, stress | CMU Pronouncing Dictionary | BSD-2-Clause (notice + conditions + disclaimer) | 35,490 entries (43% of single words, ~95% token-weighted) |
| Syllable line | CMUdict, else spelling rules | " | **100%** |
| Commonness band 1–5 | OpenSubtitles frequency list | **CC BY-SA 4.0** — our derived file inherits it | 64,164 entries |
| Irregular inflections | WordNet exception lists | Princeton | 4,099 forms |

**Rejected on licence grounds:** Norvig's `count_1w.txt` — widely assumed to be open, it actually
derives from LDC2006T13, whose agreement forbids commercial redistribution of the data. The MIT
grant on that page covers the *code* only. Also rejected: GCIDE (GPL — copyleft on the data),
Urban Dictionary and Etymonline (no reuse licence).

**Attribution is displayed at `/lexicon/sources`** and linked from every word page. Princeton's
licence additionally forbids using the university's name in advertising.

### Corpus shape

`npm run generate:lexicon` → `scripts/generate-lexicon.mjs`. Runs in ~9 seconds.

**Fully deterministic.** No `Date.now()`, no `Math.random()` — every ordering is alphabetical, by
a stored count, or by a hash of the word itself, so two runs produce byte-identical output and the
corpus is diffable in review.

```
public/data/lexicon/            32 MB total, every file gzipped
  entries/<bucket>      19 MB   1,906 buckets — a word page is ONE small read
  letters/<a-z>        4.9 MB   compact rows for A–Z browsing
  lists/…              5.7 MB   545 precomputed pattern lists
  collections/…        2.2 MB   199 topic lists + their index
  rhymes/<0-23>        124 KB   22,528 rhyme groups
  manifest / facets / wotd / inflections
```

Two decisions worth keeping:

- **Gzip on disk is not an optimisation, it is the difference between shipping and not.**
  Uncompressed this corpus is 106 MB and has to share a 215 MiB deploy artifact with a 77 MB idea
  corpus. Reads pay one gunzip per file per process against a cache that never invalidates.
- **The bucket is computed from the slug, not looked up.** Two characters of the slug, escalating
  to three for the 59 prefixes dense enough to make a bucket slow to read. AltF Ideas needs an
  8 MB slug map for the same job; we need none.

---

## 4. Information architecture

| Route | What it is | Count |
|---|---|---|
| `/lexicon` | Home: lookup, worked example, A–Z table, collections | 1 |
| `/lexicon/word/<slug>` | The word page | **147,478** (135,783 indexable) |
| `/lexicon/browse` + `/browse/<letter>` | A–Z hub and letter pages | 28 |
| `/lexicon/words` + `/words/<slug>` | Pattern lists: starting-with, N-letter, N-letter-starting-with, ending-in, containing | **546** |
| `/lexicon/collections` + `/collections/<slug>` | Topic lists | **200** |
| `/lexicon/compare` + `/compare/<a>-vs-<b>` | Word comparisons, in three computed kinds | **1,423** |
| `/lexicon/thesaurus` + `/thesaurus/<slug>` | Synonyms and antonyms, grouped by sense | 1 + n |
| `/lexicon/rhymes/<slug>` | Full rhyme list | n |
| `/lexicon/word-of-the-day` + `/<YYYY-MM-DD>` | Today plus a **dated permanent archive** | 1 + 366 |
| `/lexicon/learn` + `/learn/<slug>` | Grammar and usage guides | 9 |
| `/lexicon/tools` + `/tools/<slug>` | Anagram solver, unscrambler, syllable counter, rhyme finder, pattern search, rack scorer | 7 |
| `/lexicon/games` + `/games/<slug>` | Word scramble, guess-the-definition, syllable split, odd one out | 5 |
| `/lexicon/search` | Results, with spelling correction (noindex) | 1 |
| `/lexicon/sources` | Attribution and licences | 1 |

### The comparison tier

"X vs Y" is the most durable editorial shape in the category — dictionary.com publishes nearly two
hundred by hand. Ours are computed, in three kinds, each answering a different question:

| Kind | Question | How it is found | Count |
|---|---|---|---|
| **Homophone** | Which spelling do I want? | Identical full IPA, different spelling | 422 |
| **Near-spelling** | Which one did I mean? | One edit, at least three letters in, both words 6+ letters | 300 |
| **Synonym** | Which one should I use? | Same WordNet sense, different commonness band | 700 |

The near-spelling constraints are load-bearing. Plain edit distance at five letters returns
`beach/reach`, `black/block` and `bunch/lunch` — rhymes, not spelling questions. Requiring the
edit to be buried rather than leading is what leaves `principal/principle`,
`complement/compliment` and `advice/advise`.

### Spelling correction

Alphabetical neighbours only rescue a typo in the *tail* of a word; they will never get from
`recieve` to `receive`, which diverge at the fourth letter and sit hundreds of rows apart. Search
runs a bounded Damerau-Levenshtein scan over one letter index instead — transposition counts as
one edit, which is the slip that produces most misspellings. Scoped to the first letter and to
lengths within two, it answers in **2–14 ms** and corrects every classic: `seperate`, `definately`,
`occassion`, `accomodation`, `priviledge`, `pronounciation`, `embarass`.

### The link graph

A word page is only useful if it goes somewhere. Each entry carries, stamped at build time:

- **`co`** — up to six collections it belongs to, ordered smallest-first, because "palindromes"
  says something about a word and "concrete nouns" says almost nothing. **146,204 entries linked.**
- **`cf`** — its confusable partners and why. **2,121 entries linked.**
- **Inflected forms** — recorded irregulars from WordNet's exception lists where they exist
  (`good → better, best`; `sheep → sheep`), rule-derived forms otherwise, each **marked** so the
  page can say which is which.

Deriving any of this at request time would mean reading 199 collection files to render one page,
which is why the entry buckets are written last in the generator rather than first.

**199 collections, and not one of them was typed by hand.** 91 are authored rules over shape,
sound and learning; 108 are **derived from WordNet's own topic, region and register labels** by
scanning the corpus for every label with 25+ members. Typing them by hand produces a few dozen
categories and a lot of empty pages; deriving them produces two hundred real ones — including
"Indian English words", which exists because WordNet records region-of-use, not because somebody
compiled a list.

---

## 5. Scale constraints that shaped the build

| Limit | Where | How we stay under it |
|---|---|---|
| **215 MiB** deploy artifact | `scripts/prune-amplify-build.mjs` | Corpus gzipped: 106 MB → 32 MB |
| **1 MiB** per prerendered page | `scripts/check-prerender-size.mjs` | Everything paginated; word grids capped at 200/page |
| ↳ *watch:* `/lexicon/words` | 983 KB in dev, ~96% of the gate | The hub links all 546 lists. Roughly half of that is the inlined RSC payload, which is what a link-dense hub costs. `check-prerender-size.mjs` fails the build loudly if a copy change ever pushes it over — do not add cards to this page without re-measuring |
| ↳ *fixed:* `/lexicon/compare` | Was 2,134 KB with all 1,422 pairs inline | Now a bounded preview per kind plus `?kind=&page=` — 470 KB |
| **2 MB** sitemap `unstable_cache` | `src/app/sitemap.js` | Own child sitemap at `/lexicon/sitemap.xml`, only hub URLs in the main one |
| **50,000 URLs** per sitemap | sitemaps.org | Sitemap index with sharded children |
| CI build memory | `scripts/run-with-node-memory.mjs` | `generateStaticParams` bounded to ~150 per route, `dynamicParams = true`, ISR at 24h |

The word route pre-renders a few hundred high-frequency entries; the other ~147,000 render on
demand and are then cached. Building them all up front would add hours to CI for pages that
receive no traffic in their first month.

---

## 6. Gotchas that cost real debugging time

- **`resolveWord` candidate ORDER is load-bearing.** "hoped" must resolve to "hope", not to "hop",
  and both exist. Restore-the-silent-e is tried before the bare stem for `-ed`/`-ing`/`-er`/`-est`,
  and *not* for plurals — otherwise "cats" resolves to the archaic "cate".
- **CMUdict ships as a plain object.** WordNet has entries for `constructor` and `valueOf`; without
  a `hasOwnProperty` guard those resolve to functions and ship a syllable line derived from the
  source of a JavaScript builtin.
- **The syllable line is a single-word device.** Running it over the phrase "a battery" produces
  "a ·bat·te·ry". Phrases carry definitions and relations but no phonetics.
- **`/aɪ/` cannot be respelled "eye".** It turns "light" (L AY T) into "leyet". "ahy" is the
  convention published dictionaries settled on precisely because it survives an onset and a coda.
- **"eh" needs its h only when nothing follows it in the syllable.** "beht" is harder to read than
  "bet", but a bare "e" ending a syllable reads as the name of the letter.
- **Respelling is regrouped for reading, not for phonology.** Maximal onset is right about where a
  syllable begins, but printing /ˌsɛɹənˈdɪpɪti/ as "seh-ruhn-DI-pi-tee" puts the stress on an open
  "DI" while the syllable line above it reads "ser-en-DIP-i-ty". Two devices on one page
  disagreeing about one word is worse than either being slightly non-standard.
- **`createPageMetadata` takes `noindex`/`follow` booleans.** Passing a `robots: {}` object is
  silently ignored and the page ships indexable.
- **Game number-key shortcuts listen on the window, not on the options list.** A handler bound to
  the buttons only fires once focus is already inside them — and clicking a button to give the
  keyboard focus *is* answering, so the shortcut helps nobody. All four games share
  `games/_shared/useAnswerKeys.js`, which stands aside for modifier chords and for typing targets
  so a digit typed into the scramble game's answer box stays a digit.
- **JSX whitespace collapses.** `{count} words` wrapped across lines renders as `147478words`.
  Use an explicit `{" "}`.

---

## 7. Audits, and what they found

Four sweeps were run against the finished module. Each found something.

**Link integrity — 1,899 pages crawled, zero broken links.** Status codes prove nothing here (the
app returns 200 for unknown routes), so the crawler classifies by content: every page in this
module renders exactly one `<h1>` and the platform's not-found UI renders none. A first pass
reported all 1,899 as broken because "not-found" appears in every page's chunk manifest — worth
knowing before writing the same check again.

**Corpus integrity — two real defects, both fixed.**

- *560 entries whose syllable split disagreed with their syllable count.* The spelling cannot
  always be divided as many ways as a word is spoken: `abc` is three syllables and one written
  vowel, `acme` is two and one once the silent e is discounted. The page rendered "3 syllables"
  above a one-part syllable line. Now the count and the transcription ship (both true, both from
  the pronouncing dictionary) and the split is omitted rather than faked.
- *67 entries whose stress index pointed past the end of the parts array*, so no syllable was
  marked at all. Same root cause, gone with the same fix.
- Also caught in passing: the rhyme-key builder still used the raw `CMUDICT[...]` lookup, the
  unguarded form that resolves lemmas like `constructor` to functions off `Object.prototype`.

**Duplicate content — 209 indexable duplicates, canonicalised.** Distinct WordNet lemmas can
collapse to one slug: `.22-caliber` and `.22 caliber` differ only by a hyphen the slug strips. The
generator disambiguates rather than dropping, which left a `-2` entry with the same definition.
Where the first gloss is identical the duplicate now points its canonical at the base and leaves
the sitemap; where the glosses differ the collision is coincidental (`20` and `20/20` are different
words) and both stand.

Two tools, not one, and the distinction matters: the taxonomic tail (`genus acer`) is a real entry
and a bad search result, so it is `noindex`ed outright. A slug duplicate gets a **canonical and no
noindex** — combining the two is contradictory guidance, and noindex can propagate to the canonical
target.

**Accessibility — clean.** One `<h1>` per page, no heading-level jumps, no unlabelled inputs,
buttons or links across eight sampled pages. The seven unlabelled SVGs on every page are in the
shared site chrome, not this module. No horizontal overflow at 375px on any of fourteen pages.

**Tool APIs — all five return correct answers**, not merely HTTP 200. `listen` unscrambles to
listen, silent, enlist and tinsel; `st??e` matches 17 words over an 8,095-row scan; a `quizzed`
rack scores QUIZ at 22, which is what the standard tile values give.

**Memory — an unbounded cache, now bounded.** Touching one word in each of the 1,906 entry buckets
— what a crawler does over a day — grew resident heap to **199 MB that never came back**. The fixed
set (manifest, 27 letter indexes, 199 collections, the word lists) is small, hot and rightly
memoised forever, but the entry buckets are not bounded by construction. They now sit behind a
200-entry LRU: heap settles around 40–90 MB, all 1,906 lookups still resolve, and a miss costs one
gunzip against a page already doing several.

**A defect the audit fixed by accident:** `/lexicon/browse/0` — the 329 entries starting with a
digit or symbol — exists, is generated by `generateStaticParams` and is linked from the letter grid
as `#`, but the sitemap excluded it on a code comment asserting the route did not exist.

## 8. The production build

Run under the CI configuration (`ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240`, `ALTFT_BUILD_CPUS=1`,
`ALTFT_WEBPACK_BUILD_WORKER=true`, `ALTFT_DEFER_BULK_PRERENDER=true`):

| Stage | Result |
|---|---|
| `prebuild` — registry, `verify:ideas`, `verify:lexicon` | pass |
| webpack compile | **compiled successfully in 2.6 min** |
| static generation | **5,258 pages, no errors** |
| prerender-size gate (1 MiB/page) | **0 over** — see below |
| Amplify artifact gate (215 MiB) | **fails at 315.6 MiB** — see below |

**A local build at the default 8 GB heap OOMs** in the webpack compile, before any page renders.
That is the local default, not the CI one; reproduce with the four variables above or the failure
says nothing about your own code.

**With `ALTFT_DEFER_BULK_PRERENDER=true` the module prerenders nothing.** The root layout calls
`await connection()` when that flag is set, which forces dynamic rendering site-wide regardless of
`generateStaticParams`. Only four `.html` files exist in the whole build, none of them Lexicon's,
so the 1 MiB page gate does not apply to this module in CI. It still would if the flag were off,
which is why the pages remain paginated.

**The artifact gate fails, and not because of this module.**

Two things about that number. First, `scripts/prune-amplify-build.mjs` hardcodes `path.resolve(".next")`
and does not honour `ALTFT_NEXT_DIST_DIR`, so a build into another directory has its size reported
from whatever is sitting in `.next` — it printed 3,779 MiB for a directory this build never wrote
to. Second, `amplify.yml` runs `rm -rf .next/cache` *before* the artifact step, which `npm run build`
does not, so a local measurement must subtract the 7.1 GB webpack cache itself.

The real deployable figure is **315.6 MiB against a 215 MiB ceiling**:

| | |
|---|---|
| Lexicon's share of `server/app` | 22.9 MiB |
| Three other new untracked modules (detour, altfatlas, rabbithole) | 8.5 MiB |
| Everything else | ~284 MiB |

Removing Lexicon entirely still leaves the artifact ~69 MiB over. **The app cannot currently deploy
to Amplify for reasons that predate this module**, and that is a platform problem touching several
people's work, not something to fix from inside `/lexicon`.

What *was* worth fixing here: 10.5 MiB of the 22.9 was prerendered sitemap XML — two 4.8 MiB shards
listing 83,253 word URLs, baked into the deploy artifact for a document machines fetch once a day.
The shards dropped `force-static` and now render on first request under the same 24-hour
revalidation. The four-line index stays static, because that is the one crawlers reach first.

## 9. What is not built yet

- **Etymology.** WordNet has none. The only permissively-licensed source at scale is Wiktionary
  via Kaikki (CC BY-SA 4.0), which means isolating it in its own fields so the share-alike
  obligation stays scoped and auditable. This is the single biggest content gap, and it is also
  the softest incumbent in the category.
- **Modern and slang vocabulary.** WordNet stops well short of `selfie`, `blockchain` and `rizz`.
  Same source, same licence decision.
- **Audio pronunciation.** We ship IPA and a respelling but no recordings.
- **Exam-vocabulary lists** (CAT, UPSC, SSC, IELTS, GRE). Real demand, no credible incumbent — but
  they need curated word lists we do not have, and inventing them would be dishonest. Selecting by
  difficulty band is possible today and is what `/lexicon/collections/advanced-vocabulary` does,
  with its selection rule stated on the page.
