import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

export type Quest = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  category: string;
  completed: boolean;
  createdAt: string;
  worldId: string;
  status: 'available' | 'accepted' | 'later' | 'completed';
};

type QuestContextValue = {
  quests: Quest[];
  completedQuestIds: string[];
  totalXp: number;
  currentStreak: number;
  acceptQuest: (id: string) => void;
  saveQuestForLater: (id: string) => void;
  restoreQuest: (id: string) => void;
  completeQuest: (quest: Quest) => void;
  addQuest: (
    quest: Omit<Quest, 'id' | 'completed' | 'createdAt' | 'worldId' | 'status'>,
  ) => void;
};

const STORAGE_KEY = 'glowquest-state-v1';

function normalizeQuest(quest: Partial<Quest> & Pick<Quest, 'id' | 'title'>): Quest {
  const completed = quest.completed === true || quest.status === 'completed';
  const status = quest.status;
  const normalizedStatus =
    completed || status === 'completed'
      ? 'completed'
      : status === 'accepted' || status === 'later'
        ? status
        : 'available';
  return {
    id: quest.id,
    emoji: quest.emoji ?? '✨',
    title: quest.title,
    description: quest.description ?? '',
    duration: quest.duration ?? '0 min',
    xp: quest.xp ?? 0,
    category: quest.category ?? 'Personal',
    completed,
    createdAt: quest.createdAt ?? new Date().toISOString(),
    worldId: quest.worldId ?? 'everyday',
    status: normalizedStatus,
  };
}

const initialQuests: Quest[] = [
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
    worldId: 'everyday',
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
    worldId: 'everyday',
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
    worldId: 'everyday',
    status: 'available',
  },
];

const initialWorldQuests: Quest[] = [
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
];

const allInitialQuests = [...initialQuests, ...initialWorldQuests];

type QuestState = {
  hydrated: boolean;
  quests: Quest[];
  completedQuestIds: string[];
  totalXp: number;
  currentStreak: number;
};

type QuestAction =
  | { type: 'hydrate'; state: QuestState }
  | { type: 'accept'; id: string }
  | { type: 'save'; id: string }
  | { type: 'restore'; id: string }
  | { type: 'complete'; quest: Quest }
  | { type: 'add'; quest: Quest };

function questReducer(state: QuestState, action: QuestAction): QuestState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'accept':
      return {
        ...state,
        quests: state.quests.map((quest) =>
          quest.id === action.id && !quest.completed && quest.status === 'available'
            ? { ...quest, status: 'accepted' }
            : quest,
        ),
      };
    case 'save':
      return {
        ...state,
        quests: state.quests.map((quest) =>
          quest.id === action.id && !quest.completed && quest.status === 'available'
            ? { ...quest, status: 'later' }
            : quest,
        ),
      };
    case 'restore':
      return {
        ...state,
        quests: state.quests.map((quest) =>
          quest.id === action.id && !quest.completed && quest.status === 'later'
            ? { ...quest, status: 'available' }
            : quest,
        ),
      };
    case 'complete':
      if (state.completedQuestIds.includes(action.quest.id)) {
        return state;
      }
      return {
        ...state,
        completedQuestIds: [...state.completedQuestIds, action.quest.id],
        totalXp: state.totalXp + action.quest.xp,
        currentStreak: 1,
        quests: state.quests.map((quest) =>
          quest.id === action.quest.id ? { ...quest, completed: true, status: 'completed' } : quest,
        ),
      };
    case 'add':
      return { ...state, quests: [...state.quests, action.quest] };
  }
}

const defaultQuestState: QuestState = {
  hydrated: false,
  quests: allInitialQuests,
  completedQuestIds: [],
  totalXp: 0,
  currentStreak: 0,
};

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(questReducer, defaultQuestState);

  useEffect(() => {
    async function loadState() {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState) as {
            quests?: Array<Quest & { world?: string }>;
            completedQuestIds?: string[];
            totalXp?: number;
            currentStreak?: number;
          };

          if (parsedState.quests) {
            const savedQuests = parsedState.quests.map(({ world, ...quest }) =>
                normalizeQuest({ ...quest, worldId: quest.worldId ?? world ?? 'everyday' }),
              );
            const savedQuestIds = new Set(savedQuests.map((quest) => quest.id));
            dispatch({
              type: 'hydrate',
              state: {
                hydrated: true,
                quests: [
                  ...savedQuests,
                  ...allInitialQuests.filter((quest) => !savedQuestIds.has(quest.id)),
                ],
                completedQuestIds: parsedState.completedQuestIds ?? [],
                totalXp: parsedState.totalXp ?? 0,
                currentStreak: parsedState.currentStreak ?? 0,
              },
            });
          } else {
            dispatch({ type: 'hydrate', state: { ...defaultQuestState, hydrated: true } });
          }
        } else {
          dispatch({ type: 'hydrate', state: { ...defaultQuestState, hydrated: true } });
        }
      } catch {
        // If saved data is invalid, continue with the default in-memory state.
      } finally {
      }
    }

    loadState();
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  function completeQuest(quest: Quest) {
    dispatch({ type: 'complete', quest });
  }

  function acceptQuest(id: string) {
    dispatch({ type: 'accept', id });
  }

  function saveQuestForLater(id: string) {
    dispatch({ type: 'save', id });
  }

  function restoreQuest(id: string) {
    dispatch({ type: 'restore', id });
  }

  function addQuest(
    quest: Omit<Quest, 'id' | 'completed' | 'createdAt' | 'worldId' | 'status'>,
  ) {
    dispatch({
      type: 'add',
      quest: {
        ...quest,
        id: `quest-${Date.now()}`,
        completed: false,
        createdAt: new Date().toISOString(),
        worldId: 'everyday',
        status: 'available',
      },
    });
  }

  return (
    <QuestContext.Provider
      value={{
        quests: state.quests,
        completedQuestIds: state.completedQuestIds,
        totalXp: state.totalXp,
        currentStreak: state.currentStreak,
        acceptQuest,
        saveQuestForLater,
        restoreQuest,
        completeQuest,
        addQuest,
      }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used inside QuestProvider');
  }
  return context;
}
