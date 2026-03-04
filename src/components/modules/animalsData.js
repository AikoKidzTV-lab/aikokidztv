const CATEGORY_STYLES = {
  Wild: [
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { bg: 'bg-lime-100', text: 'text-lime-800' },
  ],
  Farm: [
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { bg: 'bg-lime-100', text: 'text-lime-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
  ],
  Pet: [
    { bg: 'bg-sky-100', text: 'text-sky-800' },
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-violet-100', text: 'text-violet-800' },
  ],
  Bird: [
    { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    { bg: 'bg-slate-100', text: 'text-slate-800' },
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
  ],
  Ocean: [
    { bg: 'bg-blue-100', text: 'text-blue-900' },
    { bg: 'bg-cyan-100', text: 'text-cyan-900' },
    { bg: 'bg-sky-100', text: 'text-sky-900' },
    { bg: 'bg-indigo-100', text: 'text-indigo-900' },
  ],
  Bug: [
    { bg: 'bg-rose-100', text: 'text-rose-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
  ],
};

const CATEGORY_DEFAULT_EMOJI = {
  Wild: '\uD83D\uDC3E',
  Farm: '\uD83D\uDC2E',
  Pet: '\uD83D\uDC36',
  Bird: '\uD83D\uDC26',
  Ocean: '\uD83D\uDC20',
  Bug: '\uD83D\uDC1B',
};

const CATEGORY_NAME_EMOJI_RULES = {
  Wild: [
    { emoji: '\uD83E\uDD81', keywords: ['lion'] },
    { emoji: '\uD83D\uDC2F', keywords: ['tiger'] },
    { emoji: '\uD83D\uDC06', keywords: ['leopard', 'jaguar', 'panther', 'lynx', 'cougar'] },
    { emoji: '\uD83D\uDC06', keywords: ['snow leopard'] },
    { emoji: '\uD83D\uDC3A', keywords: ['wolf', 'jackal', 'hyena'] },
    { emoji: '\uD83E\uDD8A', keywords: ['fox'] },
    { emoji: '\uD83D\uDC3B', keywords: ['brown bear'] },
    { emoji: '\uD83D\uDC3B\u200D\u2744\uFE0F', keywords: ['polar bear'] },
    { emoji: '\uD83D\uDC3C', keywords: ['panda'] },
    { emoji: '\uD83D\uDC28', keywords: ['koala'] },
    { emoji: '\uD83E\uDD8D', keywords: ['gorilla'] },
    { emoji: '\uD83D\uDC12', keywords: ['chimpanzee', 'orangutan', 'baboon', 'mandrill'] },
    { emoji: '\uD83E\uDD93', keywords: ['zebra'] },
    { emoji: '\uD83E\uDD92', keywords: ['giraffe'] },
    { emoji: '\uD83D\uDC18', keywords: ['elephant'] },
    { emoji: '\uD83E\uDD8F', keywords: ['rhinoceros'] },
    { emoji: '\uD83E\uDD9B', keywords: ['hippopotamus'] },
    { emoji: '\uD83E\uDDAC', keywords: ['bison'] },
    { emoji: '\uD83D\uDC03', keywords: ['buffalo'] },
    { emoji: '\uD83E\uDD8C', keywords: ['antelope', 'gazelle', 'wildebeest', 'deer', 'moose', 'elk'] },
    { emoji: '\uD83D\uDC2A', keywords: ['camel'] },
    { emoji: '\uD83E\uDD99', keywords: ['llama', 'alpaca'] },
    { emoji: '\uD83D\uDC17', keywords: ['boar'] },
    { emoji: '\uD83E\uDD98', keywords: ['kangaroo', 'wallaby'] },
    { emoji: '\uD83E\uDDA5', keywords: ['sloth'] },
    { emoji: '\uD83E\uDDA6', keywords: ['otter'] },
    { emoji: '\uD83E\uDD9D', keywords: ['raccoon'] },
    { emoji: '\uD83E\uDDA8', keywords: ['skunk'] },
    { emoji: '\uD83E\uDD94', keywords: ['hedgehog', 'porcupine'] },
  ],
  Farm: [
    { emoji: '\uD83D\uDC04', keywords: ['cow', 'bull', 'calf', 'ox', 'zebu'] },
    { emoji: '\uD83D\uDC03', keywords: ['buffalo', 'yak'] },
    { emoji: '\uD83D\uDC10', keywords: ['goat'] },
    { emoji: '\uD83D\uDC11', keywords: ['sheep', 'ram', 'lamb'] },
    { emoji: '\uD83D\uDC34', keywords: ['horse', 'pony', 'clydesdale'] },
    { emoji: '\uD83D\uDC34', keywords: ['donkey', 'mule'] },
    { emoji: '\uD83D\uDC16', keywords: ['pig', 'sow', 'piglet'] },
    { emoji: '\uD83D\uDC17', keywords: ['boar', 'berkshire'] },
    { emoji: '\uD83D\uDC14', keywords: ['chicken', 'hen', 'chick', 'silkie'] },
    { emoji: '\uD83D\uDC13', keywords: ['rooster'] },
    { emoji: '\uD83E\uDD83', keywords: ['turkey'] },
    { emoji: '\uD83E\uDD86', keywords: ['duck'] },
    { emoji: '\uD83E\uDD86', keywords: ['goose', 'gander'] },
    { emoji: '\uD83D\uDC26', keywords: ['quail', 'guinea fowl', 'pigeon'] },
    { emoji: '\uD83D\uDC07', keywords: ['rabbit'] },
    { emoji: '\uD83D\uDC08', keywords: ['cat'] },
    { emoji: '\uD83D\uDC15', keywords: ['dog'] },
    { emoji: '\uD83D\uDC2A', keywords: ['camel'] },
    { emoji: '\uD83E\uDD99', keywords: ['alpaca', 'llama'] },
    { emoji: '\uD83E\uDD8C', keywords: ['reindeer'] },
    { emoji: '\uD83D\uDC26', keywords: ['emu', 'ostrich'] },
  ],
  Pet: [
    { emoji: '\uD83D\uDC36', keywords: ['dog', 'pug', 'labrador', 'beagle', 'pomeranian'] },
    { emoji: '\uD83D\uDC31', keywords: ['cat', 'persian', 'siamese', 'maine coon', 'ragdoll'] },
    { emoji: '\uD83D\uDC30', keywords: ['rabbit', 'bunny'] },
    { emoji: '\uD83D\uDC39', keywords: ['hamster', 'guinea pig', 'gerbil', 'chinchilla'] },
    { emoji: '\uD83D\uDC2D', keywords: ['mouse'] },
    { emoji: '\uD83D\uDC00', keywords: ['rat'] },
    { emoji: '\uD83E\uDD94', keywords: ['hedgehog'] },
    { emoji: '\uD83E\uDD9C', keywords: ['parrot', 'budgie', 'cockatiel', 'cockatoo', 'macaw', 'lovebird', 'parakeet'] },
    { emoji: '\uD83D\uDC26', keywords: ['canary', 'finch'] },
    { emoji: '\uD83D\uDC22', keywords: ['turtle', 'tortoise'] },
    { emoji: '\uD83D\uDC20', keywords: ['fish', 'koi'] },
    { emoji: '\uD83D\uDC38', keywords: ['frog'] },
    { emoji: '\uD83E\uDD8E', keywords: ['gecko', 'bearded dragon', 'axolotl'] },
    { emoji: '\uD83D\uDC0D', keywords: ['snake', 'python'] },
    { emoji: '\uD83E\uDD80', keywords: ['crab'] },
    { emoji: '\uD83D\uDD77\uFE0F', keywords: ['tarantula'] },
    { emoji: '\uD83D\uDC1B', keywords: ['stick insect'] },
    { emoji: '\uD83D\uDC16', keywords: ['mini pig'] },
  ],
  Bird: [
    { emoji: '\uD83E\uDD9A', keywords: ['peacock'] },
    { emoji: '\uD83E\uDDA9', keywords: ['flamingo'] },
    { emoji: '\uD83E\uDD9C', keywords: ['cockatoo', 'parrot', 'macaw', 'budgie', 'budgerigar', 'cockatiel', 'lovebird'] },
    { emoji: '\uD83D\uDC26\u200D\u2B1B', keywords: ['crow', 'raven'] },
    { emoji: '\uD83E\uDD85', keywords: ['hawk', 'falcon', 'eagle', 'vulture', 'condor', 'kite bird'] },
    { emoji: '\uD83E\uDD89', keywords: ['owl'] },
    { emoji: '\uD83D\uDC27', keywords: ['penguin', 'puffin'] },
    { emoji: '\uD83E\uDD86', keywords: ['duck', 'goose', 'gander', 'swan'] },
    { emoji: '\uD83D\uDC26', keywords: ['pigeon', 'dove', 'sparrow'] },
    { emoji: '\uD83D\uDC26', keywords: ['pelican', 'stork', 'heron', 'crane', 'albatross', 'seagull', 'tern'] },
    { emoji: '\uD83D\uDC26', keywords: ['kingfisher', 'woodpecker', 'hummingbird', 'robin', 'blue jay', 'cardinal'] },
    { emoji: '\uD83D\uDC26', keywords: ['canary', 'finch', 'nightjar', 'quail', 'partridge', 'pheasant', 'cuckoo', 'nightingale'] },
    { emoji: '\uD83D\uDC26', keywords: ['toucan', 'hornbill', 'kiwi', 'ostrich', 'emu'] },
  ],
  Ocean: [
    { emoji: '\uD83D\uDC2C', keywords: ['dolphin'] },
    { emoji: '\uD83E\uDD88', keywords: ['shark'] },
    { emoji: '\uD83D\uDC0B', keywords: ['whale', 'orca', 'narwhal'] },
    { emoji: '\uD83D\uDC19', keywords: ['octopus'] },
    { emoji: '\uD83E\uDD91', keywords: ['squid', 'cuttlefish'] },
    { emoji: '\uD83E\uDEBC', keywords: ['jellyfish'] },
    { emoji: '\uD83D\uDC22', keywords: ['sea turtle'] },
    { emoji: '\uD83E\uDDAD', keywords: ['seal', 'sea lion', 'walrus', 'manatee', 'dugong'] },
    { emoji: '\uD83E\uDD80', keywords: ['crab'] },
    { emoji: '\uD83E\uDD9E', keywords: ['lobster'] },
    { emoji: '\uD83E\uDD90', keywords: ['shrimp', 'prawn'] },
    { emoji: '\u2B50', keywords: ['starfish'] },
    { emoji: '\uD83D\uDC1A', keywords: ['clam', 'oyster', 'mussel', 'scallop'] },
    { emoji: '\uD83E\uDEB8', keywords: ['coral'] },
    { emoji: '\uD83D\uDC1F', keywords: ['eel', 'ray', 'fish', 'tuna', 'salmon', 'marlin', 'sardine', 'anchovy', 'barracuda'] },
    { emoji: '\uD83D\uDC21', keywords: ['pufferfish'] },
  ],
  Bug: [
    { emoji: '\uD83E\uDD8B', keywords: ['butterfly', 'moth'] },
    { emoji: '\uD83D\uDC1D', keywords: ['bee', 'wasp', 'hornet', 'bumblebee'] },
    { emoji: '\uD83D\uDC1E', keywords: ['ladybug'] },
    { emoji: '\uD83D\uDC1C', keywords: ['ant', 'termite'] },
    { emoji: '\uD83E\uDEB2', keywords: ['beetle', 'weevil', 'scarab', 'goliath', 'stag', 'hercules', 'dung'] },
    { emoji: '\uD83E\uDD97', keywords: ['grasshopper', 'cricket', 'locust', 'cicada'] },
    { emoji: '\uD83E\uDD9F', keywords: ['mosquito'] },
    { emoji: '\uD83E\uDEB0', keywords: ['fly', 'housefly', 'mayfly', 'stonefly', 'caddisfly'] },
    { emoji: '\uD83D\uDC1B', keywords: ['caterpillar', 'centipede', 'millipede', 'stick insect', 'leaf insect'] },
    { emoji: '\uD83E\uDD97', keywords: ['praying mantis'] },
    { emoji: '\uD83E\uDEB3', keywords: ['cockroach'] },
    { emoji: '\uD83D\uDC1E', keywords: ['flea', 'tick', 'louse', 'aphid', 'lacewing', 'assassin bug', 'water strider'] },
    { emoji: '\uD83D\uDD77\uFE0F', keywords: ['spider', 'widow', 'tarantula'] },
    { emoji: '\u2728', keywords: ['firefly', 'glowworm'] },
  ],
};

const CATEGORY_HABITATS = {
  Wild: ['jungle', 'savanna', 'rainforest', 'mountain forest', 'grasslands'],
  Farm: ['farmyard', 'barn', 'pasture', 'village farm', 'open fields'],
  Pet: ['home', 'backyard', 'aquarium', 'terrarium', 'cozy pet corner'],
  Bird: ['tree tops', 'open sky', 'wetlands', 'forest canopy', 'rocky cliffs'],
  Ocean: ['coral reef', 'deep ocean', 'coastal waters', 'kelp forest', 'open sea'],
  Bug: ['garden', 'forest floor', 'flower meadow', 'tree bark', 'pond edge'],
};

const CATEGORY_SOUNDS = {
  Wild: ['Roar!', 'Growl!', 'Howl!', 'Snort!', 'Trumpet!'],
  Farm: ['Moo!', 'Neigh!', 'Baa!', 'Oink!', 'Cluck!'],
  Pet: ['Meow!', 'Woof!', 'Chirp!', 'Squeak!', 'Purr!'],
  Bird: ['Chirp!', 'Tweet!', 'Screech!', 'Caw!', 'Hoot!'],
  Ocean: ['Splash!', 'Click!', 'Whistle!', 'Blub!', 'Whoosh!'],
  Bug: ['Buzz!', 'Click!', 'Flutter!', 'Hum!', 'Tick-tick!'],
};

const CATEGORY_FACTS = {
  Wild: [
    'I am brave and alert in the wild.',
    'I can move quickly when I need to find food.',
    'My senses help me survive every day.',
    'I use smart tricks to stay safe from danger.',
    'My body is built perfectly for nature adventures.',
  ],
  Farm: [
    'I help people on farms every season.',
    'I enjoy simple routines and fresh food.',
    'I am happiest when I have space to move around.',
    'I can be gentle, friendly, and hardworking.',
    'I am an important friend in farm life.',
  ],
  Pet: [
    'I love spending time with my human family.',
    'I enjoy playful games and cozy rest time.',
    'I can learn routines and respond to care.',
    'I feel safe when my home is calm and kind.',
    'I bring joy with my curious personality.',
  ],
  Bird: [
    'My wings and feathers help me explore.',
    'I use my beak in smart and useful ways.',
    'I can communicate with special calls.',
    'I am light, fast, and full of energy.',
    'I watch the world from high places.',
  ],
  Ocean: [
    'I am adapted for life in water.',
    'I glide smoothly through waves and currents.',
    'My body helps me swim with balance and speed.',
    'I survive in salty seas with unique skills.',
    'I explore colorful underwater worlds.',
  ],
  Bug: [
    'I may be tiny, but I have big survival skills.',
    'I move quickly and hide in small spaces.',
    'I play an important role in nature cycles.',
    'My body has cool patterns and tiny details.',
    'I help gardens and ecosystems in many ways.',
  ],
};

const CATEGORY_NAMES = {
  Wild: [
    'Lion',
    'Tiger',
    'Leopard',
    'Cheetah',
    'Jaguar',
    'Panther',
    'Snow Leopard',
    'Lynx',
    'Cougar',
    'Hyena',
    'Wolf',
    'Fox',
    'Jackal',
    'Brown Bear',
    'Polar Bear',
    'Giant Panda',
    'Koala',
    'Gorilla',
    'Chimpanzee',
    'Orangutan',
    'Baboon',
    'Mandrill',
    'Zebra',
    'Giraffe',
    'African Elephant',
    'Rhinoceros',
    'Hippopotamus',
    'Bison',
    'Cape Buffalo',
    'Antelope',
    'Gazelle',
    'Wildebeest',
    'Deer',
    'Moose',
    'Elk',
    'Desert Camel',
    'Mountain Llama',
    'Andean Alpaca',
    'Wild Boar',
    'Kangaroo',
    'Wallaby',
    'Platypus',
    'Wombat',
    'Sloth',
    'Armadillo',
    'Meerkat',
    'River Otter',
    'Raccoon',
    'Skunk',
    'Porcupine',
  ],
  Farm: [
    'Cow',
    'Bull',
    'Calf',
    'Water Buffalo',
    'Ox',
    'Goat',
    'Kid Goat',
    'Sheep',
    'Ram',
    'Lamb',
    'Horse',
    'Pony',
    'Donkey',
    'Mule',
    'Pig',
    'Sow',
    'Boar',
    'Piglet',
    'Chicken',
    'Rooster',
    'Hen',
    'Chick',
    'Turkey',
    'Farm Duck',
    'Farm Goose',
    'Gander',
    'Farm Quail',
    'Guinea Fowl',
    'Loft Pigeon',
    'Farm Rabbit',
    'Barn Cat',
    'Sheepdog',
    'Yak',
    'Domestic Camel',
    'Ranch Alpaca',
    'Ranch Llama',
    'Zebu',
    'Reindeer',
    'Farm Emu',
    'Farm Ostrich',
    'Muscovy Duck',
    'Silkie Chicken',
    'Jersey Cow',
    'Holstein Cow',
    'Merino Sheep',
    'Angora Goat',
    'Nubian Goat',
    'Clydesdale Horse',
    'Suffolk Sheep',
    'Berkshire Pig',
  ],
  Pet: [
    'Dog',
    'Cat',
    'Pet Rabbit',
    'Hamster',
    'Guinea Pig',
    'Ferret',
    'Mouse',
    'Rat',
    'Gerbil',
    'Chinchilla',
    'Hedgehog',
    'Pet Parrot',
    'Budgie',
    'Pet Canary',
    'Pet Cockatiel',
    'Lovebird',
    'Pet Finch',
    'Turtle',
    'Tortoise',
    'Goldfish',
    'Betta Fish',
    'Guppy',
    'Molly Fish',
    'Platy Fish',
    'Koi',
    'Axolotl',
    'Pet Frog',
    'Gecko',
    'Bearded Dragon',
    'Corn Snake',
    'Ball Python',
    'Hermit Crab',
    'Pet Tarantula',
    'Pet Stick Insect',
    'Fancy Mouse',
    'Fancy Rat',
    'Mini Pig',
    'Pomeranian',
    'Labrador',
    'Beagle',
    'Persian Cat',
    'Siamese Cat',
    'Maine Coon',
    'Ragdoll',
    'Lop Bunny',
    'Parakeet',
    'Pet Cockatoo',
    'Pet Macaw',
    'Sugar Glider',
    'Pug',
  ],
  Bird: [
    'Eagle',
    'Hawk',
    'Falcon',
    'Owl',
    'Sky Parrot',
    'Rainforest Macaw',
    'Jungle Cockatoo',
    'Pigeon',
    'Dove',
    'Sparrow',
    'Crow',
    'Raven',
    'Peacock',
    'Flamingo',
    'Pelican',
    'Stork',
    'Heron',
    'Crane',
    'Swan',
    'Wild Goose',
    'Wild Duck',
    'Kingfisher',
    'Woodpecker',
    'Hummingbird',
    'Robin',
    'Blue Jay',
    'Cardinal',
    'Forest Canary',
    'Forest Finch',
    'Budgerigar',
    'Wild Cockatiel',
    'Kiwi',
    'Ostrich',
    'Emu',
    'Penguin',
    'Albatross',
    'Seagull',
    'Tern',
    'Puffin',
    'Toucan',
    'Hornbill',
    'Vulture',
    'Kite Bird',
    'Condor',
    'Nightjar',
    'Quail Bird',
    'Partridge',
    'Pheasant',
    'Cuckoo',
    'Nightingale',
  ],
  Ocean: [
    'Dolphin',
    'Shark',
    'Whale',
    'Orca',
    'Octopus',
    'Squid',
    'Cuttlefish',
    'Jellyfish',
    'Sea Turtle',
    'Seahorse',
    'Sea Lion',
    'Seal',
    'Walrus',
    'Manatee',
    'Dugong',
    'Crab',
    'Lobster',
    'Shrimp',
    'Prawn',
    'Starfish',
    'Sea Urchin',
    'Sea Cucumber',
    'Clam',
    'Oyster',
    'Mussel',
    'Scallop',
    'Coral',
    'Eel',
    'Moray Eel',
    'Stingray',
    'Manta Ray',
    'Hammerhead Shark',
    'Blue Whale',
    'Humpback Whale',
    'Sperm Whale',
    'Narwhal',
    'Beluga Whale',
    'Clownfish',
    'Angelfish',
    'Surgeonfish',
    'Tuna',
    'Salmon',
    'Swordfish',
    'Marlin',
    'Barracuda',
    'Anchovy',
    'Sardine',
    'Pufferfish',
    'Lionfish',
    'Blobfish',
  ],
  Bug: [
    'Butterfly',
    'Bee',
    'Ladybug',
    'Ant',
    'Beetle',
    'Dragonfly',
    'Damselfly',
    'Grasshopper',
    'Cricket',
    'Locust',
    'Moth',
    'Mosquito',
    'Fly',
    'Housefly',
    'Firefly',
    'Termite',
    'Wasp',
    'Hornet',
    'Bumblebee',
    'Caterpillar',
    'Centipede',
    'Millipede',
    'Stick Insect',
    'Leaf Insect',
    'Praying Mantis',
    'Cockroach',
    'Flea',
    'Tick',
    'Louse',
    'Aphid',
    'Cicada',
    'Weevil',
    'Scarab Beetle',
    'Dung Beetle',
    'Rhinoceros Beetle',
    'Hercules Beetle',
    'Stag Beetle',
    'Earwig',
    'Silverfish',
    'Mayfly',
    'Stonefly',
    'Caddisfly',
    'Lacewing',
    'Assassin Bug',
    'Water Strider',
    'Goliath Beetle',
    'Glowworm',
    'Black Widow Spider',
    'Tarantula Spider',
    'Jumping Spider',
  ],
};

const CATEGORY_TARGET = 50;

Object.entries(CATEGORY_NAMES).forEach(([category, names]) => {
  if (names.length !== CATEGORY_TARGET) {
    throw new Error(`[animalsData] ${category} must contain exactly ${CATEGORY_TARGET} animals, found ${names.length}.`);
  }
});

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getCycleValue = (values, index) => values[index % values.length];

const normalizeNameForMatching = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const matchesAnyKeyword = (normalizedName, keywords = []) =>
  keywords.some((keyword) => normalizedName.includes(String(keyword || '').toLowerCase()));

export const getExpectedAnimalId = (category, name) =>
  `${String(category || '').toLowerCase()}-${toSlug(name)}`;

export const resolveAnimalEmoji = (name, category) => {
  const normalizedName = normalizeNameForMatching(name);
  const rules = CATEGORY_NAME_EMOJI_RULES[String(category || '').trim()] || [];
  const matchingRule = rules.find((rule) => matchesAnyKeyword(normalizedName, rule.keywords));
  return matchingRule?.emoji || CATEGORY_DEFAULT_EMOJI[String(category || '').trim()] || '\uD83D\uDC3E';
};

const ensureBioContainsName = (name, quizClue, bio) => {
  const safeName = String(name || '').trim();
  const safeQuizClue = String(quizClue || '').trim() || 'I am a special animal friend.';
  const safeBio = String(bio || '').trim();

  if (safeName && safeBio.toLowerCase().includes(safeName.toLowerCase())) {
    return safeBio;
  }

  return `Who am I? I am ${safeName}. ${safeQuizClue}`;
};

export const sanitizeAnimalRecordForRender = (animal) => {
  const name = String(animal?.name || '').trim();
  const category = String(animal?.category || '').trim();
  if (!name || !category) return null;

  const expectedId = getExpectedAnimalId(category, name);
  const expectedEmoji = resolveAnimalEmoji(name, category);
  const quizClue = String(animal?.quizClue || '').trim();
  const bio = ensureBioContainsName(name, quizClue, animal?.bio);

  return {
    ...animal,
    id: expectedId,
    emoji: expectedEmoji,
    bio,
  };
};

export const validateAnimalRecordForRender = (animal) => {
  if (!animal) return false;

  const name = String(animal.name || '').trim();
  const category = String(animal.category || '').trim();
  const expectedId = getExpectedAnimalId(category, name);
  const expectedEmoji = resolveAnimalEmoji(name, category);
  const bio = String(animal.bio || '').trim().toLowerCase();

  if (!name || !category) return false;
  if (String(animal.id || '').trim() !== expectedId) return false;
  if (String(animal.emoji || '').trim() !== expectedEmoji) return false;
  if (!bio.includes(name.toLowerCase())) return false;

  return true;
};

const buildAnimalRecord = (category, name, index) => {
  const style = getCycleValue(CATEGORY_STYLES[category], index);
  const habitat = getCycleValue(CATEGORY_HABITATS[category], index);
  const sound = getCycleValue(CATEGORY_SOUNDS[category], index);
  const fact = getCycleValue(CATEGORY_FACTS[category], index);
  const emoji = resolveAnimalEmoji(name, category);
  const id = getExpectedAnimalId(category, name);

  const quizClue = `${fact} I am usually found in the ${habitat}.`;

  const record = {
    id,
    name,
    category,
    emoji,
    sound,
    soundFile: `/sounds/animals/${category.toLowerCase()}/${id}.mp3`,
    habitat,
    quizClue,
    bg: style.bg,
    text: style.text,
    bio: `Who am I? I am ${name}. ${quizClue}`,
  };

  const sanitized = sanitizeAnimalRecordForRender(record);
  if (!validateAnimalRecordForRender(sanitized)) {
    throw new Error(`[animalsData] Invalid record mapping for ${category} -> ${name}`);
  }

  return sanitized;
};

export const ANIMALS_DATA = Object.entries(CATEGORY_NAMES).flatMap(([category, names]) =>
  names.map((name, index) => buildAnimalRecord(category, name, index))
);

const OPTION_OFFSETS = [17, 43, 79, 131, 173, 211, 257];

const buildQuestionOptions = (correctIndex) => {
  const options = [ANIMALS_DATA[correctIndex].name];
  let cursor = 0;

  while (options.length < 4 && cursor < 80) {
    const offset = OPTION_OFFSETS[cursor % OPTION_OFFSETS.length] + cursor * 3;
    const candidate = ANIMALS_DATA[(correctIndex + offset) % ANIMALS_DATA.length]?.name;
    if (candidate && !options.includes(candidate)) {
      options.push(candidate);
    }
    cursor += 1;
  }

  const rotateBy = correctIndex % options.length;
  return [...options.slice(rotateBy), ...options.slice(0, rotateBy)];
};

const buildSafariQuestion = (animal, index) => {
  let questionText = '';

  if (index < 34) {
    questionText = `Which animal makes this sound: "${animal.sound}"?`;
  } else if (index < 67) {
    questionText = `Who am I? I usually live in the ${animal.habitat}.`;
  } else {
    questionText = `Who am I? ${animal.quizClue}`;
  }

  return {
    id: `safari-master-${index + 1}`,
    question: questionText,
    answer: animal.name,
    acceptedAnswers: [animal.name],
    options: buildQuestionOptions(index),
  };
};

export const SAFARI_MASTER_QUIZ_QUESTIONS = ANIMALS_DATA.slice(0, 100).map((animal, index) =>
  buildSafariQuestion(animal, index)
);

export default ANIMALS_DATA;
