import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

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
  completeQuest: (quest: Quest) => void;
  addQuest: (
    quest: Omit<Quest, 'id' | 'completed' | 'createdAt' | 'worldId' | 'status'>,
  ) => void;
};

const STORAGE_KEY = 'glowquest-state-v1';

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

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState(initialQuests);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

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
            setQuests(
              parsedState.quests.map(({ world, ...quest }) => ({
                ...quest,
                worldId: quest.worldId ?? world ?? 'everyday',
              })),
            );
          }
          if (parsedState.completedQuestIds) {
            setCompletedQuestIds(parsedState.completedQuestIds);
          }
          if (typeof parsedState.totalXp === 'number') {
            setTotalXp(parsedState.totalXp);
          }
          if (typeof parsedState.currentStreak === 'number') {
            setCurrentStreak(parsedState.currentStreak);
          }
        }
      } catch {
        // If saved data is invalid, continue with the default in-memory state.
      } finally {
        setIsHydrated(true);
      }
    }

    loadState();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ quests, completedQuestIds, totalXp, currentStreak }),
    ).catch(() => {
      // Storage errors should not interrupt the local app experience.
    });
  }, [completedQuestIds, currentStreak, isHydrated, quests, totalXp]);

  function completeQuest(quest: Quest) {
    if (completedQuestIds.includes(quest.id)) {
      return;
    }

    setCompletedQuestIds((current) => [...current, quest.id]);
    setTotalXp((current) => current + quest.xp);
    setCurrentStreak(1);
    setQuests((current) =>
      current.map((item) =>
        item.id === quest.id ? { ...item, completed: true, status: 'completed' } : item,
      ),
    );
  }

  function addQuest(
    quest: Omit<Quest, 'id' | 'completed' | 'createdAt' | 'worldId' | 'status'>,
  ) {
    setQuests((current) => [
      ...current,
      {
        ...quest,
        id: `quest-${Date.now()}`,
        completed: false,
        createdAt: new Date().toISOString(),
        worldId: 'everyday',
        status: 'available',
      },
    ]);
  }

  return (
    <QuestContext.Provider
      value={{ quests, completedQuestIds, totalXp, currentStreak, completeQuest, addQuest }}>
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
