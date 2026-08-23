import { isWorldId, type WorldId } from '@/data/worlds';

export const HOME_QUEST_WORLD_ID = 'everyday';

export type HomeQuestWorldId = typeof HOME_QUEST_WORLD_ID;
export type QuestWorldId = WorldId | HomeQuestWorldId;
export type QuestStatus = 'available' | 'accepted' | 'later' | 'completed';

export type Quest = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  worldId: QuestWorldId;
  status: QuestStatus;
  completed: boolean;
  xp: number;
  duration: string;
  /** Numeric duration in minutes — source of truth for timers/session logic. */
  durationMinutes: number;
  category: string;
  createdAt: string;
};

export type PersistedQuestRecord = Partial<Quest> & {
  world?: string;
};

export function isQuestWorldId(value: string): value is QuestWorldId {
  return value === HOME_QUEST_WORLD_ID || isWorldId(value);
}

export function isQuestStatus(value: string): value is QuestStatus {
  return value === 'available' || value === 'accepted' || value === 'later' || value === 'completed';
}

export function normalizeQuestWorldId(worldId?: string, legacyWorld?: string): QuestWorldId {
  const raw = worldId ?? legacyWorld;
  if (raw && isQuestWorldId(raw)) {
    return raw;
  }
  return HOME_QUEST_WORLD_ID;
}

