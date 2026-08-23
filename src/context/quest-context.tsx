import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

import {
  computeCurrentStreak,
  createCompletionEvent,
  hasCompletionEventForQuest,
  hydrateProgression,
  type QuestCompletionEvent,
} from '@/data/progression';
import {
  HOME_QUEST_WORLD_ID,
  normalizeQuest,
  seedQuests,
  type PersistedQuestRecord,
  type Quest,
  type QuestWorldId,
} from '@/data/quests';

export type { Quest, QuestStatus, QuestWorldId } from '@/data/quests';
export type { QuestCompletionEvent } from '@/data/progression';
export { HOME_QUEST_WORLD_ID } from '@/data/quests';
export { getLevelFromXp, getXpWithinLevel } from '@/data/progression';

type QuestContextValue = {
  quests: Quest[];
  completedQuestIds: string[];
  completionEvents: QuestCompletionEvent[];
  totalXp: number;
  currentStreak: number;
  lastCompletedAt: string | null;
  acceptQuest: (id: string) => void;
  saveQuestForLater: (id: string) => void;
  restoreQuest: (id: string) => void;
  completeQuest: (quest: Quest) => void;
  addQuest: (
    quest: Omit<Quest, 'id' | 'completed' | 'createdAt' | 'worldId' | 'status'>,
    options?: { worldId?: QuestWorldId },
  ) => void;
};

const STORAGE_KEY = 'glowquest-state-v1';

type QuestState = {
  hydrated: boolean;
  quests: Quest[];
  completedQuestIds: string[];
  completionEvents: QuestCompletionEvent[];
  totalXp: number;
  currentStreak: number;
  lastCompletedAt: string | null;
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
    case 'complete': {
      const alreadyCompleted =
        state.completedQuestIds.includes(action.quest.id) ||
        hasCompletionEventForQuest(state.completionEvents, action.quest.id) ||
        action.quest.completed;
      if (alreadyCompleted) {
        return state;
      }

      const completedAt = new Date().toISOString();
      const completionEvent = createCompletionEvent(action.quest, completedAt);
      return {
        ...state,
        completedQuestIds: [...state.completedQuestIds, action.quest.id],
        completionEvents: [...state.completionEvents, completionEvent],
        totalXp: state.totalXp + action.quest.xp,
        currentStreak: computeCurrentStreak(
          [...state.completionEvents, completionEvent],
          new Date(completedAt),
        ),
        lastCompletedAt: completedAt,
        quests: state.quests.map((quest) =>
          quest.id === action.quest.id ? { ...quest, completed: true, status: 'completed' } : quest,
        ),
      };
    }
    case 'add':
      return { ...state, quests: [...state.quests, action.quest] };
  }
}

const defaultQuestState: QuestState = {
  hydrated: false,
  quests: seedQuests,
  completedQuestIds: [],
  completionEvents: [],
  totalXp: 0,
  currentStreak: 0,
  lastCompletedAt: null,
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
            completionEvents?: unknown[];
            totalXp?: number;
            currentStreak?: number;
            lastCompletedAt?: string | null;
          };

          if (parsedState.quests) {
            const savedQuests = parsedState.quests.flatMap((quest) => {
              if (!quest.id || !quest.title) {
                return [];
              }
              return [normalizeQuest({ ...quest, id: quest.id, title: quest.title })];
            });
            const savedQuestIds = new Set(savedQuests.map((quest) => quest.id));
            const quests = [
              ...savedQuests,
              ...seedQuests.filter((quest) => !savedQuestIds.has(quest.id)),
            ];
            const progression = hydrateProgression({
              quests,
              completedQuestIds: parsedState.completedQuestIds,
              completionEvents: parsedState.completionEvents,
              totalXp: parsedState.totalXp,
              currentStreak: parsedState.currentStreak,
              lastCompletedAt: parsedState.lastCompletedAt,
            });

            dispatch({
              type: 'hydrate',
              state: {
                hydrated: true,
                quests,
                ...progression,
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
    options?: { worldId?: QuestWorldId },
  ) {
    dispatch({
      type: 'add',
      quest: {
        ...quest,
        id: `quest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        completed: false,
        createdAt: new Date().toISOString(),
        worldId: options?.worldId ?? HOME_QUEST_WORLD_ID,
        status: 'available',
      },
    });
  }

  return (
    <QuestContext.Provider
      value={{
        quests: state.quests,
        completedQuestIds: state.completedQuestIds,
        completionEvents: state.completionEvents,
        totalXp: state.totalXp,
        currentStreak: state.currentStreak,
        lastCompletedAt: state.lastCompletedAt,
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
