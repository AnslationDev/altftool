/**
 * Spanish New Year wishes composer.
 *
 * Pure data + pure functions. No React, no DOM, no network, no clock, no
 * Math.random — every shuffle is driven by an explicit integer seed, so the
 * same input always produces byte-identical output.
 *
 * Three real rules drive the output:
 *
 * 1. T-V distinction. Spanish marks respect and number in the pronoun, the
 *    object clitic and the verb ending all at once: tú (familiar singular),
 *    usted (respectful singular), vosotros (familiar plural, Spain only) and
 *    ustedes (plural everywhere else, and the respectful plural in Spain).
 *    "Te deseo / Le deseo / Os deseo / Les deseo" cannot be produced by
 *    swapping one word, so every wording is written out four times.
 * 2. Pronunciation. Spanish spelling is regular enough that a respelling can
 *    be derived rather than stored: the word is syllabified, stress is placed
 *    by the standard rule (written accent wins, otherwise penultimate for
 *    words ending in a vowel, -n or -s, otherwise final), and each syllable is
 *    respelt for an English reader. Seseo (Latin America) and distinción
 *    (most of Spain) are offered as separate accents.
 * 3. SMS length. á, í, ó and ú are missing from the GSM 03.38 7-bit alphabet
 *    even though ñ, é and ü are in it, so an accented Spanish greeting is sent
 *    as UCS-2 — 70 characters instead of 160. The tool measures both forms.
 */

export const LANGUAGE = {
  name: "Spanish",
  nativeName: "Español",
  script: "Latin",
  iso: "es",
};

/* ------------------------------------------------------------------ *
 * Option tables
 * ------------------------------------------------------------------ */

/** The four address forms. `number` matters for the salutation and closing. */
export const REGISTERS = [
  {
    id: "tu",
    label: "tú — familiar, one person",
    pronoun: "tú",
    number: "singular",
    note: "The everyday form for friends, family, children and most colleagues.",
  },
  {
    id: "usted",
    label: "usted — respectful, one person",
    pronoun: "usted",
    number: "singular",
    note: "For clients, officials, elders and anyone you have not been invited to tutear.",
  },
  {
    id: "vosotros",
    label: "vosotros — familiar, a group (Spain)",
    pronoun: "vosotros",
    number: "plural",
    note: "Used in Spain only. Latin America has no familiar plural and uses ustedes for every group.",
  },
  {
    id: "ustedes",
    label: "ustedes — a group (Latin America, or formal in Spain)",
    pronoun: "ustedes",
    number: "plural",
    note: "The default plural across Latin America; in Spain it is the respectful plural.",
  },
];

export const GENDERS = [
  { id: "x", label: "Not specified (Querido/a)" },
  { id: "m", label: "Masculine (Querido)" },
  { id: "f", label: "Feminine (Querida)" },
];

export const OCCASIONS = [
  {
    id: "ano-nuevo",
    label: "Año Nuevo — 1 January",
    note: "The new year itself, greeted with ¡Feliz Año Nuevo! or ¡Próspero Año Nuevo!",
  },
  {
    id: "nochevieja",
    label: "Nochevieja — New Year's Eve, 31 December",
    note: "New Year's Eve, when Spanish speakers eat twelve grapes on the twelve strokes of midnight.",
  },
];

export const TONES = [
  { id: "any", label: "Any tone" },
  { id: "traditional", label: "Traditional" },
  { id: "warm", label: "Warm and personal" },
  { id: "formal", label: "Formal or business" },
  { id: "short", label: "Short — status or WhatsApp" },
  { id: "funny", label: "Light-hearted" },
  { id: "poetic", label: "Poetic" },
];

export const ACCENTS = [
  {
    id: "latam",
    label: "Latin American (seseo — z and ce/ci sound like s)",
  },
  {
    id: "spain",
    label: "Central and northern Spain (distinción — z and ce/ci sound like th)",
  },
];

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2999;

/* ------------------------------------------------------------------ *
 * Salutations. Spanish adjectives agree in gender and number, so each
 * relationship stores its own six forms rather than patching an ending.
 * Estimado and Distinguido take a colon, not a comma — a comma there is
 * treated as an anglicism in Spanish letter conventions.
 * ------------------------------------------------------------------ */

const pair = (es, en) => ({ es, en });

