import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import { createBreadcrumbJsonLd, createPageMetadata } from "@/platform/seo/generateMetadata";
import { getManifest } from "@altftool/core/lexicon/corpus";
import { AnswerFirst, Breadcrumb, StatStrip } from "../_components/WordAtoms";

export const revalidate = 86400;

const description =
  "Where every definition, pronunciation and frequency band in AltF Lexicon comes from, what each source covers, and the licence terms we are required to reproduce.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Sources and licences — AltF Lexicon",
    description,
    path: "/lexicon/sources",
    keywords: [
      "WordNet licence",
      "CMU Pronouncing Dictionary licence",
      "dictionary data sources",
      "AltF Lexicon attribution",
    ],
  });
}

/*
 * Licence texts are reproduced verbatim and must stay that way.
 *
 * WordNet's licence requires its notice, statements and disclaimer to appear on
 * ALL copies "including modifications that you make". Our JSON corpus is a
 * modification, so this page is not a courtesy — it is the condition on which
 * the data may be used at all. The same is true of the CMU dictionary's
 * BSD-2-Clause, whose second clause requires the notice, the conditions AND
 * the disclaimer for redistribution in binary form, which is what serving
 * pronunciations is.
 *
 * The same licence forbids using Princeton's name in advertising or publicity.
 * Nothing on this site may present WordNet as an endorsement.
 */

const WORDNET_LICENCE = `WordNet Release 3.0

This software and database is being provided to you, the LICENSEE, by
Princeton University under the following license. By obtaining, using
and/or copying this software and database, you agree that you have
read, understood, and will comply with these terms and conditions.:

Permission to use, copy, modify and distribute this software and
database and its documentation for any purpose and without fee or
royalty is hereby granted, provided that you agree to comply with
the following copyright notice and statements, including the disclaimer,
and that the same appear on ALL copies of the software, database and
documentation, including modifications that you make for internal
use or for distribution.

WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved.

THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON
UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR
IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON
UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT-
ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE
OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT
INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR
OTHER RIGHTS.

The name of Princeton University or Princeton may not be used in
advertising or publicity pertaining to distribution of the software
and/or database. Title to copyright in this software, database and
any associated documentation shall at all times remain with
Princeton University and LICENSEE agrees to preserve same.`;

const CMU_LICENCE = `The CMU Pronouncing Dictionary

Copyright (c) 1993-2015 Carnegie Mellon University. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   The contents of this file are deemed to be source code.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in
   the documentation and/or other materials provided with the
   distribution.

This work was supported in part by funding from the Defense Advanced
Research Projects Agency, the National Science Foundation, and the
United States Department of Education. The contents of this file do
not necessarily reflect the position or the policy of the Government,
and no official endorsement should be inferred.

THIS SOFTWARE IS PROVIDED BY CARNEGIE MELLON UNIVERSITY "AS IS" AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL CARNEGIE MELLON UNIVERSITY
NOR ITS EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

const PACKAGING_LICENCE = `ISC License

