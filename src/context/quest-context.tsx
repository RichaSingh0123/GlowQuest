import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

import {
  HOME_QUEST_WORLD_ID,
  normalizeQuest,
  seedQuests,
  type PersistedQuestRecord,
  type Quest,
} from '@/data/quests';

export type { Quest, QuestStatus, QuestWorldId } from '@/data/quests';
export { HOME_QUEST_WORLD_ID } from '@/data/quests';

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
  quests: seedQuests,
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
            quests?: PersistedQuestRecord[];
            completedQuestIds?: string[];
            totalXp?: number;
            currentStreak?: number;
          };

          if (parsedState.quests) {
            const savedQuests = parsedState.quests.flatMap((quest) => {
              if (!quest.id || !quest.title) {
                return [];
              }
              return [normalizeQuest({ ...quest, id: quest.id, title: quest.title })];
            });
            const savedQuestIds = new Set(savedQuests.map((quest) => quest.id));
            dispatch({
              type: 'hydrate',
              state: {
                hydrated: true,
                quests: [
                  ...savedQuests,
                  ...seedQuests.filter((quest) => !savedQuestIds.has(quest.id)),
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
        dispatch({ type: 'hydrate', state: { ...defaultQuestState, hydrated: true } });
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
        worldId: HOME_QUEST_WORLD_ID,
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
