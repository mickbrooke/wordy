import { WordValidationResult } from "../types.ts";
import { COMMON_WORDS } from "./commonWords.ts";

// Common words classified by length
export const FOUR_LETTER_WORDS: string[] = COMMON_WORDS.filter(w => w.length === 4);
export const FIVE_LETTER_WORDS: string[] = COMMON_WORDS.filter(w => w.length === 5);
export const SIX_LETTER_WORDS: string[] = COMMON_WORDS.filter(w => w.length === 6);
export const SEVEN_LETTER_WORDS: string[] = COMMON_WORDS.filter(w => w.length === 7);
export const EIGHT_PLUS_LETTER_WORDS: string[] = COMMON_WORDS.filter(w => w.length >= 8);

export const WORD_DEFINITIONS: Record<string, string> = {
  "ABLE": "Having the power, skill, or means to do something.",
  "ACID": "A chemical substance with a pH below 7, tasting sour.",
  "ACRE": "A unit of land area equal to 4,840 square yards.",
  "ACTS": "Things done or performed, or segments of a theatrical performance.",
  "AIDE": "An assistant to an important person, especially a political or military leader.",
  "ALOE": "A succulent plant known for soothing gel in its thick leaves.",
  "APEX": "The top or highest part of something, especially one forming a point.",
  "ARCH": "A curved symmetrical structure spanning an opening.",
  "AREA": "A region or part of a town, country, or the world.",
  "ARMY": "An organized military force equipped for fighting on land.",
  "ATOM": "The basic unit of a chemical element.",
  "AURA": "The distinctive atmosphere or quality that surrounds someone or something.",
  "AUTO": "Short for automobile or automatic.",
  "AWAY": "At or to a distance from a particular place, person, or time.",
  "AXIS": "An imaginary line about which a body rotates.",
  "BABY": "A very young child or infant.",
  "BACK": "The rear surface of the human body, or in the direction of the rear.",
  "BAKE": "Cook food by dry heat without direct exposure to flame.",
  "BALL": "A spherical object used in games and sports.",
  "BAND": "A group of people having a common purpose, or a musical group.",
  "BANK": "A financial institution, or the land alongside a body of water.",
  "BARN": "A large farm building used for storing grain, hay, or livestock.",
  "BEAK": "A bird's horny projecting jaws; a bill.",
  "BEAM": "A long, sturdy piece of timber or metal, or a concentrated ray of light.",
  "BEAR": "A large, heavy mammal with thick fur, or to carry or endure.",
  "BEAT": "Strike repeatedly, or defeat someone in a game or competition.",
  "BIRD": "A warm-blooded feathered vertebrate with wings and beaks.",
  "BLUE": "The primary color between green and violet in the visible spectrum.",
  "BOAT": "A small vessel propelled on water by oars, sails, or an engine.",
  "BOLD": "Showing an ability to take risks; confident and courageous.",
  "BOND": "A strong connection between people, or a chemical link.",
  "BOOK": "A written or printed work consisting of bound pages.",
  "BOOT": "A sturdy footwear covering the foot and part of the leg.",
  "BOWL": "A round, deep dish or basin used for food or liquids.",
  "CALM": "Not showing or feeling nervousness, anger, or strong emotion.",
  "CAMP": "A place with temporary accommodations of tents or huts.",
  "CARD": "A piece of thick, stiff paper or thin pasteboard.",
  "CARE": "The provision of what is necessary for health, welfare, and safety.",
  "CASH": "Money in coins or notes, as distinct from credit cards or checks.",
  "CAST": "Cause light or shadow to appear, or register a vote, or throw.",
  "CHEF": "A professional cook, typically the chief cook in a restaurant.",
  "CITY": "A large human settlement with extensive urban systems.",
  "CLAY": "A stiff, sticky fine-grained earth that can be moulded when wet.",
  "CLEF": "A musical symbol indicating the pitch of written notes.",
  "CLUB": "An association or organization dedicated to a common interest.",
  "COAL": "A combustible black rock consisting mainly of carbonized matter.",
  "CODE": "A system of symbols used for communication or computer programming.",
  "COLD": "Of or at a low or relatively low temperature.",
  "COOK": "Prepare food by combining and heating ingredients.",
  "COOL": "Of or at a fairly low temperature, or attractively fashionable.",
  "CORN": "A cereal plant that yields large grains set in rows on a cob.",
  "CREW": "A group of people who work on and operate a ship, aircraft, or project.",
  "CUBE": "A symmetrical three-dimensional shape, either solid or hollow.",
  "DARK": "With little or no light; of a deep color.",
  "DAWN": "The first appearance of light in the sky before sunrise.",
  "DEEP": "Extending far down from the top or surface.",
  "DEER": "A hoofed grazing animal with antlers in males.",
  "DESK": "A piece of furniture with a flat top used for writing or working.",
  "DOOR": "A hinged or sliding barrier at the entrance of a building or room.",
  "DRAW": "Produce a picture or diagram by making lines, or pull something.",
  "DRUM": "A percussion instrument sounded by being struck with sticks or hands.",
  "DUST": "Fine, dry powder consisting of tiny particles of earth or waste matter.",
  "ECHO": "A sound caused by the reflection of sound waves from a surface.",
  "EDGE": "The outside limit of an object, area, or surface.",
  "EVEN": "Flat and smooth; divisible by two.",
  "EVIL": "Profoundly immoral and wicked.",
  "FACE": "The front part of a person's head from forehead to chin.",
  "FACT": "A thing that is known or proven to be true.",
  "FARM": "An area of land used for growing crops and rearing animals.",
  "FAST": "Moving or capable of moving at high speed.",
  "FEAR": "An unpleasant emotion caused by the threat of danger or harm.",
  "FIRE": "Combustion or burning, producing light, heat, and smoke.",
  "FISH": "A limbless cold-blooded aquatic animal with gills and fins.",
  "FLOW": "Move along or out steadily and continuously in a stream.",
  "FOOD": "Any nutritious substance consumed by living things.",
  "FREE": "Able to act at will; not constrained or cost-free.",
  "FROG": "A tailless amphibian with a short squat body and long hind legs.",
  "GAME": "An activity that one engages in for amusement or competition.",
  "GIFT": "A thing given willingly to someone without payment; a present.",
  "GIRL": "A female child or young woman.",
  "GLOW": "Give out steady light without flame.",
  "GOLD": "A yellow precious metal with atomic number 79.",
  "GRID": "A framework of spaced bars that are parallel to or cross each other.",
  "GROW": "Undergo natural development by increasing in size physically.",
  "HAND": "The end part of a person's arm beyond the wrist, including fingers.",
  "HEAD": "The upper part of the human body, containing the brain and sensory organs.",
  "HEAL": "Become sound or healthy again after an injury or illness.",
  "HEAT": "The quality of being hot; high thermal temperature.",
  "HERO": "A person admired for courage, outstanding achievements, or nobility.",
  "HILL": "A naturally raised area of land, not as high as a mountain.",
  "HOME": "The place where one lives permanently with affection.",
  "HOPE": "A feeling of expectation and desire for a certain thing to happen.",
  "HUNT": "Pursue and search determinedly for something.",
  "ICON": "A representative symbol or person worthy of high veneration.",
  "IDEA": "A thought or suggestion as to a possible course of action.",
  "IRON": "A strong, hard magnetic silvery-gray metal.",
  "JAZZ": "A genre of music originating in African-American communities.",
  "JOIN": "Link or connect two or more things together.",
  "JOKE": "A thing that someone says to cause amusement or laughter.",
  "JUMP": "Push oneself off a surface and into the air by using legs.",
  "KEEP": "Have or retain possession of something.",
  "KING": "The male ruler of an independent state, especially an inherited title.",
  "KITE": "A toy consisting of a light frame covered with thin material flown in wind.",
  "KNOW": "Be aware of through observation, inquiry, or information.",
  "LAKE": "A large body of water surrounded by land.",
  "LAND": "The part of the earth's surface that is not covered by water.",
  "LATE": "Taking place after the expected, proper, or usual time.",
  "LEAF": "A flattened structure of a plant, typically green and photosynthetic.",
  "LIFE": "The condition that distinguishes living organisms from inorganic matter.",
  "LINE": "A long, narrow mark or band.",
  "LION": "A large tawny-coloured wild cat that lives in prides.",
  "LOCK": "A mechanism for keeping a door or container fastened securely.",
  "LOVE": "An intense feeling of deep affection and care.",
  "LUCK": "Success or failure apparently brought by chance.",
  "MIND": "The faculty of consciousness and thought in a person.",
  "MOON": "The natural satellite of the earth, visible by reflected sunlight.",
  "MOVE": "Go in a specified direction or change spatial position.",
  "NEST": "A structure made by a bird for laying eggs and sheltering young.",
  "NEWS": "Newly received or noteworthy information about recent events.",
  "NICE": "Pleasant; agreeable; satisfactory.",
  "NODE": "A point at which lines or pathways intersect or branch.",
  "NOTE": "A brief record of facts, topics, or thoughts written down.",
  "OPEN": "Allowing access, passage, or view through empty space.",
  "PAGE": "One side of a sheet of paper in a book or document.",
  "PARK": "A large public green area in a town used for recreation.",
  "PATH": "A way or track laid down for walking.",
  "PEAK": "The pointed top of a mountain, or highest point of development.",
  "PLAY": "Engage in activity for enjoyment and recreation.",
  "POEM": "A piece of writing in verse characterized by rhythm and imagery.",
  "POOL": "A small area of still water, or an artificial swimming basin.",
  "QUAD": "A square courtyard or a quadrangle; four of something.",
  "QUIZ": "A test of knowledge, especially as an entertaining competition.",
  "RAIN": "Moisture condensed from the atmosphere that falls in drops.",
  "READ": "Look at and comprehend the meaning of written characters.",
  "REAL": "Actually existing as a thing or occurring in fact.",
  "RICE": "A cultivated grain that is a staple food across the world.",
  "ROAD": "A wide paved way leading from one destination to another.",
  "ROCK": "Solid mineral material forming part of the surface of the earth.",
  "ROSE": "A prickly shrub that typically bears fragrant, elegant flowers.",
  "SAFE": "Protected from or not exposed to danger or risk.",
  "SAIL": "A piece of fabric on a mast to catch wind and propel a vessel.",
  "SALT": "A white crystalline seasoning, sodium chloride, found in seawater.",
  "SAND": "Loose granular particles resulting from the erosion of rock.",
  "SEAL": "A device or substance used to fasten containers, or a marine mammal.",
  "SHIP": "A large boat for transporting people or goods across the sea.",
  "SHOW": "Allow or cause to be visible; display.",
  "SILK": "A fine, strong, lustrous fiber produced by silkworms.",
  "SING": "Make musical sounds with the voice.",
  "SNOW": "Atmospheric water vapor frozen into ice crystals falling in flakes.",
  "SONG": "A short poem or lyric set to music and sung.",
  "SOUL": "The spiritual or immaterial part of a human being.",
  "STAR": "A luminous point in the night sky; a celestial incandescent sphere.",
  "STAY": "Remain in the same place without departing.",
  "STEP": "An act of lifting and setting down the foot in walking.",
  "SWIM": "Propel the body through water using arms and legs.",
  "TALK": "Speak in order to give information or express thoughts.",
  "TEAM": "A group of people working together toward a common objective.",
  "TIME": "The indefinite continuous progression of existence and events.",
  "TREE": "A woody perennial plant with a single trunk and branches.",
  "TRIP": "A journey or excursion, especially for pleasure.",
  "TRUE": "In accordance with fact, reality, or accuracy.",
  "TUNE": "A melody, especially one that characterizes a musical piece.",
  "VIEW": "The ability to see something, or the scenic sight observed.",
  "WAIT": "Stay in place or delay action until a particular time or event.",
  "WALK": "Move at a regular pace on foot.",
  "WARM": "At a comfortable, moderate high temperature.",
  "WAVE": "A ridge or swell moving along the surface of water.",
  "WIND": "The natural movement of air across the earth's surface.",
  "WINE": "An alcoholic drink made from fermented grape juice.",
  "WISH": "Feel or express a strong desire or hope for something.",
  "WOOD": "The hard fibrous material making up the trunk and branches of trees.",
  "WORD": "A single distinct meaningful element of speech or writing.",
  "WORK": "Activity involving physical or mental effort to achieve a purpose.",
  "YARD": "A unit of length equal to 3 feet, or the ground surrounding a house.",
  "YEAR": "The time taken by the earth to make one orbit around the sun (365 days).",
  "ZEAL": "Great energy or enthusiasm in pursuit of a cause or objective.",
  "ZERO": "The numerical figure 0 representing nil or none.",
  "ZEST": "Great enthusiasm and energy, or the fragrant outer peel of citrus.",
  "ZONE": "An area or stretch of land having a distinct character or purpose.",
  "ZOOM": "Move or travel very quickly, or change magnification smoothly."
};

