export const aikoScenarios = [
  { id: 1, title: "The Dropped Ice Cream", scenario: "Your friend drops their ice cream and starts crying. What does a leader do?", options: ["Laugh at them", "Share your ice cream or help clean it up", "Walk away"], correct: "Share your ice cream or help clean it up", emoji: "🍦" },
  { id: 2, title: "The New Kid", scenario: "There is a new student in class who sits alone at lunch. What do you do?", options: ["Ignore them", "Invite them to sit and play with you", "Stare at them"], correct: "Invite them to sit and play with you", emoji: "🏫" },
  { id: 3, title: "The Messy Room", scenario: "Your little sibling made a huge mess with their toys.", options: ["Yell at them", "Help them clean it up together", "Hide the toys"], correct: "Help them clean it up together", emoji: "🧸" },
  { id: 4, title: "The Hard Puzzle", scenario: "Your team is losing a game because the puzzle is too hard.", options: ["Give up and quit", "Cheer the team on and try a new strategy", "Blame your teammates"], correct: "Cheer the team on and try a new strategy", emoji: "🧩" },
  { id: 5, title: "The Broken Rule", scenario: "You see a friend about to do something dangerous.", options: ["Let them do it", "Kindly warn them and explain why it's unsafe", "Join them"], correct: "Kindly warn them and explain why it's unsafe", emoji: "🛑" },
  { id: 6, title: "The Lost Pet", scenario: "You find a lost dog looking scared in the park.", options: ["Run away", "Tell an adult so they can help find the owner", "Try to catch it alone"], correct: "Tell an adult so they can help find the owner", emoji: "🐶" },
  { id: 7, title: "The Argument", scenario: "Two of your friends are fighting over a game.", options: ["Take sides", "Help them take turns and compromise", "Take the game away"], correct: "Help them take turns and compromise", emoji: "🤝" }
];

export const goodDeeds = [
  "Held the door open for someone today! 🚪",
  "Said 'Thank You' to the bus driver or teacher! 🚌",
  "Helped set the dinner table without being asked! 🍽️",
  "Shared my favorite toy with a friend or sibling! 🧸",
  "Gave someone a genuine compliment today! 🌟",
  "Picked up a piece of trash and threw it in the bin! ♻️",
  "Made a 'Get Well Soon' card for someone who is sick! 💌",
  "Helped carry the groceries into the house! 🛍️",
  "Let someone else go first in line! 🚶‍♂️",
  "Watered the plants for my parents! 🪴"
];

export const affirmations = [
  "I am brave, I am kind, and I am a great leader! 🦁",
  "Making mistakes helps me learn and grow! 🌱",
  "I have the power to make today an amazing day! ☀️",
  "My ideas are valuable and worth sharing! 💡",
  "I am a good friend and I care about others! 🤝",
  "I can do hard things if I just keep trying! 🧗‍♂️",
  "Every day I am getting stronger and smarter! 🧠",
  "I choose to be positive and spread happiness! 😊",
  "I believe in myself and my team! ⭐",
  "I am proud of who I am becoming! 🌻"
];

export const leadershipChallenges = [
  "Challenge: Be the first to say 'Good Morning' to 3 people today! ☀️",
  "Challenge: Teach a friend or sibling something new you learned! 📚",
  "Challenge: Invent a fun new game and explain the rules clearly to your friends! 🎲",
  "Challenge: Try to go a whole day without complaining about anything! 🤐",
  "Challenge: Find someone who looks sad and try to make them smile! 😄",
  "Challenge: Organize your books or toys into neat, easy-to-find piles! 📚",
  "Challenge: Ask for help when you need it – real leaders know they can't do everything alone! 🙋‍♂️"
];

export const HERO_MISSIONS = leadershipChallenges;

export const braveryScenarios = aikoScenarios.map(({ scenario, correct }) => ({
  scenario,
  action: correct,
}));
