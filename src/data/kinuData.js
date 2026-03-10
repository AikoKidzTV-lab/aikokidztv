export const contraptionChallenges = [
  {
    prompt: 'The ball needs to bounce!',
    startEmoji: '⚽',
    toolEmoji: '🌀',
    endEmoji: '🎯',
    actionLabel: 'Place Spring 🌀',
    successMessage: 'BOING! 🔔',
  },
  {
    prompt: 'The paper plane needs a turbo boost!',
    startEmoji: '🛩️',
    toolEmoji: '💨',
    endEmoji: '🎈',
    actionLabel: 'Add Turbo 💨',
    successMessage: 'WHOOSH! Sky mission ready!',
  },
  {
    prompt: 'The drum beat needs a power zap!',
    startEmoji: '🥁',
    toolEmoji: '⚡',
    endEmoji: '🎵',
    actionLabel: 'Charge It ⚡',
    successMessage: 'KABOOM! Beat unlocked!',
  },
  {
    prompt: 'The robot helper needs a silly gear!',
    startEmoji: '🤖',
    toolEmoji: '⚙️',
    endEmoji: '📦',
    actionLabel: 'Drop Gear ⚙️',
    successMessage: 'CLANK! Robot fix complete!',
  },
  {
    prompt: 'The paint rocket needs a bright launch!',
    startEmoji: '🎨',
    toolEmoji: '🚀',
    endEmoji: '🌈',
    actionLabel: 'Launch Rocket 🚀',
    successMessage: 'ZOOM! Colors everywhere!',
  },
];

export const prankChallenges = [
  {
    prompt: "I hid NIKO's ball! Where is it?",
    answerId: 'cloud',
    successMessage: 'You found it! ⚽🎉',
    failureMessage: 'Nope, not here! 😜',
    spots: [
      { id: 'bush', label: 'Bush 🌳' },
      { id: 'cloud', label: 'Cloud ☁️' },
      { id: 'box', label: 'Box 📦' },
    ],
  },
  {
    prompt: "I hid MIMI's paintbrush! Where is it?",
    answerId: 'jar',
    successMessage: 'You caught my prank! 🖌️🎉',
    failureMessage: 'Hehe, keep looking!',
    spots: [
      { id: 'book', label: 'Book Stack 📚' },
      { id: 'jar', label: 'Paint Jar 🫙' },
      { id: 'hat', label: 'Top Hat 🎩' },
    ],
  },
  {
    prompt: "I hid CHIKO's screwdriver! Where is it?",
    answerId: 'toolbox',
    successMessage: 'You found the toolbox trick! 🪛🎉',
    failureMessage: 'Not there. Try again!',
    spots: [
      { id: 'pillow', label: 'Pillow 🛏️' },
      { id: 'toolbox', label: 'Toolbox 🧰' },
      { id: 'plant', label: 'Plant 🪴' },
    ],
  },
  {
    prompt: "I hid AIKO's notebook! Where is it?",
    answerId: 'drawer',
    successMessage: 'Notebook discovered! 📓🎉',
    failureMessage: 'Sneaky, but not that spot!',
    spots: [
      { id: 'drawer', label: 'Drawer 🗄️' },
      { id: 'moon', label: 'Moon Lamp 🌙' },
      { id: 'basket', label: 'Basket 🧺' },
    ],
  },
  {
    prompt: "I hid MIKO's star toy! Where is it?",
    answerId: 'planet',
    successMessage: 'You spotted the cosmic prank! ⭐🎉',
    failureMessage: 'Nope. Search the galaxy again!',
    spots: [
      { id: 'planet', label: 'Planet 🪐' },
      { id: 'locker', label: 'Locker 🚪' },
      { id: 'curtain', label: 'Curtain 🎭' },
    ],
  },
];

