const buildEmojiDetectiveOptions = (baseEmoji, targetEmoji, targetIndex) =>
  Array.from({ length: 12 }, (_, index) => (index === targetIndex ? targetEmoji : baseEmoji));

export const magicBookData = [
  {
    question: 'Why does it rain? \u{1F327}\uFE0F',
    answer: 'Because water rises into clouds and then falls back down as rain!',
    steps: ['Sun heats water \u2600\uFE0F', 'Clouds form \u2601\uFE0F', 'Rain falls \u{1F327}\uFE0F'],
  },
  {
    question: 'Why is the sky blue? \u{1F499}',
    answer: 'Because sunlight scatters and blue light spreads the most in the sky!',
    steps: [
      'Sunlight enters the air \u2600\uFE0F',
      'Tiny particles scatter blue light \u{1F4AB}',
      'The sky looks blue \u{1F499}',
    ],
  },
  {
    question: 'How do plants grow? \u{1F331}',
    answer: 'Plants use sunlight, water, and soil nutrients to grow strong and tall!',
    steps: ['Roots drink water \u{1F4A7}', 'Leaves catch sunlight \u2600\uFE0F', 'The plant grows taller \u{1F331}'],
  },
  {
    question: 'Why do shadows follow you? \u{1F463}',
    answer: 'Because your body blocks light and makes a dark shape behind or beside you!',
    steps: [
      'Light shines from one side \u{1F526}',
      'Your body blocks the light \u{1F64B}',
      'A shadow appears on the ground \u{1F463}',
    ],
  },
  {
    question: 'Why does the moon change shape? \u{1F319}',
    answer: 'Because we see different lit parts of the moon as it moves around Earth!',
    steps: [
      'The moon moves around Earth \u{1F30D}',
      'Sunlight lights one side of the moon \u2600\uFE0F',
      'We see different moon shapes \u{1F319}',
    ],
  },
];

export const puzzleCanvasData = [
  {
    prompt: 'Pick the shape that completes the roof sketch.',
    solvedPrompt: 'The roof sketch is complete!',
    targetShape: 'triangle',
    targetIcon: '\u{1F53A}',
    placeholderLabel: 'Roof shape missing...',
    successMessage: 'Perfect! Roof fixed \u{1F389}',
    failureMessage: 'Hmm, that shape does not fit the roof.',
    options: [
      { id: 'triangle', label: 'Triangle', icon: '\u{1F53A}' },
      { id: 'circle', label: 'Circle', icon: '\u{1F535}' },
      { id: 'square', label: 'Square', icon: '\u{1F7E6}' },
    ],
  },
  {
    prompt: 'Choose the shape for the bright sun spot.',
    solvedPrompt: 'The sunny shape looks perfect!',
    targetShape: 'circle',
    targetIcon: '\u{1F535}',
    placeholderLabel: 'Sun shape missing...',
    successMessage: 'Yes! The sunny circle fits beautifully! \u2600\uFE0F',
    failureMessage: 'Not quite. Try the round shape.',
    options: [
      { id: 'square', label: 'Square', icon: '\u{1F7E6}' },
      { id: 'circle', label: 'Circle', icon: '\u{1F535}' },
      { id: 'triangle', label: 'Triangle', icon: '\u{1F53A}' },
    ],
  },
  {
    prompt: 'Find the shape that finishes the gift box design.',
    solvedPrompt: 'The gift box design is complete!',
    targetShape: 'square',
    targetIcon: '\u{1F7E6}',
    placeholderLabel: 'Gift box shape missing...',
    successMessage: 'Great job! The box piece fits! \u{1F381}',
    failureMessage: 'That one does not make the box shape.',
    options: [
      { id: 'circle', label: 'Circle', icon: '\u{1F535}' },
      { id: 'square', label: 'Square', icon: '\u{1F7E6}' },
      { id: 'triangle', label: 'Triangle', icon: '\u{1F53A}' },
    ],
  },
  {
    prompt: 'Pick the shape that completes the kite art.',
    solvedPrompt: 'The kite art is ready to fly!',
    targetShape: 'diamond',
    targetIcon: '\u{1F536}',
    placeholderLabel: 'Kite shape missing...',
    successMessage: 'Wonderful! The kite shape fits! \u{1FA81}',
    failureMessage: 'Close, but the kite needs a diamond shape.',
    options: [
      { id: 'heart', label: 'Heart', icon: '\u{1F497}' },
      { id: 'diamond', label: 'Diamond', icon: '\u{1F536}' },
      { id: 'circle', label: 'Circle', icon: '\u{1F535}' },
    ],
  },
  {
    prompt: 'Choose the shape for the friendship badge.',
    solvedPrompt: 'The friendship badge looks adorable!',
    targetShape: 'heart',
    targetIcon: '\u{1F497}',
    placeholderLabel: 'Badge shape missing...',
    successMessage: 'Aww! The heart shape is right! \u{1F496}',
    failureMessage: 'Try the heart shape for this badge.',
    options: [
      { id: 'triangle', label: 'Triangle', icon: '\u{1F53A}' },
      { id: 'diamond', label: 'Diamond', icon: '\u{1F536}' },
      { id: 'heart', label: 'Heart', icon: '\u{1F497}' },
    ],
  },
];