// Combined dictionary of common English words spanning 4 to 16 letters
export const ALL_DICTIONARY_WORDS: string[] = COMMON_WORDS;

// Fast lookup Set of all valid common 4-to-16-letter words
export const VALID_WORDS_SET = new Set<string>(COMMON_WORDS);

// Precomputed Prefix Set to allow DFS search pruning in O(1) time
export const PREFIX_SET = new Set<string>();
for (const word of VALID_WORDS_SET) {
  for (let i = 1; i <= word.length; i++) {
    PREFIX_SET.add(word.slice(0, i));
  }
}

/**
 * Check if any valid word begins with the given prefix
 * Used to immediately prune DFS branches in board solving
 */
export function hasWordWithPrefix(prefix: string): boolean {
  if (!prefix) return true;
  return PREFIX_SET.has(prefix.toUpperCase());
}

/**
 * Check if a word is in the common English words dictionary (4 to 16 letters)
 */
export function isValidWord(word: string): boolean {
  if (!word || word.length < 4 || word.length > 16) return false;
  return VALID_WORDS_SET.has(word.toUpperCase());
}

/**
 * Retrieve definition if available
 */
export function getWordDefinition(word: string): string | undefined {
  return WORD_DEFINITIONS[word.toUpperCase()];
}

/**
 * Word Validation Feature
 * Validates word length (4-16 chars), common English dictionary existence, and duplicate status
 */
