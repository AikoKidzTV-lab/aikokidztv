export const fitnessChallenges = [
  "Do 10 jumping jacks as fast as you can! 🏃‍♂️",
  "Balance on one leg for 15 seconds like a flamingo! 🦩",
  "Touch your toes 10 times without bending your knees! 🤸‍♀️",
  "Pretend to jump rope for 30 seconds! 🪢",
  "Do 5 frog jumps! Ribbit! 🐸",
  "Run in place for 20 seconds as fast as a cheetah! 🐆",
  "Do 5 big star jumps! ⭐",
  "Stretch your arms as high as you can and count to 10! ⬆️",
  "Do 3 forward rolls (only if you are on a soft carpet or mat)! 🛏️",
  "Walk like a crab across the room! 🦀"
];

export const sportsTrivia = [
  { question: "Which sport uses a black and white ball that you kick?", answer: "Football / Soccer", emoji: "⚽" },
  { question: "In which sport do you hit a yellow fuzzy ball over a net with a racket?", answer: "Tennis", emoji: "🎾" },
  { question: "Which sport is played with a bat, a ball, and wickets?", answer: "Cricket", emoji: "🏏" },
  { question: "In which sport do you shoot a large orange ball through a hoop?", answer: "Basketball", emoji: "🏀" },
  { question: "Which sport uses a shuttlecock instead of a ball?", answer: "Badminton", emoji: "🏸" },
  { question: "Which sport involves hitting a small white ball into a hole from far away?", answer: "Golf", emoji: "⛳" },
  { question: "In what sport do you wear a heavy helmet and slide on ice to hit a puck?", answer: "Ice Hockey", emoji: "🏒" },
  { question: "Which sport uses a heavy ball to knock down 10 white pins?", answer: "Bowling", emoji: "🎳" },
  { question: "In which sport do you hit a ball over a net using your hands and jump very high?", answer: "Volleyball", emoji: "🏐" },
  { question: "What sport takes place in a pool with lanes?", answer: "Swimming", emoji: "🏊‍♂️" }
];

export const healthyHabits = [
  "Drink a big glass of water right after waking up! 💧",
  "Wash your hands with soap for at least 20 seconds! 🧼",
  "Eat at least one green vegetable with your dinner today! 🥦",
  "Brush your teeth for 2 whole minutes, morning and night! 🪥",
  "Get at least 8 to 10 hours of sleep so your brain can grow! 🛌",
  "Take a deep breath in, hold it, and breathe out slowly when you feel angry. 🧘‍♂️",
  "Limit your screen time and go play outside for an hour! ☀️",
  "Cough or sneeze into your elbow to protect your friends from germs! 🤧",
  "Always wear a helmet when riding your bike or scooter! 🚴‍♂️",
  "Eat a colorful fruit like an apple or banana for your snack! 🍎"
];

export const teamworkScenarios = [
  { title: "The Relay Race", scenario: "Your teammate drops the baton during a race.", options: ["Yell at them", "Encourage them to pick it up and keep going", "Quit the race"], correct: "Encourage them to pick it up and keep going", emoji: "🏃‍♀️" },
  { title: "The Ball Hog", scenario: "A player on your team won't pass the ball to anyone.", options: ["Push them", "Stop playing", "Politely ask them to pass and remind them it's a team game"], correct: "Politely ask them to pass and remind them it's a team game", emoji: "⚽" },
  { title: "The Losing Game", scenario: "Your team is losing by 10 points and the game is almost over.", options: ["Give up and sit down", "Keep playing your best until the whistle blows", "Blame the referee"], correct: "Keep playing your best until the whistle blows", emoji: "⏱️" },
  { title: "The Injured Player", scenario: "A player from the OTHER team falls down and hurts their knee.", options: ["Laugh at them", "Ignore them", "Check if they are okay and help them up"], correct: "Check if they are okay and help them up", emoji: "🤝" },
  { title: "The Winning Goal", scenario: "Your teammate scores the winning point!", options: ["Say nothing", "High-five them and celebrate together", "Say you could have done it better"], correct: "High-five them and celebrate together", emoji: "🏆" }
];

export const fitnessMissions = fitnessChallenges;

const healthyHabitEmojis = ["💧", "🧼", "🥦", "🪥", "🛌", "🧘‍♂️", "☀️", "🤧", "🚴‍♂️", "🍎"];

export const foodFacts = healthyHabits.map((habit, index) => ({
  food: `Healthy Habit ${index + 1}`,
  emoji: healthyHabitEmojis[index] || "🥗",
  fact: habit,
}));