export function parseDurationMinutes(value?: string): number {
  if (!value) {
    return 0;
  }
  const match = value.match(/\d+/);
  if (!match) {
    return 0;
  }
  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function formatDurationMinutes(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  return `${safeMinutes} min`;
}

export function normalizeQuest(quest: PersistedQuestRecord & Pick<Quest, 'id' | 'title'>): Quest {
  const completed = quest.completed === true || quest.status === 'completed';
  const status = quest.status;
  const normalizedStatus: QuestStatus =
    completed || status === 'completed'
      ? 'completed'
      : status && isQuestStatus(status)
        ? status
        : 'available';

  const normalizedDurationMinutes =
    typeof quest.durationMinutes === 'number' && Number.isFinite(quest.durationMinutes)
      ? Math.max(0, Math.round(quest.durationMinutes))
      : parseDurationMinutes(quest.duration);

  return {
    id: quest.id,
    emoji: quest.emoji ?? '✨',
    title: quest.title,
    description: quest.description ?? '',
    duration: quest.duration ?? formatDurationMinutes(normalizedDurationMinutes),
    durationMinutes: normalizedDurationMinutes,
    xp: quest.xp ?? 0,
    category: quest.category ?? 'Personal',
    completed,
    createdAt: quest.createdAt ?? new Date().toISOString(),
    worldId: normalizeQuestWorldId(quest.worldId, quest.world),
    status: normalizedStatus,
  };
}

type SeedQuest = Omit<Quest, 'durationMinutes'>;

function toQuest(seed: SeedQuest): Quest {
  return { ...seed, durationMinutes: parseDurationMinutes(seed.duration) };
}

const homeSeedQuestsBase: SeedQuest[] = [
  {
    id: 'study-java',
    emoji: '📚',
    title: 'Study Java',
    description: 'Complete one focused study session.',
    duration: '20 min',
    xp: 30,
    category: 'Learning',
    completed: false,
    createdAt: '2026-08-22T00:00:00.000Z',
    worldId: HOME_QUEST_WORLD_ID,
    status: 'available',
  },
  {
    id: 'morning-workout',
    emoji: '🧘',
    title: 'Morning Workout',
    description: 'Move your body and start the day bright.',
    duration: '15 min',
    xp: 20,
    category: 'Wellness',
    completed: false,
    createdAt: '2026-08-22T00:00:00.000Z',
    worldId: HOME_QUEST_WORLD_ID,
    status: 'available',
  },
  {
    id: 'drink-water',
    emoji: '💧',
    title: 'Drink Water',
    description: 'Take a refreshing pause for your body.',
    duration: '5 min',
    xp: 10,
    category: 'Wellness',
    completed: false,
    createdAt: '2026-08-22T00:00:00.000Z',
    worldId: HOME_QUEST_WORLD_ID,
    status: 'available',
  },
];

const worldSeedQuestsBase: Record<WorldId, SeedQuest[]> = {
  dreamscape: [
    {
      id: 'dreamscape-water',
      emoji: '💧',
      title: 'Drink a glass of water',
      description: 'Give your body a refreshing moment of care.',
      duration: '2 min',
      xp: 10,
      category: 'Wellness',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'dreamscape',
      status: 'available',
    },
    {
      id: 'dreamscape-meditate',
      emoji: '🧘',
      title: 'Meditate for 5 minutes',
      description: 'Let your thoughts settle like petals on a pond.',
      duration: '5 min',
      xp: 15,
      category: 'Mindfulness',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'dreamscape',
      status: 'available',
    },
    {
      id: 'dreamscape-journal',
      emoji: '📖',
      title: 'Journal one thought',
      description: 'Give one feeling or idea a quiet place to land.',
      duration: '5 min',
      xp: 15,
      category: 'Reflection',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'dreamscape',
      status: 'available',
    },
    {
      id: 'dreamscape-screen-break',
      emoji: '🌙',
      title: 'Take a 10-minute screen break',
      description: 'Step away and let your eyes rest under the moonlight.',
      duration: '10 min',
      xp: 20,
      category: 'Rest',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'dreamscape',
      status: 'available',
    },
  ],
  'heros-journey': [
    {
      id: 'heros-journey-java',
      emoji: '📚',
      title: 'Study Java for 20 minutes',
      description: 'Train your mind with one focused study session.',
      duration: '20 min',
      xp: 30,
      category: 'Learning',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'heros-journey',
      status: 'available',
    },
    {
      id: 'heros-journey-dsa',
      emoji: '🧩',
      title: 'Solve 1 DSA problem',
      description: 'Face one problem and sharpen your problem-solving blade.',
      duration: '20 min',
      xp: 25,
      category: 'Practice',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'heros-journey',
      status: 'available',
    },
    {
      id: 'heros-journey-lecture',
      emoji: '📜',
      title: "Review today's lecture notes",
      description: 'Restore one fragment of the Knowledge Crystal.',
      duration: '15 min',
      xp: 20,
      category: 'Academics',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'heros-journey',
      status: 'available',
    },
    {
      id: 'heros-journey-coding',
      emoji: '⚔️',
      title: 'Complete one coding exercise',
      description: 'Enter the Codeforge and build your next skill.',
      duration: '25 min',
      xp: 30,
      category: 'Coding',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'heros-journey',
      status: 'available',
    },
  ],
  'glow-up-city': [
    {
      id: 'glow-up-city-walk',
      emoji: '🚶',
      title: 'Take a 15-minute walk',
      description: 'Bring fresh energy to Sunrise Park.',
      duration: '15 min',
      xp: 20,
      category: 'Fitness',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'glow-up-city',
      status: 'available',
    },
    {
      id: 'glow-up-city-workout',
      emoji: '💪',
      title: 'Complete a short workout',
      description: 'Turn up the city lights with a burst of movement.',
      duration: '15 min',
      xp: 20,
      category: 'Fitness',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'glow-up-city',
      status: 'available',
    },
    {
      id: 'glow-up-city-organize',
      emoji: '🧺',
      title: 'Organize one small area',
      description: 'Make one corner of your city feel lighter.',
      duration: '10 min',
      xp: 15,
      category: 'Habits',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'glow-up-city',
      status: 'available',
    },
    {
      id: 'glow-up-city-routine',
      emoji: '☀️',
      title: 'Follow your morning/evening routine',
      description: 'Keep your brightest habits moving along the boulevard.',
      duration: '20 min',
      xp: 25,
      category: 'Routine',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'glow-up-city',
      status: 'available',
    },
  ],
  'future-lab': [
    {
      id: 'future-lab-project',
      emoji: '🛠️',
      title: 'Work on a personal project for 20 minutes',
      description: 'Power up Launch Bay with one focused build session.',
      duration: '20 min',
      xp: 30,
      category: 'Projects',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'future-lab',
      status: 'available',
    },
    {
      id: 'future-lab-concept',
      emoji: '💡',
      title: 'Learn one technical concept',
      description: 'Charge the Skill Engine with a new idea.',
      duration: '15 min',
      xp: 20,
      category: 'Skills',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'future-lab',
      status: 'available',
    },
    {
      id: 'future-lab-portfolio',
      emoji: '🧪',
      title: 'Improve one portfolio feature',
      description: 'Turn a prototype into a clearer signal of your skills.',
      duration: '20 min',
      xp: 25,
      category: 'Career',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'future-lab',
      status: 'available',
    },
    {
      id: 'future-lab-opportunity',
      emoji: '🔭',
      title: 'Research one career/internship opportunity',
      description: 'Open a new possibility in the Career Observatory.',
      duration: '15 min',
      xp: 20,
      category: 'Career',
      completed: false,
      createdAt: '2026-08-22T00:00:00.000Z',
      worldId: 'future-lab',
      status: 'available',
    },
  ],
};

export const homeSeedQuests: Quest[] = homeSeedQuestsBase.map(toQuest);

export const worldSeedQuests: Record<WorldId, Quest[]> = {
  dreamscape: worldSeedQuestsBase.dreamscape.map(toQuest),
  'heros-journey': worldSeedQuestsBase['heros-journey'].map(toQuest),
  'glow-up-city': worldSeedQuestsBase['glow-up-city'].map(toQuest),
  'future-lab': worldSeedQuestsBase['future-lab'].map(toQuest),
};

export const seedQuests: Quest[] = [
  ...homeSeedQuests,
  ...worldSeedQuests.dreamscape,
  ...worldSeedQuests['heros-journey'],
  ...worldSeedQuests['glow-up-city'],
  ...worldSeedQuests['future-lab'],
];