export const RELATIONSHIPS = [
  {
    id: "partner",
    label: "Partner or spouse",
    register: "tu",
    closing: "intimate",
    themes: ["intimate", "love"],
    greeting: {
      singular: {
        m: pair("Mi querido {name},", "My dear {name},"),
        f: pair("Mi querida {name},", "My dear {name},"),
        x: pair("Mi querido/a {name},", "My dear {name},"),
      },
      plural: {
        m: pair("Mis queridos,", "My dears,"),
        f: pair("Mis queridas,", "My dears,"),
        x: pair("Mis queridos/as,", "My dears,"),
      },
    },
  },
  {
    id: "parent",
    label: "Mother or father",
    register: "tu",
    closing: "family",
    themes: ["family", "gratitude", "elder"],
    greeting: {
      singular: {
        m: pair("Querido papá,", "Dear Dad,"),
        f: pair("Querida mamá,", "Dear Mum,"),
        x: pair("Queridos papás,", "Dear Mum and Dad,"),
      },
      plural: {
        m: pair("Queridos papás,", "Dear Mum and Dad,"),
        f: pair("Queridas mamás,", "Dear Mums,"),
        x: pair("Queridos papás,", "Dear Mum and Dad,"),
      },
    },
  },
  {
    id: "grandparent",
    label: "Grandmother or grandfather",
    register: "usted",
    closing: "family",
    themes: ["family", "elder", "health"],
    greeting: {
      singular: {
        m: pair("Querido abuelo,", "Dear Grandpa,"),
        f: pair("Querida abuela,", "Dear Grandma,"),
        x: pair("Queridos abuelos,", "Dear Grandma and Grandpa,"),
      },
      plural: {
        m: pair("Queridos abuelos,", "Dear Grandma and Grandpa,"),
        f: pair("Queridas abuelas,", "Dear Grandmas,"),
        x: pair("Queridos abuelos,", "Dear Grandma and Grandpa,"),
      },
    },
  },
  {
    id: "sibling",
    label: "Brother or sister",
    register: "tu",
    closing: "family",
    themes: ["family", "fun", "friend"],
    greeting: {
      singular: {
        m: pair("Hermano, {name},", "Bro, {name},"),
        f: pair("Hermana, {name},", "Sis, {name},"),
        x: pair("Hermano/a, {name},", "Bro / Sis, {name},"),
      },
      plural: {
        m: pair("Hermanos,", "Brothers and sisters,"),
        f: pair("Hermanas,", "Sisters,"),
        x: pair("Hermanos/as,", "Brothers and sisters,"),
      },
    },
  },
  {
    id: "friend",
    label: "Friend",
    register: "tu",
    closing: "warm",
    themes: ["friend", "fun"],
    greeting: {
      singular: {
        m: pair("Querido amigo {name},", "Dear friend {name},"),
        f: pair("Querida amiga {name},", "Dear friend {name},"),
        x: pair("Querido/a amigo/a {name},", "Dear friend {name},"),
      },
      plural: {
        m: pair("Queridos amigos,", "Dear friends,"),
        f: pair("Queridas amigas,", "Dear friends,"),
        x: pair("Queridos/as amigos/as,", "Dear friends,"),
      },
    },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "tu",
    closing: "warm",
    themes: ["work", "fun"],
    greeting: {
      singular: {
        m: pair("Hola, {name}:", "Hi {name},"),
        f: pair("Hola, {name}:", "Hi {name},"),
        x: pair("Hola, {name}:", "Hi {name},"),
      },
      plural: {
        m: pair("Hola a todos:", "Hi everyone,"),
        f: pair("Hola a todas:", "Hi everyone,"),
        x: pair("Hola a todos/as:", "Hi everyone,"),
      },
    },
  },
  {
    id: "boss",
    label: "Manager or someone senior",
    register: "usted",
    closing: "formal",
    themes: ["work", "business", "elder", "gratitude"],
    greeting: {
      singular: {
        m: pair("Estimado {name}:", "Dear {name},"),
        f: pair("Estimada {name}:", "Dear {name},"),
        x: pair("Estimado/a {name}:", "Dear {name},"),
      },
      plural: {
        m: pair("Estimados señores:", "Dear Sirs,"),
        f: pair("Estimadas señoras:", "Dear Madams,"),
        x: pair("Estimados/as todos/as:", "Dear all,"),
      },
    },
  },
  {
    id: "client",
    label: "Client or supplier",
    register: "usted",
    closing: "formal",
    themes: ["business", "work"],
    greeting: {
      singular: {
        m: pair("Distinguido {name}:", "Dear {name},"),
        f: pair("Distinguida {name}:", "Dear {name},"),
        x: pair("Distinguido/a {name}:", "Dear {name},"),
      },
      plural: {
        m: pair("Distinguidos clientes:", "Dear customers,"),
        f: pair("Distinguidas clientas:", "Dear customers,"),
        x: pair("Distinguidos/as clientes:", "Dear customers,"),
      },
    },
  },
  {
    id: "teacher",
    label: "Teacher or professor",
    register: "usted",
    closing: "formal",
    themes: ["elder", "gratitude"],
    greeting: {
      singular: {
        m: pair("Estimado profesor {name}:", "Dear Professor {name},"),
        f: pair("Estimada profesora {name}:", "Dear Professor {name},"),
        x: pair("Estimado/a profesor/a {name}:", "Dear Professor {name},"),
      },
      plural: {
        m: pair("Estimados profesores:", "Dear teachers,"),
        f: pair("Estimadas profesoras:", "Dear teachers,"),
        x: pair("Estimados/as profesores/as:", "Dear teachers,"),
      },
    },
  },
  {
    id: "neighbour",
    label: "Neighbour",
    register: "usted",
    closing: "warm",
    themes: ["neighbour", "community"],
    greeting: {
      singular: {
        m: pair("Querido vecino {name},", "Dear neighbour {name},"),
        f: pair("Querida vecina {name},", "Dear neighbour {name},"),
        x: pair("Querido/a vecino/a {name},", "Dear neighbour {name},"),
      },
      plural: {
        m: pair("Queridos vecinos,", "Dear neighbours,"),
        f: pair("Queridas vecinas,", "Dear neighbours,"),
        x: pair("Queridos/as vecinos/as,", "Dear neighbours,"),
      },
    },
  },
  {
    id: "team",
    label: "A team at work",
    register: "ustedes",
    closing: "warm",
    themes: ["work", "group", "business"],
    greeting: {
      singular: {
        m: pair("Compañero {name},", "Teammate {name},"),
        f: pair("Compañera {name},", "Teammate {name},"),
        x: pair("Compañero/a {name},", "Teammate {name},"),
      },
      plural: {
        m: pair("Equipo,", "Team,"),
        f: pair("Equipo,", "Team,"),
        x: pair("Equipo,", "Team,"),
      },
    },
  },
  {
    id: "family-group",
    label: "A whole family",
    register: "ustedes",
    closing: "family",
    themes: ["family", "group"],
    greeting: {
      singular: {
        m: pair("Querido {name} y familia,", "Dear {name} and family,"),
        f: pair("Querida {name} y familia,", "Dear {name} and family,"),
        x: pair("Querido/a {name} y familia,", "Dear {name} and family,"),
      },
      plural: {
        m: pair("Querida familia,", "Dear family,"),
        f: pair("Querida familia,", "Dear family,"),
        x: pair("Querida familia,", "Dear family,"),
      },
    },
  },
];

/** Sign-offs, chosen by how formal the relationship is and by the register. */
export const CLOSINGS = {
  intimate: {
    tu: pair("Con todo mi cariño,", "With all my love,"),
    usted: pair("Con todo mi cariño,", "With all my love,"),
    vosotros: pair("Con todo mi cariño,", "With all my love,"),
    ustedes: pair("Con todo mi cariño,", "With all my love,"),
  },
  family: {
    tu: pair("Un beso muy fuerte,", "A big kiss,"),
    usted: pair("Con mucho cariño,", "With much affection,"),
    vosotros: pair("Un beso muy fuerte a todos,", "A big kiss to you all,"),
    ustedes: pair("Con mucho cariño para todos,", "With much affection to you all,"),
  },
  warm: {
    tu: pair("Un abrazo,", "A hug,"),
    usted: pair("Un cordial saludo,", "Kind regards,"),
    vosotros: pair("Un abrazo a todos,", "A hug to you all,"),
    ustedes: pair("Un abrazo para todos,", "A hug to you all,"),
  },
  formal: {
    tu: pair("Un saludo cordial,", "Kind regards,"),
    usted: pair("Atentamente,", "Yours sincerely,"),
    vosotros: pair("Un saludo cordial,", "Kind regards,"),
    ustedes: pair("Atentamente,", "Yours sincerely,"),
  },
};

