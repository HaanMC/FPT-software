import { QuizData, Achievement, Flashcard } from './types';

// Available subjects for focus sessions
export const SUBJECTS = ['Math', 'English', 'Physics', 'History', 'Custom'];

// Focus tips shown during timer sessions
export const FOCUS_TIPS = [
  "Turn off phone notifications.",
  "Keep water nearby.",
  "Focus on one thing at a time.",
  "Take deep breaths during breaks.",
  "Visualize the completed task.",
  "Break large tasks into smaller chunks.",
  "Set a clear intention for this session.",
  "Eliminate visual distractions.",
  "Stay curious about what you're learning."
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_session', title: 'First Steps', description: 'Complete your first focus session', rewardCoins: 50, condition: (d) => d.history.some(h => h.type === 'focus') },
  { id: 'quiz_master', title: 'Quiz Whiz', description: 'Score 100% on a quiz', rewardCoins: 100, condition: (d) => d.history.some(h => h.type === 'quiz' && h.score === 100) },
  { id: 'marathon', title: 'Focus Marathon', description: 'Reach 100 total focus minutes', rewardCoins: 200, condition: (d) => d.history.filter(h => h.type === 'focus').reduce((acc, curr) => acc + (curr.durationSeconds/60), 0) >= 100 },
  { id: 'collector', title: 'Collector', description: 'Buy an item from the shop', rewardCoins: 50, condition: (d) => d.profile.inventory.length > 1 },
];

export const SHOP_ITEMS = [
  { id: 'theme:navy', name: 'Navy Theme', cost: 150, type: 'theme' },
  { id: 'theme:forest', name: 'Forest Theme', cost: 150, type: 'theme' },
  { id: 'theme:dark', name: 'Dark Mode', cost: 200, type: 'theme' },
  { id: 'item:freeze', name: 'Streak Freeze', cost: 300, type: 'consumable' },
  { id: 'item:hint', name: 'Hint Token', cost: 50, type: 'consumable' },
];