export function validateWordSubmission(
  word: string,
  alreadyFoundWords: Set<string>
): WordValidationResult {
  const upper = (word || "").toUpperCase().trim();

  // Length check: words can be between 4 and 16 characters long
  if (upper.length < 4 || upper.length > 16) {
    return {
      isValid: false,
      word: upper,
      status: "INVALID_LENGTH",
      message: upper.length < 4
        ? `"${upper}" has only ${upper.length} letters. Words must be at least 4 letters.`
        : `"${upper}" has ${upper.length} letters. Words cannot exceed 16 letters.`,
    };
  }

  // Already found check
  if (alreadyFoundWords.has(upper)) {
    return {
      isValid: false,
      word: upper,
      status: "ALREADY_FOUND",
      message: `"${upper}" is already in your word list!`,
      definition: getWordDefinition(upper),
    };
  }

  // Common English word validation
  if (!VALID_WORDS_SET.has(upper)) {
    return {
      isValid: false,
      word: upper,
      status: "NOT_IN_DICTIONARY",
      message: `"${upper}" is not a recognized common English word.`,
    };
  }

  // Success — valid common words ALWAYS work and earn points!
  return {
    isValid: true,
    word: upper,
    status: "VALID",
    message: `Valid word! "${upper}" added to your list.`,
    definition: getWordDefinition(upper),
  };
}