/* ------------------------------------------------------------------ *
 * Message bank. Every wording is written out in all four address forms:
 * the clitic (te / le / os / les), the possessive (tu / su / vuestro) and
 * the verb ending all move together, so none of these can be derived from
 * another by find-and-replace.
 * ------------------------------------------------------------------ */

export const TEMPLATES = [
  {
    id: "salud-trabajo",
    tone: "traditional",
    occasions: ["ano-nuevo"],
    themes: ["any"],
    tu: "¡Feliz Año Nuevo! Que el año que empieza te traiga salud, trabajo y gente que te quiera bien.",
    usted:
      "¡Feliz Año Nuevo! Que el año que empieza le traiga salud, trabajo y gente que le quiera bien.",
    vosotros:
      "¡Feliz Año Nuevo! Que el año que empieza os traiga salud, trabajo y gente que os quiera bien.",
    ustedes:
      "¡Feliz Año Nuevo! Que el año que empieza les traiga salud, trabajo y gente que les quiera bien.",
    english:
      "Happy New Year! May the year now beginning bring you health, work and people who care about you.",
  },
  {
    id: "prospero-proyectos",
    tone: "traditional",
    occasions: ["ano-nuevo"],
    themes: ["work", "business", "gratitude"],
    tu: "¡Próspero Año Nuevo! Que se cumplan todos los proyectos que tienes en mente.",
    usted: "¡Próspero Año Nuevo! Que se cumplan todos los proyectos que tiene en mente.",
    vosotros: "¡Próspero Año Nuevo! Que se cumplan todos los proyectos que tenéis en mente.",
    ustedes: "¡Próspero Año Nuevo! Que se cumplan todos los proyectos que tienen en mente.",
    english: "A prosperous New Year! May every plan you have in mind come true.",
  },
  {
    id: "doce-uvas",
    tone: "traditional",
    occasions: ["ano-nuevo", "nochevieja"],
    themes: ["any"],
    tu: "Que las doce uvas te traigan doce meses de suerte. ¡Feliz Año Nuevo!",
    usted: "Que las doce uvas le traigan doce meses de suerte. ¡Feliz Año Nuevo!",
    vosotros: "Que las doce uvas os traigan doce meses de suerte. ¡Feliz Año Nuevo!",
    ustedes: "Que las doce uvas les traigan doce meses de suerte. ¡Feliz Año Nuevo!",
    english: "May the twelve grapes bring you twelve months of luck. Happy New Year!",
  },
  {
    id: "gracias-acompanar",
    tone: "warm",
    occasions: ["ano-nuevo"],
    themes: ["friend", "family", "intimate", "gratitude"],
    tu: "Gracias por acompañarme en el año que se va. Que el nuevo te traiga todo lo que has estado esperando.",
    usted:
      "Gracias por acompañarme en el año que se va. Que el nuevo le traiga todo lo que ha estado esperando.",
    vosotros:
      "Gracias por acompañarme en el año que se va. Que el nuevo os traiga todo lo que habéis estado esperando.",
    ustedes:
      "Gracias por acompañarme en el año que se va. Que el nuevo les traiga todo lo que han estado esperando.",
    english:
      "Thank you for being with me through the year that is ending. May the new one bring you everything you have been waiting for.",
  },
  {
    id: "casa-salud",
    tone: "warm",
    occasions: ["ano-nuevo"],
    themes: ["family", "elder", "neighbour", "community", "health"],
    tu: "Que en tu casa no te falte salud ni compañía en este año nuevo.",
    usted: "Que en su casa no le falte salud ni compañía en este año nuevo.",
    vosotros: "Que en vuestra casa no os falte salud ni compañía en este año nuevo.",
    ustedes: "Que en su casa no les falte salud ni compañía en este año nuevo.",
    english: "May your home lack neither health nor company in this new year.",
  },
  {
    id: "tenerte-cerca",
    tone: "warm",
    occasions: ["ano-nuevo"],
    themes: ["family", "intimate", "elder", "love", "gratitude"],
    tu: "Empiezo el año dando gracias por tenerte cerca. Que este sea el tuyo.",
    usted: "Empiezo el año dando gracias por tenerle cerca. Que este sea el suyo.",
    vosotros: "Empiezo el año dando gracias por teneros cerca. Que este sea el vuestro.",
    ustedes: "Empiezo el año dando gracias por tenerlos cerca. Que este sea el suyo.",
    english: "I begin the year grateful to have you close by. May this one be yours.",
  },
  {
    id: "brindo",
    tone: "warm",
    occasions: ["ano-nuevo", "nochevieja"],
    themes: ["intimate", "friend", "group", "love"],
    tu: "Esta noche brindo por ti y por todo lo que nos queda por vivir juntos.",
    usted: "Esta noche brindo por usted y por todo lo que nos queda por vivir.",
    vosotros: "Esta noche brindo por vosotros y por todo lo que nos queda por vivir juntos.",
    ustedes: "Esta noche brindo por ustedes y por todo lo que nos queda por vivir juntos.",
    english: "Tonight I raise a glass to you and to everything we still have ahead of us.",
  },
  {
    id: "confianza-cliente",
    tone: "formal",
    occasions: ["ano-nuevo"],
    themes: ["business", "work"],
    tu: "Te agradecemos la confianza de este año y te deseamos un próspero año nuevo.",
    usted:
      "Le agradecemos la confianza depositada en nosotros durante este año y le deseamos un próspero año nuevo.",
    vosotros:
      "Os agradecemos la confianza depositada en nosotros durante este año y os deseamos un próspero año nuevo.",
    ustedes:
      "Les agradecemos la confianza depositada en nosotros durante este año y les deseamos un próspero año nuevo.",
    english:
      "We are grateful for the trust you placed in us this year and we wish you a prosperous new year.",
  },
  {
    id: "mejores-deseos",
    tone: "formal",
    occasions: ["ano-nuevo"],
    themes: ["any"],
    tu: "Recibe mis mejores deseos de paz y prosperidad para el año que comienza.",
    usted: "Reciba nuestros mejores deseos de paz y prosperidad para el año que comienza.",
    vosotros: "Recibid nuestros mejores deseos de paz y prosperidad para el año que comienza.",
    ustedes: "Reciban nuestros mejores deseos de paz y prosperidad para el año que comienza.",
    english: "Please accept our best wishes of peace and prosperity for the year that is beginning.",
  },
  {
    id: "equipo-unidos",
    tone: "formal",
    occasions: ["ano-nuevo"],
    themes: ["work", "group", "business"],
    tu: "Gracias por tu trabajo este año. Que el próximo nos encuentre igual de unidos.",
    usted: "Gracias por su trabajo este año. Que el próximo nos encuentre igual de unidos.",
    vosotros: "Gracias por vuestro trabajo este año. Que el próximo nos encuentre igual de unidos.",
    ustedes: "Gracias por su trabajo este año. Que el próximo nos encuentre igual de unidos.",
    english:
      "Thank you for your work this year. May the next one find us just as united.",
  },
  {
    id: "feliz-simple",
    tone: "short",
    occasions: ["ano-nuevo"],
    themes: ["any"],
    tu: "¡Feliz Año Nuevo! Que sea un gran año para ti.",
    usted: "¡Feliz Año Nuevo! Que sea un gran año para usted.",
    vosotros: "¡Feliz Año Nuevo! Que sea un gran año para vosotros.",
    ustedes: "¡Feliz Año Nuevo! Que sea un gran año para ustedes.",
    english: "Happy New Year! May it be a great year for you.",
  },
  {
    id: "feliz-year",
    tone: "short",
    occasions: ["ano-nuevo"],
    themes: ["any"],
    tu: "¡Feliz {year}! Que te traiga cosas buenas.",
    usted: "¡Feliz {year}! Que le traiga cosas buenas.",
    vosotros: "¡Feliz {year}! Que os traiga cosas buenas.",
    ustedes: "¡Feliz {year}! Que les traiga cosas buenas.",
    english: "Happy {year}! May it bring you good things.",
  },
  {
    id: "gimnasio",
    tone: "funny",
    occasions: ["ano-nuevo"],
    themes: ["friend", "fun", "work"],
    tu: "Feliz año. Este año sí vas al gimnasio en febrero, ¿verdad? Yo te creo.",
    usted: "Feliz año. Este año sí va al gimnasio en febrero, ¿verdad? Yo le creo.",
    vosotros: "Feliz año. Este año sí vais al gimnasio en febrero, ¿verdad? Yo os creo.",
    ustedes: "Feliz año. Este año sí van al gimnasio en febrero, ¿verdad? Yo les creo.",
    english:
      "Happy New Year. This year you really are going to the gym in February, right? I believe you.",
  },
  {
    id: "propositos",
    tone: "funny",
    occasions: ["ano-nuevo"],
    themes: ["friend", "fun", "work", "neighbour"],
    tu: "Mis propósitos para este año: dormir más y contestar tus mensajes el mismo día.",
    usted: "Mis propósitos para este año: dormir más y contestar sus mensajes el mismo día.",
    vosotros: "Mis propósitos para este año: dormir más y contestar vuestros mensajes el mismo día.",
    ustedes: "Mis propósitos para este año: dormir más y contestar sus mensajes el mismo día.",
    english:
      "My resolutions for this year: sleep more, and answer your messages the same day.",
  },
  {
    id: "pagina-blanca",
    tone: "poetic",
    occasions: ["ano-nuevo"],
    themes: ["any"],
    tu: "Se cierra una página y empieza otra en blanco. Que la escribas bonita.",
    usted: "Se cierra una página y empieza otra en blanco. Que la escriba bonita.",
    vosotros: "Se cierra una página y empieza otra en blanco. Que la escribáis bonita.",
    ustedes: "Se cierra una página y empieza otra en blanco. Que la escriban bonita.",
    english: "One page closes and another begins blank. May you write it beautifully.",
  },
  {
    id: "campanadas",
    tone: "poetic",
    occasions: ["ano-nuevo", "nochevieja"],
    themes: ["any"],
    tu: "Doce campanadas, doce deseos. Que se te cumplan todos.",
    usted: "Doce campanadas, doce deseos. Que se le cumplan todos.",
    vosotros: "Doce campanadas, doce deseos. Que se os cumplan todos.",
    ustedes: "Doce campanadas, doce deseos. Que se les cumplan todos.",
    english: "Twelve chimes, twelve wishes. May every one of them come true for you.",
  },
  {
    id: "nochevieja-gracias",
    tone: "warm",
    occasions: ["nochevieja"],
    themes: ["friend", "family", "intimate", "gratitude"],
    tu: "Esta noche se acaba el año y quería decirte que me alegro de haberlo pasado contigo.",
    usted: "Esta noche se acaba el año y quería decirle que me alegro de haberlo pasado con usted.",
    vosotros:
      "Esta noche se acaba el año y quería deciros que me alegro de haberlo pasado con vosotros.",
    ustedes:
      "Esta noche se acaba el año y quería decirles que me alegro de haberlo pasado con ustedes.",
    english:
      "The year ends tonight, and I wanted to tell you I am glad I spent it with you.",
  },
  {
    id: "nochevieja-equipo",
    tone: "warm",
    occasions: ["nochevieja"],
    themes: ["work", "group", "business", "neighbour", "community"],
    tu: "Antes de que acabe el año quería darte las gracias por todo lo de estos meses.",
    usted: "Antes de que acabe el año quería darle las gracias por todo lo de estos meses.",
    vosotros: "Antes de que acabe el año quería daros las gracias por todo lo de estos meses.",
    ustedes: "Antes de que acabe el año quería darles las gracias por todo lo de estos meses.",
    english: "Before the year is out I wanted to thank you for everything over these past months.",
  },
  {
    id: "nochevieja-uvas-broma",
    tone: "funny",
    occasions: ["nochevieja"],
    themes: ["friend", "fun", "family", "work"],
    tu: "¡Feliz Nochevieja! Cómete las doce uvas con calma, que el año no se va a ir sin ti.",
    usted: "¡Feliz Nochevieja! Cómase las doce uvas con calma, que el año no se va a ir sin usted.",
    vosotros:
      "¡Feliz Nochevieja! Comeos las doce uvas con calma, que el año no se va a ir sin vosotros.",
    ustedes:
      "¡Feliz Nochevieja! Cómanse las doce uvas con calma, que el año no se va a ir sin ustedes.",
    english:
      "Happy New Year's Eve! Take your time with the twelve grapes — the year is not leaving without you.",
  },
  {
    id: "nochevieja-formal",
    tone: "formal",
    occasions: ["nochevieja"],
    themes: ["any"],
    tu: "Recibe mis mejores deseos en esta Nochevieja y en el año que comienza.",
    usted: "Reciba nuestros mejores deseos en esta Nochevieja y en el año que comienza.",
    vosotros: "Recibid nuestros mejores deseos en esta Nochevieja y en el año que comienza.",
    ustedes: "Reciban nuestros mejores deseos en esta Nochevieja y en el año que comienza.",
    english: "Please accept our best wishes on this New Year's Eve and for the year that begins.",
  },
  {
    id: "nochevieja-corto",
    tone: "short",
    occasions: ["nochevieja"],
    themes: ["any"],
    tu: "¡Feliz Nochevieja! Nos vemos en {year}.",
    usted: "¡Feliz Nochevieja! Nos vemos en {year}, si Dios quiere.",
    vosotros: "¡Feliz Nochevieja! Nos vemos en {year}, chicos.",
    ustedes: "¡Feliz Nochevieja! Nos vemos en {year}.",
    english: "Happy New Year's Eve! See you in {year}.",
  },
  {
    id: "nochevieja-traditional",
    tone: "traditional",
    occasions: ["nochevieja"],
    themes: ["any"],
    tu: "¡Feliz Nochevieja! Que termines el año con los tuyos y empieces el nuevo con salud.",
    usted: "¡Feliz Nochevieja! Que termine el año con los suyos y empiece el nuevo con salud.",
    vosotros: "¡Feliz Nochevieja! Que terminéis el año con los vuestros y empecéis el nuevo con salud.",
    ustedes: "¡Feliz Nochevieja! Que terminen el año con los suyos y empiecen el nuevo con salud.",
    english:
      "Happy New Year's Eve! May you end the year with your own people and start the new one in good health.",
  },
  {
    id: "nochevieja-poetic",
    tone: "poetic",
    occasions: ["nochevieja"],
    themes: ["any"],
    tu: "El año se despide despacio. Que lo que dejes atrás no te pese y lo que venga te encuentre despierto.",
    usted:
      "El año se despide despacio. Que lo que deje atrás no le pese y lo que venga le encuentre despierto.",
    vosotros:
      "El año se despide despacio. Que lo que dejéis atrás no os pese y lo que venga os encuentre despiertos.",
    ustedes:
      "El año se despide despacio. Que lo que dejen atrás no les pese y lo que venga les encuentre despiertos.",
    english:
      "The year takes its leave slowly. May what you leave behind not weigh on you, and may what comes find you awake.",
  },
];