Copyright (c) 2015 Zeke Sikelianos <zeke@sikelianos.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`;

export default async function SourcesPage() {
  const manifest = await getManifest();

  const pct = (value) => `${Math.round((value / manifest.total) * 100)}%`;
  const n = (value) => Number(value || 0).toLocaleString("en-US");

  const coverage = [
    {
      field: "Definitions and senses",
      source: "WordNet",
      count: n(manifest.senses),
      note: `Every one of the ${n(manifest.total)} entries has at least one definition.`,
    },
    {
      field: "Part of speech, semantic field",
      source: "WordNet",
      count: n(manifest.total),
      note: "Taken from the lexicographer file each sense is filed under, not inferred from the text.",
    },
    {
      field: "Synonyms, antonyms, broader and narrower",
      source: "WordNet",
      count: "—",
      note: "Synonyms are the other words in the same synset. Antonyms are recorded per word pair, not per meaning group.",
    },
    {
      field: "Usage examples",
      source: "WordNet",
      count: n(manifest.withExamples),
      note: `${pct(manifest.withExamples)} of entries. Verbs and adverbs are far better covered than nouns.`,
    },
    {
      field: "IPA and respelling",
      source: "CMU Pronouncing Dictionary",
      count: n(manifest.withPronunciation),
      note: "Entries with a recorded pronunciation. Everything else shows a syllable line only, and says so.",
    },
    {
      field: "Syllable division and stress",
      source: "CMUdict, else spelling rules",
      count: n(manifest.withSyllables),
      note: "Every single-word entry. Multi-word phrases carry no phonetics.",
    },
    {
      field: "Commonness band",
      source: "OpenSubtitles frequency list",
      count: n(manifest.withFrequency),
      note: "Entries with a measured frequency rank. The rest fall back to how many senses the word carries.",
    },
    {
      field: "Irregular inflections",
      source: "WordNet exception lists",
      count: n(manifest.inflections),
      note: "Lets a search for ran find run, and mice find mouse.",
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-lexicon-sources"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lexicon", path: "/lexicon" },
            { name: "Sources", path: "/lexicon/sources" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Breadcrumb items={[{ name: "Lexicon", path: "/lexicon" }, { name: "Sources" }]} />

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Sources &amp; licences
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Where this dictionary comes from
          </h1>

          <AnswerFirst>
            Nothing in AltF Lexicon is written by us. Definitions and word relationships come from
            Princeton&rsquo;s WordNet, pronunciations from the CMU Pronouncing Dictionary, and
            commonness bands from a published frequency list. This page states what each source
            covers, what it does not, and reproduces the licence terms we are required to carry.
          </AnswerFirst>

          <StatStrip
            stats={[
              { value: n(manifest.total), label: "Entries" },
              { value: n(manifest.senses), label: "Distinct senses" },
              { value: n(manifest.withPronunciation), label: "Recorded pronunciations" },
              { value: "3", label: "Primary sources" },
            ]}
          />
        </header>

        {/* ---------------- Coverage ---------------- */}
        <section className="py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            What each source contributes
          </h2>
          <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            Coverage is uneven, and pretending otherwise is how a dictionary loses trust. Where a
            field is missing on a word page, the page says which source did not have it rather than
            filling the gap with a guess.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Field
                  </th>
                  <th className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Source
                  </th>
                  <th className="py-3 pr-4 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Entries
                  </th>
                  <th className="py-3 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((row) => (
                  <tr key={row.field} className="border-b border-border align-top">
                    <td className="py-3 pr-4 font-medium text-foreground">{row.field}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.source}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-foreground">{row.count}</td>
                    <td className="py-3 text-muted-foreground">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- Licences ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Licences, reproduced in full
          </h2>
          <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            Two of these licences require their notice, conditions and disclaimer to travel with any
            copy of the data — including a derived one such as ours. They are reproduced verbatim
            below for that reason.
          </p>

          <LicenceBlock
            title="Princeton WordNet"
            contributes="Definitions, senses, parts of speech, synonyms, antonyms, broader and narrower terms, semantic fields, subject and register labels, and the irregular-inflection lists."
            terms="Royalty-free for any purpose, on condition that the notice, statements and disclaimer appear on all copies, including modifications."
            text={WORDNET_LICENCE}
          />

          <LicenceBlock
            title="CMU Pronouncing Dictionary"
            contributes="Phoneme transcriptions, from which we derive the IPA, the plain-English respelling, the syllable count and the stressed syllable."
            terms="BSD 2-Clause. Serving pronunciations is redistribution in binary form, so clause 2 applies: the notice, the conditions and the disclaimer must all be reproduced."
            text={CMU_LICENCE}
          />

          <LicenceBlock
            title="cmu-pronouncing-dictionary (npm packaging)"
            contributes="The packaged form of the CMU data that our build reads. The licence below covers the packaging only — the data itself is under Carnegie Mellon's terms above."
            terms="ISC."
            text={PACKAGING_LICENCE}
          />

          <div className="mt-8 rounded-lg border border-border bg-surface p-5">
            <h3 className="text-base font-semibold text-foreground">Word frequency data</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Commonness bands are derived from the 2018 English frequency list of the OpenSubtitles
              corpus, published as{" "}
              <a
                href="https://github.com/hermitdave/FrequencyWords"
                rel="nofollow noopener noreferrer"
                target="_blank"
                className="text-primary hover:underline"
              >
                hermitdave/FrequencyWords
              </a>
              . That content is licensed{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                rel="nofollow noopener noreferrer"
                target="_blank"
                className="text-primary hover:underline"
              >
                CC BY-SA 4.0
              </a>
              , and the filtered list we ship is redistributed under the same licence.
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              We deliberately do <strong className="text-foreground">not</strong> use the frequency
              list most often reached for in this situation. It traces back to a corpus distributed
              under an agreement that forbids commercial redistribution of the data; the open
              licence on that page covers the accompanying code, not the word counts.
            </p>
          </div>
        </section>

        {/* ---------------- Honesty section ---------------- */}
        <section className="border-t border-border py-10">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            What this dictionary does not have
          </h2>
          <ul className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-primary">
                —
              </span>
              <span>
                <strong className="text-foreground">Etymology.</strong> WordNet records no word
                origins, so no page here claims any. A word origin invented to fill a gap is worse
                than an empty section.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-primary">
                —
              </span>
              <span>
                <strong className="text-foreground">Very recent vocabulary.</strong> The corpus
                stops well short of words coined in the last decade.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-primary">
                —
              </span>
              <span>
                <strong className="text-foreground">Audio recordings.</strong> We ship IPA and a
                written respelling; there is no spoken audio.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="text-primary">
                —
              </span>
              <span>
                <strong className="text-foreground">
                  Pronunciation for every word.
                </strong>{" "}
                {n(manifest.withPronunciation)} of {n(manifest.total)} entries have a recorded
                pronunciation. The rest show a syllable line derived from spelling and say so on the
                page, rather than printing a phonetic transcription we would be guessing at.
              </span>
            </li>
          </ul>

          <p className="mt-8 text-[0.9375rem] text-muted-foreground">
            <Link href="/lexicon" className="text-primary hover:underline">
              Back to AltF Lexicon
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}

function LicenceBlock({ title, contributes, terms, text }) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <dl className="mt-2 space-y-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-mono text-xs uppercase tracking-[0.06em] text-primary">Provides</dt>
          <dd className="min-w-0 flex-1">{contributes}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-mono text-xs uppercase tracking-[0.06em] text-primary">Terms</dt>
          <dd className="min-w-0 flex-1">{terms}</dd>
        </div>
      </dl>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface-soft p-4 font-mono text-[0.75rem] leading-relaxed text-muted-foreground">
        {text}
      </pre>
    </div>
  );
}