// Comprehensive fallback question bank (20+ questions per subject)
// Used when Gemini API fails or returns invalid JSON
export const FALLBACK_QUIZZES: Record<string, QuizData> = {
  'Math': {
    title: "Math Quiz (Offline)",
    questions: [
      { q: "What is 15 + 27?", choices: { A: "42", B: "43", C: "41", D: "44" }, answer: "A", explanation: "15 + 27 = 42" },
      { q: "What is 8 × 7?", choices: { A: "54", B: "56", C: "58", D: "49" }, answer: "B", explanation: "8 × 7 = 56" },
      { q: "What is the square root of 81?", choices: { A: "8", B: "7", C: "9", D: "10" }, answer: "C", explanation: "√81 = 9 because 9 × 9 = 81" },
      { q: "What is 100 ÷ 4?", choices: { A: "20", B: "25", C: "30", D: "15" }, answer: "B", explanation: "100 ÷ 4 = 25" },
      { q: "What is 3² + 4²?", choices: { A: "25", B: "12", C: "7", D: "49" }, answer: "A", explanation: "3² + 4² = 9 + 16 = 25" },
      { q: "What is 50% of 80?", choices: { A: "30", B: "40", C: "45", D: "35" }, answer: "B", explanation: "50% of 80 = 0.5 × 80 = 40" },
      { q: "What is the perimeter of a square with side 5?", choices: { A: "15", B: "25", C: "20", D: "10" }, answer: "C", explanation: "Perimeter = 4 × side = 4 × 5 = 20" },
      { q: "What is 12 - (-5)?", choices: { A: "7", B: "17", C: "-7", D: "12" }, answer: "B", explanation: "12 - (-5) = 12 + 5 = 17" },
      { q: "What is 2⁴?", choices: { A: "8", B: "12", C: "16", D: "32" }, answer: "C", explanation: "2⁴ = 2 × 2 × 2 × 2 = 16" },
      { q: "If x + 5 = 12, what is x?", choices: { A: "5", B: "6", C: "7", D: "17" }, answer: "C", explanation: "x = 12 - 5 = 7" },
      { q: "What is the area of a rectangle 6×4?", choices: { A: "20", B: "24", C: "10", D: "28" }, answer: "B", explanation: "Area = length × width = 6 × 4 = 24" },
      { q: "What is 1/4 + 1/4?", choices: { A: "1/8", B: "1/2", C: "2/4", D: "1" }, answer: "B", explanation: "1/4 + 1/4 = 2/4 = 1/2" },
      { q: "What is 0.5 × 0.5?", choices: { A: "0.25", B: "1", C: "0.5", D: "2.5" }, answer: "A", explanation: "0.5 × 0.5 = 0.25" },
      { q: "How many degrees in a right angle?", choices: { A: "45", B: "180", C: "90", D: "360" }, answer: "C", explanation: "A right angle is exactly 90 degrees" },
      { q: "What is the next prime after 7?", choices: { A: "9", B: "11", C: "8", D: "10" }, answer: "B", explanation: "11 is prime; 8, 9, 10 are not" },
      { q: "What is 144 ÷ 12?", choices: { A: "11", B: "13", C: "12", D: "14" }, answer: "C", explanation: "144 ÷ 12 = 12" },
      { q: "What is 25% of 200?", choices: { A: "25", B: "50", C: "75", D: "100" }, answer: "B", explanation: "25% of 200 = 0.25 × 200 = 50" },
      { q: "What is |-7|?", choices: { A: "-7", B: "0", C: "7", D: "14" }, answer: "C", explanation: "Absolute value of -7 is 7" },
      { q: "What is 5! (5 factorial)?", choices: { A: "25", B: "60", C: "120", D: "720" }, answer: "C", explanation: "5! = 5×4×3×2×1 = 120" },
      { q: "What is the GCD of 12 and 18?", choices: { A: "3", B: "6", C: "9", D: "12" }, answer: "B", explanation: "Greatest common divisor of 12 and 18 is 6" }
    ]
  },
  'English': {
    title: "English Quiz (Offline)",
    questions: [
      { q: "Which word is a noun?", choices: { A: "Run", B: "Beautiful", C: "Library", D: "Quickly" }, answer: "C", explanation: "Library is a noun (a place)" },
      { q: "What is the plural of 'child'?", choices: { A: "Childs", B: "Children", C: "Childes", D: "Child" }, answer: "B", explanation: "The irregular plural of child is children" },
      { q: "Which is the correct spelling?", choices: { A: "Recieve", B: "Receive", C: "Receeve", D: "Recive" }, answer: "B", explanation: "Receive follows 'i before e except after c'" },
      { q: "What is a synonym for 'happy'?", choices: { A: "Sad", B: "Joyful", C: "Angry", D: "Tired" }, answer: "B", explanation: "Joyful means the same as happy" },
      { q: "Which word is an adjective?", choices: { A: "Run", B: "Quickly", C: "Beautiful", D: "House" }, answer: "C", explanation: "Beautiful describes a noun (adjective)" },
      { q: "What is the past tense of 'go'?", choices: { A: "Goed", B: "Gone", C: "Went", D: "Going" }, answer: "C", explanation: "Went is the irregular past tense of go" },
      { q: "Which sentence is correct?", choices: { A: "She don't like it", B: "She doesn't like it", C: "She not like it", D: "She no like it" }, answer: "B", explanation: "Third person singular uses 'doesn't'" },
      { q: "What is an antonym for 'hot'?", choices: { A: "Warm", B: "Cold", C: "Burning", D: "Heated" }, answer: "B", explanation: "Cold is the opposite of hot" },
      { q: "Which is a compound word?", choices: { A: "Running", B: "Sunshine", C: "Beautiful", D: "Quickly" }, answer: "B", explanation: "Sunshine = sun + shine" },
      { q: "What punctuation ends a question?", choices: { A: "Period", B: "Exclamation", C: "Question mark", D: "Comma" }, answer: "C", explanation: "Questions end with a question mark (?)" },
      { q: "Which word is a verb?", choices: { A: "Table", B: "Happy", C: "Dance", D: "Green" }, answer: "C", explanation: "Dance is an action word (verb)" },
      { q: "What is the contraction of 'cannot'?", choices: { A: "Can't", B: "Cant", C: "Cann't", D: "Ca'nt" }, answer: "A", explanation: "Can't is the contraction of cannot" },
      { q: "Which is a proper noun?", choices: { A: "city", B: "London", C: "river", D: "book" }, answer: "B", explanation: "London is a specific place (proper noun)" },
      { q: "What is the comparative of 'good'?", choices: { A: "Gooder", B: "More good", C: "Better", D: "Best" }, answer: "C", explanation: "Better is the irregular comparative of good" },
      { q: "Which sentence uses correct capitalization?", choices: { A: "i love Summer.", B: "I love summer.", C: "i Love Summer.", D: "I Love Summer." }, answer: "B", explanation: "'I' is always capitalized; seasons are not" },
      { q: "What type of word is 'quickly'?", choices: { A: "Noun", B: "Verb", C: "Adverb", D: "Adjective" }, answer: "C", explanation: "Quickly modifies a verb (adverb)" },
      { q: "Which is the correct plural of 'mouse'?", choices: { A: "Mouses", B: "Mice", C: "Mouse", D: "Mousies" }, answer: "B", explanation: "Mice is the irregular plural of mouse" },
      { q: "What does a period indicate?", choices: { A: "Question", B: "Excitement", C: "End of sentence", D: "Pause" }, answer: "C", explanation: "A period ends a declarative sentence" },
      { q: "Which is a preposition?", choices: { A: "Jump", B: "Under", C: "Happy", D: "Quickly" }, answer: "B", explanation: "Under shows position/relationship (preposition)" },
      { q: "What is the superlative of 'tall'?", choices: { A: "Taller", B: "More tall", C: "Tallest", D: "Most tall" }, answer: "C", explanation: "Tallest is the superlative form of tall" }
    ]
  },
  'Physics': {
    title: "Physics Quiz (Offline)",
    questions: [
      { q: "What is the SI unit of force?", choices: { A: "Joule", B: "Watt", C: "Newton", D: "Pascal" }, answer: "C", explanation: "Force is measured in Newtons (N)" },
      { q: "What is the speed of light (approx)?", choices: { A: "300,000 km/s", B: "150,000 km/s", C: "1,000 km/s", D: "30,000 km/s" }, answer: "A", explanation: "Light travels at approximately 300,000 km/s" },
      { q: "What does F=ma represent?", choices: { A: "Energy equation", B: "Newton's Second Law", C: "Ohm's Law", D: "Power formula" }, answer: "B", explanation: "F=ma is Newton's Second Law of Motion" },
      { q: "What is the unit of energy?", choices: { A: "Newton", B: "Watt", C: "Joule", D: "Ampere" }, answer: "C", explanation: "Energy is measured in Joules (J)" },
      { q: "What type of energy does a moving car have?", choices: { A: "Potential", B: "Kinetic", C: "Thermal", D: "Chemical" }, answer: "B", explanation: "Moving objects have kinetic energy" },
      { q: "What is the formula for velocity?", choices: { A: "v = d/t", B: "v = d×t", C: "v = t/d", D: "v = d+t" }, answer: "A", explanation: "Velocity = distance ÷ time" },
      { q: "What force pulls objects toward Earth?", choices: { A: "Friction", B: "Magnetism", C: "Gravity", D: "Tension" }, answer: "C", explanation: "Gravity pulls objects toward Earth's center" },
      { q: "What is the unit of electric current?", choices: { A: "Volt", B: "Ohm", C: "Watt", D: "Ampere" }, answer: "D", explanation: "Electric current is measured in Amperes (A)" },
      { q: "What does a prism do to white light?", choices: { A: "Absorbs it", B: "Reflects it", C: "Disperses it", D: "Blocks it" }, answer: "C", explanation: "A prism disperses white light into spectrum colors" },
      { q: "What is the acceleration due to gravity?", choices: { A: "9.8 m/s²", B: "10.5 m/s²", C: "8.5 m/s²", D: "11 m/s²" }, answer: "A", explanation: "Earth's gravitational acceleration is ~9.8 m/s²" },
      { q: "Which is a good conductor of electricity?", choices: { A: "Wood", B: "Copper", C: "Rubber", D: "Glass" }, answer: "B", explanation: "Copper is an excellent electrical conductor" },
      { q: "What is the unit of power?", choices: { A: "Joule", B: "Newton", C: "Watt", D: "Ohm" }, answer: "C", explanation: "Power is measured in Watts (W)" },
      { q: "What does V=IR represent?", choices: { A: "Newton's Law", B: "Ohm's Law", C: "Hooke's Law", D: "Pascal's Law" }, answer: "B", explanation: "V=IR is Ohm's Law (Voltage = Current × Resistance)" },
      { q: "What type of wave is sound?", choices: { A: "Transverse", B: "Electromagnetic", C: "Longitudinal", D: "Radio" }, answer: "C", explanation: "Sound is a longitudinal (compression) wave" },
      { q: "What is the boiling point of water (°C)?", choices: { A: "90°C", B: "100°C", C: "110°C", D: "212°C" }, answer: "B", explanation: "Water boils at 100°C at standard pressure" },
      { q: "What is potential energy?", choices: { A: "Energy of motion", B: "Stored energy", C: "Heat energy", D: "Sound energy" }, answer: "B", explanation: "Potential energy is stored energy due to position" },
      { q: "What is the unit of frequency?", choices: { A: "Seconds", B: "Meters", C: "Hertz", D: "Decibels" }, answer: "C", explanation: "Frequency is measured in Hertz (Hz)" },
      { q: "What lens converges light?", choices: { A: "Concave", B: "Convex", C: "Flat", D: "Opaque" }, answer: "B", explanation: "Convex (converging) lenses focus light to a point" },
      { q: "What is Newton's Third Law?", choices: { A: "F=ma", B: "Every action has equal opposite reaction", C: "Objects at rest stay at rest", D: "Energy is conserved" }, answer: "B", explanation: "Third Law: Action-reaction pairs are equal and opposite" },
      { q: "What is absolute zero in Celsius?", choices: { A: "0°C", B: "-100°C", C: "-273°C", D: "-373°C" }, answer: "C", explanation: "Absolute zero is approximately -273.15°C" }
    ]
  },
  'History': {
    title: "History Quiz (Offline)",
    questions: [
      { q: "In what year did World War II end?", choices: { A: "1943", B: "1944", C: "1945", D: "1946" }, answer: "C", explanation: "WWII ended in 1945 with Japan's surrender" },
      { q: "Who was the first US President?", choices: { A: "Jefferson", B: "Lincoln", C: "Washington", D: "Adams" }, answer: "C", explanation: "George Washington was the first US President (1789-1797)" },
      { q: "What empire built the Colosseum?", choices: { A: "Greek", B: "Roman", C: "Egyptian", D: "Persian" }, answer: "B", explanation: "The Romans built the Colosseum in 70-80 AD" },
      { q: "When was the Declaration of Independence signed?", choices: { A: "1774", B: "1775", C: "1776", D: "1777" }, answer: "C", explanation: "The Declaration was signed on July 4, 1776" },
      { q: "Who discovered America in 1492?", choices: { A: "Magellan", B: "Columbus", C: "Vespucci", D: "Cabot" }, answer: "B", explanation: "Christopher Columbus reached the Americas in 1492" },
      { q: "What ancient wonder was in Egypt?", choices: { A: "Hanging Gardens", B: "Colossus", C: "Great Pyramid", D: "Lighthouse" }, answer: "C", explanation: "The Great Pyramid of Giza is in Egypt" },
      { q: "When did the French Revolution begin?", choices: { A: "1776", B: "1789", C: "1799", D: "1804" }, answer: "B", explanation: "The French Revolution began in 1789" },
      { q: "Who wrote the Communist Manifesto?", choices: { A: "Lenin", B: "Stalin", C: "Marx", D: "Engels" }, answer: "C", explanation: "Karl Marx (with Engels) wrote the Communist Manifesto" },
      { q: "What wall fell in 1989?", choices: { A: "Great Wall", B: "Berlin Wall", C: "Hadrian's Wall", D: "Wall Street" }, answer: "B", explanation: "The Berlin Wall fell on November 9, 1989" },
      { q: "Who was the first man on the Moon?", choices: { A: "Buzz Aldrin", B: "Neil Armstrong", C: "John Glenn", D: "Yuri Gagarin" }, answer: "B", explanation: "Neil Armstrong walked on the Moon on July 20, 1969" },
      { q: "What empire was ruled by Pharaohs?", choices: { A: "Roman", B: "Greek", C: "Egyptian", D: "Persian" }, answer: "C", explanation: "Pharaohs were rulers of Ancient Egypt" },
      { q: "When did WWI begin?", choices: { A: "1912", B: "1913", C: "1914", D: "1915" }, answer: "C", explanation: "World War I began in July 1914" },
      { q: "Who painted the Mona Lisa?", choices: { A: "Michelangelo", B: "Raphael", C: "Da Vinci", D: "Botticelli" }, answer: "C", explanation: "Leonardo da Vinci painted the Mona Lisa" },
      { q: "What was the Renaissance?", choices: { A: "War", B: "Disease", C: "Cultural rebirth", D: "Empire" }, answer: "C", explanation: "The Renaissance was a cultural and intellectual rebirth" },
      { q: "Who was known as the 'Iron Lady'?", choices: { A: "Queen Victoria", B: "Margaret Thatcher", C: "Angela Merkel", D: "Indira Gandhi" }, answer: "B", explanation: "Margaret Thatcher was nicknamed the Iron Lady" },
      { q: "What civilization built Machu Picchu?", choices: { A: "Aztec", B: "Maya", C: "Inca", D: "Olmec" }, answer: "C", explanation: "The Incas built Machu Picchu in Peru" },
      { q: "When was the Magna Carta signed?", choices: { A: "1066", B: "1215", C: "1415", D: "1515" }, answer: "B", explanation: "The Magna Carta was signed in 1215" },
      { q: "Who led India's independence movement?", choices: { A: "Nehru", B: "Gandhi", C: "Patel", D: "Bose" }, answer: "B", explanation: "Mahatma Gandhi led India's nonviolent independence movement" },
      { q: "What year did the Titanic sink?", choices: { A: "1910", B: "1911", C: "1912", D: "1913" }, answer: "C", explanation: "The Titanic sank on April 15, 1912" },
      { q: "Who invented the printing press?", choices: { A: "Newton", B: "Gutenberg", C: "Edison", D: "Franklin" }, answer: "B", explanation: "Johannes Gutenberg invented the printing press around 1440" }
    ]
  },
  'Custom': {
    title: "General Knowledge Quiz (Offline)",
    questions: [
      { q: "What is the largest planet in our solar system?", choices: { A: "Saturn", B: "Jupiter", C: "Neptune", D: "Uranus" }, answer: "B", explanation: "Jupiter is the largest planet" },
      { q: "What is H2O commonly known as?", choices: { A: "Salt", B: "Sugar", C: "Water", D: "Acid" }, answer: "C", explanation: "H2O is the chemical formula for water" },
      { q: "How many continents are there?", choices: { A: "5", B: "6", C: "7", D: "8" }, answer: "C", explanation: "There are 7 continents on Earth" },
      { q: "What is the capital of Japan?", choices: { A: "Kyoto", B: "Osaka", C: "Tokyo", D: "Nagoya" }, answer: "C", explanation: "Tokyo is Japan's capital city" },
      { q: "What organ pumps blood in the body?", choices: { A: "Brain", B: "Lungs", C: "Liver", D: "Heart" }, answer: "D", explanation: "The heart pumps blood throughout the body" },
      { q: "What is the largest ocean?", choices: { A: "Atlantic", B: "Indian", C: "Pacific", D: "Arctic" }, answer: "C", explanation: "The Pacific Ocean is the largest ocean" },
      { q: "What gas do plants absorb?", choices: { A: "Oxygen", B: "Nitrogen", C: "Carbon dioxide", D: "Hydrogen" }, answer: "C", explanation: "Plants absorb CO2 for photosynthesis" },
      { q: "How many days are in a leap year?", choices: { A: "364", B: "365", C: "366", D: "367" }, answer: "C", explanation: "Leap years have 366 days (Feb 29)" },
      { q: "What is the hardest natural substance?", choices: { A: "Gold", B: "Iron", C: "Diamond", D: "Platinum" }, answer: "C", explanation: "Diamond is the hardest natural substance" },
      { q: "What is the largest mammal?", choices: { A: "Elephant", B: "Blue Whale", C: "Giraffe", D: "Hippopotamus" }, answer: "B", explanation: "The blue whale is the largest mammal" },
      { q: "What planet is known as the Red Planet?", choices: { A: "Venus", B: "Mars", C: "Jupiter", D: "Mercury" }, answer: "B", explanation: "Mars is called the Red Planet due to iron oxide" },
      { q: "What is the smallest country in the world?", choices: { A: "Monaco", B: "San Marino", C: "Vatican City", D: "Liechtenstein" }, answer: "C", explanation: "Vatican City is the smallest country" },
      { q: "How many bones are in the adult human body?", choices: { A: "186", B: "206", C: "226", D: "246" }, answer: "B", explanation: "Adult humans have 206 bones" },
      { q: "What is the chemical symbol for gold?", choices: { A: "Go", B: "Gd", C: "Au", D: "Ag" }, answer: "C", explanation: "Au (from Latin 'aurum') is gold's symbol" },
      { q: "What is the longest river in the world?", choices: { A: "Amazon", B: "Mississippi", C: "Nile", D: "Yangtze" }, answer: "C", explanation: "The Nile is the longest river at ~6,650 km" },
      { q: "What is the main language spoken in Brazil?", choices: { A: "Spanish", B: "Portuguese", C: "English", D: "French" }, answer: "B", explanation: "Portuguese is Brazil's official language" },
      { q: "How many colors are in a rainbow?", choices: { A: "5", B: "6", C: "7", D: "8" }, answer: "C", explanation: "Rainbows have 7 colors: ROYGBIV" },
      { q: "What is the freezing point of water in Fahrenheit?", choices: { A: "0°F", B: "32°F", C: "100°F", D: "212°F" }, answer: "B", explanation: "Water freezes at 32°F (0°C)" },
      { q: "What is the currency of the UK?", choices: { A: "Euro", B: "Dollar", C: "Pound", D: "Franc" }, answer: "C", explanation: "The British Pound Sterling is the UK currency" },
      { q: "What percentage of Earth is covered by water?", choices: { A: "51%", B: "61%", C: "71%", D: "81%" }, answer: "C", explanation: "About 71% of Earth's surface is water" }
    ]
  },
  'General': {
    title: "General Knowledge (Offline)",
    questions: [
      { q: "What is the capital of France?", choices: { A: "London", B: "Berlin", C: "Paris", D: "Madrid" }, answer: "C", explanation: "Paris is the capital of France." },
      { q: "2 + 2 = ?", choices: { A: "3", B: "4", C: "5", D: "6" }, answer: "B", explanation: "Basic math: 2 + 2 = 4" },
      { q: "What color is the sky on a clear day?", choices: { A: "Green", B: "Red", C: "Blue", D: "Yellow" }, answer: "C", explanation: "The sky appears blue due to light scattering" },
      { q: "How many days in a week?", choices: { A: "5", B: "6", C: "7", D: "8" }, answer: "C", explanation: "A week has 7 days" },
      { q: "What animal is known as man's best friend?", choices: { A: "Cat", B: "Dog", C: "Bird", D: "Fish" }, answer: "B", explanation: "Dogs are commonly called man's best friend" },
      { q: "What is 10 × 10?", choices: { A: "10", B: "20", C: "100", D: "1000" }, answer: "C", explanation: "10 × 10 = 100" },
      { q: "What season comes after summer?", choices: { A: "Spring", B: "Winter", C: "Fall/Autumn", D: "Monsoon" }, answer: "C", explanation: "Autumn/Fall follows summer" },
      { q: "How many months have 31 days?", choices: { A: "5", B: "6", C: "7", D: "8" }, answer: "C", explanation: "7 months have 31 days" },
      { q: "What is frozen water called?", choices: { A: "Steam", B: "Ice", C: "Fog", D: "Rain" }, answer: "B", explanation: "Frozen water is called ice" },
      { q: "What shape has 4 equal sides?", choices: { A: "Triangle", B: "Circle", C: "Square", D: "Rectangle" }, answer: "C", explanation: "A square has 4 equal sides" }
    ]
  }
};

export const FALLBACK_FLASHCARDS: Partial<Flashcard>[] = [
  { front: "Photosynthesis", back: "Process by which plants make food using sunlight." },
  { front: "Mitochondria", back: "Powerhouse of the cell." },
  { front: "Pythagorean Theorem", back: "a² + b² = c²" }
];