/* ------------------------------------------------------------------ *
 * SMS measurement (3GPP TS 23.038 / 23.040)
 * ------------------------------------------------------------------ */

/**
 * GSM 03.38 default 7-bit alphabet. Spanish ñ, é, ü, ¡ and ¿ ARE in this
 * table; á, í, ó and ú are not, which is why an accented Spanish greeting
 * falls through to UCS-2.
 */
export const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** GSM 03.38 extension table — each of these costs two septets. */
export const GSM7_EXTENDED = "^{}\\[~]|€";

export const SMS_LIMITS = {
  gsm7Single: 160,
  gsm7Multi: 153,
  ucs2Single: 70,
  ucs2Multi: 67,
};

/**
 * Substitutions that bring Spanish inside the GSM-7 alphabet without changing
 * a word's meaning. ñ, é and ü are present in GSM 03.38 and are never touched
 * — writing "ano" for "año" would change the meaning of the word entirely.
 */
export const GSM_SAFE_REPLACEMENTS = {
  á: "a",
  í: "i",
  ó: "o",
  ú: "u",
  Á: "A",
  Í: "I",
  Ó: "O",
  Ú: "U",
  "—": "-",
  "–": "-",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "…": "...",
};

/**
 * Rewrite text so every character survives the GSM-7 alphabet: apply the
 * substitution table, keep anything already in GSM 03.38 and drop the rest.
 */