export const patternData = [
  {
    sequence: ['\u{1F34E}', '\u{1F343}', '\u{1F34E}'],
    choices: ['\u{1F343}', '\u{1F30A}', '\u2600\uFE0F'],
    answer: '\u{1F343}',
  },
  {
    sequence: ['\u2B50', '\u{1F319}', '\u2B50'],
    choices: ['\u2601\uFE0F', '\u{1F319}', '\u{1FA90}'],
    answer: '\u{1F319}',
  },
  {
    sequence: ['\u{1F9E9}', '\u{1F3A8}', '\u{1F9E9}'],
    choices: ['\u{1F3B5}', '\u{1F4DA}', '\u{1F3A8}'],
    answer: '\u{1F3A8}',
  },
  {
    sequence: ['\u{1F41D}', '\u{1F338}', '\u{1F41D}'],
    choices: ['\u{1F353}', '\u{1F308}', '\u{1F338}'],
    answer: '\u{1F338}',
  },
  {
    sequence: ['\u{1F98B}', '\u{1F340}', '\u{1F98B}'],
    choices: ['\u{1F31E}', '\u{1F340}', '\u{1F34E}'],
    answer: '\u{1F340}',
  },
];

export const emojiDetectiveData = [
  {
    targetEmoji: '\u{1F345}',
    baseEmoji: '\u{1F34E}',
    options: buildEmojiDetectiveOptions('\u{1F34E}', '\u{1F345}', 7),
  },
  {
    targetEmoji: '\u{1F319}',
    baseEmoji: '\u2B50',
    options: buildEmojiDetectiveOptions('\u2B50', '\u{1F319}', 3),
  },
  {
    targetEmoji: '\u{1F980}',
    baseEmoji: '\u{1F41F}',
    options: buildEmojiDetectiveOptions('\u{1F41F}', '\u{1F980}', 10),
  },
  {
    targetEmoji: '\u{1F33B}',
    baseEmoji: '\u{1F337}',
    options: buildEmojiDetectiveOptions('\u{1F337}', '\u{1F33B}', 1),
  },
  {
    targetEmoji: '\u2728',
    baseEmoji: '\u{1F497}',
    options: buildEmojiDetectiveOptions('\u{1F497}', '\u2728', 8),
  },
];

export const riddleData = [
  {
    question: 'I have keys but no locks. I have space but no room. You can enter but not go outside. What am I?',
    options: ['A Map', 'A Keyboard', 'A Door'],
    answer: 'A Keyboard',
  },
  {
    question: 'What has hands but cannot clap?',
    options: ['A Clock', 'A Robot', 'A Table'],
    answer: 'A Clock',
  },
  {
    question: 'What gets wetter as it dries?',
    options: ['A Towel', 'A Candle', 'A Pillow'],
    answer: 'A Towel',
  },
  {
    question: 'What has one eye but cannot see?',
    options: ['A Needle', 'A Pirate', 'A Potato'],
    answer: 'A Needle',
  },
  {
    question: 'What is full of holes but still holds water?',
    options: ['A Sponge', 'A Basket', 'A Shoe'],
    answer: 'A Sponge',
  },
];
