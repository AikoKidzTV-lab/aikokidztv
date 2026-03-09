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
  'Draw a flying cat wearing sunglasses!',
  'Draw a pizza slice playing a guitar!',
  'Draw a robot octopus painting the ocean!',
  'Draw a sleepy dragon reading comic books!',
  'Draw a disco banana on a skateboard!',
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