export function toGsmSafe(text) {
  const value = typeof text === "string" ? text : "";
  let out = "";

  for (const ch of value) {
    const replacement = GSM_SAFE_REPLACEMENTS[ch];
    if (replacement !== undefined) out += replacement;
    else if (GSM7_BASIC.indexOf(ch) !== -1 || GSM7_EXTENDED.indexOf(ch) !== -1) out += ch;
  }

  return out
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
}

/** Billable length of an SMS: alphabet, unit count and number of segments. */
export function measureSms(text) {
  const value = typeof text === "string" ? text : "";
  if (value.length === 0) {
    return { encoding: "GSM-7", units: 0, segments: 0, perSegment: SMS_LIMITS.gsm7Single };
  }

  let septets = 0;
  let gsmSafe = true;
  for (const ch of value) {
    if (GSM7_BASIC.indexOf(ch) !== -1) septets += 1;
    else if (GSM7_EXTENDED.indexOf(ch) !== -1) septets += 2;
    else {
      gsmSafe = false;
      break;
    }
  }

  if (gsmSafe) {
    const segments =
      septets <= SMS_LIMITS.gsm7Single ? 1 : Math.ceil(septets / SMS_LIMITS.gsm7Multi);
    return {
      encoding: "GSM-7",
      units: septets,
      segments,
      perSegment: segments > 1 ? SMS_LIMITS.gsm7Multi : SMS_LIMITS.gsm7Single,
    };
  }

  // UCS-2 bills UTF-16 code units, which is exactly String#length here.
  const units = value.length;
  const segments = units <= SMS_LIMITS.ucs2Single ? 1 : Math.ceil(units / SMS_LIMITS.ucs2Multi);
  return {
    encoding: "UCS-2",
    units,
    segments,
    perSegment: segments > 1 ? SMS_LIMITS.ucs2Multi : SMS_LIMITS.ucs2Single,
  };
}

