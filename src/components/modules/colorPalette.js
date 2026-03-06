// Color palette with deuteranopia (red-green color blindness) simulation hex values.
const CB_OVERRIDES = {
  red: '#8F7E00',
  blue: '#3B82F6',
  green: '#8D9E4A',
  yellow: '#FFE0A8',
  orange: '#AB8E00',
  purple: '#5269F7',
};

const BASE_PALETTE = [
  // Basic Colors (Free)
  { id: 'red', name: 'Red', hex: '#EF4444', unlockCost: 0 },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', unlockCost: 0 },
  { id: 'green', name: 'Green', hex: '#22C55E', unlockCost: 0 },
  { id: 'yellow', name: 'Yellow', hex: '#EAB308', unlockCost: 0 },
  { id: 'orange', name: 'Orange', hex: '#F97316', unlockCost: 0 },
  { id: 'purple', name: 'Purple', hex: '#A855F7', unlockCost: 0 },
  { id: 'pink', name: 'Pink', hex: '#EC4899', unlockCost: 0 },
  { id: 'brown', name: 'Brown', hex: '#8B4513', unlockCost: 0 },
  { id: 'black', name: 'Black', hex: '#000000', unlockCost: 0 },
  { id: 'white', name: 'White', hex: '#FFFFFF', unlockCost: 0, border: true },

  // Premium / Gem Colors
  { id: 'cyan', name: 'Cyan', hex: '#06B6D4', unlockCost: 10 },
  { id: 'magenta', name: 'Magenta', hex: '#D946EF', unlockCost: 10 },
  { id: 'lime', name: 'Lime', hex: '#84CC16', unlockCost: 10 },
  { id: 'teal', name: 'Teal', hex: '#14B8A6', unlockCost: 15 },
  { id: 'indigo', name: 'Indigo', hex: '#6366F1', unlockCost: 15 },
  { id: 'rose', name: 'Rose', hex: '#F43F5E', unlockCost: 15 },
  { id: 'amber', name: 'Amber', hex: '#F59E0B', unlockCost: 10 },
  { id: 'emerald', name: 'Emerald', hex: '#10B981', unlockCost: 20 },
  { id: 'sky', name: 'Sky Blue', hex: '#0EA5E9', unlockCost: 10 },
  { id: 'fuchsia', name: 'Fuchsia', hex: '#C026D3', unlockCost: 20 },

  // Advanced Colors
  { id: 'crimson', name: 'Crimson', hex: '#DC143C', unlockCost: 25 },
  { id: 'gold', name: 'Gold', hex: '#FFD700', unlockCost: 50 },
  { id: 'coral', name: 'Coral', hex: '#FF7F50', unlockCost: 15 },
  { id: 'salmon', name: 'Salmon', hex: '#FA8072', unlockCost: 15 },
  { id: 'khaki', name: 'Khaki', hex: '#F0E68C', unlockCost: 10 },
  { id: 'plum', name: 'Plum', hex: '#DDA0DD', unlockCost: 20 },
  { id: 'orchid', name: 'Orchid', hex: '#DA70D6', unlockCost: 20 },
  { id: 'navy', name: 'Navy', hex: '#000080', unlockCost: 25 },
  { id: 'turquoise', name: 'Turquoise', hex: '#40E0D0', unlockCost: 30 },
  { id: 'olive', name: 'Olive', hex: '#808000', unlockCost: 15 },

  // Nature & Fun Themes
  { id: 'forest', name: 'Forest', hex: '#228B22', unlockCost: 20 },
  { id: 'chocolate', name: 'Chocolate', hex: '#D2691E', unlockCost: 20 },
  { id: 'tomato', name: 'Tomato', hex: '#FF6347', unlockCost: 15 },
  { id: 'peach', name: 'Peach', hex: '#FFDAB9', unlockCost: 15 },
  { id: 'lavender', name: 'Lavender', hex: '#E6E6FA', unlockCost: 25 },
  { id: 'maroon', name: 'Maroon', hex: '#800000', unlockCost: 20 },
  { id: 'mint', name: 'Mint', hex: '#98FF98', unlockCost: 30 },
  { id: 'aquamarine', name: 'Aquamarine', hex: '#7FFFD4', unlockCost: 35 },
  { id: 'hotpink', name: 'Hot Pink', hex: '#FF69B4', unlockCost: 30 },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0', unlockCost: 40 },

  // More Vibrant Shades
  { id: 'royal', name: 'Royal Blue', hex: '#4169E1', unlockCost: 30 },
  { id: 'dodger', name: 'Dodger Blue', hex: '#1E90FF', unlockCost: 20 },
  { id: 'slate', name: 'Slate', hex: '#708090', unlockCost: 10 },
  { id: 'peru', name: 'Peru', hex: '#CD853F', unlockCost: 15 },
  { id: 'sienna', name: 'Sienna', hex: '#A0522D', unlockCost: 15 },
  { id: 'chartreuse', name: 'Chartreuse', hex: '#7FFF00', unlockCost: 25 },
  { id: 'spring', name: 'Spring Green', hex: '#00FF7F', unlockCost: 25 },
  { id: 'deep_pink', name: 'Deep Pink', hex: '#FF1493', unlockCost: 30 },
  { id: 'violet', name: 'Violet', hex: '#8A2BE2', unlockCost: 35 },
  { id: 'platinum', name: 'Platinum', hex: '#E5E4E2', unlockCost: 50 },
];

export const COLOR_PALETTE = BASE_PALETTE.map((c) => ({
  ...c,
  unlockCost: 0,
  cbHex: CB_OVERRIDES[c.id] || c.hex,
}));

export default COLOR_PALETTE;
