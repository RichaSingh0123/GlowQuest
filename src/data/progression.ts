import {
  normalizeQuestWorldId,
  type Quest,
  type QuestWorldId,
} from '@/data/quests';

export const XP_PER_LEVEL = 100;

export type QuestCompletionEvent = {
  id: string;
  questId: string;
  worldId: QuestWorldId;
  completedAt: string;
  xpEarned: number;
};

export type PersistedCompletionEvent = Partial<QuestCompletionEvent> & {
  quest?: string;
  timestamp?: string;
  xp?: number;
};

export type StreakState = {
  currentStreak: number;
  lastCompletedAt: string | null;
};

export type CompletionHistorySummary = {
  questsCompleted: number;
  xpEarned: number;
  worldsUsed: QuestWorldId[];
  completionDates: string[];
};

export function getLevelFromXp(totalXp: number): number {
  const xp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpWithinLevel(totalXp: number): number {
  const xp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  return xp % XP_PER_LEVEL;
}

export function getCalendarDayKey(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createCompletionEvent(
  quest: Quest,
  completedAt = new Date().toISOString(),
): QuestCompletionEvent {
  return {
    id: `event-${quest.id}-${completedAt}`,
    questId: quest.id,
    worldId: quest.worldId,
    completedAt,
    xpEarned: quest.xp,
  };
}

export function normalizeCompletionEvent(
  event: PersistedCompletionEvent,
): QuestCompletionEvent | null {
  const questId = event.questId ?? event.quest;
  if (!questId) {
    return null;
  }

  const completedAt = parseTimestamp(event.completedAt ?? event.timestamp);
  const xpEarned = Number(event.xpEarned ?? event.xp ?? 0);

  return {
    id: event.id && event.id.trim() ? event.id : `event-legacy-${questId}`,
    questId,
    worldId: normalizeQuestWorldId(event.worldId),
    completedAt,
    xpEarned: Number.isFinite(xpEarned) ? xpEarned : 0,
  };
}

export function hasCompletionEventForQuest(
  events: QuestCompletionEvent[],
  questId: string,
): boolean {
  return events.some((event) => event.questId === questId);
}

export function summarizeCompletionHistory(
  events: QuestCompletionEvent[],
): CompletionHistorySummary {
  const worldsUsed = [...new Set(events.map((event) => event.worldId))];

  return {
    questsCompleted: events.length,
    xpEarned: events.reduce((total, event) => total + event.xpEarned, 0),
    worldsUsed,
    completionDates: events.map((event) => event.completedAt),
  };
}

export function hydrateProgression({
  quests,
  completedQuestIds = [],
  completionEvents = [],
  totalXp = 0,
  currentStreak = 0,
  lastCompletedAt = null,
}: {
  quests: Quest[];
  completedQuestIds?: string[];
  completionEvents?: unknown[];
  totalXp?: number;
  currentStreak?: number;
  lastCompletedAt?: string | null;
}): {
  completionEvents: QuestCompletionEvent[];
  completedQuestIds: string[];
  totalXp: number;
  currentStreak: number;
  lastCompletedAt: string | null;
} {
  const questsById = new Map(quests.map((quest) => [quest.id, quest]));
  const normalizedEvents = completionEvents.flatMap((event) => {
    if (!event || typeof event !== 'object') {
      return [];
    }
    const normalized = normalizeCompletionEvent(event as PersistedCompletionEvent);
    return normalized ? [normalized] : [];
  });

  const eventsByQuestId = new Map<string, QuestCompletionEvent>();
  for (const event of normalizedEvents) {
    if (!eventsByQuestId.has(event.questId)) {
      eventsByQuestId.set(event.questId, event);
    }
  }

  const knownCompletedIds = new Set(
    [...completedQuestIds, ...quests.filter((quest) => quest.completed).map((quest) => quest.id)].filter(Boolean),
  );

  for (const questId of knownCompletedIds) {
    if (eventsByQuestId.has(questId)) {
      continue;
    }
    const quest = questsById.get(questId);
    if (!quest) {
      continue;
    }
    eventsByQuestId.set(questId, {
      id: `event-legacy-${quest.id}`,
      questId: quest.id,
      worldId: quest.worldId,
      completedAt: parseTimestamp(quest.createdAt),
      xpEarned: quest.xp,
    });
  }

  const hydratedEvents = [...eventsByQuestId.values()];
  const hydratedCompletedIds = [...new Set([...knownCompletedIds, ...hydratedEvents.map((event) => event.questId)])];
  const latestEvent = hydratedEvents.reduce<QuestCompletionEvent | null>((latest, event) => {
    if (!latest) {
      return event;
    }
    return event.completedAt > latest.completedAt ? event : latest;
  }, null);

  return {
    completionEvents: hydratedEvents,
    completedQuestIds: hydratedCompletedIds,
    totalXp: Number.isFinite(totalXp) ? totalXp : 0,
    currentStreak: Number.isFinite(currentStreak) ? currentStreak : 0,
    lastCompletedAt: parseOptionalTimestamp(lastCompletedAt) ?? latestEvent?.completedAt ?? null,
  };
}

function parseTimestamp(value?: string): string {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return new Date(0).toISOString();
}

function parseOptionalTimestamp(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