/** Whitespace-separated word count. */
export function countWords(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/* ------------------------------------------------------------------ *
 * Spanish year names, so the pronunciation guide can read "2027" aloud
 * ------------------------------------------------------------------ */

const UNITS_ES = [
  "cero",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
  "trece",
  "catorce",
  "quince",
  "dieciséis",
  "diecisiete",
  "dieciocho",
  "diecinueve",
  "veinte",
  "veintiuno",
  "veintidós",
  "veintitrés",
  "veinticuatro",
  "veinticinco",
  "veintiséis",
  "veintisiete",
  "veintiocho",
  "veintinueve",
];

const TENS_ES = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

const HUNDREDS_ES = [
  "",
  "ciento",
  "doscientos",
  "trescientos",
  "cuatrocientos",
  "quinientos",
  "seiscientos",
  "setecientos",
  "ochocientos",
  "novecientos",
];

/** Spanish name of a whole number from 0 to 999. */
export function spanishNumberUnder1000(value) {
  const n = Math.trunc(value);
  if (!Number.isFinite(n) || n < 0 || n > 999) return "";
  if (n < 30) return UNITS_ES[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return rest === 0 ? TENS_ES[tens] : `${TENS_ES[tens]} y ${UNITS_ES[rest]}`;
  }
  if (n === 100) return "cien";
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0 ? HUNDREDS_ES[hundreds] : `${HUNDREDS_ES[hundreds]} ${spanishNumberUnder1000(rest)}`;
}

/** Spanish name of a year between MIN_YEAR and MAX_YEAR, e.g. "dos mil veintisiete". */
export function spanishYearWords(year) {
  const n = Math.trunc(year);
  if (!Number.isFinite(n) || n < MIN_YEAR || n > MAX_YEAR) return "";
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const head = thousands === 1 ? "mil" : `${UNITS_ES[thousands]} mil`;
  return rest === 0 ? head : `${head} ${spanishNumberUnder1000(rest)}`;
}

/* ------------------------------------------------------------------ *
 * Pronunciation: syllabify, place the stress, respell for an English reader
 * ------------------------------------------------------------------ */

const VOWEL_LETTERS = "aeiouáéíóúü";
const STRONG_BASE = "aeo";
const ACCENT_BASE = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u" };
const STRESS_MARKS = "áéíóú";

const stripAccent = (ch) => ACCENT_BASE[ch] || ch;
const isVowelLetter = (ch) => VOWEL_LETTERS.indexOf(ch) !== -1;

/** Consonant clusters that may open a Spanish syllable. */
const ONSET_CLUSTERS = new Set([
  "pl", "pr", "bl", "br", "fl", "fr", "gl", "gr", "cl", "cr", "kl", "kr", "tr", "dr",
]);

/** Single-vowel respellings for an English reader. */
const VOWEL_SOUNDS = { a: "ah", e: "eh", i: "ee", o: "oh", u: "oo" };

/** Diphthongs and triphthongs, keyed on the accent-stripped nucleus. */
const NUCLEUS_SOUNDS = {
  ia: "yah", ie: "yeh", io: "yoh", iu: "yoo",
  ua: "wah", ue: "weh", ui: "wee", uo: "woh",
  ai: "eye", ei: "ay", oi: "oy", au: "ow", eu: "eh-oo", ou: "oh-oo",
  iai: "yeye", iei: "yay", uai: "wye", uei: "way", uau: "wow", iau: "yow",
};

/**
 * Split a lowercase Spanish word into letter units, treating ch, ll, rr and
 * the digraphs qu/gu/gü before e and i as single consonants, and a word-final
 * y after a vowel as a vowel.
 */
function toUnits(word) {
  const units = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2);
    const next = word[i + 2];
    if (two === "ch" || two === "ll" || two === "rr") {
      units.push({ type: "c", text: two });
      i += 2;
      continue;
    }
    if ((two === "qu" || two === "gu") && next !== undefined && "eiéí".indexOf(next) !== -1) {
      units.push({ type: "c", text: two });
      i += 2;
      continue;
    }
    if (two === "gü") {
      units.push({ type: "c", text: "gü" });
      i += 2;
      continue;
    }
    const ch = word[i];
    if (isVowelLetter(ch)) {
      units.push({ type: "v", text: ch });
    } else if (ch === "y") {
      const prev = word[i - 1];
      const after = word[i + 1];
      const finalAfterVowel = after === undefined && prev !== undefined && isVowelLetter(prev);
      units.push(finalAfterVowel || word.length === 1 ? { type: "v", text: "y" } : { type: "c", text: "y" });
    } else {
      units.push({ type: "c", text: ch });
    }
    i += 1;
  }
  return units;
}

/** Break a run of adjacent vowels into nuclei, honouring hiatus. */
function splitNuclei(cluster) {
  const chars = cluster.map((unit) => (unit.text === "y" ? "i" : unit.text));
  const out = [];
  let current = [chars[0]];
  for (let k = 1; k < chars.length; k += 1) {
    const prev = chars[k - 1];
    const ch = chars[k];
    const bothStrong =
      STRONG_BASE.indexOf(stripAccent(prev)) !== -1 && STRONG_BASE.indexOf(stripAccent(ch)) !== -1;
    // An accented í or ú always breaks a diphthong (día, país, reúno).
    const accentedWeak = prev === "í" || prev === "ú" || ch === "í" || ch === "ú";
    if (bothStrong || accentedWeak) {
      out.push(current.join(""));
      current = [ch];
    } else {
      current.push(ch);
    }
  }
  out.push(current.join(""));
  return out;
}

/** Decide how a run of consonants between two nuclei splits into coda + onset. */
function splitConsonantRun(run) {
  const n = run.length;
  if (n === 0) return { coda: [], onset: [] };
  if (n === 1) return { coda: [], onset: run.slice() };
  const lastTwo = `${run[n - 2].text}${run[n - 1].text}`;
  if (n === 2) {
    return ONSET_CLUSTERS.has(lastTwo)
      ? { coda: [], onset: run.slice() }
      : { coda: [run[0]], onset: [run[1]] };
  }
  if (ONSET_CLUSTERS.has(lastTwo)) {
    return { coda: run.slice(0, n - 2), onset: run.slice(n - 2) };
  }
  return { coda: run.slice(0, n - 1), onset: [run[n - 1]] };
}

/**
 * Syllabify one lowercase Spanish word.
 * @returns {{onset:Array, nucleus:string, coda:Array, start:number}[]}
 */
