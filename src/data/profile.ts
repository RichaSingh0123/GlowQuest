import { isWorldId, WORLD_IDS, type WorldId } from '@/data/worlds';

/**
 * Player profile foundation (Phase 2).
 *
 * Persistence stores identity + preferences only. Progression stats
 * (level / xp / quests completed) are derived from the quest system so
 * there is never a second competing XP source.
 */

export const VISUAL_STYLES = ['fairytale', 'adventure'] as const;

export type VisualStyle = (typeof VISUAL_STYLES)[number];

/**
 * Placeholder avatar entry. Emoji stands in for future custom artwork:
 * when real art lands, extend this type with an optional `artwork` field
 * (e.g. `{ light: ImageSource; dark?: ImageSource }`) without breaking
 * any consumer — everything reads through `getAvatarById`.
 */
export type Avatar = {
  id: string;
  name: string;
  emoji: string;
  style: VisualStyle;
  tagline: string;
};

export const AVATARS: Avatar[] = [
  {
    id: 'princess',
    name: 'Princess',
    emoji: '👸',
    style: 'fairytale',
    tagline: 'Graceful ruler of cozy kingdoms.',
  },
  {
    id: 'fairy',
    name: 'Fairy',
    emoji: '🧚',
    style: 'fairytale',
    tagline: 'Sprinkles focus-dust on every task.',
  },
  {
    id: 'bunny',
    name: 'Bunny',
    emoji: '🐰',
    style: 'fairytale',
    tagline: 'Hops through checklists with joy.',
  },
  {
    id: 'magical-girl',
    name: 'Magical Girl',
    emoji: '🪄',
    style: 'fairytale',
    tagline: 'Transforms to-dos into sparkles.',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🧭',
    style: 'adventure',
    tagline: 'Maps the way to done.',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🧙',
    style: 'adventure',
    tagline: 'Casts spells of deep focus.',
  },
  {
    id: 'knight',
    name: 'Knight',
    emoji: '🛡️',
    style: 'adventure',
    tagline: 'Guardian of good habits.',
  },
  {
    id: 'fox',
    name: 'Fox',
    emoji: '🦊',
    style: 'adventure',
    tagline: 'Clever, quick and curious.',
  },
];

export const DEFAULT_VISUAL_STYLE: VisualStyle = 'fairytale';
export const DEFAULT_AVATAR_ID = 'fairy';
export const DEFAULT_CURRENT_WORLD_ID: WorldId = 'dreamscape';

/** All four worlds are open from day one; unlocking is future-proofing. */
export const DEFAULT_UNLOCKED_WORLD_IDS: WorldId[] = [...WORLD_IDS];

export const MAX_AVATAR_NAME_LENGTH = 24;

export const PROFILE_STORAGE_KEY = 'glowquest-profile-v1';

/** Identity + preferences that are persisted to AsyncStorage. */
export type PlayerIdentity = {
  avatarId: string;
  avatarName: string;
  visualStyle: VisualStyle;
  currentWorldId: WorldId;
  unlockedWorldIds: WorldId[];
  createdAt: string;
};

/** Full player profile: persisted identity + live progression stats. */
export type PlayerProfile = PlayerIdentity & {
  level: number;
  /** Total XP earned across all worlds (mirrors the quest system). */
  xp: number;
  /** XP earned within the current level (0–99). */
  xpWithinLevel: number;
  totalQuestsCompleted: number;
};

export type PersistedProfileRecord = {
  version?: number;
  avatarId?: string;
  avatarName?: string;
  visualStyle?: string;
  currentWorldId?: string;
  unlockedWorldIds?: string[];
  createdAt?: string;
};

export function isVisualStyle(value?: string): value is VisualStyle {
  return value === 'fairytale' || value === 'adventure';
}

export function getAvatarById(avatarId?: string): Avatar | undefined {
  if (!avatarId) {
    return undefined;
  }
  return AVATARS.find((avatar) => avatar.id === avatarId);
}

export function getAvatarsForStyle(style: VisualStyle): Avatar[] {
  return AVATARS.filter((avatar) => avatar.style === style);
}

export function getDefaultAvatarForStyle(style: VisualStyle): Avatar {
  return getAvatarsForStyle(style)[0] ?? getAvatarById(DEFAULT_AVATAR_ID)!;
}

function normalizeAvatarName(value?: string): string {
  if (!value) {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_AVATAR_NAME_LENGTH);
}

function normalizeCreatedAt(value?: string): string {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return new Date().toISOString();
}

export function normalizeProfile(record: PersistedProfileRecord): PlayerIdentity {
  const visualStyle = isVisualStyle(record.visualStyle) ? record.visualStyle : DEFAULT_VISUAL_STYLE;
  const storedAvatar = getAvatarById(record.avatarId);
  const avatar = storedAvatar ?? getDefaultAvatarForStyle(visualStyle);

  const unlockedWorldIds = (record.unlockedWorldIds ?? []).filter(
    (worldId): worldId is WorldId => isWorldId(worldId),
  );

  const currentWorldId =
    record.currentWorldId && isWorldId(record.currentWorldId)
      ? record.currentWorldId
      : DEFAULT_CURRENT_WORLD_ID;

  return {
    avatarId: avatar.id,
    avatarName: normalizeAvatarName(record.avatarName),
    visualStyle,
    currentWorldId,
    unlockedWorldIds: unlockedWorldIds.length > 0 ? unlockedWorldIds : [...DEFAULT_UNLOCKED_WORLD_IDS],
    createdAt: normalizeCreatedAt(record.createdAt),
  };
}