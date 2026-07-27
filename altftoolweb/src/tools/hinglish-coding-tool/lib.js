/**
 * Hinglish Coding Dictionary — pure data and lookup logic.
 *
 * Every entry pairs the textbook definition of a programming concept with a
 * Hinglish (Hindi written in Latin script, mixed with English) explanation and a
 * everyday analogy, so a learner can anchor the term to something familiar.
 * No React, no DOM, no clock reads.
 */

/** Topic buckets used by the filter. */
export const TOPICS = {
  all: "All topics",
  basics: "Programming basics",
  javascript: "JavaScript",
  python: "Python",
  web: "Web & browser",
  data: "Data structures",
  git: "Git & workflow",
  backend: "Backend & databases",
};

/** Difficulty ladder, mirroring how these concepts are usually taught. */
export const LEVELS = {
  all: "All levels",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * The dictionary. `english` is the precise definition, `hinglish` is the
 * conversational translation, `analogy` is the everyday picture.
 */
export const DICTIONARY = [
  {
    id: "variable",
    term: "Variable",
    topic: "basics",
    level: "beginner",
    english: "A named box in memory that holds a value your program can read and change later.",
    hinglish: "Variable matlab ek naam wala dabba jisme aap koi value rakh dete ho aur baad me badal bhi sakte ho.",
    analogy: "Tiffin box par naam likha hai — andar ka khana badal sakta hai, naam wahi rehta hai.",
    example: "let score = 10; score = 25;",
  },
  {
    id: "constant",
    term: "Constant",
    topic: "basics",
    level: "beginner",
    english: "A binding whose value cannot be reassigned after it is first set.",
    hinglish: "Constant woh value hai jo ek baar set hone ke baad badli nahi ja sakti.",
    analogy: "Aadhaar number jaisa — ek baar mila, phir fix hai.",
    example: "const PI = 3.14159;",
  },
  {
    id: "function",
    term: "Function",
    topic: "basics",
    level: "beginner",
    english: "A reusable block of code that takes inputs, does one job, and usually returns a result.",
    hinglish: "Function ek chhota kaam ka packet hai — input do, kaam karke result wapas milta hai.",
    analogy: "Juicer: santre daalo, juice nikle. Har baar wahi process.",
    example: "function add(a, b) { return a + b; }",
  },
  {
    id: "parameter",
    term: "Parameter vs argument",
    topic: "basics",
    level: "beginner",
    english: "A parameter is the placeholder named in the function definition; an argument is the actual value passed in when calling it.",
    hinglish: "Parameter definition me likha naam hai, argument woh asli value hai jo call karte waqt bhejte ho.",
    analogy: "Shaadi ka card 'guest ka naam' chhodta hai — parameter. Card par 'Rohan' likhna — argument.",
    example: "function greet(name) {} ; greet('Rohan');",
  },
  {
    id: "loop",
    term: "Loop",
    topic: "basics",
    level: "beginner",
    english: "A construct that repeats a block of code until a condition stops being true.",
    hinglish: "Loop matlab same kaam baar-baar, jab tak condition sach hai.",
    analogy: "Roti banate waqt jab tak aata bacha hai, tab tak belte raho.",
    example: "for (let i = 0; i < 5; i++) { console.log(i); }",
  },
  {
    id: "conditional",
    term: "Conditional (if/else)",
    topic: "basics",
    level: "beginner",
    english: "A branch that runs one block of code when a test is true and another when it is false.",
    hinglish: "Agar yeh sach hai to yeh karo, warna woh karo — bas yahi if/else hai.",
    analogy: "Baarish ho rahi hai to chhata lo, warna dhoop ka chashma.",
    example: "if (marks >= 33) pass(); else fail();",
  },
  {
    id: "recursion",
    term: "Recursion",
    topic: "basics",
    level: "intermediate",
    english: "A function that calls itself on a smaller version of the problem, with a base case that stops the chain.",
    hinglish: "Function khud ko hi bulata hai, har baar chhote problem ke saath, aur base case pe ruk jaata hai.",
    analogy: "Do aamne-saamne rakhe sheeshe — reflection ke andar reflection, jab tak roshni khatam.",
    example: "function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }",
  },
  {
    id: "bug",
    term: "Bug",
    topic: "basics",
    level: "beginner",
    english: "A defect that makes a program behave differently from what was intended.",
    hinglish: "Bug matlab code ka woh keeda jo program ko galat chalata hai.",
    analogy: "Recipe me namak ki jagah cheeni — dish ban to gayi, par galat.",
    example: "// off-by-one: for (let i = 0; i <= n; i++)",
  },
  {
    id: "algorithm",
    term: "Algorithm",
    topic: "basics",
    level: "beginner",
    english: "A finite, ordered set of steps that turns an input into a desired output.",
    hinglish: "Algorithm ek pakki step-by-step recipe hai — input se output tak ka rasta.",
    analogy: "Chai banane ki vidhi: paani, patti, doodh, cheeni — order badla to swaad gaya.",
    example: "// 1. read list  2. compare pairs  3. swap  4. repeat",
  },
  {
    id: "time-complexity",
    term: "Time complexity (Big O)",
    topic: "data",
    level: "intermediate",
    english: "A measure of how the running time of an algorithm grows as the input size n grows, ignoring constants.",
    hinglish: "Input badha to time kitna badhega — bas wahi Big O batata hai, chhoti-moti detail chhod ke.",
    analogy: "10 log ki line vs 1000 log ki line — counter ek hi hai, wait waise hi badhega.",
    example: "// linear search = O(n), binary search = O(log n)",
  },
  {
    id: "array",
    term: "Array",
    topic: "data",
    level: "beginner",
    english: "An ordered, index-based collection where each element sits at a numbered position starting at 0.",
    hinglish: "Array ek line me lage dabbe hain, har dabbe ka number hai, aur ginti 0 se shuru hoti hai.",
    analogy: "Train ke dabbe — pehla dabba number 0, doosra 1.",
    example: "const marks = [90, 75, 60]; marks[0]; // 90",
  },
  {
    id: "object",
    term: "Object / dictionary",
    topic: "data",
    level: "beginner",
    english: "A collection of key-value pairs where you look values up by name instead of by position.",
    hinglish: "Object me har value ka ek naam hota hai — number se nahi, naam se dhoondhte ho.",
    analogy: "Phone contact list: naam daalo, number mile.",
    example: "const user = { name: 'Aisha', age: 24 }; user.name;",
  },
  {
    id: "stack",
    term: "Stack",
    topic: "data",
    level: "intermediate",
    english: "A last-in, first-out collection: the item pushed most recently is the first one popped.",
    hinglish: "Stack matlab jo cheez sabse baad me rakhi, wahi sabse pehle nikalti hai.",
    analogy: "Thali ka dher — sabse upar wali thali pehle uthti hai.",
    example: "const s = []; s.push(1); s.push(2); s.pop(); // 2",
  },
  {
    id: "queue",
    term: "Queue",
    topic: "data",
    level: "intermediate",
    english: "A first-in, first-out collection: items leave in the same order they arrived.",
    hinglish: "Queue me jo pehle aaya, wahi pehle jayega — line todna mana hai.",
    analogy: "Railway ticket counter ki line.",
    example: "const q = []; q.push('a'); q.push('b'); q.shift(); // 'a'",
  },
  {
    id: "hash-map",
    term: "Hash map",
    topic: "data",
    level: "intermediate",
    english: "A structure that turns a key into an array index with a hash function, giving average O(1) lookups.",
    hinglish: "Key ko ek formula se number banaya jaata hai, aur seedha us jagah pahunch jaate ho — isliye lookup itna fast hai.",
    analogy: "Library me book ka shelf number card se pata chal jaata hai, poori library nahi chhaanni padti.",
    example: "const m = new Map(); m.set('roll1', 'Aisha'); m.get('roll1');",
  },
  {
    id: "let-var-const",
    term: "let vs var vs const",
    topic: "javascript",
    level: "beginner",
    english: "var is function-scoped and hoisted as undefined; let and const are block-scoped, and const cannot be reassigned.",
    hinglish: "var poore function me ghoomta hai, let aur const sirf apne { } ke andar rehte hain, aur const dobara assign nahi hota.",
    analogy: "var = poore ghar ka common remote, let = kamre ka remote, const = deewar par fix switch.",
    example: "if (true) { let a = 1; var b = 2; } // a gone, b survives",
  },
  {
    id: "closure",
    term: "Closure",
    topic: "javascript",
    level: "advanced",
    english: "A function that keeps access to the variables of the scope it was created in, even after that scope has returned.",
    hinglish: "Function apne janm-sthaan ke variables yaad rakhta hai, chahe woh function kab ka return ho chuka ho.",
    analogy: "Ghar chhod diya, par ghar ki chaabi abhi bhi jeb me hai.",
    example: "function counter() { let n = 0; return () => ++n; }",
  },
  {
    id: "promise",
    term: "Promise",
    topic: "javascript",
    level: "intermediate",
    english: "An object representing a value that is not ready yet; it settles once as fulfilled or rejected.",
    hinglish: "Promise ek parchi hai — abhi cheez nahi mili, par mil jaayegi ya saaf mana ho jaayega.",
    analogy: "Dhobi ki parchi: kapde abhi nahi, shaam ko milenge — ya kho gaye to bata denge.",
    example: "fetch(url).then(r => r.json()).catch(handleError);",
  },
  {
    id: "async-await",
    term: "async / await",
    topic: "javascript",
    level: "intermediate",
    english: "Syntax that lets you write promise-based code in a straight line; await pauses the async function until the promise settles.",
    hinglish: "await likh do aur function wahin ruk jaata hai jab tak jawab na aaye — code seedha padhne me aasan ho jaata hai.",
    analogy: "Counter par token lekar wahin khade rehna, bhaag-daud ke bajaye.",
    example: "const r = await fetch(url); const data = await r.json();",
  },
  {
    id: "event-loop",
    term: "Event loop",
    topic: "javascript",
    level: "advanced",
    english: "The scheduler that runs the call stack to empty, then drains microtasks, then takes one macrotask, forever.",
    hinglish: "Ek hi waiter hai — pehle table khaali karta hai, phir chhote kaam, phir agla bada order uthata hai.",
    analogy: "Ek waiter, kai tables: sab ek saath nahi, ek ke baad ek.",
    example: "console.log(1); setTimeout(() => console.log(3)); Promise.resolve().then(() => console.log(2));",
  },
  {
    id: "hoisting",
    term: "Hoisting",
    topic: "javascript",
    level: "intermediate",
    english: "Declarations are registered before code runs; var becomes undefined, while let and const stay in the temporal dead zone until their line executes.",
    hinglish: "Naam pehle register ho jaate hain, par let/const ko chhoo nahi sakte jab tak unki line na aaye.",
    analogy: "Attendance register me naam likha hai, par bachcha class me abhi aaya hi nahi.",
    example: "console.log(x); var x = 5; // undefined, not an error",
  },
  {
    id: "this",
    term: "this",
    topic: "javascript",
    level: "advanced",
    english: "A binding decided by how a function is called, not where it is written; arrow functions inherit it from the enclosing scope.",
    hinglish: "this ka matlab isse tay hota hai ki function kis tarah bulaya gaya, na ki kahan likha gaya.",
    analogy: "'Main' shabd bolne wale par depend karta hai, likhne wale par nahi.",
    example: "const o = { n: 1, get() { return this.n; } }; o.get(); // 1",
  },
  {
    id: "list-comprehension",
    term: "List comprehension",
    topic: "python",
    level: "beginner",
    english: "Python syntax that builds a new list from an iterable in one expression, with optional filtering.",
    hinglish: "Ek hi line me poori list bana lo — loop aur condition dono usi bracket ke andar.",
    analogy: "Ek hi chalni me daal saaf bhi hui aur alag bartan me chali bhi gayi.",
    example: "squares = [n * n for n in range(5) if n % 2 == 0]",
  },
  {
    id: "python-indent",
    term: "Indentation blocks",
    topic: "python",
    level: "beginner",
    english: "Python marks blocks by indentation, so consistent spacing is part of the syntax, not just style.",
    hinglish: "Python me space hi bracket ka kaam karta hai — aage-peeche hua to error pakka.",
    analogy: "Rangoli ki line hat gayi to design hi bigad gaya.",
    example: "if ok:\n    run()\nelse:\n    stop()",
  },
  {
    id: "python-dict",
    term: "dict",
    topic: "python",
    level: "beginner",
    english: "Python's built-in hash map: mutable key-value pairs with average O(1) lookup.",
    hinglish: "dict matlab naam-se-value wali diary, dhoondhna turant.",
    analogy: "Dukaan ka rate card: cheez ka naam bolo, daam mile.",
    example: "prices = {'chai': 10}; prices['chai']",
  },
  {
    id: "virtualenv",
    term: "Virtual environment",
    topic: "python",
    level: "intermediate",
    english: "An isolated folder holding its own Python interpreter and packages so projects do not fight over versions.",
    hinglish: "Har project ka apna alag kamra — ek ke packages doosre ko pareshan nahi karte.",
    analogy: "Alag-alag tiffin — koi kisi ka khana nahi mixaata.",
    example: "python -m venv .venv && source .venv/bin/activate",
  },
  {
    id: "dom",
    term: "DOM",
    topic: "web",
    level: "beginner",
    english: "The browser's live tree of objects representing the page; changing it changes what is rendered.",
    hinglish: "Browser page ko ek tree bana leta hai — us tree ko badloge to page turant badal jaayega.",
    analogy: "Ghar ka naksha jise badalte hi asli ghar bhi badal jaaye.",
    example: "document.querySelector('h1').textContent = 'Namaste';",
  },
  {
    id: "api",
    term: "API",
    topic: "web",
    level: "beginner",
    english: "A defined contract for asking another program for data or actions, without knowing how it works inside.",
    hinglish: "API woh menu card hai jisse aap doosre software se cheezein maang lete ho, uske kitchen me ghuse bina.",
    analogy: "Restaurant ka waiter: order lo, khana lao, kitchen dikhana zaroori nahi.",
    example: "GET /api/users/42",
  },
  {
    id: "cors",
    term: "CORS",
    topic: "web",
    level: "intermediate",
    english: "A browser rule that blocks cross-origin requests unless the server sends headers allowing that origin.",
    hinglish: "Browser doosre domain se data lene se rokta hai jab tak server likh ke permission na de.",
    analogy: "Society ka guard: bina resident ki permission ke andar nahi ghusne dega.",
    example: "Access-Control-Allow-Origin: https://example.com",
  },
  {
    id: "cache",
    term: "Cache",
    topic: "web",
    level: "beginner",
    english: "A nearby copy of expensive-to-fetch data, kept so the next request can be answered faster.",
    hinglish: "Cache matlab pehle se rakhi hui copy, taaki dobara door se laane ki zaroorat na pade.",
    analogy: "Fridge me pehle se bana khana — dobara pakane ki zaroorat nahi.",
    example: "Cache-Control: max-age=3600",
  },
  {
    id: "cookie-token",
    term: "Cookie vs token",
    topic: "web",
    level: "intermediate",
    english: "A cookie is storage the browser sends automatically with matching requests; a token is a credential your code attaches deliberately, usually in an Authorization header.",
    hinglish: "Cookie browser khud bhej deta hai, token aapko khud header me lagana padta hai.",
    analogy: "Cookie = society ka sticker gaadi par, token = haath me pakda gate pass.",
    example: "Authorization: Bearer eyJhbGciOi...",
  },
  {
    id: "git-commit",
    term: "Commit",
    topic: "git",
    level: "beginner",
    english: "A permanent snapshot of the staged changes, with a message and a parent commit.",
    hinglish: "Commit matlab abhi tak ke kaam ka photo kheench ke naam ke saath save kar dena.",
    analogy: "Game me save point — yahin se wapas aa sakte ho.",
    example: "git commit -m 'fix login redirect'",
  },
  {
    id: "git-branch",
    term: "Branch",
    topic: "git",
    level: "beginner",
    english: "A movable pointer to a line of commits, letting work happen in parallel without touching main.",
    hinglish: "Branch ek alag raasta hai — main ko chhede bina apna kaam karo, baad me mila do.",
    analogy: "Highway se nikli service road — aage jaake wapas mil jaati hai.",
    example: "git switch -c feature/login",
  },
  {
    id: "merge-conflict",
    term: "Merge conflict",
    topic: "git",
    level: "intermediate",
    english: "What Git reports when two branches changed the same lines and it cannot decide which version wins.",
    hinglish: "Do logon ne ek hi line badli — ab Git khud faisla nahi karega, aapko chunna padega.",
    analogy: "Ek hi copy me do students ne alag answer likh diya — teacher aapse poochh raha hai kaunsa sahi hai.",
    example: "<<<<<<< HEAD ... ======= ... >>>>>>> feature",
  },
  {
    id: "pull-request",
    term: "Pull request",
    topic: "git",
    level: "beginner",
    english: "A request to merge one branch into another, opened so teammates can review the diff before it lands.",
    hinglish: "Pull request matlab 'mera kaam dekh lo, theek ho to main me daal do' wali parchi.",
    analogy: "Homework check karwana teacher se, phir hi final copy me chadhta hai.",
    example: "gh pr create --base main --head feature/login",
  },
  {
    id: "index-db",
    term: "Database index",
    topic: "backend",
    level: "intermediate",
    english: "An extra sorted structure on a column that lets the database find rows without scanning the whole table.",
    hinglish: "Index ek alag se bani suchi hai jisse database seedha row tak pahunch jaata hai, poori table padhe bina.",
    analogy: "Kitaab ke peeche ka index — page number seedha mil jaata hai.",
    example: "CREATE INDEX idx_users_email ON users(email);",
  },
  {
    id: "transaction",
    term: "Transaction (ACID)",
    topic: "backend",
    level: "advanced",
    english: "A group of database operations that either all commit or all roll back, keeping the data consistent.",
    hinglish: "Ya to saare steps hote hain, ya ek bhi nahi — beech me adhoora kaam nahi chhodta.",
    analogy: "Paisa ek account se katega tabhi jab doosre me jama ho — warna dono cancel.",
    example: "BEGIN; UPDATE a...; UPDATE b...; COMMIT;",
  },
  {
    id: "env-var",
    term: "Environment variable",
    topic: "backend",
    level: "beginner",
    english: "A configuration value supplied by the runtime environment, kept out of the source code so secrets and settings can differ per deployment.",
    hinglish: "Setting aur secret code me nahi likhte — bahar se environment se aate hain, har server par alag.",
    analogy: "Same TV, alag-alag ghar ka remote setting.",
    example: "process.env.DATABASE_URL",
  },
  {
    id: "idempotent",
    term: "Idempotent",
    topic: "backend",
    level: "advanced",
    english: "An operation that gives the same end state whether it runs once or many times, which is why retries are safe.",
    hinglish: "Ek baar chalao ya das baar, result wahi rahega — isliye dobara try karna safe hai.",
    analogy: "Lift ka button dus baar dabao, lift ek hi baar aayegi.",
    example: "PUT /users/42 { name: 'Aisha' }",
  },
  {
    id: "race-condition",
    term: "Race condition",
    topic: "backend",
    level: "advanced",
    english: "A bug where the result depends on the unpredictable order in which concurrent operations finish.",
    hinglish: "Do kaam ek saath chal rahe hain aur kaun pehle khatam hoga yeh pakka nahi — isi wajah se result badalta rehta hai.",
    analogy: "Do log ek hi seat par ek saath baithne ki koshish — kabhi koi, kabhi koi.",
    example: "// read balance, then write balance, twice at once",
  },
];

const normalise = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

/**
 * Filter the dictionary.
 * @param {{ query?: string, topic?: string, level?: string }} params
 * @returns {{ error: string }|{ results: object[], total: number, matched: number }}
 */
export function searchDictionary({ query = "", topic = "all", level = "all" } = {}) {
  if (topic !== "all" && !TOPICS[topic]) {
    return { error: "Pick a topic from the list." };
  }
  if (level !== "all" && !LEVELS[level]) {
    return { error: "Pick a level from the list." };
  }

  const needle = normalise(query);
  const results = DICTIONARY.filter((entry) => {
    if (topic !== "all" && entry.topic !== topic) return false;
    if (level !== "all" && entry.level !== level) return false;
    if (needle === "") return true;
    return (
      normalise(entry.term).includes(needle) ||
      normalise(entry.english).includes(needle) ||
      normalise(entry.hinglish).includes(needle) ||
      normalise(entry.analogy).includes(needle) ||
      normalise(entry.example).includes(needle)
    );
  });

  return { results, total: DICTIONARY.length, matched: results.length };
}

/** Look one entry up by its id. */
export function getEntry(id) {
  const entry = DICTIONARY.find((item) => item.id === id);
  if (!entry) return { error: `No dictionary entry with the id "${id}".` };
  return { entry };
}

/** Count entries per topic, for the filter chips. */
export function topicCounts() {
  const counts = { all: DICTIONARY.length };
  for (const key of Object.keys(TOPICS)) {
    if (key === "all") continue;
    counts[key] = DICTIONARY.filter((entry) => entry.topic === key).length;
  }
  return counts;
}

/**
 * Build a deterministic multiple-choice question from the dictionary.
 * Distractors are picked by walking the list in strides of 7 so they are not the
 * answer's immediate neighbours; a second pass in strides of 1 fills the gaps
 * when the pool length is a multiple of 7 and the first pass repeats itself.
 * Both passes are bounded by the pool length, so this always terminates.
 */
const DISTRACTOR_STEP = 7;
export const QUIZ_OPTION_COUNT = 4;

export function buildQuizQuestion(seed, pool = DICTIONARY) {
  if (!Array.isArray(pool) || pool.length < QUIZ_OPTION_COUNT) {
    return {
      error: `Need at least ${QUIZ_OPTION_COUNT} entries to make a question — widen the filters.`,
    };
  }
  const index = Number(seed);
  if (!Number.isFinite(index) || index < 0) {
    return { error: "Question number must be zero or more." };
  }

  const answerIndex = Math.floor(index) % pool.length;
  const answer = pool[answerIndex];
  const options = [answer];
  for (const stride of [DISTRACTOR_STEP, 1]) {
    for (let k = 1; k < pool.length && options.length < QUIZ_OPTION_COUNT; k += 1) {
      const candidate = pool[(answerIndex + k * stride) % pool.length];
      if (!options.includes(candidate)) options.push(candidate);
    }
  }

  // Deterministic placement of the correct answer so it is not always first.
  const correctSlot = Math.floor(index) % QUIZ_OPTION_COUNT;
  const ordered = options.slice(1);
  ordered.splice(correctSlot, 0, answer);

  return {
    prompt: answer.hinglish,
    options: ordered.map((item) => ({ id: item.id, term: item.term })),
    answerId: answer.id,
    english: answer.english,
    analogy: answer.analogy,
  };
}
