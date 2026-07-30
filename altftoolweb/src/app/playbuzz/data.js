

const normalizeQuestions = (quiz) => {
  if (Array.isArray(quiz.questions) && quiz.questions.length) return quiz.questions;
  if (Array.isArray(quiz.q) && quiz.q.length) {
    return quiz.q.map((entry, idx) => {
      const [text, options, correctIndex] = entry;
      return { id: idx + 1, text, options, correctIndex };
    });
  }

};

const normalizeQuiz = (quiz) => {
  const cardImage = quiz.cardImage || quiz.img || quiz.image;
  const heroImage = quiz.heroImage || quiz.cardImage || quiz.img || quiz.image;
  const category = (quiz.category || quiz.cat || 'TRIVIA').toString().toUpperCase();

  return {
    ...quiz,
    title: quiz.title,
    author: quiz.author || quiz.creator || 'Unknown',
    cardImage,
    heroImage,
    category,
    trending: Boolean(quiz.trending),
    questions: normalizeQuestions(quiz)
  };
};

const rawQuizzesData = [
  {
    id: 1, title: "Only 1 in 100 People Can Ace This General Knowledge Quiz", cardImage: '/playbuzz-assets/newsection_4.jpeg', heroImage: '/playbuzz-assets/newsection_4.jpeg', cat: "lifestyle", trending: false, questions: [
      { id: 1, text: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe", "Go"], correctIndex: 0 },
      { id: 2, text: 'How many sides does a hexagon have?', options: ["5", "7", "8", "6"], correctIndex: 3 },
      { id: 3, text: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 },
      { id: 4, text: "Who painted the Mona Lisa?", options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], correctIndex: 1 }
    ]
  },
  {
    id: 2,
    title: "How Well Do You Know World History?",
    cat: "personality",
    cardImage: '/playbuzz-assets/newsection_3.jpg',
    heroImage: '/playbuzz-assets/newsection_3.jpg',
    trending: true,
    questions: [
      { id: 1, text: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctIndex: 2 },
      { id: 2, text: "Who was the first Emperor of Rome?", options: ["Julius Caesar", "Nero", "Augustus", "Caligula"], correctIndex: 2 },
      { id: 3, text: "The ancient city of Carthage was located in which modern country?", options: ["Libya", "Algeria", "Morocco", "Tunisia"], correctIndex: 3 },
      { id: 4, text: "Which civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], correctIndex: 2 },
      { id: 5, text: "Who wrote the declaration that abolished slavery in the US?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "Andrew Jackson"], correctIndex: 1 }
    ]

  }, {
    id: 3,
    title: "Can You Pass This Science Trivia Challenge?",
    cat: "trivia",
    img: "/playbuzz-assets/4.jpg",
    trending: true,
    q: [["What is the powerhouse of the cell?", ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], 2], ["What is the speed of light in a vacuum (approx.)?", ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], 0], ["Which element has the atomic number 1?", ["Helium", "Lithium", "Oxygen", "Hydrogen"], 3], ["What force keeps planets in orbit around the Sun?", ["Magnetism", "Gravity", "Friction", "Electrostatic force"], 1], ["DNA stands for what?", ["Dynamic Nucleic Acid", "Deoxyribonucleic Acid", "Diatomic Nitrogen Alloy", "Dextrose Nucleic Alignment"], 1]],
    r: [[0, 2, "Amateur Scientist", "Science isn't your strongest subject yet, but every expert started somewhere!"], [3, 4, "Lab Assistant", "You've got a solid science foundation — just a few concepts to sharpen up."], [5, 5, "Science Whiz", "Perfect score! You clearly paid attention in science class — brilliant work."]]
  }, {
    id: 4,
    title: "Think You Know Your World Capitals? Prove It!",
    cat: "trivia",
    trending: true,
    img: "/playbuzz-assets/5.jpg",
    q: [["What is the capital of Japan?", ["Osaka", "Kyoto", "Hiroshima", "Tokyo"], 3], ["Which city is the capital of Canada?", ["Toronto", "Vancouver", "Ottawa", "Montreal"], 2], ["What is the capital of Brazil?", ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"], 2], ["Which city serves as the capital of South Africa's government?", ["Cape Town", "Johannesburg", "Durban", "Pretoria"], 3], ["What is the capital of New Zealand?", ["Auckland", "Wellington", "Christchurch", "Dunedin"], 1]],
    r: [[0, 2, "Lost Traveler", "You might need a map! World capitals are tricky but keep exploring."], [3, 4, "Seasoned Explorer", "Great effort! You know your way around the globe with just a few detours."], [5, 5, "World Navigator", "Flawless! You could navigate the globe blindfolded — a true geography master."]]
  }, {
    id: 5,
    title: "Only True Bookworms Can Score 5/5 on This Literature Quiz",
    cat: "trivia",
    img: "/playbuzz-assets/6.jpg",
    q: [["Who wrote '1984'?", ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"], 1], ["In which Shakespeare play does the character Ophelia appear?", ["Macbeth", "Othello", "King Lear", "Hamlet"], 3], ["What is the first book of the Bible?", ["Exodus", "Leviticus", "Genesis", "Numbers"], 2], ["Who wrote 'Pride and Prejudice'?", ["Charlotte Brontë", "Mary Shelley", "Jane Austen", "Virginia Woolf"], 2], ["Herman Melville's 'Moby-Dick' features a captain named what?", ["Nemo", "Hook", "Ahab", "Flint"], 2]],
    r: [[0, 2, "Casual Reader", "You prefer TV to books — no shame! But there are amazing stories waiting for you."], [3, 4, "Bookworm in Training", "You've done some solid reading! A few classics still await your attention."], [5, 5, "Literary Legend", "Incredible! You have the literary knowledge of a college professor — well read indeed."]]
  }, {
    id: 6,
    title: "How Much Do You Actually Know About Space?",
    cat: "trivia",
    img: "/playbuzz-assets/7.jpg",
    q: [["Which planet has the most moons in our solar system?", ["Jupiter", "Uranus", "Neptune", "Saturn"], 3], ["What is the name of the galaxy we live in?", ["Andromeda", "Milky Way", "Triangulum", "Whirlpool"], 1], ["How long does it take light from the Sun to reach Earth?", ["8 seconds", "8 minutes", "8 hours", "8 days"], 1], ["Which space telescope was launched in 1990?", ["James Webb", "Chandra", "Spitzer", "Hubble"], 3], ["What is a light-year a measure of?", ["Time", "Speed", "Distance", "Brightness"], 2]],
    r: [[0, 2, "Earthbound", "You're still tethered to the ground — time to look up and explore the cosmos!"], [3, 4, "Stargazer", "You know your way around the night sky pretty well — keep reaching for the stars."], [5, 5, "Cosmic Expert", "Out of this world! Your knowledge of space is truly astronomical."]]
  }, {
    id: 7,
    title: "Can You Identify These Famous Landmarks?",
    cat: "trivia",
    img: "/playbuzz-assets/8.jpg",
    q: [["In which country is the Taj Mahal located?", ["Pakistan", "Bangladesh", "Nepal", "India"], 3], ["The Colosseum is located in which city?", ["Athens", "Rome", "Paris", "Istanbul"], 1], ["Which country is home to Machu Picchu?", ["Colombia", "Bolivia", "Peru", "Ecuador"], 2], ["Where is the Statue of Liberty located?", ["Boston", "Washington D.C.", "Philadelphia", "New York City"], 3], ["In which country would you find Angkor Wat?", ["Thailand", "Vietnam", "Cambodia", "Laos"], 2]],
    r: [[0, 2, "Armchair Tourist", "You haven't wandered far yet! There are incredible landmarks just waiting to be discovered."], [3, 4, "Well-Traveled", "You've clearly been around — just a couple of destinations you've yet to visit."], [5, 5, "World Wanderer", "Passport full and mind sharp! You know your landmarks inside and out."]]
  }, {
    id: 8,
    title: "Are You Smarter Than a 5th Grader? Take This Quiz!",
    cat: "trivia",
    img: "/playbuzz-assets/9.jpg",
    q: [["How many continents are there on Earth?", ["5", "6", "7", "8"], 2], ["What is the largest ocean on Earth?", ["Atlantic", "Indian", "Arctic", "Pacific"], 3], ["Which animal is the largest land mammal?", ["Hippopotamus", "Giraffe", "African Elephant", "White Rhinoceros"], 2], ["How many zeros are in one million?", ["5", "6", "7", "8"], 1], ["What is the hardest natural substance on Earth?", ["Gold", "Diamond", "Iron", "Quartz"], 1]],
    r: [[0, 2, "Below Grade Level", "Even 5th graders are ahead of you here! Time to hit the books."], [3, 4, "Passing Grade", "You'd squeak by in 5th grade — not bad, but there's room to improve!"], [5, 5, "Teacher's Pet", "Perfect score! You're definitely smarter than a 5th grader — gold star for you."]]
  }, {
    id: 9,
    title: "Only a True Foodie Can Score 100% on This Cuisine Quiz",
    cat: "trivia",
    img: "/playbuzz-assets/10.jpg",
    q: [["Sushi originated in which country?", ["China", "South Korea", "Vietnam", "Japan"], 3], ["What is the main ingredient in traditional hummus?", ["Lentils", "Black beans", "Chickpeas", "Edamame"], 2], ["Which country is famous for inventing pizza?", ["France", "Spain", "Italy", "Greece"], 2], ["What spice gives turmeric its yellow color?", ["Curcumin", "Saffron", "Annatto", "Beta-carotene"], 0], ["Croissants are most associated with which country?", ["Belgium", "Switzerland", "Austria", "France"], 3]],
    r: [[0, 2, "Fast Food Fan", "Your palate hasn't explored much yet — there's a delicious world of cuisine to discover!"], [3, 4, "Home Cook", "You know your way around a kitchen and have decent culinary knowledge."], [5, 5, "Master Chef", "Extraordinary! Your food knowledge is Michelin-star level — a true culinary connoisseur."]]
  }, {
    id: 10,
    title: "This Impossible Trivia Quiz Has Stumped Millions — Can You Beat It?",
    cat: "trivia",
    img: "/playbuzz-assets/11.jpg",
    q: [["What is the longest river in the world?", ["Amazon", "Congo", "Mississippi", "Nile"], 3], ["Which element is denoted by the symbol 'K' on the periodic table?", ["Krypton", "Potassium", "Cobalt", "Calcium"], 1], ["In what year did the Berlin Wall fall?", ["1987", "1988", "1989", "1990"], 2], ["Who was the first woman to win a Nobel Prize?", ["Rosalind Franklin", "Dorothy Hodgkin", "Marie Curie", "Lise Meitner"], 2], ["What is the smallest country in the world by area?", ["Monaco", "San Marino", "Liechtenstein", "Vatican City"], 3]],
    r: [[0, 2, "Stumped Again", "This quiz has claimed another victim! Don't worry — even the smartest people struggle with this one."], [3, 4, "Almost Unbeatable", "You came so close! You're clearly sharp — just a couple of tough ones got the better of you."], [5, 5, "Trivia Legend", "Unbelievable! You've beaten the quiz that stumped millions — you are a certified trivia legend."]]
  }, {
    id: 11,
    title: "What Does Your Coffee Order Say About You?",
    cat: "personality",
    img: "/playbuzz-assets/12.jpg",
    trending: true,
    q: [["Which would you rather have on a slow morning?", ["A quiet coffee alone", "Coffee with a close friend", "Coffee in a busy café", "Coffee to-go on the run"], 0], ["Which describes you best when facing a challenge?", ["I stay calm and think it through", "I ask others for input", "I dive in headfirst", "I make a list and plan"], 0], ["Which would you rather do on a weekend?", ["Read a book at home", "Explore a new neighborhood", "Host a dinner party", "Go hiking outdoors"], 0], ["Which describes your work style best?", ["Methodical and precise", "Collaborative and open", "Bold and spontaneous", "Efficient and goal-oriented"], 0], ["Which would you rather have as a daily ritual?", ["A quiet journaling session", "A morning walk with music", "A long catch-up call with a friend", "A brisk gym workout"], 0]],
    r: [[0, 2, "The Slow Sipper", "You savor the moment and find joy in stillness. Comfort and consistency are your love languages."], [3, 4, "The Social Blend", "You thrive in the company of others and bring warmth wherever you go."], [5, 5, "The Espresso Shot", "Bold, fast, and full of energy — you live life at full speed and love every second."]]
  }, {
    id: 12,
    title: "Which Disney Princess Are You?",
    cat: "personality",
    img: "/playbuzz-assets/13.jpg",
    q: [["Which would you rather do when you feel stuck?", ["Dream about what could be", "Talk it out with someone I trust", "Fight for what I believe in", "Find a creative workaround"], 0], ["Which describes you best in a group?", ["The quiet dreamer", "The loyal supporter", "The brave leader", "The clever problem-solver"], 0], ["Which would you rather explore?", ["A faraway magical kingdom", "A cozy enchanted forest", "An ancient hidden temple", "A mysterious underwater world"], 0], ["Which describes your biggest strength?", ["My imagination and hope", "My kindness and empathy", "My courage and determination", "My wit and resourcefulness"], 0], ["Which would you rather have as a companion?", ["A wise and gentle mentor", "A funny loyal sidekick", "A fierce and protective ally", "A quirky magical creature"], 0]],
    r: [[0, 2, "The Dreamer", "Like Cinderella or Aurora, you hold onto hope and believe in the magic of possibility."], [3, 4, "The Nurturer", "Like Snow White or Rapunzel, your heart is pure and your compassion lights up every room."], [5, 5, "The Warrior", "Like Mulan or Merida, you blaze your own trail and never back down from a challenge."]]
  }, {
    id: 13,
    title: "What Type of Friend Are You?",
    cat: "personality",
    img: "/playbuzz-assets/14.jpg",
    q: [["Which would you rather do for a struggling friend?", ["Listen without judgment", "Offer practical advice", "Cheer them up with humor", "Show up with food and a hug"], 0], ["Which describes how you handle group plans?", ["I go with whatever the group decides", "I organize everything carefully", "I suggest the most fun option", "I make sure everyone feels included"], 0], ["Which would you rather be remembered as?", ["The dependable one", "The funny one", "The wise one", "The caring one"], 0], ["Which describes your texting style?", ["I reply when I can — life gets busy", "I send long thoughtful messages", "I use memes and voice notes", "I always check in first"], 0], ["Which would you rather do on a friend's birthday?", ["Write them a heartfelt note", "Plan a surprise party", "Roast them lovingly", "Cook their favorite meal"], 0]],
    r: [[0, 2, "The Chill Companion", "Easygoing and stress-free, you're the friend who brings calm to every situation."], [3, 4, "The Ride or Die", "Fiercely loyal and always there, you're the one people call when things get real."], [5, 5, "The Social Glue", "You hold the whole friend group together with your warmth, humor, and endless energy."]]
  }, {
    id: 14,
    title: "What Does Your Playlist Reveal About You?",
    cat: "personality",
    img: "/playbuzz-assets/15.jpg",
    q: [["Which would you rather listen to on a road trip?", ["Indie folk acoustic vibes", "Upbeat pop anthems", "Moody alternative rock", "High-energy hip hop"], 0], ["Which describes how music makes you feel?", ["It takes me somewhere else", "It gives me energy", "It helps me process emotions", "It makes me want to move"], 0], ["Which would you rather do at a concert?", ["Stand back and absorb the atmosphere", "Sing along to every word", "Close my eyes and feel the music", "Dance and jump in the crowd"], 0], ["Which describes your go-to playlist mood?", ["Cozy and introspective", "Feel-good and bright", "Deep and emotional", "Hype and unstoppable"], 0], ["Which would you rather have as background music while working?", ["Soft lo-fi beats", "Light acoustic guitar", "Cinematic instrumentals", "Fast-paced electronic music"], 0]],
    r: [[0, 2, "The Introspective Soul", "Your music is your inner world — rich, layered, and deeply personal."], [3, 4, "The Mood Shifter", "You curate the perfect soundtrack for every moment, reading the room like a DJ."], [5, 5, "The Energy Generator", "Your playlist is pure fuel — infectious, bold, and impossible not to move to."]]
  }, {
    id: 15,
    title: "Are You More Introvert or Extrovert?",
    cat: "personality",
    img: "/playbuzz-assets/16.jpg",
    q: [["Which would you rather do after a long week?", ["Stay home with a movie and snacks", "Go out and see people", "Have one close friend over", "Attend a big social event"], 0], ["Which describes how you recharge?", ["Alone time and quiet", "Being around people I love", "A mix of both depending on my mood", "Keeping myself constantly busy"], 0], ["Which would you rather do at a party?", ["Find a quiet corner and observe", "Work the whole room", "Stick with a few close people", "Be the center of attention"], 0], ["Which describes your ideal Saturday?", ["A solo creative project at home", "Brunch and plans with a big group", "A low-key hangout with one friend", "A packed day of back-to-back activities"], 0], ["Which would you rather have more of?", ["Alone time to think and reset", "Social events and new connections", "Deep one-on-one conversations", "Spontaneous group adventures"], 0]],
    r: [[0, 2, "The Introvert", "You draw strength from solitude and depth. Your inner world is rich and beautifully complex."], [3, 4, "The Ambivert", "You move fluidly between social and solo — adaptable, balanced, and hard to pin down."], [5, 5, "The Extrovert", "People are your fuel. You come alive in a crowd and leave every room a little brighter."]]
  }, {
    id: 16,
    title: "Which Decade Were You Actually Born For?",
    cat: "personality",
    img: "/playbuzz-assets/17.jpg",
    q: [["Which would you rather spend a night doing?", ["Watching classic black-and-white films", "Dancing at a disco", "Watching MTV and eating cereal", "Scrolling through viral videos"], 0], ["Which describes your fashion sense best?", ["Timeless and elegant", "Bold and groovy", "Casual and nostalgic", "Eclectic and trend-forward"], 0], ["Which would you rather listen to for a full day?", ["Frank Sinatra and jazz standards", "ABBA and Donna Summer", "Nirvana and TLC", "Beyoncé and Arctic Monkeys"], 0], ["Which describes your ideal social vibe?", ["Sophisticated dinner parties", "Wild dance floors", "Laid-back house parties", "Spontaneous internet-fueled meetups"], 0], ["Which would you rather drive?", ["A sleek vintage convertible", "A funky painted van", "A boxy retro hatchback", "A modern minimalist electric car"], 0]],
    r: [[0, 2, "The Classic Soul", "You belong in the golden age — glamorous, timeless, and effortlessly sophisticated."], [3, 4, "The Retro Rebel", "Groovy and bold, you were made for an era when self-expression was an art form."], [5, 5, "The Modern Native", "You're exactly where you should be — wired for now, fluent in culture, and always evolving."]]
  }, {
    id: 17,
    title: "What Kind of Traveler Are You?",
    cat: "personality",
    img: "/playbuzz-assets/18.jpg",
    q: [["Which would you rather do on the first day of a trip?", ["Wander aimlessly and see what happens", "Hit every major landmark on my list", "Find a local café and just sit", "Book a guided tour and learn everything"], 0], ["Which describes your packing style?", ["I throw in whatever fits", "I pack with a color-coded spreadsheet", "I pack light and buy what I need", "I over-pack every single time"], 0], ["Which would you rather eat abroad?", ["Whatever the street vendors are selling", "A renowned restaurant with reservations", "Whatever the locals eat at home", "A familiar comfort food from home"], 0], ["Which describes your travel companion preference?", ["Solo — total freedom", "With my best friend", "With a large group of friends", "With my partner"], 0], ["Which would you rather bring home from a trip?", ["A wild story no one believes", "A photo album full of memories", "A new perspective on life", "A suitcase full of souvenirs"], 0]],
    r: [[0, 2, "The Free Spirit", "Unplanned and unbothered, you let the world surprise you and that's exactly how you like it."], [3, 4, "The Cultured Explorer", "You travel with intention — soaking up history, food, and local life wherever you go."], [5, 5, "The Planner", "Your itineraries are works of art and you never miss a must-see. Maximizing every minute is your superpower."]]
  }, {
    id: 18,
    title: "What Does Your Bookshelf Say About You?",
    cat: "personality",
    img: "/playbuzz-assets/19.jpg",
    q: [["Which would you rather read on a rainy afternoon?", ["A sweeping fantasy epic", "A gripping psychological thriller", "A cozy romance novel", "A thought-provoking memoir"], 0], ["Which describes how you choose your next book?", ["A friend's passionate recommendation", "The cover and first paragraph alone", "Whatever is trending right now", "A carefully researched list I've built"], 0], ["Which would you rather do with a book you loved?", ["Reread it every few years", "Lend it to everyone I know", "Write notes in the margins", "Keep it pristine on my shelf"], 0], ["Which describes your reading environment?", ["Curled up in bed with tea", "At a café with background noise", "On public transit between stops", "In complete silence at a desk"], 0], ["Which would you rather your bookshelf say about you?", ["That I have eclectic and surprising taste", "That I devour books faster than most", "That I choose depth over quantity", "That I keep every book I've ever loved"], 0]],
    r: [[0, 2, "The Escapist", "Books are your portal to other worlds. You read to disappear and come back changed."], [3, 4, "The Curious Mind", "You read to understand — people, history, ideas, and the beautiful mess of being human."], [5, 5, "The Devoted Reader", "Books are sacred to you. Your shelves are a autobiography and you wouldn't have it any other way."]]
  }, {
    id: 19,
    title: "Which Element Are You — Fire, Water, Earth, or Air?",
    cat: "personality",
    img: "/playbuzz-assets/20.jpg",
    q: [["Which would you rather do when you're angry?", ["Let it out immediately — I can't hold back", "Retreat and process it alone", "Stay steady and address it calmly", "Talk it through with someone rational"], 0], ["Which describes your decision-making style?", ["I go with my gut — instantly", "I feel it out emotionally", "I weigh every option carefully", "I think it through logically"], 0], ["Which would you rather be doing on a perfect day?", ["Skydiving or something thrilling", "Swimming or relaxing near water", "Hiking or working in a garden", "Traveling or discovering something new"], 0], ["Which describes your energy in a group?", ["The spark that ignites excitement", "The depth that holds everything together", "The ground that everyone stands on", "The breeze that keeps things light"], 0], ["Which would you rather your friends say about you?", ["That you're passionate and fearless", "That you're empathetic and intuitive", "That you're reliable and grounded", "That you're clever and free-thinking"], 0]],
    r: [[0, 2, "The Earth Sign", "Steady, grounded, and deeply dependable — you are the foundation that others build their lives upon."], [3, 4, "The Water Sign", "Intuitive, emotional, and flowing — you feel everything deeply and move through life with quiet power."], [5, 5, "The Fire Sign", "Bold, passionate, and unstoppable — you burn bright and inspire everyone lucky enough to be near you."]]
  }, {
    id: 20,
    title: "What Kind of Energy Do You Bring to a Room?",
    cat: "personality",
    img: "/playbuzz-assets/21.jpg",
    q: [["Which would you rather do when you walk into a party?", ["Scope it out quietly before engaging", "Immediately find someone I know", "Introduce myself to someone new", "Make everyone laugh within five minutes"], 0], ["Which describes the feedback you get most?", ["People say I'm calming to be around", "People say I make them feel heard", "People say I make everything fun", "People say I inspire them"], 0], ["Which would you rather your presence feel like to others?", ["A warm fireplace on a cold night", "A deep conversation over coffee", "A burst of sunshine on a cloudy day", "A motivating push when they need it"], 0], ["Which describes how you handle conflict in a group?", ["I de-escalate quietly and keep peace", "I listen to all sides with empathy", "I lighten the mood to ease tension", "I address it directly and move forward"], 0], ["Which would you rather leave people feeling after they've spent time with you?", ["Calm and at ease", "Understood and valued", "Happy and entertained", "Motivated and inspired"], 0]],
    r: [[0, 2, "The Calm Presence", "You walk in and the room breathes easier. Your quiet steadiness is a rare and treasured gift."], [3, 4, "The Warm Heart", "You make everyone feel seen. Your empathy and sincerity create connection wherever you go."], [5, 5, "The Radiator", "You light up every room you enter. Your energy is contagious, your joy is generous, and people orbit you naturally."]]
  }, {
    id: 21,
    title: "What Does Your Love Style Say About You?",
    cat: "love",
    img: "/playbuzz-assets/22.jpg",
    q: [["What's your ideal first date?", ["A quiet dinner for two", "An adventurous outdoor activity", "A cozy movie night at home", "A walk through an art gallery"], 0], ["How do you show someone you care?", ["Cook them their favorite meal", "Write them a heartfelt letter", "Surprise them with little gifts", "Plan a spontaneous getaway"], 0], ["What song plays in your romantic daydream?", ["A slow, soulful ballad", "An upbeat love anthem", "A soft acoustic melody", "A classic jazz tune"], 0], ["When you're in love, you tend to…", ["Think about them constantly", "Plan your future together", "Drop everything to be with them", "Express it through creative gestures"], 0], ["Your perfect Valentine's Day involves…", ["A candlelit dinner at home", "An exciting surprise trip", "A handwritten love note", "Dancing under the stars"], 0]],
    r: [[0, 2, "The Gentle Dreamer", "You love softly and steadily, cherishing quiet moments and deep emotional bonds."], [3, 4, "The Balanced Lover", "You blend romance with practicality, creating relationships that are both passionate and grounded."], [5, 5, "The Hopeless Romantic", "Love is your greatest adventure — you give your whole heart and inspire those around you."]]
  }, {
    id: 22,
    title: "Which Romantic Movie Couple Are You?",
    cat: "love",
    img: "/playbuzz-assets/23.jpg",
    q: [["When you first met your partner, it felt like…", ["Love at first sight", "A slow burn you didn't expect", "An instant deep connection", "A fun, playful friendship first"], 0], ["How do you handle a big argument?", ["Talk it out calmly and honestly", "Give each other space, then reconnect", "Fight passionately but forgive quickly", "Use humor to diffuse the tension"], 0], ["Your love story would best be described as…", ["An epic, sweeping romance", "A quirky indie film", "A classic fairy tale", "A gripping drama with a happy ending"], 0], ["What's your go-to romantic gesture?", ["A grand public declaration of love", "A private, deeply personal moment", "A thoughtful surprise", "A simple, sincere 'I love you'"], 0], ["Where would your love story's final scene be set?", ["At the airport just in time", "On a rain-soaked street", "In your cozy shared apartment", "Under a sky full of fireworks"], 0]],
    r: [[0, 2, "The Quiet Love", "Like Allie and Noah in quieter moments, your love is tender, patient, and deeply sincere."], [3, 4, "The Witty Partner", "You and your love have the banter of a rom-com duo — sharp, fun, and undeniably magnetic."], [5, 5, "The Epic Romance", "Your love story is cinematic — bold, passionate, and the kind people write movies about."]]
  }, {
    id: 23,
    title: "How Many People Have Secretly Loved You?",
    cat: "love",
    img: "/playbuzz-assets/24.jpg",
    q: [["Friends often describe you as…", ["Warm and easy to talk to", "Mysterious and intriguing", "Funny and always fun to be around", "Caring and deeply empathetic"], 0], ["When someone has a crush on you, you usually…", ["Notice the little signs right away", "Have no idea until someone tells you", "Suspect it but wait for them to act", "Enjoy the attention without assuming"], 0], ["People are drawn to you because of your…", ["Genuine kindness and warmth", "Confident, magnetic energy", "Great sense of humor", "Deep emotional intelligence"], 0], ["How often do you catch someone staring at you?", ["Quite often, actually", "Sometimes, but I brush it off", "Rarely — or maybe I don't notice", "More than I'd care to admit"], 0], ["After a breakup, your ex tends to…", ["Reach out months later", "Move on quietly but watch from afar", "Stay close as a 'friend'", "Tell mutual friends they miss you"], 0]],
    r: [[0, 2, "A Hidden Gem", "A handful of hearts have quietly adored you — the ones who appreciated your rare, understated charm."], [3, 4, "Quietly Irresistible", "More people than you think have harbored secret feelings for you — your warmth is magnetic."], [5, 5, "The One Everyone Wants", "You've left a trail of secret admirers wherever you go — your energy is simply unforgettable."]]
  }, {
    id: 24,
    title: "What Kind of Lover Are You Deep Down?",
    cat: "love",
    img: "/playbuzz-assets/25.jpg",
    q: [["When you love someone, your biggest fear is…", ["Losing them unexpectedly", "Not being enough for them", "Growing apart over time", "Loving more than you're loved back"], 0], ["On a lazy Sunday with your partner, you prefer…", ["Staying in bed and talking for hours", "Exploring somewhere new together", "Cooking a big brunch together", "Watching something you both love"], 0], ["You feel most loved when your partner…", ["Holds your hand in public", "Remembers the small things you said", "Sends a sweet message out of nowhere", "Makes time for you no matter what"], 0], ["Your love language is closest to…", ["Words of affirmation", "Quality time", "Physical touch", "Acts of service"], 0], ["When your partner is sad, you…", ["Hold them close without saying much", "Listen to every word they have to say", "Try to make them laugh again", "Go out of your way to fix the problem"], 0]],
    r: [[0, 2, "The Tender Nurturer", "You love with deep care and quiet devotion, always putting your partner's heart first."], [3, 4, "The Steady Companion", "You're the dependable, thoughtful partner everyone hopes to find — present, loving, and true."], [5, 5, "The Passionate Soul", "Your love burns bright and fierce — you feel everything deeply and love without reservation."]]
  }, {
    id: 25,
    title: "Which Love Language Is Truly Yours?",
    cat: "love",
    img: "/playbuzz-assets/26.jpg",
    q: [["A perfect evening with your partner looks like…", ["Deep conversation over candles", "An activity you've planned together", "Cuddling on the couch all night", "Them doing something thoughtful for you"], 0], ["You feel disconnected from your partner when they…", ["Stop saying sweet things to you", "Are always too busy to spend time", "Become distant and untouchy", "Stop putting in effort for you"], 0], ["Your ideal 'I love you' is expressed through…", ["A heartfelt note left on your pillow", "A whole day planned just for you", "A long, warm embrace", "Something they did without being asked"], 0], ["After a hard day, you most want your partner to…", ["Tell you they're proud of you", "Drop everything and be with you", "Give you a long hug", "Handle something stressful for you"], 0], ["A small romantic gesture that melts your heart is…", ["A sweet text just because", "Showing up to surprise you", "Reaching for your hand first", "Tidying up because they knew you were tired"], 0]],
    r: [[0, 2, "Words Are Your World", "Affirmation and verbal love fuel your heart — the right words from the right person mean everything."], [3, 4, "Time and Touch", "You crave closeness — whether it's quality moments together or the comfort of physical presence."], [5, 5, "Love in Action", "For you, love is a verb — thoughtful acts and effort speak louder than any words ever could."]]
  }, {
    id: 26,
    title: "Are You Ready for the Love of Your Life?",
    cat: "love",
    img: "/playbuzz-assets/27.jpg",
    trending: true,
    q: [["When you think about a serious relationship, you feel…", ["Excited and genuinely ready", "Hopeful but a little nervous", "Curious about what it would look like", "Open to it if the right person appears"], 0], ["How much space does love currently take up in your mind?", ["It's front and center lately", "I think about it more than I admit", "It's somewhere in the background", "Only when prompted, like right now"], 0], ["Your last relationship taught you…", ["Exactly what you need in a partner", "How to love yourself better first", "That timing matters more than people say", "That vulnerability is worth the risk"], 0], ["When you imagine your future, your partner is…", ["Already in the picture, clearly", "A fuzzy but hopeful shape", "Someone I haven't met yet", "Whoever is meant to find me"], 0], ["Your heart right now feels…", ["Open and ready to receive love", "Healing but hopeful", "Cautious but curious", "Full of love and ready to share it"], 0]],
    r: [[0, 2, "Still Becoming", "Your heart is on its own beautiful journey — the love of your life is worth every step of growth."], [3, 4, "Almost Ready", "You're closer than you think. A few more chapters of self-discovery and you'll be wide open."], [5, 5, "The Door Is Open", "You are fully, radiantly ready — the love of your life would be lucky to walk through that door."]]
  }, {
    id: 27,
    title: "What Does Your Ideal Relationship Actually Look Like?",
    cat: "love",
    img: "/playbuzz-assets/28.jpg",
    q: [["Your ideal partner challenges you by…", ["Encouraging you to grow and dream bigger", "Having honest, sometimes tough conversations", "Pushing you outside your comfort zone", "Inspiring you through their own ambition"], 0], ["In your relationship, alone time is…", ["Respected and healthy for both of us", "Something I need more than most", "A balance we figure out together", "Less important than shared experiences"], 0], ["The most important thing in a relationship is…", ["Trust above everything else", "Deep emotional intimacy", "Laughter and genuine fun", "Shared values and life direction"], 0], ["Your dream home life with a partner includes…", ["A cozy space full of warmth and routines", "Adventures big and small, always together", "Creative projects and passionate conversations", "Quiet Sunday mornings and simple joys"], 0], ["When your relationship hits a rough patch, you…", ["Face it head-on as a team", "Reflect privately before talking", "Lean into honesty even when it's hard", "Give it time and trust the foundation"], 0]],
    r: [[0, 2, "The Sanctuary Seeker", "You dream of a relationship that feels like home — safe, warm, and built on unshakeable trust."], [3, 4, "The Growth Partner", "You want a love that evolves with you — a partnership that makes both of you better people."], [5, 5, "The Grand Adventure", "Your ideal relationship is electric — full of passion, depth, spontaneity, and endless discovery."]]
  }, {
    id: 28,
    title: "How Romantic Are You, Really?",
    cat: "love",
    img: "/playbuzz-assets/29.jpg",
    q: [["When you hear a love song, you…", ["Think of someone specific immediately", "Feel genuinely moved by the lyrics", "Hum along and enjoy the melody", "Connect it to a memory or moment"], 0], ["You believe true love is…", ["Worth every risk and sacrifice", "Built slowly through trust and time", "A beautiful mix of choice and feeling", "Something rare and deeply precious"], 0], ["On your partner's birthday, you…", ["Plan something meaningful and personal", "Pull off a surprise they'll never forget", "Make sure the whole day feels special", "Put thought into a gift that says it all"], 0], ["When you watch a romantic sunset, you…", ["Wish you were sharing it with someone", "Feel grateful for love in your life", "Take it in quietly and feel something deep", "Immediately want to capture the moment"], 0], ["Your friends come to you for advice about love because…", ["You see the beauty in every love story", "You give honest, caring guidance", "You've experienced a lot and learned from it", "You genuinely believe in love for everyone"], 0]],
    r: [[0, 2, "The Quiet Romantic", "Romance lives in your heart quietly but deeply — you notice beauty in love that others walk right past."], [3, 4, "The Thoughtful Sweetheart", "You express romance with intention and care, making the people you love feel truly seen."], [5, 5, "The Hopeless Romantic", "You feel love in everything — you were born to give it, chase it, and celebrate it in all its forms."]]
  }, {
    id: 29,
    title: "Which Era of Love Are You Living In?",
    cat: "love",
    img: "/playbuzz-assets/30.jpg",
    q: [["Your approach to romance is best described as…", ["Classic and deeply traditional", "Modern but sentimental at heart", "Fresh, fluid, and fully present", "Timeless — love never really changes"], 0], ["How do you feel about vulnerability in love?", ["It's the only way to truly connect", "It's terrifying but I lean into it anyway", "It gets easier the more you trust someone", "It's the bravest thing you can do"], 0], ["Your idea of a romantic evening in 2026 looks like…", ["A candlelit dinner, no phones allowed", "A curated playlist and cooking together", "A spontaneous late-night conversation", "Whatever feels natural in the moment"], 0], ["When you fall in love, it happens…", ["Slowly and deeply over time", "Fast and all at once", "In quiet, unexpected moments", "The moment I feel truly seen by them"], 0], ["Love, to you, is ultimately about…", ["Building a life with someone", "Choosing each other every single day", "Feeling fully alive with another person", "Growing together without losing yourself"], 0]],
    r: [[0, 2, "The Old Soul Lover", "Your heart beats in a timeless rhythm — you believe in the kind of love that lasts generations."], [3, 4, "The Modern Romantic", "You carry the best of tradition into the present, loving with both your head and your whole heart."], [5, 5, "The Now Generation", "You love boldly in the present tense — alive, intentional, and beautifully in the moment."]]
  }, {
    id: 30,
    title: "What Will Your Love Story Be Remembered For?",
    cat: "love",
    img: "/playbuzz-assets/31.jpg",
    q: [["The chapter of your love story people talk about most will be…", ["The way you found each other against all odds", "The loyalty you showed through the hardest times", "The joy and laughter you brought each other", "The depth of understanding between you"], 0], ["Your love story's turning point happens when…", ["You choose to stay when it would be easier to leave", "You say the thing you were most afraid to say", "You realize this person sees all of you", "You stop looking and finally just feel it"], 0], ["The theme of your love story is…", ["Devotion that never wavers", "Growth that never stops", "Joy that never fades", "A love that defies every odd"], 0], ["People watching your love story would feel…", ["Moved to tears by its tenderness", "Inspired to believe in love again", "Warmed by how natural it all looks", "Awed by how deeply you chose each other"], 0], ["Your love story ends with…", ["Two people who never stopped choosing each other", "A life that was richer for having loved so fully", "Laughter echoing all the way to the last page", "A quiet certainty that it was all worth it"], 0]],
    r: [[0, 2, "A Story of Quiet Devotion", "Your love story will be remembered for its gentle, unwavering depth — love that held steady through everything."], [3, 4, "A Story of Beautiful Growth", "Your love story will be remembered for how it made two people bloom — braver, kinder, and more alive."], [5, 5, "A Story for the Ages", "Your love story will be told and retold — bold, beautiful, and the kind that makes people believe again."]]
  }, {
    id: 31,
    title: "What City Were You Actually Born to Live In?",
    cat: "lifestyle",
    img: "/playbuzz-assets/32.jpg",
    q: [["What's your ideal weekend activity?", ["Exploring a new neighborhood", "Hiking in nature", "Attending a rooftop party", "Binge-watching shows at home"], 0], ["What climate makes you happiest?", ["Mild and sunny year-round", "Cold with snowy winters", "Hot and humid", "Warm with a cool breeze"], 0], ["Which best describes your ideal commute?", ["Walking or cycling everywhere", "Driving through scenic roads", "Packed subway with city energy", "Working from home"], 0], ["What's your go-to Friday night?", ["Trying a trendy new restaurant", "Bonfire with close friends", "Live music or a festival", "Quiet dinner and early bed"], 0], ["What matters most in where you live?", ["Walkability and culture", "Green spaces and nature", "Nightlife and energy", "Safety and quiet streets"], 0]],
    r: [[0, 2, "The Homebody", "You thrive in cozy, familiar surroundings. A quiet town or suburban haven suits your soul perfectly."], [3, 4, "The Explorer", "You love mixing comfort with discovery. A mid-sized city with culture and parks is your sweet spot."], [5, 5, "The City Dweller", "You were made for the buzz of a world-class metropolis. New York, London, or Tokyo — take your pick!"]]
  }, {
    id: 32,
    title: "Which Decade Should You Have Been Born In?",
    cat: "lifestyle",
    img: "/playbuzz-assets/33.jpg",
    creator: "James Calloway",
    trending: true,
    q: [["Pick your ideal fashion vibe:", ["Bell-bottoms and flower power", "Sharp suits and victory rolls", "Neon windbreakers and big hair", "Minimalist and modern"], 0], ["What's your favorite type of music?", ["Classic rock and folk", "Big band and jazz", "Pop and new wave", "Hip-hop and indie"], 0], ["How do you prefer to communicate?", ["Face-to-face or handwritten letters", "Phone calls only", "Answering machine and pagers", "Texts and social media"], 0], ["What's your dream car?", ["A vintage muscle car", "A sleek art deco roadster", "A flashy sports car", "An eco-friendly EV"], 0], ["What social cause speaks to you most?", ["Peace and civil rights", "Women's liberation", "Environmental awareness", "Digital privacy"], 0]],
    r: [[0, 2, "The Old Soul", "You belong in the 1940s or 50s — a time of classic elegance, community, and timeless style."], [3, 4, "The Free Spirit", "The 1960s or 70s called your name. You're all about self-expression, music, and big ideas."], [5, 5, "The Modern Icon", "You're a true child of today. You thrive with technology, global connection, and endless possibility."]]
  }, {
    id: 33,
    title: "What Does Your Morning Routine Say About You?",
    cat: "lifestyle",
    img: "/playbuzz-assets/34.jpg",
    q: [["What time does your alarm go off?", ["5–6 AM", "7 AM", "8–9 AM", "I don't use an alarm"], 0], ["What's the first thing you do after waking up?", ["Work out or meditate", "Make coffee and journal", "Check my phone", "Hit snooze at least twice"], 0], ["What does breakfast look like for you?", ["A nutritious home-cooked meal", "A quick smoothie or bar", "Coffee is breakfast", "Whatever I can grab"], 0], ["How do you feel by 9 AM?", ["Energized and focused", "Pleasantly awake", "Still warming up", "Barely functional"], 0], ["What does your morning playlist sound like?", ["Upbeat and motivational", "Calm and acoustic", "Whatever's trending", "Silence — I need quiet"], 0]],
    r: [[0, 2, "The Night Owl", "Mornings aren't your thing, and that's okay. You peak later in the day and do your best work after dark."], [3, 4, "The Balanced Riser", "You ease into the day with intention. You've found a routine that works without being rigid."], [5, 5, "The Go-Getter", "You own the morning! Your disciplined start sets you up to crush every goal before noon."]]
  }, {
    id: 34,
    title: "What Kind of Traveler Are You Really?",
    cat: "lifestyle",
    img: "/playbuzz-assets/35.jpg",
    q: [["How do you plan a trip?", ["Spreadsheet itinerary weeks in advance", "Rough outline with flexibility", "Book a flight and figure it out", "I let someone else plan"], 0], ["What's your ideal accommodation?", ["A boutique hotel with character", "A cozy Airbnb with local vibes", "A hostel to meet people", "Luxury resort — spare no expense"], 0], ["What do you always pack?", ["A detailed guidebook", "Comfortable walking shoes", "My camera and journal", "Just the essentials — I travel light"], 0], ["What's your must-do at every destination?", ["Visit historical landmarks", "Eat at local restaurants", "Find hidden off-the-beaten-path spots", "Relax on a beach or spa"], 0], ["How do you handle travel delays?", ["I budgeted time for this", "Find something nearby to explore", "Stress but adapt", "It ruins my whole trip"], 0]],
    r: [[0, 2, "The Relaxer", "You travel to unwind. Sun, sand, and zero agenda — that's your perfect getaway."], [3, 4, "The Cultural Explorer", "You seek authentic experiences and local flavor. Every trip is a story worth telling."], [5, 5, "The Adventure Seeker", "Nothing is too far or too wild for you. You live for the thrill of the unknown destination."]]
  }, {
    id: 35,
    title: "Which Wellness Ritual Was Made for You?",
    cat: "lifestyle",
    img: "/playbuzz-assets/36.jpg",
    q: [["How do you decompress after a stressful day?", ["A long bath or meditation", "A run or workout", "Talking it out with a friend", "Watching TV and ordering food"], 0], ["What's your relationship with sleep?", ["I guard it fiercely — 8 hours minimum", "I try but often fall short", "Sleep is overrated, I stay up late", "I nap whenever I can"], 0], ["Which best describes your diet?", ["Mindful and mostly whole foods", "Balanced with occasional indulgences", "I eat whatever, whenever", "I meal prep religiously"], 0], ["How often do you check in with your mental health?", ["Daily journaling or therapy", "When things feel off", "Rarely — I just push through", "I have a whole self-care practice"], 0], ["What's your go-to form of movement?", ["Yoga or pilates", "Running or cycling", "Team sports or classes", "I prefer walks and light stretching"], 0]],
    r: [[0, 2, "The Rest Seeker", "Your body and mind crave stillness. Prioritizing sleep, baths, and gentle movement will transform your wellbeing."], [3, 4, "The Balanced Wellness Fan", "You know what you need and mostly give it to yourself. A few small tweaks could make a big difference."], [5, 5, "The Wellness Warrior", "You treat your body like a temple. Your consistent rituals inspire everyone around you."]]
  }, {
    id: 36,
    title: "What's Your Actual Interior Design Personality?",
    cat: "lifestyle",
    img: "/playbuzz-assets/37.jpg",
    trending: true,
    q: [["How would you describe your dream living room?", ["Cozy with warm tones and layered textures", "Clean lines and neutral colors", "Eclectic with bold colors and art", "Rustic with natural wood and plants"], 0], ["What's your approach to clutter?", ["Everything has a place — I love organization", "A little mess shows a lived-in space", "Organized chaos is my aesthetic", "I'm working on it..."], 0], ["Pick a statement piece for your home:", ["A vintage velvet sofa", "A sleek modular shelving unit", "A gallery wall of personal art", "A reclaimed wood dining table"], 0], ["What matters most in a bedroom?", ["Soft lighting and cozy linens", "Minimal furniture and calm colors", "Personal mementos and personality", "Natural light and plants"], 0], ["What's your go-to home scent?", ["Warm vanilla or sandalwood", "Clean linen or eucalyptus", "Citrus or something unexpected", "Cedar, pine, or fresh rain"], 0]],
    r: [[0, 2, "The Cozy Nester", "Warmth, comfort, and personal touches define your space. Your home is a sanctuary that hugs you back."], [3, 4, "The Modern Minimalist", "Less is more in your world. Your clean, intentional spaces feel calm, chic, and always put-together."], [5, 5, "The Bold Curator", "Your home is a reflection of your vibrant personality. Every room tells a story only you could write."]]
  }, {
    id: 37,
    title: "How Adventurous Is Your Palate?",
    cat: "lifestyle",
    img: "/playbuzz-assets/38.jpg",
    q: [["You're at a new restaurant. What do you order?", ["Whatever sounds most adventurous on the menu", "My usual reliable dish", "Something I recognize but haven't tried", "I check the menu online before I go"], 0], ["How do you feel about spicy food?", ["Bring on the heat — the spicier the better", "I like a mild kick", "I prefer no spice at all", "Depends on my mood"], 0], ["Have you ever eaten street food in another country?", ["Yes, and I seek it out on every trip", "Yes, but carefully", "No, it makes me nervous", "I haven't traveled internationally"], 0], ["What's your approach to cooking at home?", ["Experimenting with new cuisines often", "Rotating a few tried-and-true recipes", "I barely cook", "Following recipes very precisely"], 0], ["What do you think about food trends like fermented or raw dishes?", ["I try them immediately", "I'm curious but cautious", "Not for me", "I've already moved on to the next trend"], 0]],
    r: [[0, 2, "The Comfort Eater", "You know what you like and you stick to it — and there's nothing wrong with that. Your favorites are your favorites for a reason."], [3, 4, "The Curious Foodie", "You enjoy trying new things when the moment feels right. You've got a growing palate and a good sense of adventure."], [5, 5, "The Culinary Daredevil", "No cuisine is too foreign and no dish too unusual. You eat your way through life with fearless curiosity."]]
  }, {
    id: 38,
    title: "What Does Your Social Life Say About You?",
    cat: "lifestyle",
    img: "/playbuzz-assets/39.jpg",
    q: [["How do you feel after a big social event?", ["Energized and wanting more", "Happy but ready to recharge", "Exhausted but glad I went", "I usually skip big events"], 0], ["How big is your inner circle?", ["Just 1–2 very close people", "A small tight-knit group of 5–8", "A large network of acquaintances", "It shifts depending on the season of life"], 0], ["How do you prefer to make plans?", ["Spontaneous — I love a last-minute invite", "I like a heads-up but stay flexible", "Scheduled well in advance", "I prefer others to initiate"], 0], ["What kind of gathering do you enjoy most?", ["Intimate dinner parties", "Casual hangouts at someone's place", "Big parties and events", "One-on-one coffee or walks"], 0], ["How often do you feel lonely?", ["Rarely — I keep my calendar full", "Sometimes, but I recharge well alone", "Often — I wish I connected more", "Never — I love my alone time"], 0]],
    r: [[0, 2, "The Selective Introvert", "Quality over quantity is your social motto. Your relationships are deep, meaningful, and built to last."], [3, 4, "The Social Balancer", "You love people but also know when to recharge. You've mastered the art of being present and protecting your energy."], [5, 5, "The Social Butterfly", "You light up every room you enter. Your energy is magnetic and your social life is always buzzing."]]
  }, {
    id: 39,
    title: "Which Self-Care Love Language Are You?",
    cat: "lifestyle",
    img: "/playbuzz-assets/40.jpg",
    q: [["When you're burnt out, what do you reach for first?", ["A hot bath, candles, and silence", "A long walk or workout", "Calling a friend or loved one", "Journaling or creative expression"], 0], ["What makes you feel most recharged?", ["Physical rest and sensory comfort", "Moving my body and getting outside", "Emotional connection and deep talks", "Making something with my hands"], 0], ["Which treat feels most luxurious to you?", ["A spa day or massage", "A solo hike or outdoor adventure", "A heartfelt conversation over wine", "An afternoon to create or explore ideas"], 0], ["How do you show yourself love on hard days?", ["Slow down and do less", "Push through with movement", "Reach out and connect", "Create or write through it"], 0], ["Which environment makes you feel safest?", ["Warm, quiet, and familiar", "Open air and natural spaces", "Surrounded by people I trust", "A studio, library, or creative space"], 0]],
    r: [[0, 2, "The Soother", "Your self-care is sensory and restorative. You recharge through comfort, stillness, and nurturing your physical senses."], [3, 4, "The Mover", "You heal through action. Movement, nature, and physical challenge are your most powerful forms of self-love."], [5, 5, "The Creator", "Your self-care is expressive and imaginative. Making, writing, and exploring ideas fills your cup like nothing else."]]
  }, {
    id: 40,
    title: "Are You Actually Living Your Best Life?",
    cat: "lifestyle",
    img: "/playbuzz-assets/41.jpg",
    q: [["How often do you do something just for fun — no productivity attached?", ["Almost every day", "A few times a week", "Occasionally when I make time", "Rarely, I feel too busy"], 0], ["Do you have hobbies that have nothing to do with work?", ["Yes, several that I actively pursue", "One or two I dabble in", "I used to but fell out of them", "Not really — work takes most of my energy"], 0], ["When did you last try something completely new?", ["In the past week", "In the past month", "A few months ago", "I honestly can't remember"], 0], ["How present do you feel in your daily life?", ["Very — I notice the little things", "Mostly, with occasional distraction", "I often feel on autopilot", "I feel like I'm just going through the motions"], 0], ["How aligned do you feel with your values right now?", ["Fully — my life reflects what I care about", "Mostly, with some areas to improve", "I'm working on closing the gap", "Not really — something needs to change"], 0]],
    r: [[0, 2, "The Work in Progress", "You're not quite there yet, but awareness is the first step. Small changes now can lead to a life you love."], [3, 4, "The Consciously Living", "You're doing more right than you think. Keep nurturing what lights you up and don't forget to pause and enjoy it."], [5, 5, "The Best Life Liver", "You're truly thriving! You've found a rhythm that balances joy, purpose, and presence — and it shows."]]
  }, {
    id: 41,
    title: "Which Marvel Hero Matches Your Soul?",
    cat: "entertainment",
    img: "/playbuzz-assets/42.jpg",
    q: [["Pick your ideal superpower:", ["Super strength", "Time manipulation", "Telepathy", "Invisibility"], 0], ["Who played Iron Man in the MCU?", ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"], 1], ["Which stone does Thanos need last in Avengers: Infinity War?", ["Time Stone", "Mind Stone", "Soul Stone", "Space Stone"], 2], ["What is Thor's hammer called?", ["Stormbreaker", "Gungnir", "Mjolnir", "Excalibur"], 2], ["In which city is the Avengers Tower located?", ["Chicago", "Los Angeles", "New York", "Washington D.C."], 2]],
    r: [[0, 2, "Rookie Hero", "You're just getting started on your heroic journey — but every legend begins somewhere."], [3, 4, "Shield Agent", "You know your Marvel lore well and have the instincts of a seasoned S.H.I.E.L.D. operative."], [5, 5, "True Avenger", "Impressive! You'd fit right in assembling with Earth's Mightiest Heroes."]]
  }, {
    id: 42,
    title: "How Well Do You Know Friends?",
    cat: "entertainment",
    img: "/playbuzz-assets/43.jpg",
    q: [["What is the name of the coffee house the gang frequents?", ["Central Perk", "Java Joe's", "The Grind", "Brew Corner"], 0], ["What were Ross's three failed marriages?", ["Carol, Emily, Rachel", "Carol, Rachel, Emily", "Emily, Carol, Mona", "Rachel, Emily, Carol"], 1], ["What is Chandler Bing's job?", ["Data analyst", "IT procurement manager", "Accountant", "Ad executive"], 1], ["Which character says 'How you doin'?", ["Ross", "Joey", "Chandler", "Gunther"], 1], ["What is the name of Phoebe's alter ego musician?", ["Regina Falange", "Princess Consuela", "Smelly Cat", "Monana"], 1]],
    r: [[0, 2, "Casual Viewer", "You've seen a few episodes but the details are fuzzy — time for a rewatch!"], [3, 4, "On a Break Fan", "You know Friends pretty well, but there are still some trivia traps that got you."], [5, 5, "Unofficial Cast Member", "Could you BE any more of a Friends expert? Absolutely flawless."]]
  }, {
    id: 43,
    title: "Which Hogwarts House Do You Truly Belong To?",
    cat: "entertainment",
    img: "/playbuzz-assets/44.jpg",
    q: [["What quality do you value most?", ["Bravery", "Ambition", "Loyalty", "Wisdom"], 0], ["Who is the Potions master during Harry's early years at Hogwarts?", ["Dumbledore", "Snape", "Lupin", "Quirrell"], 1], ["What form does Harry's Patronus take?", ["Wolf", "Stag", "Phoenix", "Doe"], 1], ["Which house is known for its loyalty and dedication?", ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw"], 2], ["What platform do students use to board the Hogwarts Express?", ["9 and 3/4", "10 and 1/2", "8 and 3/4", "11 and 1/4"], 0]],
    r: [[0, 2, "Muggle at Heart", "Magic is not really your forte — but every wizard starts somewhere."], [3, 4, "Sorting Hat Contender", "You know your Harry Potter lore, and the Sorting Hat would have a real debate over you."], [5, 5, "Hogwarts Scholar", "You belong in the highest of towers — pure wizarding knowledge flows through you."]]
  }, {
    id: 44,
    title: "Which Game of Thrones Character Are You?",
    cat: "entertainment",
    img: "/playbuzz-assets/45.jpg",
    q: [["How do you handle betrayal?", ["Strike back immediately", "Plan a slow revenge", "Forgive and move on", "Flee and regroup"], 0], ["Who is known as the Mother of Dragons?", ["Cersei Lannister", "Sansa Stark", "Daenerys Targaryen", "Melisandre"], 2], ["What is the motto of House Stark?", ["Fire and Blood", "Ours is the Fury", "Winter is Coming", "Growing Strong"], 2], ["Who sits on the Iron Throne at the very end of the series?", ["Jon Snow", "Sansa Stark", "Bran Stark", "Arya Stark"], 2], ["What phrase do the White Walkers' enemies use to warn of their coming?", ["The Night is Dark", "Winter is Coming", "Death Comes for All", "The Long Night"], 1]],
    r: [[0, 2, "Smallfolk", "You survive by staying out of the game — and there's wisdom in that."], [3, 4, "Lord of the Realm", "You know Westeros well and would hold your own at court."], [5, 5, "Iron Throne Worthy", "You command the knowledge of a true ruler of the Seven Kingdoms."]]
  }, {
    id: 45,
    title: "Which Disney Princess Is Your Spirit Twin?",
    cat: "entertainment",
    img: "/playbuzz-assets/45.jpg",
    q: [["What's your ideal adventure?", ["Exploring the ocean", "Roaming enchanted forests", "Traveling to faraway kingdoms", "Discovering ancient ruins"], 0], ["Which Disney princess sings 'Let It Go'?", ["Moana", "Cinderella", "Elsa", "Rapunzel"], 2], ["In Beauty and the Beast, what is the enchanted object that shows far-off places?", ["Crystal ball", "Magic mirror", "Enchanted book", "Glowing rose"], 1], ["Who is Ariel's father in The Little Mermaid?", ["Triton", "Poseidon", "Neptune", "Aquaman"], 0], ["What is the name of Mulan's horse?", ["Maximus", "Samson", "Khan", "Phillipe"], 2]],
    r: [[0, 2, "Fairy Tale Newcomer", "You're just stepping into the magical world — so much wonder still awaits."], [3, 4, "Enchanted Traveler", "You know your Disney princesses well and have a touch of magic about you."], [5, 5, "Royal Expert", "You could write the storybook yourself — a true Disney royalty connoisseur."]]
  }, {
    id: 46,
    title: "How Much of a 90s Pop Culture Genius Are You?",
    cat: "entertainment",
    img: "/playbuzz-assets/46.jpg",
    q: [["Which decade are we celebrating?", ["1970s", "1980s", "1990s", "2000s"], 2], ["Which film features the line 'You can't handle the truth!'?", ["The Shawshank Redemption", "A Few Good Men", "Philadelphia", "JFK"], 1], ["What TV show features a high school chemistry teacher turned drug manufacturer?", ["Dexter", "Breaking Bad", "The Wire", "Weeds"], 1], ["Who sang 'Baby One More Time' in 1998?", ["Christina Aguilera", "Britney Spears", "Mariah Carey", "TLC"], 1], ["Which 1994 film stars Tom Hanks as a man with a low IQ who witnesses major historical events?", ["Philadelphia", "Cast Away", "Big", "Forrest Gump"], 3]],
    r: [[0, 2, "Born After the 90s", "The 90s are a mystery to you — but they were totally radical, trust us."], [3, 4, "Pop Culture Fan", "You've got solid 90s knowledge — you probably had a Tamagotchi."], [5, 5, "90s Legend", "All that and a bag of chips! You're a certified 90s pop culture genius."]]
  }, {
    id: 47,
    title: "Which Stranger Things Character Are You?",
    cat: "entertainment",
    img: "/playbuzz-assets/10.jpg",
    q: [["How do you face fear?", ["Head-on with courage", "With science and strategy", "By leaning on friends", "By running and reassessing"], 0], ["In which fictional town is Stranger Things set?", ["Riverdale", "Hawkins", "Derry", "Castle Rock"], 1], ["What is the name of the alternate dimension in the show?", ["The Shadow Realm", "The Upside Down", "The Void", "The Dark Side"], 1], ["Who plays the character Eleven?", ["Sadie Sink", "Millie Bobby Brown", "Natalia Dyer", "Gaten Matarazzo"], 1], ["What year does the first season of Stranger Things take place?", ["1980", "1983", "1985", "1988"], 1]],
    r: [[0, 2, "Normal Hawkins Resident", "You live a quiet life — probably unaware the Upside Down even exists."], [3, 4, "Part of the Party", "You're in the inner circle and know your way around the mysteries of Hawkins."], [5, 5, "Demogorgon Slayer", "You know Stranger Things inside out — even the Mind Flayer fears your knowledge."]]
  }, {
    id: 48,
    title: "Which Breaking Bad Character Shares Your Fate?",
    cat: "entertainment",
    img: "/playbuzz-assets/14.jpg",
    q: [["How do you justify a tough moral choice?", ["For the greater good", "For my family", "I don't — I just act", "I weigh every consequence"], 0], ["What is Walter White's alter ego called?", ["The Cook", "Heisenberg", "Blue Sky", "The Chemist"], 1], ["What subject does Walter White teach at the start of the series?", ["Biology", "Physics", "Chemistry", "Mathematics"], 2], ["What color is Walter's signature product?", ["White", "Yellow", "Blue", "Clear"], 2], ["Who is Walter White's DEA brother-in-law?", ["Mike", "Hank", "Saul", "Tuco"], 1]],
    r: [[0, 2, "Innocent Bystander", "You've stayed out of the drug trade — probably the smartest move."], [3, 4, "Street Level Operative", "You know your Breaking Bad lore and could survive a season or two."], [5, 5, "I Am The Danger", "Say my name. You're a true Breaking Bad scholar — pure Heisenberg energy."]]
  }, {
    id: 49,
    title: "Are You a True Office Fan?",
    cat: "entertainment",
    img: "/playbuzz-assets/7.jpg",
    q: [["What is the name of the paper company in The Office?", ["Staples", "Dunder Mifflin", "Paper Trail", "The Halpert Group"], 1], ["Who plays Michael Scott?", ["John Krasinski", "Ed Helms", "Steve Carell", "Rainn Wilson"], 2], ["What is Dwight Schrute's farm known for growing?", ["Potatoes", "Corn", "Beets", "Hops"], 2], ["Which character famously declares 'I am the assistant regional manager'?", ["Jim", "Kevin", "Ryan", "Dwight"], 3], ["What city is the Scranton branch of Dunder Mifflin located in?", ["Albany", "Scranton", "Buffalo", "Harrisburg"], 1]],
    r: [[0, 2, "Casual Viewer", "You've seen a clip or two but the details escape you — queue up a rewatch!"], [3, 4, "That's What She Said Fan", "You're a solid Office fan with good instincts — Michael Scott would approve."], [5, 5, "World's Best Boss", "You know every awkward pause and paper jam — a true Dunder Mifflin devotee."]]
  }, {
    id: 50,
    title: "Which Iconic Movie Villain Are You Most Like?",
    cat: "entertainment",
    img: "/playbuzz-assets/18.jpg",
    q: [["What drives you most?", ["Power", "Revenge", "Control", "Recognition"], 0], ["Who famously said 'Why so serious?' in The Dark Knight?", ["Two-Face", "The Riddler", "The Joker", "Bane"], 2], ["Which film features the villain Hannibal Lecter?", ["Seven", "Psycho", "The Silence of the Lambs", "American Psycho"], 2], ["What is Darth Vader's real name?", ["Luke Skywalker", "Anakin Skywalker", "Han Solo", "Obi-Wan Kenobi"], 1], ["In Home Alone, what are the two burglars collectively called?", ["The Sticky Bandits", "The Wet Bandits", "The Slippery Pair", "The Wet Robbers"], 1]],
    r: [[0, 2, "Reluctant Villain", "You don't have the stomach for villainy — deep down you're the hero of your story."], [3, 4, "Scheming Sidekick", "You know your iconic villains and have a flair for drama — dangerous in small doses."], [5, 5, "Legendary Antagonist", "You know every sinister detail — a true connoisseur of cinematic evil."]]
  }, {
    id: 51,
    title: "Only 5% of People Can Pass This IQ Test",
    cat: "smart",
    img: "/playbuzz-assets/21.jpg",
    q: [["Which number comes next in the sequence: 2, 6, 18, 54, ?", ["108", "162", "128", "162"], 1], ["If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?", ["No", "Only sometimes", "Yes", "Cannot be determined"], 2], ["A farmer has 17 sheep. All but 9 die. How many are left?", ["8", "9", "17", "0"], 1], ["What is the missing number? 3, 7, 13, 21, 31, ?", ["41", "43", "39", "45"], 1], ["If you rearrange the letters 'CIFAIPC', you get the name of a(n):", ["Country", "Ocean", "Animal", "City"], 1]],
    r: [[0, 2, "Rising Mind", "You're just getting warmed up! A little more practice and those neurons will be firing on all cylinders."], [3, 4, "Sharp Thinker", "You've got a solid intellect and can handle most logic challenges with ease."], [5, 5, "Genius Level", "You're in rarified air — only a tiny fraction of people ace every question here!"]]
  }, {
    id: 52,
    title: "Can You Solve These 5 Logic Puzzles?",
    cat: "smart",
    img: "/playbuzz-assets/22.jpg",
    q: [["A rooster lays an egg on top of a pointed roof. Which way does it roll?", ["Left", "Right", "Roosters don't lay eggs", "Straight down"], 2], ["You have a 3-gallon jug and a 5-gallon jug. How do you measure exactly 4 gallons?", ["Fill the 3, pour into 5, refill 3, top off the 5", "Fill both jugs halfway", "Fill the 5-gallon twice", "It's impossible"], 0], ["A man is looking at a photo and says 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the photo?", ["His uncle", "Himself", "His son", "His brother"], 2], ["There are 3 switches outside a room. One controls a bulb inside. You can flip switches as often as you like before entering once. How do you find the right switch?", ["Turn on switch 1, wait, turn it off, turn on switch 2, enter and feel the bulb", "Enter and try each switch", "Flip all switches and see which is on", "You cannot determine it"], 0], ["How many months have 28 days?", ["1", "2", "6", "12"], 3]],
    r: [[0, 2, "Rising Mind", "Logic puzzles can be tricky — keep challenging yourself and you'll sharpen those problem-solving skills."], [3, 4, "Sharp Thinker", "You see through most tricks and traps. Your lateral thinking is well above average."], [5, 5, "Genius Level", "Flawless logic! You cut through every misdirection like a true puzzle master."]]
  }, {
    id: 53,
    title: "Is Your Vocabulary in the Top 1%?",
    cat: "smart",
    img: "/playbuzz-assets/28.jpg",
    q: [["What does 'perspicacious' mean?", ["Easily irritated", "Having a ready insight into things", "Overly cautious", "Excessively talkative"], 1], ["Which word means 'a general agreement'?", ["Dissent", "Disparity", "Consensus", "Conundrum"], 2], ["What is the meaning of 'ephemeral'?", ["Ancient", "Lasting a very short time", "Extremely large", "Deeply mysterious"], 1], ["Choose the correct meaning of 'sycophant':", ["A type of musical instrument", "A person who flatters to gain favor", "An ancient philosopher", "A rare plant species"], 1], ["What does 'laconic' mean?", ["Using very few words", "Extremely emotional", "Fond of luxury", "Moving slowly"], 0]],
    r: [[0, 2, "Rising Mind", "Your vocabulary is growing — keep reading widely and those rare words will start to feel familiar."], [3, 4, "Sharp Thinker", "You command an impressive range of vocabulary that puts you well ahead of most people."], [5, 5, "Genius Level", "Top 1% material! Your lexical mastery is extraordinary and truly sets you apart."]]
  }, {
    id: 54,
    title: "The Brain Teaser Test That Breaks Most Adults",
    cat: "smart",
    img: "/playbuzz-assets/39.jpg",
    q: [["What gets wetter the more it dries?", ["A sponge", "A towel", "Ice", "Rain"], 1], ["I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?", ["A shadow", "A dream", "An echo", "A flame"], 2], ["If there are 6 apples and you take away 4, how many apples do YOU have?", ["2", "4", "6", "0"], 1], ["A clock is looked at in a mirror and shows 8:30. What is the actual time?", ["3:30", "4:30", "8:30", "9:30"], 1], ["What 4-letter word can be written forward, backward, or upside down, and can still be read from left to right?", ["NOON", "DEED", "TOOT", "MAIM"], 0]],
    r: [[0, 2, "Rising Mind", "These brain teasers love to trick quick thinkers — slow down and you'll catch them next time."], [3, 4, "Sharp Thinker", "Your brain navigates twists and misdirection better than most. Impressive focus!"], [5, 5, "Genius Level", "Perfect score! Your mind is wired to spot patterns and resist every trap. Exceptional!"]]
  }, {
    id: 55,
    title: "Math Riddles Only Geniuses Get Right",
    cat: "smart",
    img: "/playbuzz-assets/17.jpg",
    q: [["If 5 machines take 5 minutes to make 5 widgets, how long does it take 100 machines to make 100 widgets?", ["100 minutes", "5 minutes", "10 minutes", "50 minutes"], 1], ["A bat and a ball cost $1.10 in total. The bat costs $1 more than the ball. How much does the ball cost?", ["10 cents", "5 cents", "15 cents", "20 cents"], 1], ["What is the sum of all integers from 1 to 100?", ["5050", "4950", "5500", "10000"], 0], ["If you double a penny every day for 30 days, how much do you have on day 30?", ["About $5 million", "About $500", "About $50,000", "About $500 million"], 0], ["How many squares are on a standard 8x8 chessboard (counting all sizes)?", ["64", "128", "204", "256"], 2]],
    r: [[0, 2, "Rising Mind", "Math can be sneaky! A bit more practice and these number tricks won't fool you."], [3, 4, "Sharp Thinker", "Strong numerical reasoning — you think carefully before jumping to conclusions."], [5, 5, "Genius Level", "A perfect mathematical mind at work. You belong in the genius hall of fame!"]]
  }, {
    id: 56,
    title: "Can You Beat This Advanced Pattern Recognition Quiz?",
    cat: "smart",
    img: "/playbuzz-assets/27.jpg",
    q: [["Which number is the odd one out: 2, 3, 5, 7, 11, 13, 16, 17?", ["11", "16", "13", "3"], 1], ["Complete the analogy: Book is to Reading as Fork is to:", ["Kitchen", "Eating", "Metal", "Spoon"], 1], ["What letter comes next in the series: A, C, F, J, O, ?", ["T", "U", "S", "V"], 1], ["If RED = 27, BLUE = 40, what does GREEN equal?", ["49", "52", "57", "45"], 2], ["Which shape completes the pattern if circle = 0 corners, triangle = 3, square = 4, pentagon = 5?", ["Hexagon has 6", "Hexagon has 7", "Hexagon has 8", "Hexagon has 5"], 0]],
    r: [[0, 2, "Rising Mind", "Pattern recognition is a skill that grows with practice — you're building a solid foundation."], [3, 4, "Sharp Thinker", "You spot relationships and sequences that most people miss entirely. Well done!"], [5, 5, "Genius Level", "Your pattern recognition is off the charts — a hallmark of true analytical genius."]]
  }, {
    id: 57,
    title: "This Tricky Word Quiz Stumps 9 Out of 10 People",
    cat: "smart",
    img: "/playbuzz-assets/39.jpg",
    q: [["Which word is the antonym of 'obsequious'?", ["Servile", "Assertive", "Timid", "Compliant"], 1], ["What is a 'solecism'?", ["A formal greeting", "A grammatical or social blunder", "A type of poetry", "A legal document"], 1], ["'Defenestration' refers to the act of:", ["Setting something on fire", "Throwing someone out of a window", "Removing all furniture", "Declaring independence"], 1], ["Which word means 'the fear of long words'?", ["Logophobia", "Hippopotomonstrosesquippedaliophobia", "Verbophobia", "Lexiphobia"], 1], ["What does 'sanguine' mean?", ["Pessimistic", "Relating to blood only", "Optimistic and positive", "Extremely tired"], 2]],
    r: [[0, 2, "Rising Mind", "Words are a lifelong journey — even getting a few of these means you're already ahead of most."], [3, 4, "Sharp Thinker", "Your word knowledge is genuinely impressive and well above the average person's range."], [5, 5, "Genius Level", "You mastered every word — your vocabulary and linguistic IQ are in a class of their own!"]]
  }, {
    id: 58,
    title: "Only True Geniuses Can Ace This Lateral Thinking Quiz",
    cat: "smart",
    img: "/playbuzz-assets/40.jpg",
    q: [["A man walks into a restaurant and orders albatross soup. He takes one sip, goes home, and kills himself. Why?", ["The soup was poisoned", "His wife had died at sea and he realized the 'albatross soup' on their raft was her", "He hated the taste", "He had lost all his money"], 1], ["A woman shoots her husband, then has dinner with him. How?", ["He survived the shot", "She's a photographer", "He's a ghost", "She dreamed it"], 1], ["How can a man who has no hands knock on a door?", ["He uses his foot", "He asks someone else", "He uses a special device", "He cannot"], 0], ["A woman runs a mile south, a mile west, and a mile north and ends up exactly where she started. Where is she?", ["Equator", "North Pole", "South Pole", "Center of a circular track"], 1], ["The more you take, the more you leave behind. What is it?", ["Money", "Time", "Footsteps", "Memories"], 2]],
    r: [[0, 2, "Rising Mind", "Lateral thinking requires flipping your assumptions — keep at it and your creative reasoning will flourish."], [3, 4, "Sharp Thinker", "You think outside the box and challenge conventional logic. A seriously agile mind!"], [5, 5, "Genius Level", "Lateral thinking master! You see the angles others completely miss. Truly elite thinking."]]
  }, {
    id: 59,
    title: "How High Is Your Emotional Intelligence?",
    cat: "smart",
    trending: true,
    img: "/playbuzz-assets/41.jpg",
    q: [["A colleague takes credit for your work in a meeting. The most emotionally intelligent response is to:", ["Confront them loudly in the meeting", "Say nothing and let it go forever", "Calmly speak with them privately afterward", "Send a passive-aggressive email"], 2], ["Which of the following best defines empathy?", ["Feeling sorry for someone", "Understanding and sharing the feelings of another", "Offering advice to someone in distress", "Agreeing with everything someone says"], 1], ["When you feel overwhelmed with anger, the most effective first step is to:", ["Express it immediately so it doesn't bottle up", "Pause and use deep breathing to regulate", "Call a friend and vent", "Distract yourself with entertainment"], 1], ["Which trait is the hallmark of high self-awareness?", ["Never feeling negative emotions", "Recognizing your emotions and their impact on others", "Always being confident", "Avoiding difficult conversations"], 1], ["A friend cancels plans last minute for the third time. You feel hurt but value the friendship. You should:", ["Stop inviting them out entirely", "Express how their pattern of canceling affects you", "Pretend it doesn't bother you", "Cancel on them next time as payback"], 1]],
    r: [[0, 2, "Rising Mind", "EQ is learnable! Reflecting on emotions and interactions will grow your emotional intelligence fast."], [3, 4, "Sharp Thinker", "You navigate emotions and relationships with real skill — your empathy and self-awareness are strong."], [5, 5, "Genius Level", "Off-the-charts emotional intelligence! You read people, manage emotions, and build trust masterfully."]]
  }, {
    id: 60,
    title: "The Ultimate General Knowledge Brain Workout",
    cat: "smart",
    img: "/playbuzz-assets/42.jpg",
    q: [["How many bones are in the adult human body?", ["206", "185", "312", "246"], 0], ["Which element has the chemical symbol 'Au'?", ["Silver", "Aluminum", "Gold", "Argon"], 2], ["What is the smallest prime number?", ["0", "1", "2", "3"], 2], ["In which year did the Berlin Wall fall?", ["1987", "1989", "1991", "1993"], 1], ["Who wrote the play 'Hamlet'?", ["Christopher Marlowe", "Ben Jonson", "John Milton", "William Shakespeare"], 3]],
    r: [[0, 2, "Rising Mind", "A great mix of topics to explore — brush up on science, history, and language to go even further."], [3, 4, "Sharp Thinker", "Solid general knowledge across multiple disciplines. Your curious mind serves you well!"], [5, 5, "Genius Level", "A flawless performance! Your breadth of knowledge across every subject is simply remarkable."]]
  }, {
    id: 61,
    title: "Which Dog Breed Matches Your Personality?",
    cat: "animals",
    img: "/playbuzz-assets/4.jpg",
    q: [["You have a free Sunday — what do you do?", ["Go hiking in the mountains", "Host a big gathering of friends", "Curl up at home with a book", "Explore somewhere you've never been"], 0], ["Pick your ideal living situation:", ["A cozy apartment in the city", "A house with a big backyard", "A cabin in the woods", "A beachside cottage"], 0], ["How do you handle conflict?", ["I confront it head-on", "I try to keep the peace", "I need time alone to process", "I rely on humor to defuse it"], 0], ["Your friends would describe you as:", ["Loyal and protective", "Energetic and playful", "Calm and gentle", "Independent and curious"], 0], ["What matters most to you?", ["Family and belonging", "Adventure and fun", "Comfort and routine", "Freedom and exploration"], 0]],
    r: [[0, 2, "Laid-Back Labrador", "You're easygoing, warm, and everyone loves being around you. Life is best enjoyed at a relaxed pace with good company."], [3, 4, "Adventurous Husky", "You crave excitement, love the outdoors, and have a free spirit that's hard to tame. Every day is a new adventure."], [5, 5, "Loyal Border Collie", "You're sharp, dedicated, and always on the move. You thrive when you have a purpose and people counting on you."]]
  }, {
    id: 62,
    title: "Can You Identify These Animals by Their Eyes?",
    cat: "animals",
    img: "/playbuzz-assets/5.jpg",
    q: [["Which animal has rectangular, horizontal pupils that give it a wide field of vision?", ["Goat", "Wolf", "Owl", "Crocodile"], 0], ["The tarsier has eyes so large they cannot move in their sockets — how does it compensate?", ["It can rotate its head nearly 180 degrees", "It has a third eyelid", "Its pupils dilate to cover the entire eye", "It has mirror-like retinas"], 0], ["Which animal has a tapetum lucidum, causing its eyes to glow green in the dark?", ["Cat", "Frog", "Snake", "Dolphin"], 0], ["A mantis shrimp has 16 types of photoreceptors. Humans have how many?", ["3", "6", "9", "12"], 0], ["Which bird is known for having eyes larger than its brain?", ["Ostrich", "Eagle", "Barn owl", "Parrot"], 0]],
    r: [[0, 2, "Nature Novice", "Animals have some of the most fascinating eyes on the planet — keep exploring and you'll be amazed what you discover."], [3, 4, "Wildlife Watcher", "You know your way around the animal kingdom and notice details others miss. Nice work!"], [5, 5, "Eye Spy Expert", "You aced it! Your knowledge of animal vision is truly sharp — you see the world like a true naturalist."]]
  }, {
    id: 63,
    title: "What Is Your Spirit Animal?",
    cat: "animals",
    img: "/playbuzz-assets/6.jpg",
    q: [["How do you approach a big decision?", ["I trust my instincts and act fast", "I gather information and plan carefully", "I go with whatever feels right in the moment", "I ask everyone I trust for their opinion"], 0], ["What is your greatest strength?", ["Courage and determination", "Intelligence and strategy", "Adaptability and resilience", "Empathy and connection"], 0], ["Choose a natural landscape:", ["Open plains at sunrise", "Dense forest at midnight", "A rushing river", "A vast ocean"], 0], ["When things get hard, you:", ["Push through with sheer willpower", "Find a clever workaround", "Flow around the obstacle", "Lean on your community"], 0], ["Your ideal life motto:", ["Fortune favors the bold", "Knowledge is power", "Go with the flow", "Together we rise"], 0]],
    r: [[0, 2, "The Wise Owl", "Patient, observant, and thoughtful — you see what others miss and offer guidance when it matters most."], [3, 4, "The Cunning Fox", "Quick-witted and resourceful, you find creative solutions and navigate life with clever grace."], [5, 5, "The Mighty Wolf", "You lead with heart and strength, fiercely loyal to your pack and always ready to rise to any challenge."]]
  }, {
    id: 64,
    title: "How Well Do You Know Big Cats?",
    cat: "animals",
    img: "/playbuzz-assets/4.jpg",
    q: [["Which big cat is the fastest land animal on Earth?", ["Cheetah", "Leopard", "Lion", "Jaguar"], 0], ["Which big cat is an excellent swimmer and is found in the Amazon rainforest?", ["Jaguar", "Tiger", "Cougar", "Snow leopard"], 0], ["Unlike other big cats, which species cannot roar but can purr continuously?", ["Cheetah", "Leopard", "Lion", "Clouded leopard"], 0], ["A leopard and a jaguar look similar — what is the key difference in their coat patterns?", ["Jaguars have spots inside their rosettes; leopards do not", "Leopards have spots inside their rosettes; jaguars do not", "Jaguars are always black; leopards are always spotted", "Leopards are larger than jaguars"], 0], ["Which big cat has the widest global range, spanning from Canada to South America?", ["Cougar (Puma)", "Leopard", "Jaguar", "Tiger"], 0]],
    r: [[0, 2, "Safari Beginner", "Big cats are magnificent and mysterious — there's so much more to discover about these apex predators!"], [3, 4, "Prowling Explorer", "You know your big cats well. With a little more study, you could be a true field guide."], [5, 5, "Apex Predator of Trivia", "Purrfect score! You know big cats inside and out — a true wildlife expert."]]
  }, {
    id: 65,
    title: "Which Mythical Animal Are You?",
    cat: "animals",
    img: "/playbuzz-assets/5.jpg",
    q: [["Pick the element you feel most drawn to:", ["Fire", "Water", "Air", "Earth"], 0], ["How do people usually see you?", ["Powerful and awe-inspiring", "Mysterious and elusive", "Free-spirited and graceful", "Wise and ancient"], 0], ["What do you value most in life?", ["Passion and intensity", "Depth and emotion", "Freedom and wonder", "Knowledge and wisdom"], 0], ["Choose a time of day:", ["High noon", "Midnight", "Dawn", "Dusk"], 0], ["Your biggest flaw might be:", ["Too stubborn", "Too secretive", "Too impulsive", "Too reserved"], 0]],
    r: [[0, 2, "The Phoenix", "Born from fire and reborn from ashes, you are resilient beyond measure. Every ending in your life becomes a new beginning."], [3, 4, "The Kraken", "Deep, powerful, and rarely fully understood, you hold vast inner worlds that few are privileged to explore."], [5, 5, "The Dragon", "Ancient, fierce, and commanding respect wherever you go — you are a force of nature that cannot be ignored."]]
  }, {
    id: 66,
    title: "Can You Match the Animal to Its Habitat?",
    cat: "animals",
    img: "/playbuzz-assets/6.jpg",
    q: [["Where do polar bears primarily live and hunt?", ["Arctic sea ice", "Antarctic tundra", "Siberian taiga", "Greenland grasslands"], 0], ["The axolotl is a critically endangered salamander native to which body of water?", ["Lake Xochimilco in Mexico", "The Amazon River", "Lake Titicaca in Peru", "The Yangtze River in China"], 0], ["Whale sharks, the largest fish in the world, prefer which type of environment?", ["Warm, tropical open oceans", "Cold polar waters", "Deep ocean trenches", "Coastal mangrove swamps"], 0], ["Which continent is the only natural home of wild lemurs?", ["Madagascar", "Africa", "South America", "Australia"], 0], ["The snow leopard is found in the mountain ranges of which region?", ["Central Asia", "Northern Canada", "Scandinavia", "Patagonia"], 0]],
    r: [[0, 2, "Armchair Traveler", "The animal kingdom spans some amazing places — time to brush up on your wild geography!"], [3, 4, "Field Naturalist", "You know your biomes and habitats well. Most animals would be lucky to have you as a guide."], [5, 5, "Habitat Master", "Flawless! You can place any creature in its home environment without breaking a sweat."]]
  }, {
    id: 67,
    title: "What Kind of Cat Person Are You?",
    cat: "animals",
    img: "/playbuzz-assets/7.jpg",
    q: [["What is your cat's favorite activity at 3 a.m.?", ["Knocking things off shelves deliberately", "Sprinting laps around the apartment", "Demanding cuddles and purring loudly", "Staring at a wall for no apparent reason"], 0], ["How does your cat greet you when you come home?", ["Completely ignores me — classic", "Runs to the door every time", "Chirps and trills from across the room", "Watches suspiciously from a high perch"], 0], ["Your cat's relationship with your laptop is:", ["It is their personal heated throne", "They type helpful emails on occasion", "They sit directly in front of the screen", "They couldn't care less about it"], 0], ["When a guest comes over, your cat:", ["Hides under the bed immediately", "Investigates boldly and demands attention", "Watches from a safe distance for hours", "Runs up and claims the guest as their own"], 0], ["Your cat's life philosophy is:", ["I tolerate you, human", "I love you intensely on my own terms", "The world is mine to explore", "Safety first, always"], 0]],
    r: [[0, 2, "The Independent Cat Parent", "Your cat runs the household and you both know it. You respect the boundaries and that's the foundation of your relationship."], [3, 4, "The Entertained Cat Parent", "Life with your cat is never boring. From 3 a.m. chaos to unexpected affection, you wouldn't trade it for anything."], [5, 5, "The Devoted Cat Parent", "Your cat is your shadow and your best friend. The bond you share is the kind people write poems about."]]
  }, {
    id: 68,
    title: "Do You Know These Incredible Animal Records?",
    cat: "animals",
    img: "/playbuzz-assets/8.jpg",
    q: [["Which animal holds the record for the loudest sound produced by any living creature?", ["Sperm whale", "Blue whale", "Pistol shrimp", "Howler monkey"], 0], ["The migratory route of the Arctic tern is the longest of any animal — approximately how far does it travel annually?", ["70,000 km (43,000 miles)", "20,000 km (12,000 miles)", "40,000 km (25,000 miles)", "90,000 km (56,000 miles)"], 0], ["Which animal has the longest lifespan verified by science?", ["Ocean quahog clam", "Greenland shark", "Giant tortoise", "Bowhead whale"], 0], ["The mantis shrimp can strike with the speed of a bullet. Roughly how fast is its punch?", ["80 km/h (50 mph)", "23 km/h (14 mph)", "160 km/h (100 mph)", "320 km/h (200 mph)"], 0], ["Which animal has the most complex brain relative to its body size among all invertebrates?", ["Octopus", "Honeybee", "Cuttlefish", "Jumping spider"], 0]],
    r: [[0, 2, "Record Rookie", "The animal world is full of jaw-dropping stats — you've only scratched the surface of what's out there."], [3, 4, "Stats Tracker", "You know some seriously impressive animal facts. A few more deep dives and you'll be unbeatable."], [5, 5, "World Record Buff", "You aced every single one! You know the animal kingdom's greatest achievements better than most naturalists."]]
  }, {
    id: 69,
    title: "Which Ocean Creature Are You?",
    cat: "animals",
    img: "/playbuzz-assets/9.jpg",
    q: [["How do you handle social situations?", ["I'm the life of the party — always moving, always visible", "I prefer to drift and go where the current takes me", "I observe from the shadows until I'm comfortable", "I form one tight-knit group and stay loyal to it"], 0], ["Choose a superpower:", ["Camouflage — blend in anywhere", "Speed — outswim any challenge", "Glowing in the dark", "Regenerating from any setback"], 0], ["What best describes your communication style?", ["Expressive and colorful", "Subtle and indirect", "Silent but impactful", "Loud and hard to ignore"], 0], ["Your approach to danger is:", ["Change colors and disappear", "Swim away as fast as possible", "Stand your ground", "Rally the group"], 0], ["What do people love most about you?", ["My creativity and intelligence", "My calm, graceful presence", "My mysterious depth", "My reliability and warmth"], 0]],
    r: [[0, 2, "The Jellyfish", "Serene, ethereal, and beautifully unconcerned with the chaos around you — you drift through life with quiet grace."], [3, 4, "The Octopus", "Brilliantly clever and endlessly adaptable, you solve problems others can't even see and you do it with style."], [5, 5, "The Dolphin", "Playful, social, and wickedly smart — you light up every room (or reef) you enter and bring others along for the ride."]]
  }, {
    id: 70,
    title: "True or False: Wild Animal Edition",
    cat: "animals",
    img: "/playbuzz-assets/10.jpg",
    q: [["True or False: A group of flamingos is called a flamboyance.", ["True", "False", "It depends on the region", "Only in formal scientific contexts"], 0], ["True or False: Elephants are the only animals that cannot jump.", ["False — hippos and rhinos also cannot jump", "True — elephants are unique in this", "False — sloths also cannot jump", "False — no animal is physically unable to jump"], 0], ["True or False: Sloths are so slow that algae actually grows on their fur.", ["True", "False", "Only in captivity", "Only during rainy seasons"], 0], ["True or False: A crocodile cannot stick out its tongue.", ["True", "False", "Only saltwater crocodiles can", "Only when submerged"], 0], ["True or False: Wombats produce cube-shaped droppings.", ["True", "False", "Only the northern hairy-nosed wombat", "Only when dehydrated"], 0]],
    r: [[0, 2, "Animal Myth Believer", "You might have believed a few tall tales — but that just means the animal world has even more surprises in store for you!"], [3, 4, "Fact Checker", "You've got a sharp eye for animal fact versus fiction. Most people can't tell the difference as well as you can."], [5, 5, "Wildlife Truth-Teller", "You called every one of them correctly! You have an outstanding sense for what's real and what's myth in the animal world."]]
  }, {
    id: 71,
    title: "Which Sport Were You Born to Play?",
    cat: "sports",
    img: "/playbuzz-assets/11.jpg",
    q: [["How do you prefer to spend a free afternoon?", ["Solo outdoor run", "Team pickup game", "Swimming laps", "Hitting the gym alone"], 0], ["Which FIFA World Cup host country has won the tournament on home soil?", ["France", "Germany", "Brazil", "England"], 2], ["What is the diameter of a regulation NBA basketball hoop in inches?", ["16", "18", "20", "22"], 1], ["How many players are on the field for one team in American football?", ["9", "10", "11", "12"], 2], ["Which country has won the most Olympic gold medals in wrestling?", ["USA", "Russia", "Japan", "Iran"], 0]],
    r: [[0, 2, "Weekend Warrior", "You enjoy sports casually and love the social side of games more than the competition."], [3, 4, "All-Star", "You have solid sports knowledge and a competitive drive that pushes you to the next level."], [5, 5, "Sports Legend", "You live and breathe sports — your knowledge and passion put you in a league of your own."]]
  }, {
    id: 72,
    title: "How Much Do You Know About the FIFA World Cup?",
    cat: "sports",
    img: "/playbuzz-assets/12.jpg",
    q: [["Which country has won the most FIFA World Cup titles?", ["Germany", "Argentina", "Brazil", "Italy"], 2], ["In what year was the first FIFA World Cup held?", ["1926", "1930", "1934", "1938"], 1], ["Which player holds the record for most World Cup goals all time?", ["Pelé", "Ronaldo", "Miroslav Klose", "Gerd Müller"], 2], ["How many teams participate in the modern FIFA World Cup finals?", ["24", "32", "36", "48"], 1], ["Which country hosted the 2018 FIFA World Cup?", ["Brazil", "France", "Russia", "Qatar"], 2]],
    r: [[0, 2, "Weekend Warrior", "You know the basics but there's a lot more World Cup history to explore."], [3, 4, "All-Star", "You clearly follow the beautiful game closely — impressive World Cup knowledge!"], [5, 5, "Sports Legend", "You could commentate a World Cup match yourself — your knowledge is world-class."]]
  }, {
    id: 73,
    title: "Which NBA Legend Are You?",
    cat: "sports",
    img: "/playbuzz-assets/13.jpg",
    q: [["Pick your leadership style on a team.", ["Quiet leader who leads by example", "Vocal coach who motivates everyone", "Creative playmaker who improvises", "Defensive stopper who sets the tone"], 0], ["How many rings did Michael Jordan win with the Chicago Bulls?", ["4", "5", "6", "7"], 2], ["Which player scored 100 points in a single NBA game?", ["Elgin Baylor", "Wilt Chamberlain", "Jerry West", "Oscar Robertson"], 1], ["What does MVP stand for in sports?", ["Most Valuable Player", "Most Versatile Player", "Maximum Victory Points", "Most Victorious Player"], 0], ["Which team has won the most NBA championships?", ["Los Angeles Lakers", "Boston Celtics", "Chicago Bulls", "Golden State Warriors"], 1]],
    r: [[0, 2, "Weekend Warrior", "You've got heart on the court but need more time to develop your inner legend."], [3, 4, "All-Star", "You have the skills and knowledge of a true All-Star — keep pushing!"], [5, 5, "Sports Legend", "You are the GOAT of sports trivia — a true NBA legend in the making."]]
  }, {
    id: 74,
    title: "Are You a True NFL Fan?",
    cat: "sports",
    img: "/playbuzz-assets/14.jpg",
    q: [["How do you watch big games?", ["Massive watch party with friends", "Just me and a close friend", "Alone with full snacks and focus", "Half-watching while doing other things"], 0], ["How many points is a touchdown worth in the NFL?", ["4", "6", "7", "8"], 1], ["Which team has the most Super Bowl victories?", ["Dallas Cowboys", "San Francisco 49ers", "New England Patriots", "Pittsburgh Steelers"], 2], ["What is the length of an NFL football field in yards?", ["80", "90", "100", "110"], 2], ["Who is the NFL's all-time leading passer in touchdown passes?", ["Brett Favre", "Peyton Manning", "Tom Brady", "Drew Brees"], 2]],
    r: [[0, 2, "Weekend Warrior", "You cheer on game day but the rulebook is still a mystery — and that's okay!"], [3, 4, "All-Star", "You know your football and can hold your own in any pre-game debate."], [5, 5, "Sports Legend", "You eat, sleep, and breathe NFL — a true gridiron genius."]]
  }, {
    id: 75,
    title: "Which Olympic Sport Matches Your Personality?",
    cat: "sports",
    img: "/playbuzz-assets/15.jpg",
    q: [["What word best describes you?", ["Graceful", "Explosive", "Enduring", "Strategic"], 0], ["How often are the Summer Olympic Games held?", ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], 2], ["Which country has won the most Summer Olympic gold medals in history?", ["China", "Russia", "Great Britain", "United States"], 3], ["What is the longest running track event in the Olympics?", ["5000m", "10000m", "Marathon", "3000m steeplechase"], 2], ["In which year did women first compete in the Olympic Games?", ["1896", "1900", "1912", "1924"], 1]],
    r: [[0, 2, "Weekend Warrior", "You enjoy the Olympics for the spectacle — every four years is plenty for you!"], [3, 4, "All-Star", "You follow Olympic sports closely and know your athletes from your arenas."], [5, 5, "Sports Legend", "You could write the history of the Olympics yourself — absolutely legendary knowledge."]]
  }, {
    id: 76,
    title: "How Well Do You Know Tennis' Greatest Champions?",
    cat: "sports",
    img: "/playbuzz-assets/16.jpg",
    q: [["Which quality do you admire most in a champion?", ["Mental toughness", "Raw power", "Elegant technique", "Relentless consistency"], 0], ["Which player has won the most Grand Slam singles titles in men's tennis?", ["Rafael Nadal", "Roger Federer", "Novak Djokovic", "Pete Sampras"], 2], ["How many sets are in a standard men's Grand Slam match?", ["Best of 3", "Best of 5", "Best of 7", "Best of 4"], 1], ["On which surface is the French Open played?", ["Grass", "Hard court", "Clay", "Carpet"], 2], ["Which country does Serena Williams represent?", ["Canada", "Australia", "Great Britain", "United States"], 3]],
    r: [[0, 2, "Weekend Warrior", "Tennis is fun to watch but the stats are a bit hazy — time to brush up!"], [3, 4, "All-Star", "You know your Grand Slams from your tie-breaks — a solid tennis fan."], [5, 5, "Sports Legend", "Your tennis IQ is unmatched — you belong in the commentator's booth at Wimbledon."]]
  }, {
    id: 77,
    title: "Which Soccer Position Were You Born to Play?",
    cat: "sports",
    img: "/playbuzz-assets/17.jpg",
    q: [["What's your role in a group project?", ["The organizer keeping everyone on track", "The creative one with wild ideas", "The reliable executor who gets things done", "The protector who prevents mistakes"], 0], ["How many players are on a soccer team on the field at one time?", ["9", "10", "11", "12"], 2], ["Which nation won the first ever UEFA European Championship?", ["Spain", "West Germany", "Soviet Union", "France"], 2], ["What is the maximum number of substitutions allowed per team in FIFA World Cup matches (since 2022)?", ["3", "4", "5", "6"], 2], ["Who won the Ballon d'Or the most times in history?", ["Cristiano Ronaldo", "Lionel Messi", "Ronaldo Nazário", "Zinedine Zidane"], 1]],
    r: [[0, 2, "Weekend Warrior", "You're still learning the beautiful game, but passion is the most important skill!"], [3, 4, "All-Star", "You know your offsides from your overlapping runs — a genuine soccer enthusiast."], [5, 5, "Sports Legend", "You'd fit right in as a tactical analyst — your soccer knowledge is top tier."]]
  }, {
    id: 78,
    title: "What Kind of Sports Fan Are You Really?",
    cat: "sports",
    img: "/playbuzz-assets/18.jpg",
    q: [["What do you do during a commercial break?", ["Debate the game with everyone nearby", "Check stats on your phone", "Grab snacks and come right back", "Use the bathroom and miss the next play"], 0], ["Which sport is played at Wimbledon?", ["Badminton", "Squash", "Tennis", "Table Tennis"], 2], ["How long is a standard NBA game in quarters?", ["4 x 10 minutes", "4 x 12 minutes", "4 x 15 minutes", "2 x 24 minutes"], 1], ["In baseball, how many strikes does it take to strike out a batter?", ["2", "3", "4", "5"], 1], ["Which country invented the sport of basketball?", ["Canada", "United States", "England", "France"], 0]],
    r: [[0, 2, "Weekend Warrior", "You show up for the big games and the vibes — and there's nothing wrong with that!"], [3, 4, "All-Star", "You're a well-rounded sports fan with knowledge that spans multiple disciplines."], [5, 5, "Sports Legend", "From courtside to the commentary box, you are the ultimate sports authority."]]
  }, {
    id: 79,
    title: "Which Baseball Hall of Famer Are You?",
    cat: "sports",
    img: "/playbuzz-assets/19.jpg",
    q: [["How would your teammates describe you?", ["The clutch performer who delivers under pressure", "The steady veteran everyone trusts", "The power hitter who changes games", "The scrappy underdog who outworks everyone"], 0], ["How many outs are in a standard baseball inning per team?", ["2", "3", "4", "6"], 1], ["Which player holds the MLB record for career home runs?", ["Babe Ruth", "Hank Aaron", "Barry Bonds", "Alex Rodriguez"], 2], ["What is the distance between home plate and first base in feet?", ["60", "80", "90", "100"], 2], ["In what year was the Baseball Hall of Fame officially opened?", ["1930", "1935", "1939", "1945"], 2]],
    r: [[0, 2, "Weekend Warrior", "Baseball history isn't your strong suit yet, but a trip to Cooperstown could change that!"], [3, 4, "All-Star", "You know your innings and your icons — a solid baseball fan with real knowledge."], [5, 5, "Sports Legend", "You could lead a tour of the Hall of Fame yourself — baseball royalty status achieved."]]
  }, {
    id: 80,
    title: "How Much Do You Know About the Summer Olympics?",
    cat: "sports",
    img: "/playbuzz-assets/20.jpg",
    q: [["What motivates you most?", ["Beating your personal best", "Winning as part of a team", "Representing something bigger than yourself", "The thrill of competition itself"], 0], ["In which city were the first modern Olympic Games held in 1896?", ["Rome", "London", "Paris", "Athens"], 3], ["How many rings are on the Olympic flag, and what do they represent?", ["4 rings — cardinal directions", "5 rings — five continents", "6 rings — founding nations", "7 rings — seven seas"], 1], ["Which sport was removed from the Olympics after 2008 and then reinstated for 2020?", ["Softball", "Baseball", "Both softball and baseball", "Handball"], 2], ["Who lit the cauldron at the 1996 Atlanta Olympics opening ceremony?", ["Carl Lewis", "Michael Johnson", "Muhammad Ali", "Jesse Owens"], 2]],
    r: [[0, 2, "Weekend Warrior", "You tune in every four years but the history books are still largely unread."], [3, 4, "All-Star", "You have strong Olympic knowledge and genuine appreciation for the Games."], [5, 5, "Sports Legend", "You are an Olympic encyclopedia — Pierre de Coubertin himself would be impressed."]]
  }, {
    id: 81,
    title: "Which Music Era Defines Your Soul?",
    cat: "music",
    img: "/playbuzz-assets/21.jpg",
    q: [["What's your ideal Saturday night?", ["Dancing at a loud club", "Vinyl records by candlelight", "Headbanging at a concert", "Acoustic jam with friends"], 0], ["Which decade produced the most iconic music?", ["1980s", "1960s", "1970s", "1990s"], 2], ["What instrument speaks to your soul?", ["Electric guitar", "Piano", "Synthesizer", "Drums"], 0], ["Which word best describes your vibe?", ["Rebellious", "Dreamy", "Groovy", "Digital"], 0], ["What do you look for most in a song?", ["A killer beat", "Emotional lyrics", "Catchy melody", "Complex musicianship"], 0]],
    r: [[0, 2, "Timeless Classic", "You're rooted in the golden eras of music — you appreciate craftsmanship, soul, and songs that stand the test of time."], [3, 4, "Genre Blender", "You pull from multiple eras with ease, mixing the vintage with the modern in a way that's uniquely you."], [5, 5, "Future Sound", "You live on the cutting edge, always chasing the next wave before it breaks mainstream."]]
  }, {
    id: 82,
    title: "Can You Name These Songs By Their Lyrics?",
    cat: "music",
    img: "/playbuzz-assets/22.jpg",
    q: [["'Is this the real life? Is this just fantasy?' — which Queen song is this?", ["Bohemian Rhapsody", "We Are the Champions", "Radio Ga Ga", "Don't Stop Me Now"], 0], ["'Just a small town girl, livin' in a lonely world' opens which Journey song?", ["Don't Stop Believin'", "Any Way You Want It", "Faithfully", "Separate Ways"], 0], ["'Hello from the other side' — who sang this 2015 hit?", ["Adele", "Beyoncé", "Rihanna", "Taylor Swift"], 0], ["'I kissed a girl and I liked it' was a hit for which artist?", ["Katy Perry", "Lady Gaga", "Kesha", "Nicki Minaj"], 0], ["'We don't talk about Bruno' comes from which Disney film?", ["Moana", "Encanto", "Coco", "Frozen"], 1]],
    r: [[0, 2, "Casual Listener", "You enjoy music but the deep cuts escape you — time to brush up on those lyrics!"], [3, 4, "Music Enthusiast", "You know your hits well and can hum along to most radio classics without missing a beat."], [5, 5, "True Music Genius", "You could ace a pub quiz blindfolded — your lyric knowledge is absolutely encyclopedic!"]]
  }, {
    id: 83,
    title: "Which Legendary Musician Are You?",
    cat: "music",
    img: "/playbuzz-assets/23.jpg",
    q: [["How do you handle creative blocks?", ["Smash through them with raw energy", "Wait for divine inspiration", "Collaborate with others", "Study the masters"], 0], ["What's your relationship with fame?", ["I crave the spotlight", "It's a necessary evil", "I use it to spread a message", "I prefer mystery"], 0], ["Which best describes your style?", ["Flamboyant and theatrical", "Understated and cool", "Political and powerful", "Experimental and strange"], 0], ["How do you approach songwriting?", ["Gut feeling, pure emotion", "Meticulous craft and revision", "Stream of consciousness", "Mathematical precision"], 0], ["What's your stage presence like?", ["Total chaos and energy", "Quiet intensity", "Passionate and engaging", "Otherworldly and ethereal"], 0]],
    r: [[0, 2, "The Troubadour", "Like Bob Dylan or Joni Mitchell, you're a storyteller at heart — honest, raw, and deeply human."], [3, 4, "The Showman", "Shades of Freddie Mercury or David Bowie run through you — bold, theatrical, and unforgettable."], [5, 5, "The Visionary", "You're cut from the same cloth as Prince or Björk — utterly original and ahead of your time."]]
  }, {
    id: 84,
    title: "How Well Do You Know Classic Rock?",
    cat: "music",
    img: "/playbuzz-assets/24.jpg",
    q: [["Which band recorded 'Stairway to Heaven'?", ["Led Zeppelin", "Deep Purple", "Black Sabbath", "The Who"], 0], ["What year did The Beatles release 'Abbey Road'?", ["1969", "1967", "1971", "1968"], 0], ["'Hotel California' is by which band?", ["Eagles", "Fleetwood Mac", "The Doors", "Crosby Stills & Nash"], 0], ["Who is the lead vocalist of AC/DC since 1980?", ["Brian Johnson", "Bon Scott", "Angus Young", "Phil Rudd"], 0], ["Which Rolling Stones song features the lyric 'I can't get no satisfaction'?", ["(I Can't Get No) Satisfaction", "Paint It Black", "Sympathy for the Devil", "Gimme Shelter"], 0]],
    r: [[0, 2, "Casual Listener", "Classic rock isn't quite your wheelhouse yet — but there's a whole incredible world waiting for you to explore."], [3, 4, "Music Enthusiast", "You've got solid classic rock knowledge and clearly spent some quality time with the greats."], [5, 5, "True Music Genius", "A perfect score — you could give any rock historian a run for their money. Absolute legend!"]]
  }, {
    id: 85,
    title: "What Genre Is Your Musical Soulmate?",
    cat: "music",
    img: "/playbuzz-assets/25.jpg",
    q: [["Pick a mood: your music should make you feel...", ["Powerful and unstoppable", "Melancholy and reflective", "Free and euphoric", "Grounded and soulful"], 0], ["Your ideal concert venue is...", ["A massive festival stage", "An intimate café", "An underground club", "An outdoor amphitheatre"], 0], ["You judge a song first by its...", ["Beat and rhythm", "Lyrics and meaning", "Energy and vibe", "Instrumentation"], 0], ["Your music taste is...", ["Niche and underground", "Broadly eclectic", "Deeply nostalgic", "Whatever's trending"], 0], ["Music is most important to you when...", ["Working out", "Driving alone", "Falling asleep", "Feeling sad"], 0]],
    r: [[0, 2, "Casual Listener", "You enjoy music as background noise — any genre works as long as the vibe fits the moment."], [3, 4, "Music Enthusiast", "You have genuine taste and a genre or two you truly live inside — music shapes your identity."], [5, 5, "True Music Genius", "Music is your lifeblood. You don't just listen — you feel every note on a level most people never reach."]]
  }, {
    id: 86,
    title: "Can You Match the Artist to Their Album?",
    cat: "music",
    img: "/playbuzz-assets/26.jpg",
    q: [["Which artist released the album 'Thriller'?", ["Michael Jackson", "Prince", "Stevie Wonder", "James Brown"], 0], ["Who recorded the album 'Rumours' in 1977?", ["Fleetwood Mac", "ABBA", "The Eagles", "Blondie"], 0], ["'The Dark Side of the Moon' belongs to which band?", ["Pink Floyd", "Genesis", "Yes", "King Crimson"], 0], ["Beyoncé's visual album released in 2016 is called...", ["Lemonade", "Renaissance", "Dangerously in Love", "B'Day"], 0], ["Which rapper released 'To Pimp a Butterfly'?", ["Kendrick Lamar", "J. Cole", "Drake", "Kanye West"], 0]],
    r: [[0, 2, "Casual Listener", "You know the hits but the albums behind them are still a mystery — time for a deep listening session!"], [3, 4, "Music Enthusiast", "Solid album knowledge — you appreciate music as a full body of work, not just singles."], [5, 5, "True Music Genius", "Five for five! You treat albums as sacred texts, and it absolutely shows."]]
  }, {
    id: 87,
    title: "Which Pop Diva Are You?",
    cat: "music",
    img: "/playbuzz-assets/27.jpg",
    q: [["Your go-to power move is...", ["A surprise comeback announcement", "Dropping a cryptic teaser", "Selling out arenas worldwide", "Reinventing your look entirely"], 0], ["Pick your anthem energy:", ["Fierce and empowering", "Heartbroken but strong", "Fun and carefree", "Dark and mysterious"], 0], ["Your fanbase nickname would be...", ["Something fierce and loyal", "Cute and wholesome", "Edgy and devoted", "Glamorous and elite"], 0], ["Your signature fashion moment is...", ["A jaw-dropping Met Gala look", "Effortless street style", "Full glam on a Tuesday", "Avant-garde and polarizing"], 0], ["How do you respond to criticism?", ["Turn it into a hit song", "Ignore it completely", "Shade them subtly in interviews", "Take a hiatus and return stronger"], 0]],
    r: [[0, 2, "Casual Listener", "Pop diva energy isn't quite your scene — you're more of a background-music, no-drama type."], [3, 4, "Music Enthusiast", "You've got real pop sensibility and more than a little diva flair hiding beneath the surface."], [5, 5, "True Music Genius", "Full diva energy detected. You were born for the stage, the spotlight, and the dramatic exit."]]
  }, {
    id: 88,
    title: "How Much Do You Know About Hip-Hop History?",
    cat: "music",
    img: "/playbuzz-assets/28.jpg",
    q: [["Hip-hop is widely considered to have originated in which New York borough?", ["The Bronx", "Brooklyn", "Harlem", "Queens"], 0], ["Who is often called the 'Godfather of Hip-Hop'?", ["DJ Kool Herc", "Grandmaster Flash", "Afrika Bambaataa", "Melle Mel"], 0], ["Which rapper's debut album was 'Reasonable Doubt' (1996)?", ["Jay-Z", "Nas", "Biggie Smalls", "Rakim"], 0], ["What does 'MC' traditionally stand for in hip-hop?", ["Master of Ceremonies", "Music Controller", "Mic Commander", "Melody Conductor"], 0], ["Tupac Shakur was signed to which record label?", ["Death Row Records", "Bad Boy Records", "Def Jam", "Ruthless Records"], 0]],
    r: [[0, 2, "Casual Listener", "Hip-hop history is deep and rich — you've got some catching up to do, but what a journey awaits you."], [3, 4, "Music Enthusiast", "You clearly respect the culture and know your way around the foundational era of hip-hop."], [5, 5, "True Music Genius", "Flawless knowledge of hip-hop's roots. You honour the culture and the legends who built it."]]
  }, {
    id: 89,
    title: "Which Music Festival Were You Born to Attend?",
    cat: "music",
    img: "/playbuzz-assets/29.jpg",
    q: [["Your ideal festival weather is...", ["Blazing desert sun", "Cool mountain air", "Tropical heat and rain", "A crisp autumn evening"], 0], ["Your festival fashion is...", ["Flower crowns and flowy dresses", "All black everything", "Neon and glitter head to toe", "Vintage band tees and denim"], 0], ["You're most excited for...", ["The legendary headliner", "The underground tent stages", "The art installations", "The food and community"], 0], ["Your festival squad is...", ["A big group of strangers you just met", "Your two best friends", "A large crew who planned months ahead", "Solo — total freedom"], 0], ["After the festival you feel...", ["Spiritually recharged", "Creatively inspired", "Completely exhausted but happy", "Ready to go back immediately"], 0]],
    r: [[0, 2, "Casual Listener", "Festivals might not be your thing just yet — you prefer your music in more controlled environments."], [3, 4, "Music Enthusiast", "You'd have an amazing time at almost any festival — you strike the perfect balance of planning and spontaneity."], [5, 5, "True Music Genius", "You were made for the festival life. Dust on your boots and a wristband on your arm is your natural state."]]
  }, {
    id: 90,
    title: "Can You Identify These Iconic Guitar Riffs?",
    cat: "music",
    img: "/playbuzz-assets/30.jpg",
    q: [["The opening riff of 'Smoke on the Water' was played by which guitarist?", ["Ritchie Blackmore", "Jimmy Page", "Tony Iommi", "Eric Clapton"], 0], ["Who played the legendary guitar solo on 'Comfortably Numb'?", ["David Gilmour", "Carlos Santana", "Slash", "Jimi Hendrix"], 0], ["'Johnny B. Goode' is a guitar classic by which rock pioneer?", ["Chuck Berry", "Little Richard", "Bo Diddley", "Elvis Presley"], 0], ["Which guitarist is known for the whammy bar dive bombs on 'Eruption'?", ["Eddie Van Halen", "Yngwie Malmsteen", "Steve Vai", "Joe Satriani"], 0], ["The distinctive riff in 'Walk This Way' belongs to which band?", ["Aerosmith", "AC/DC", "Guns N' Roses", "Kiss"], 0]],
    r: [[0, 2, "Casual Listener", "Guitar riffs aren't your specialty — but these legends are worth a deep dive on your next playlist."], [3, 4, "Music Enthusiast", "You know your iconic riffs and clearly have a soft spot for guitar-driven rock."], [5, 5, "True Music Genius", "A perfect score — you have the ears of a guitarist and the knowledge of a music historian. Shred on!"]]
  }, {
    id: 91,
    title: "Which Movie Villain Are You?",
    cat: "movies",
    img: "/playbuzz-assets/31.jpg",
    q: [["You spot someone taking the last parking spot you were waiting for. You:", ["Let it go and find another", "Give them a cold stare and drive off", "Leave a strongly worded note", "Plot a slow and elaborate revenge"], 0], ["What is the name of the chemical compound that gives the Joker his bleached appearance in the 1989 Batman film?", ["Smylex", "Venom", "Titan", "Compound V"], 0], ["Which villain said 'I'm gonna make him an offer he can't refuse'?", ["Michael Corleone", "Don Vito Corleone", "Tom Hagen", "Carlo Rizzi"], 1], ["Your ideal lair would be:", ["An underground volcano base", "A sprawling Gothic mansion", "A sleek high-tech skyscraper", "A hidden forest bunker"], 0], ["What motivates you most?", ["Power and control", "Revenge against those who wronged me", "Proving I'm smarter than everyone", "Pure chaos for its own sake"], 0]],
    r: [[0, 2, "Misunderstood Antihero", "You're more reluctant rebel than true villain — circumstances pushed you here. You have a code, even if others don't see it."], [3, 4, "Calculated Schemer", "Cold, strategic, and always three steps ahead. You don't lose your temper — you lose your enemies."], [5, 5, "Iconic Villain", "You're the stuff of nightmares and legend. Dramatic, theatrical, and utterly unforgettable. The world is your stage."]]
  }, {
    id: 92,
    title: "Can You Complete These Famous Movie Quotes?",
    cat: "movies",
    img: "/playbuzz-assets/32.jpg",
    q: [["'You can't handle the ___!' (A Few Good Men, 1992)", ["Truth", "Pressure", "Facts", "Reality"], 0], ["'Here's looking at you, ___.' (Casablanca, 1942)", ["Kid", "Darling", "Baby", "Dear"], 0], ["'May the Force be ___ you.' (Star Wars, 1977)", ["With", "Inside", "Upon", "Beside"], 0], ["'You had me at ___.' (Jerry Maguire, 1996)", ["Hello", "Goodbye", "Yes", "Please"], 0], ["'I'll be ___.' (The Terminator, 1984)", ["Back", "Gone", "Here", "Fine"], 0]],
    r: [[0, 2, "Quote Rookie", "You know the big ones, but Hollywood's vast library of lines still has a lot to offer you. Time to rewatch some classics!"], [3, 4, "Dialogue Devotee", "You clearly pay attention when the good lines land. You can hold your own at any movie trivia night."], [5, 5, "Quote Master", "Flawless. You could recite these in your sleep. Someone get this person a Hollywood walk of fame star."]]
  }, {
    id: 93,
    title: "Which Sci-Fi Universe Would You Live In?",
    cat: "movies",
    img: "/playbuzz-assets/33.jpg",
    q: [["Your ideal mode of transportation is:", ["A sleek starship", "A time machine", "A mech suit", "A teleporter"], 0], ["Which threat sounds most manageable to you?", ["An alien invasion", "A robot uprising", "A dystopian government", "A dimensional rift"], 0], ["In the Matrix, Neo is offered two pills. Which color pill does he take to learn the truth?", ["Red", "Blue", "Green", "White"], 0], ["What skill would you bring to a sci-fi world?", ["Engineering and tech", "Combat and strategy", "Diplomacy and leadership", "Science and medicine"], 0], ["Which sci-fi film won the Academy Award for Best Picture?", ["The Shape of Water", "Avatar", "Interstellar", "Gravity"], 0]],
    r: [[0, 2, "Earthbound Dreamer", "Sci-fi thrills you from the safety of your couch. The cosmos is fascinating — just maybe from a distance."], [3, 4, "Seasoned Explorer", "You've got the curiosity and the grit. You'd adapt quickly to life among the stars or in a digital world."], [5, 5, "Born for Another Galaxy", "You were built for a universe beyond this one. Visionary, bold, and ready for whatever strange new world awaits."]]
  }, {
    id: 94,
    title: "How Well Do You Know the Oscars?",
    cat: "movies",
    img: "/playbuzz-assets/34.jpg",
    q: [["Which film holds the record for most Academy Award wins with 11 Oscars?", ["Ben-Hur", "Titanic", "The Lord of the Rings: The Return of the King", "All of the above"], 3], ["Who was the first woman to win the Academy Award for Best Director?", ["Sofia Coppola", "Greta Gerwig", "Kathryn Bigelow", "Ava DuVernay"], 2], ["Which film won Best Picture at the 2020 Academy Awards?", ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"], 2], ["What year were the first Academy Awards held?", ["1929", "1932", "1939", "1925"], 0], ["Which actor has received the most Academy Award nominations for acting?", ["Meryl Streep", "Jack Nicholson", "Katharine Hepburn", "Spencer Tracy"], 0]],
    r: [[0, 2, "Casual Awards Watcher", "You tune in for the fashion and the speeches. No shame — that's half the fun anyway."], [3, 4, "Awards Season Enthusiast", "You follow the race closely and know your nominees. Oscar night is a proper event in your household."], [5, 5, "Academy Insider", "Impeccable. You could commentate the ceremony live. The Academy should be calling you."]]
  }, {
    id: 95,
    title: "Which Classic Film Era Suits Your Soul?",
    cat: "movies",
    img: "/playbuzz-assets/35.jpg",
    q: [["Your ideal Friday night looks like:", ["Black-and-white films with a glass of wine", "80s blockbusters and popcorn", "Indie cinema and deep discussion", "A sprawling 70s epic"], 0], ["In which decade was 'Singin' in the Rain' released?", ["1950s", "1940s", "1960s", "1930s"], 0], ["Which film style do you find most appealing?", ["Glamorous old Hollywood", "Gritty New Wave realism", "Colorful musicals", "Minimalist art-house"], 0], ["Your fashion sense is best described as:", ["Timeless and elegant", "Casual and comfortable", "Eclectic and bold", "Understated chic"], 0], ["What do you value most in a film?", ["A perfectly crafted script", "Stunning visual effects", "Emotional performances", "Groundbreaking direction"], 0]],
    r: [[0, 2, "Modern Multiplex Lover", "Your heart belongs to the present. New releases, latest tech, and the biggest screens — that's your cinema."], [3, 4, "Golden Age Admirer", "You appreciate where film came from. You can spot a Hitchcock tension-builder or a screwball comedy setup."], [5, 5, "Old Hollywood Royalty", "Glamour, wit, and grace define your cinematic soul. You belong in a velvet-curtained screening room."]]
  }, {
    id: 96,
    title: "Can You Name the Movie From One Screenshot Clue?",
    cat: "movies",
    img: "/playbuzz-assets/36.jpg",
    q: [["A chess set, a mysterious island, and a game played against Death — which Ingmar Bergman film is this?", ["The Seventh Seal", "Wild Strawberries", "Persona", "Cries and Whispers"], 0], ["A red coat stands out in a black-and-white scene of chaos — which Spielberg film features this iconic image?", ["Schindler's List", "Saving Private Ryan", "Empire of the Sun", "Munich"], 0], ["Which film features a character spinning a top to test if they're in a dream?", ["Inception", "The Matrix", "Eternal Sunshine of the Spotless Mind", "Interstellar"], 0], ["A pair of ruby slippers clicking together three times — what film?", ["The Wizard of Oz", "Cinderella", "Snow White", "Sleeping Beauty"], 0], ["A shower curtain silhouette and a screeching violin — which Hitchcock film?", ["Psycho", "The Birds", "Rear Window", "Vertigo"], 0]],
    r: [[0, 2, "Moviegoer", "You know the modern hits but classic cinema still has surprises in store. A great excuse to explore more films!"], [3, 4, "Cinephile in Training", "Strong visual memory and a solid film library in your head. You'd crush a movie poster round at pub quiz."], [5, 5, "Film Archive", "You don't just watch movies — you absorb them. Every frame, every detail. A true visual encyclopedia."]]
  }, {
    id: 97,
    title: "Which Pixar Character Are You?",
    cat: "movies",
    img: "/playbuzz-assets/37.jpg",
    q: [["When faced with a big challenge, you:", ["Dive in headfirst with pure enthusiasm", "Make a detailed plan before acting", "Lean on your friends for support", "Try to find the humor in it"], 0], ["Which Pixar film features the Latin Day of the Dead celebration?", ["Coco", "Soul", "Encanto", "Turning Red"], 0], ["Your friends would describe you as:", ["The adventurous one", "The creative dreamer", "The loyal supporter", "The funny one"], 0], ["What do you care most about?", ["Family and belonging", "Following your passion", "Protecting those you love", "Experiencing everything life offers"], 0], ["In Toy Story, what is the name of the young boy who owns Woody and Buzz?", ["Andy", "Sid", "Rex", "Bonnie"], 0]],
    r: [[0, 2, "Dory", "You live in the moment, full of warmth and good intentions. Just keep swimming — you'll find your way."], [3, 4, "Woody", "Loyal, dependable, and a natural leader. You take responsibility seriously but always make time for the people you love."], [5, 5, "Wall-E", "Curious, earnest, and quietly extraordinary. You see wonder in everything and inspire others just by being yourself."]]
  }, {
    id: 98,
    title: "Which Movie Director Matches Your Vision?",
    cat: "movies",
    img: "/playbuzz-assets/38.jpg",
    q: [["Your storytelling style is:", ["Slow-burn tension with precise framing", "Sprawling epics with emotional depth", "Fast-paced, stylized, and referential", "Dark, surreal, and deeply psychological"], 0], ["Which director is known for the 'Dogme 95' filmmaking movement?", ["Lars von Trier", "Werner Herzog", "Andrei Tarkovsky", "Jean-Luc Godard"], 0], ["What matters most in a film you make?", ["Visual symmetry and control", "Character psychology", "Pure entertainment", "Social commentary"], 0], ["Your film would most likely be shot:", ["On a studio backlot with total control", "On location in remote landscapes", "In a gritty urban setting", "In a dreamlike constructed world"], 0], ["Which director won an Oscar for 'The Revenant' in 2016?", ["Alejandro González Iñárritu", "Ridley Scott", "George Miller", "Adam McKay"], 0]],
    r: [[0, 2, "Aspiring Auteur", "You have a voice — it just needs time to develop. Every great director started somewhere. Start shooting."], [3, 4, "Indie Visionary", "You have strong instincts and a clear aesthetic. Your films would get critical buzz and loyal festival audiences."], [5, 5, "Master Filmmaker", "Visionary, disciplined, and wholly original. Your name belongs in the conversation with the all-time greats."]]
  }, {
    id: 99,
    title: "Horror Movie Survival Quiz: Would You Make It?",
    cat: "movies",
    img: "/playbuzz-assets/39.jpg",
    q: [["You hear a strange noise in the basement at 2am. You:", ["Stay in bed and pull the covers up", "Call out 'Hello?' from the top of the stairs", "Grab a weapon and go check", "Wake up your housemates first"], 3], ["In 'Halloween' (1978), what is the name of the killer?", ["Michael Myers", "Jason Voorhees", "Freddy Krueger", "Leatherface"], 0], ["The power goes out in your isolated cabin. You:", ["Wait calmly and find a flashlight", "Immediately try to leave", "Search the fuse box alone in the dark", "Panic and split up from your group"], 0], ["Which 1980 horror film features the Overlook Hotel?", ["The Shining", "The Amityville Horror", "Poltergeist", "Carrie"], 0], ["Your group wants to split up to cover more ground. You:", ["Refuse and insist everyone sticks together", "Agree — it seems logical", "Go alone to prove you're brave", "Volunteer to check the creepy attic"], 0]],
    r: [[0, 2, "First Victim", "You mean well, but you'd be the opening scene. Horror movies exist to warn people like you. We'll miss you."], [3, 4, "Likely Survivor", "You make mostly smart calls under pressure. You might get a scare or two, but you'd probably see the credits."], [5, 5, "Final Girl (or Guy)", "Ice in your veins and good instincts. You don't just survive horror movies — you outwit them. The monster should be afraid."]]
  }
];

export const quizzesData = rawQuizzesData.map(normalizeQuiz);

export const articlesData = quizzesData.map((quiz) => ({
  id: quiz.id,
  title: quiz.title,
  author: quiz.author,
  image: quiz.cardImage,
  plays: quiz.plays,
  category: quiz.category,
  showInFeatured: quiz.showInFeatured ?? true,
  showInPopular: quiz.showInPopular ?? true
}));

export const trendingData = quizzesData
  .filter((quiz) => quiz.trending)
  .map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    author: quiz.author,
    image: quiz.cardImage
  }));

export const quizById = quizzesData.reduce((acc, quiz) => {
  acc[quiz.id] = quiz;
  return acc;
}, {});
