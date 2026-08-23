import type { WorldId } from '@/data/worlds';

export type WorldQuestCopy = {
  accept: string;
  later: string;
  laterCollection: string;
};

export const worldQuestCopy: Record<WorldId, WorldQuestCopy> = {
  dreamscape: {
    accept: 'Nurture yourself',
    later: 'The Resting Garden',
    laterCollection: 'The Resting Garden',
  },
  'heros-journey': {
    accept: 'Accept the mission',
    later: 'The Strategy Board',
    laterCollection: 'The Strategy Board',
  },
  'glow-up-city': {
    accept: 'Make a positive move',
    later: 'The Inspiration Board',
    laterCollection: 'The Inspiration Board',
  },
  'future-lab': {
    accept: 'Run the experiment',
    later: 'The Future Queue',
    laterCollection: 'The Future Queue',
  },
};
