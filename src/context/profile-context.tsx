import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { getVisualStyleTokens, type VisualStyleTokens } from '@/constants/visual-styles';
import { getLevelFromXp, getXpWithinLevel } from '@/data/progression';
import {
  DEFAULT_AVATAR_ID,
  PROFILE_STORAGE_KEY,
  getAvatarById,
  getDefaultAvatarForStyle,
  normalizeProfile,
  type Avatar,
  type PersistedProfileRecord,
  type PlayerIdentity,
  type PlayerProfile,
  type VisualStyle,
} from '@/data/profile';
import { isWorldId, type WorldId } from '@/data/worlds';
import { useQuests } from '@/context/quest-context';

type ProfileContextValue = {
  /** Persisted identity + live progression stats (single XP source: quest system). */
  profile: PlayerProfile;
  /** Resolved avatar object for the current avatarId. */
  avatar: Avatar;
  /** Style tokens for the selected visual experience. */
  styleTokens: VisualStyleTokens;
  isWorldUnlocked: (worldId: WorldId) => boolean;
  setVisualStyle: (style: VisualStyle) => void;
  setAvatar: (avatarId: string) => void;
  setAvatarName: (name: string) => void;
  selectCurrentWorld: (worldId: WorldId) => void;
  unlockWorld: (worldId: WorldId) => void;
};

type ProfileState = PlayerIdentity & {
  hydrated: boolean;
};

type ProfileAction =
  | { type: 'hydrate'; state: ProfileState }
  | { type: 'set-style'; style: VisualStyle }
  | { type: 'set-avatar'; avatarId: string }
  | { type: 'rename'; name: string }
  | { type: 'select-world'; worldId: WorldId }
  | { type: 'unlock-world'; worldId: WorldId };

function defaultProfileState(): ProfileState {
  return { ...normalizeProfile({}), hydrated: false };
}

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'set-style':
      return { ...state, visualStyle: action.style };
    case 'set-avatar': {
      const avatar = getAvatarById(action.avatarId);
      if (!avatar) {
        return state;
      }
      return { ...state, avatarId: avatar.id };
    }
    case 'rename':
      return { ...state, avatarName: action.name };
    case 'select-world':
      if (!isWorldId(action.worldId)) {
        return state;
      }
      return { ...state, currentWorldId: action.worldId };
    case 'unlock-world':
      if (!isWorldId(action.worldId) || state.unlockedWorldIds.includes(action.worldId)) {
        return state;
      }
      return { ...state, unlockedWorldIds: [...state.unlockedWorldIds, action.worldId] };
  }
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, undefined, defaultProfileState);
  const { totalXp, completedQuestIds } = useQuests();

  useEffect(() => {
    async function loadProfile() {
      try {
        const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile) as PersistedProfileRecord;
          dispatch({ type: 'hydrate', state: { ...normalizeProfile(parsed), hydrated: true } });
          return;
        }
      } catch {
        // Fall through to defaults on any parse/read failure.
      }
      dispatch({ type: 'hydrate', state: { ...defaultProfileState(), hydrated: true } });
    }

    loadProfile();
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    const record: PersistedProfileRecord = {
      version: 1,
      avatarId: state.avatarId,
      avatarName: state.avatarName,
      visualStyle: state.visualStyle,
      currentWorldId: state.currentWorldId,
      unlockedWorldIds: state.unlockedWorldIds,
      createdAt: state.createdAt,
    };
    AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(record)).catch(() => undefined);
  }, [state]);

  const value = useMemo<ProfileContextValue>(() => {
    const avatar =
      getAvatarById(state.avatarId) ??
      getDefaultAvatarForStyle(state.visualStyle) ??
      getAvatarById(DEFAULT_AVATAR_ID)!;

    return {
      profile: {
        avatarId: state.avatarId,
        avatarName: state.avatarName,
        visualStyle: state.visualStyle,
        currentWorldId: state.currentWorldId,
        unlockedWorldIds: state.unlockedWorldIds,
        createdAt: state.createdAt,
        level: getLevelFromXp(totalXp),
        xp: totalXp,
        xpWithinLevel: getXpWithinLevel(totalXp),
        totalQuestsCompleted: completedQuestIds.length,
      },
      avatar,
      styleTokens: getVisualStyleTokens(state.visualStyle),
      isWorldUnlocked: (worldId) => state.unlockedWorldIds.includes(worldId),
      setVisualStyle: (style) => dispatch({ type: 'set-style', style }),
      setAvatar: (avatarId) => dispatch({ type: 'set-avatar', avatarId }),
      setAvatarName: (name) => dispatch({ type: 'rename', name }),
      selectCurrentWorld: (worldId) => dispatch({ type: 'select-world', worldId }),
      unlockWorld: (worldId) => dispatch({ type: 'unlock-world', worldId }),
    };
  }, [state, totalXp, completedQuestIds]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used inside ProfileProvider');
  }
  return context;
}