export const sillySolutionChallenges = [
  {
    prompt: 'How to cross a broken bridge? 🌉',
    options: [
      { id: 'castle', label: 'Giant Bouncy Castle 🏰', message: 'Boing! Boing! Safe landing!' },
      { id: 'boots', label: 'Rocket Boots 🚀', message: 'Zoom! You crossed in style!' },
      { id: 'car', label: 'Floating Car 🚗', message: 'Vroom in the sky. Bridge problem solved!' },
    ],
  },
  {
    prompt: 'How to reach a cookie on the moon? 🌙',
    options: [
      { id: 'ladder', label: 'Mega Ladder 🪜', message: 'Climb, climb, cookie time!' },
      { id: 'catapult', label: 'Cookie Catapult 🥠', message: 'Wheee! Snack mission launched!' },
      { id: 'jetpack', label: 'Marshmallow Jetpack 🎒', message: 'Puff! You floated to the cookie!' },
    ],
  },
  {
    prompt: 'How to cool down a grumpy dragon? 🐉',
    options: [
      { id: 'fan', label: 'Super Fan 🌬️', message: 'Fwoosh! Dragon is chill now!' },
      { id: 'popsicle', label: 'Mega Popsicle 🍭', message: 'Crunch! Dragon became cheerful!' },
      { id: 'sprinkler', label: 'Rainbow Sprinkler 🌈', message: 'Splash! Fire mood gone!' },
    ],
  },
  {
    prompt: 'How to deliver music to a sleepy whale? 🐋',
    options: [
      { id: 'submarine', label: 'Singing Submarine 🚢', message: 'Blub blub! Concert delivered!' },
      { id: 'bubble', label: 'Bubble Speaker 🫧', message: 'Pop! The whale heard every note!' },
      { id: 'trumpet', label: 'Golden Trumpet 🎺', message: 'Toot! Underwater jam session started!' },
    ],
  },
  {
    prompt: 'How to paint a cloud without getting wet? ☁️',
    options: [
      { id: 'umbrella', label: 'Painter Umbrella ☂️', message: 'Drip-proof and masterpiece ready!' },
      { id: 'drone', label: 'Art Drone 🚁', message: 'Buzz! The cloud got painted from above!' },
      { id: 'boots', label: 'Sky Boots 👢', message: 'Tap tap! You walked right up to the cloud!' },
    ],
  },
];

export const drawingPrompts = [
  "Draw a cat wearing a space helmet! 🐱‍🚀",
  "Design a house made entirely out of candy! 🍬🏡",
  "Draw your favorite superhero, but as a cute baby! 🦸‍♂️🍼",
  "Invent a new animal by mixing a lion and a fish! 🦁🐟",
  "Draw a tree that grows pizzas instead of leaves! 🍕🌳",
  "Design your dream robot friend. What does it do? 🤖",
  "Draw a monster that is friendly and loves to bake cookies! 🍪👾",
  "Imagine and draw what a flying car would look like! 🚗✈️",
  "Draw a snowman enjoying a sunny day at the beach! ⛄🏖️",
  "Design a magical sword or wand! What power does it have? ✨",
  "Draw a dinosaur riding a skateboard! 🦖🛹",
  "Draw an alien eating a giant ice cream cone! 👽🍦",
  "Design the ultimate treehouse with a water slide! 🌳🎢",
  "Draw a pirate ship that flies in the clouds! 🏴‍☠️☁️",
  "Draw a dog wearing cool sunglasses and a hat! 🐶🕶️",
  "Imagine a castle sitting on top of a fluffy cloud! 🏰☁️",
  "Draw a monkey painting a picture on a canvas! 🐒🎨",
  "Draw a butterfly with rainbow-colored wings! 🦋🌈",
  "Draw a unicorn having a tea party! 🦄🫖",
  "Design a rocket ship made entirely out of fruit! 🚀🍉",
  "Draw a robot dog playing fetch! 🤖🐕",
  "Imagine a glowing city deep underwater! 🏙️🌊",
  "Draw a little bird wearing a tiny winter scarf! 🐦🧣",
  "Draw the biggest, most delicious cupcake ever! 🧁✨",
  "Draw a snake playing a rock guitar! 🐍🎸"
];

export const colorMixes = [
  { question: "What do you get when you mix RED and YELLOW?", answer: "Orange! 🟠", emoji: "🎨" },
  { question: "What do you get when you mix BLUE and YELLOW?", answer: "Green! 🟢", emoji: "🌿" },
  { question: "What do you get when you mix RED and BLUE?", answer: "Purple! 🟣", emoji: "🍇" },
  { question: "What do you get when you mix BLACK and WHITE?", answer: "Grey! ⚪", emoji: "🐘" },
  { question: "What do you get when you mix RED and WHITE?", answer: "Pink! 🌸", emoji: "🐷" },
  { question: "How do you make Brown?", answer: "Mix all three primary colors: Red, Blue, and Yellow! 🟤", emoji: "🐻" },
  { question: "What is a 'Primary' color?", answer: "Red, Blue, and Yellow! You can't make them by mixing other colors.", emoji: "🥇" },
  { question: "What is a 'Secondary' color?", answer: "A color made by mixing two primary colors (like Orange, Green, or Purple)!", emoji: "🥈" },
  { question: "What do you get when you mix BLUE and WHITE?", answer: "Light Blue (like the sky)! 🩵", emoji: "☁️" },
  { question: "What do you get when you mix GREEN and WHITE?", answer: "Mint or Light Green! 🍵", emoji: "🍃" },
  { question: "What happens if you mix RED and GREEN?", answer: "You usually get a muddy Brown or Grey! 🟤", emoji: "🪵" },
  { question: "What happens if you mix BLUE and ORANGE?", answer: "They cancel each other out and make Brown! 🟫", emoji: "🥥" },
  { question: "What happens if you mix YELLOW and PURPLE?", answer: "You get Brown! They are 'complementary' colors.", emoji: "🍂" },
  { question: "How do you make the color Peach?", answer: "Mix Yellow, Red (to make orange), and a lot of White! 🍑", emoji: "🎨" },
  { question: "What color do you get if you mix BLACK and RED?", answer: "Dark Red or Maroon! 🍷", emoji: "🐞" },
  { question: "How do you make Navy Blue?", answer: "Mix a little bit of Black into Blue! 🌌", emoji: "👖" },
  { question: "What do you get when you mix Yellow and Green?", answer: "Yellow-Green or Lime Green! 🍋", emoji: "🦎" },
  { question: "What are 'Warm' colors?", answer: "Colors like Red, Orange, and Yellow! They remind us of the sun and fire. 🔥", emoji: "☀️" },
  { question: "What are 'Cool' colors?", answer: "Colors like Blue, Green, and Purple! They remind us of water and ice. ❄️", emoji: "🌊" },
  { question: "Can you make Red by mixing other colors?", answer: "No! Red is a Primary color. You just have to buy it! 🖍️", emoji: "🍎" }
];