export function syllabify(word) {
  const units = toUnits(word);
  if (units.length === 0) return [];

  // Split the unit list into: leading consonants, then (nucleus, consonants)*.
  const groups = [];
  let leading = [];
  let index = 0;
  while (index < units.length && units[index].type === "c") {
    leading.push(units[index]);
    index += 1;
  }
  if (index === units.length) return [];

  while (index < units.length) {
    const vowelRun = [];
    while (index < units.length && units[index].type === "v") {
      vowelRun.push(units[index]);
      index += 1;
    }
    const consonantRun = [];
    while (index < units.length && units[index].type === "c") {
      consonantRun.push(units[index]);
      index += 1;
    }
    const nuclei = splitNuclei(vowelRun);
    nuclei.forEach((nucleus, k) => {
      groups.push({ nucleus, run: k === nuclei.length - 1 ? consonantRun : [] });
    });
  }

  const syllables = [];
  let pendingOnset = leading;
  groups.forEach((group, k) => {
    const isLast = k === groups.length - 1;
    const { coda, onset } = isLast
      ? { coda: group.run, onset: [] }
      : splitConsonantRun(group.run);
    syllables.push({ onset: pendingOnset, nucleus: group.nucleus, coda, start: k === 0 });
    pendingOnset = onset;
  });
  return syllables;
}

/** Which syllable carries the stress, by the standard Spanish rule. */
export function stressedIndex(word, syllables) {
  if (syllables.length === 0) return -1;
  for (let i = 0; i < syllables.length; i += 1) {
    for (const ch of syllables[i].nucleus) {
      if (STRESS_MARKS.indexOf(ch) !== -1) return i;
    }
  }
  if (syllables.length === 1) return 0;
  const last = word[word.length - 1];
  const openEnding = isVowelLetter(last) || last === "n" || last === "s" || last === "y";
  // A word ending in -y (hoy, Uruguay) is stressed on the last syllable.
  if (last === "y") return syllables.length - 1;
  return openEnding ? syllables.length - 2 : syllables.length - 1;
}

/**
 * @param nextLetter the letter that actually follows this consonant — the next
 *   consonant of the same onset if there is one, otherwise the first vowel of
 *   the nucleus. c and g are only soft before a vowel, so "cr" in escriban is
 *   /kr/ and not /sr/.
 */
function onsetSound(unit, nextLetter, atWordStart, prevLetter, accent) {
  const nextVowel = stripAccent(nextLetter || "");
  const soft = nextVowel === "e" || nextVowel === "i";
  const theta = accent === "spain" ? "th" : "s";
  switch (unit.text) {
    case "b":
    case "v":
      return "b";
    case "c":
      return soft ? theta : "k";
    case "z":
      return theta;
    case "ch":
      return "ch";
    case "g":
      return soft ? "h" : "g";
    case "gu":
      return "g";
    case "gü":
      return "gw";
    case "h":
      return "";
    case "j":
      return "h";
    case "ll":
      return "y";
    case "ñ":
      return "ny";
    case "qu":
    case "q":
    case "k":
      return "k";
    case "r":
      // r is trilled at the start of a word and after n, l or s.
      return atWordStart || prevLetter === "n" || prevLetter === "l" || prevLetter === "s"
        ? "rr"
        : "r";
    case "rr":
      return "rr";
    case "x":
      return "ks";
    case "w":
      return "w";
    case "y":
      return "y";
    default:
      return unit.text;
  }
}

function codaSound(unit, accent) {
  const theta = accent === "spain" ? "th" : "s";
  switch (unit.text) {
    case "z":
      return theta;
    case "c":
      return "k";
    case "v":
      return "b";
    case "h":
      return "";
    case "j":
      return "h";
    case "ñ":
      return "ny";
    case "ll":
      return "y";
    case "rr":
      return "rr";
    case "x":
      return "ks";
    case "qu":
      return "k";
    default:
      return unit.text;
  }
}

function nucleusSound(nucleus) {
  const base = Array.from(nucleus).map(stripAccent).join("");
  if (NUCLEUS_SOUNDS[base]) return NUCLEUS_SOUNDS[base];
  if (base.length === 1) return VOWEL_SOUNDS[base] || base;
  return Array.from(base)
    .map((ch) => VOWEL_SOUNDS[ch] || ch)
    .join("-");
}

/**
 * Words where x keeps its old /x/ value rather than the regular /ks/ — the
 * spelling was frozen before the sound shifted, so the rule cannot predict it.
 */
const X_AS_J = new Set(["méxico", "mexicano", "mexicana", "mexicanos", "mexicanas", "oaxaca", "texas"]);

/** Respell a single Spanish word for an English reader. */
export function respellWord(word, accent = "latam") {
  const raw = String(word).toLowerCase();
  const lower = X_AS_J.has(raw) ? raw.split("x").join("j") : raw;
  const syllables = syllabify(lower);
  if (syllables.length === 0) return lower;
  const stress = stressedIndex(lower, syllables);

  const parts = syllables.map((syllable, i) => {
    let prevLetter = "";
    const onset = syllable.onset
      .map((unit, k) => {
        const atWordStart = i === 0 && k === 0;
        const following = syllable.onset[k + 1];
        const nextLetter = following ? following.text[0] : syllable.nucleus[0];
        const sound = onsetSound(unit, nextLetter, atWordStart, prevLetter, accent);
        prevLetter = unit.text[unit.text.length - 1];
        return sound;
      })
      .join("");
    const coda = syllable.coda.map((unit) => codaSound(unit, accent)).join("");
    const text = `${onset}${nucleusSound(syllable.nucleus)}${coda}`;
    return syllables.length > 1 && i === stress ? text.toUpperCase() : text;
  });

  return parts.join("-");
}

/**
 * Respell a whole Spanish sentence. Punctuation and spacing survive; anything
 * that is not a Spanish letter is passed through untouched.
 */
export function respell(text, accent = "latam") {
  const value = typeof text === "string" ? text : "";
  return value.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, (word) => respellWord(word, accent));
}

/* ------------------------------------------------------------------ *
 * Deterministic shuffle
 * ------------------------------------------------------------------ */

/** mulberry32 — a small, deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Next seed in a fixed sequence, so a shuffle button stays reproducible. */
export function nextSeed(seed) {
  const current = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 1;
  return (current * 1664525 + 1013904223) % 2147483647 || 1;
}

