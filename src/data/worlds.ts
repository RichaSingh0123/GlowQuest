export type World = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  theme: string;
};

export const worlds: World[] = [
  {
    id: 'dreamscape',
    name: 'Dreamscape',
    emoji: '🌸',
    description: 'A gentle garden for self-care, mindfulness, and wellness.',
    theme: 'dreamscape',
  },
  {
    id: 'heros-journey',
    name: "Hero's Journey",
    emoji: '⚔️',
    description: 'A brave path for studying, coding, DSA, and academics.',
    theme: 'heros-journey',
  },
  {
    id: 'glow-up-city',
    name: 'Glow-Up City',
    emoji: '💖',
    description: 'A bright city for fitness, habits, confidence, and growth.',
    theme: 'glow-up-city',
  },
  {
    id: 'future-lab',
    name: 'Future Lab',
    emoji: '🚀',
    description: 'A launchpad for projects, AI, career, and new skills.',
    theme: 'future-lab',
  },
];