export const musicalBeats = [
  "Clap your hands 3 times, then stomp your feet 2 times! 👏 👣",
  "Make a drum sound on the table: Tap, Tap, BOOM! 🥁",
  "Snap your fingers (or pretend to) to the beat of your favorite song! 🫰",
  "Say 'Boom-Chicka-Boom' as fast as you can 5 times! 🎶",
  "Take a deep breath and hum the ABC song without opening your mouth! 🤐🎵",
  "Pat your head and rub your tummy to a musical rhythm! 🤷‍♂️",
  "Pretend you are playing a giant piano with your feet! 🎹👣",
  "Make a shushing sound like the ocean waves: Shhhhh... Shhhhh... 🌊",
  "Click your tongue to sound like a horse trotting! 🐎",
  "Whistle or blow air out to make wind sounds! 🌬️",
  "Tap your shoulders, then your knees: 1, 2, 3, 4! 🥁",
  "Try to make a beatboxing sound: Boots and Cats! 🎤",
  "Sing your favorite song, but replace all the words with 'Meow'! 🐱🎶",
  "Rub your hands together really fast to sound like rain falling! 🌧️",
  "Gently tap two pencils together like tiny drumsticks! 🥢",
  "Make a low humming sound like a giant spaceship taking off! 🚀",
  "Slap your thighs to the beat of 'We Will Rock You'! 🎸",
  "Say 'Zoom, Swoosh, Pop!' in a fast, musical rhythm! ✨",
  "Pretend to play a trumpet: Doot doot doo! 🎺",
  "Take a deep breath and sing one note for as long as you possibly can! 🗣️🎵"
];

export const creativeIdeas = [
  "Find an empty cardboard box and imagine it's a spaceship! 📦🚀",
  "Make up a brand new word that means 'super happy' and tell your friends! 🗣️",
  "Build the tallest tower you can using pillows and cushions! 🏰",
  "Look at the clouds and tell a story about the shapes you see! ☁️📖",
  "Create a secret handshake with a friend or family member! 🤝",
  "Try to balance a soft book on your head and walk across the room! 📚🚶‍♂️",
  "Make a shadow puppet using your hands and a flashlight! 🔦🐇",
  "Write a short silly song about your favorite food! 🍔🎤",
  "Invent a new superhero. What is their name and what do they wear? 🦸‍♀️",
  "Pretend the floor is hot lava and navigate across the room safely! 🌋🪑",
  "Draw a 'Treasure Map' of your house and hide a toy for someone to find! 🗺️🪙",
  "Build a cozy reading fort using blankets and chairs! ⛺",
  "Invent a brand new holiday. What do we celebrate and what do we eat? 🎉",
  "Create a 3-step dance routine for your favorite song! 💃🕺",
  "Write a short letter to an alien explaining what Earth is like! 👽🌍",
  "Close your eyes and imagine you have wings. Where do you fly first? 🦅",
  "Collect 5 random safe items from your room and invent a story connecting them! 🧸✏️",
  "Make a paper airplane and see how far it can fly! ✈️📄",
  "Pretend you are a news reporter broadcasting live from your living room! 🎙️📺",
  "Design a menu for a magical restaurant. What weird foods do they serve? 🍝✨"
];

export const kinuJokes = [
  {
    setup: 'Why did the cow cross the road?',
    punchline: 'To get to the udder side!',
  },
  {
    setup: 'Why did the music note bring a ladder?',
    punchline: 'It wanted to reach the high notes!',
  },
  {
    setup: 'Why did the paintbrush blush?',
    punchline: 'Because it saw the canvas without any colors on!',
  },
  {
    setup: 'Why did the crayon become a comedian?',
    punchline: 'Because it was great at drawing laughs!',
  },
  {
    setup: 'Why did the guitar sit in the sunshine?',
    punchline: 'It wanted to feel a little more string light!',
  },
];