/* ------------------------------------------------------------------ *
 * Composition
 * ------------------------------------------------------------------ */

function cleanName(raw) {
  if (raw === undefined || raw === null) return "";
  return String(raw).replace(/\s+/g, " ").trim();
}

/** Drop a dangling {name} and tidy the punctuation left behind. */
function applyName(template, name) {
  const filled = name
    ? template.split("{name}").join(name)
    : template.split("{name}").join("");
  return filled
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*:/g, ":")
    .trim();
}

function applyYear(template, year) {
  return template.split("{year}").join(String(year));
}

function joinLines(parts) {
  return parts.filter((part) => part && part.length > 0).join("\n");
}

/**
 * Compose Spanish New Year messages.
 *
 * @param {object} input
 * @param {string} [input.name] the person or group being greeted
 * @param {string} [input.relationshipId] one of RELATIONSHIPS
 * @param {"auto"|"tu"|"usted"|"vosotros"|"ustedes"} [input.register]
 * @param {"x"|"m"|"f"} [input.gender] grammatical gender for the salutation
 * @param {string} [input.occasionId] one of OCCASIONS
 * @param {string} [input.tone] one of TONES
 * @param {number} [input.count] 1..MAX_MESSAGES
 * @param {number} [input.year] the year being wished in, MIN_YEAR..MAX_YEAR
 * @param {number} [input.seed] integer; the same seed gives the same messages
 * @param {string} [input.senderName] signed under the closing
 * @param {"latam"|"spain"} [input.accent] pronunciation model
 * @returns {{messages:Array}|{error:string}}
 */
export function generateSpanishNewYearWishes({
  name = "",
  relationshipId = "friend",
  register = "auto",
  gender = "x",
  occasionId = "ano-nuevo",
  tone = "any",
  count = 3,
  year = 2027,
  seed = 1,
  senderName = "",
  accent = "latam",
} = {}) {
  const relationship = RELATIONSHIPS.find((item) => item.id === relationshipId);
  if (!relationship) return { error: "Choose who the message is for." };

  const occasion = OCCASIONS.find((item) => item.id === occasionId);
  if (!occasion) return { error: "Choose Año Nuevo or Nochevieja." };

  if (!TONES.some((item) => item.id === tone)) return { error: "Choose a valid tone." };
  if (!GENDERS.some((item) => item.id === gender)) {
    return { error: "Choose masculine, feminine or unspecified." };
  }
  if (!ACCENTS.some((item) => item.id === accent)) {
    return { error: "Choose a Latin American or Spanish pronunciation." };
  }
  if (register !== "auto" && !REGISTERS.some((item) => item.id === register)) {
    return { error: "Choose tú, usted, vosotros, ustedes or automatic." };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }
  const cleanedSender = cleanName(senderName);
  if (cleanedSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep your own name under ${MAX_NAME_LENGTH} characters.` };
  }

  const usedRegisterId = register === "auto" ? relationship.register : register;
  const usedRegister = REGISTERS.find((item) => item.id === usedRegisterId);
  const isPlural = usedRegister.number === "plural";

  // Pool: occasion is a hard filter; tone and relationship narrow it only when
  // something is left, so no combination can end up with nothing to say.
  const byOccasion = TEMPLATES.filter((item) => item.occasions.includes(occasionId));
  if (byOccasion.length === 0) return { error: "No wording is written for that occasion yet." };

  let pool = byOccasion;
  let tonedApplied = false;
  if (tone !== "any") {
    const toned = pool.filter((item) => item.tone === tone);
    if (toned.length > 0) {
      pool = toned;
      tonedApplied = true;
    }
  }

  const fitted = pool.filter(
    (item) =>
      item.themes.includes("any") ||
      item.themes.some((theme) => relationship.themes.includes(theme)),
  );
  const themeApplied = fitted.length > 0;
  if (themeApplied) pool = fitted;

  const safeSeed = Math.abs(Math.trunc(seed)) || 1;
  const picked = seededShuffle(pool, safeSeed).slice(0, Math.min(count, pool.length));

  const greetingSet = relationship.greeting[isPlural ? "plural" : "singular"][gender];
  const greeting = {
    es: applyName(greetingSet.es, cleanedName),
    en: applyName(greetingSet.en, cleanedName),
  };

  const closingSet = CLOSINGS[relationship.closing][usedRegisterId];
  const signature = {
    es: cleanedSender ? `${closingSet.es}\n${cleanedSender}` : closingSet.es,
    en: cleanedSender ? `${closingSet.en}\n${cleanedSender}` : closingSet.en,
  };

  const yearWords = spanishYearWords(year);

  const messages = picked.map((item) => {
    const bodyEs = applyYear(item[usedRegisterId], year);
    const bodyEn = applyYear(item.english, year);
    // The pronunciation reads the year out in words rather than as digits.
    const bodySpoken = item[usedRegisterId].split("{year}").join(yearWords);

    const full = joinLines([greeting.es, bodyEs, signature.es]);
    const fullEnglish = joinLines([greeting.en, bodyEn, signature.en]);
    const fullSpoken = joinLines([greeting.es, bodySpoken, signature.es]);
    const plain = toGsmSafe(full);

    return {
      id: item.id,
      tone: item.tone,
      toneLabel: (TONES.find((t) => t.id === item.tone) || {}).label || item.tone,
      spanish: bodyEs,
      english: bodyEn,
      full,
      fullEnglish,
      pronunciation: respell(fullSpoken, accent),
      plain,
      plainDiffers: plain !== full,
      characters: full.length,
      words: countWords(full),
      sms: measureSms(full),
      smsPlain: measureSms(plain),
    };
  });

  return {
    messages,
    language: LANGUAGE,
    relationship,
    occasion,
    tone,
    accent,
    gender,
    year,
    yearWords,
    register: usedRegisterId,
    registerLabel: usedRegister.label,
    registerNote: usedRegister.note,
    pronoun: usedRegister.pronoun,
    number: usedRegister.number,
    autoRegister: relationship.register,
    registerOverridden: register !== "auto" && register !== relationship.register,
    greeting,
    closing: closingSet,
    senderName: cleanedSender,
    recipientName: cleanedName,
    requested: count,
    delivered: messages.length,
    poolSize: pool.length,
    tonedApplied,
    themeApplied,
  };
}
