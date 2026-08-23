import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VISUAL_STYLE_REGISTRY } from '@/constants/visual-styles';
import { getAvatarById, getAvatarsForStyle, MAX_AVATAR_NAME_LENGTH } from '@/data/profile';
import type { VisualStyle } from '@/data/profile';
import { useProfile } from '@/context/profile-context';
import { useQuests } from '@/context/quest-context';
import { useWorlds } from '@/context/world-context';

export default function ProfileScreen() {
  const {
    profile,
    avatar,
    styleTokens,
    setVisualStyle,
    setAvatar,
    setAvatarName,
    selectCurrentWorld,
  } = useProfile();
  const { worlds } = useWorlds();
  // Streak stays owned by the quest/progression system — read, never stored here.
  const { currentStreak } = useQuests();
  const colors = styleTokens.colors;

  const [nameDraft, setNameDraft] = useState(profile.avatarName);
  const [isEditing, setIsEditing] = useState(false);
  const [draftStyle, setDraftStyle] = useState<VisualStyle>(profile.visualStyle);
  const [draftAvatarId, setDraftAvatarId] = useState(avatar.id);
  const [draftWorldId, setDraftWorldId] = useState(profile.currentWorldId);

  useEffect(() => {
    if (!isEditing) {
      setNameDraft(profile.avatarName);
    }
  }, [isEditing, profile.avatarName]);

  function displayName() {
    return profile.avatarName.trim() || avatar.name;
  }

  function startEditing() {
    setDraftStyle(profile.visualStyle);
    setDraftAvatarId(avatar.id);
    setDraftWorldId(profile.currentWorldId);
    setNameDraft(profile.avatarName);
    setIsEditing(true);
  }

  function cancelEditing() {
    setNameDraft(profile.avatarName);
    setIsEditing(false);
  }

  function saveEditing() {
    const trimmed = nameDraft.trim().slice(0, MAX_AVATAR_NAME_LENGTH);
    // Persisted exclusively through the existing ProfileContext/AsyncStorage flow.
    setVisualStyle(draftStyle);
    setAvatar(draftAvatarId);
    setAvatarName(trimmed);
    selectCurrentWorld(draftWorldId);
    setNameDraft(trimmed);
    setIsEditing(false);
  }

  function chooseDraftStyle(style: VisualStyle) {
    setDraftStyle(style);
    const styleAvatars = getAvatarsForStyle(style);
    if (!styleAvatars.some((option) => option.id === draftAvatarId)) {
      const firstAvatar = styleAvatars[0];
      if (firstAvatar) {
        setDraftAvatarId(firstAvatar.id);
      }
    }
  }

  const xpProgress = Math.min(profile.xpWithinLevel / 100, 1);
  const currentWorld = worlds.find((world) => world.id === profile.currentWorldId);

  // While editing, pickers preview unsaved drafts; otherwise they mirror saved values.
  const activeStyle = isEditing ? draftStyle : profile.visualStyle;
  const activeAvatarId = isEditing ? draftAvatarId : profile.avatarId;
  const activeWorldId = isEditing ? draftWorldId : profile.currentWorldId;
  const previewAvatar = getAvatarById(activeAvatarId) ?? avatar;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.content}>
          <ThemedText style={[styles.kicker, { color: colors.accent }]}>YOUR CHARACTER</ThemedText>
          <ThemedText style={[styles.title, { color: colors.textPrimary }]}>Profile</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Shape the hero behind every quest.
          </ThemedText>

          <View style={styles.editActionsRow}>
            {/* Cancel/Save stay mounted (hidden until edit mode) so they are always
                present in the rendered tree and appear instantly when editing. */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isEditing }}
              disabled={!isEditing}
              onPress={cancelEditing}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                !isEditing && styles.editButtonHidden,
                pressed && isEditing && styles.pressed,
              ]}>
              <ThemedText style={[styles.editButtonText, { color: colors.textSecondary }]}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isEditing }}
              disabled={!isEditing}
              onPress={saveEditing}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: colors.accent, borderColor: colors.accent },
                !isEditing && styles.editButtonHidden,
                pressed && isEditing && styles.pressed,
              ]}>
              <ThemedText style={[styles.editButtonText, { color: colors.onAccent }]}>
                Save Changes ✓
              </ThemedText>
            </Pressable>
            {!isEditing ? (
              <Pressable
                accessibilityRole="button"
                onPress={startEditing}
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={[styles.editButtonText, { color: colors.accent }]}>
                  ✎ Edit Profile
                </ThemedText>
              </Pressable>
            ) : null}
          </View>

          {/* Character hero card */}
          <View style={[styles.heroPanel, { backgroundColor: colors.heroPanel }]}>
            <View style={styles.heroRow}>
              <View style={[styles.avatarOrb, { backgroundColor: colors.highlight }]}>
                <ThemedText style={styles.avatarOrbEmoji}>{previewAvatar.emoji}</ThemedText>
              </View>
              <View style={styles.heroCopy}>
                <ThemedText style={[styles.heroName, { color: colors.heroPanelText }]}>
                  {displayName()}
                </ThemedText>
                <ThemedText style={[styles.heroTagline, { color: colors.heroPanelSubtext }]}>
                  {styleTokens.emoji} {avatar.name} · {styleTokens.label}
                </ThemedText>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: colors.highlight }]}>
                <ThemedText style={[styles.levelLabel, { color: colors.textPrimary }]}>LEVEL</ThemedText>
                <ThemedText style={[styles.levelNumber, { color: colors.textPrimary }]}>
                  {profile.level}
                </ThemedText>
              </View>
            </View>

            <View style={styles.progressMeta}>
              <ThemedText style={[styles.progressLabelText, { color: colors.heroPanelText }]}>
                Level {profile.level} progress
              </ThemedText>
              <ThemedText style={[styles.progressValueText, { color: colors.highlight }]}>
                {profile.xpWithinLevel}/100 XP
              </ThemedText>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${xpProgress * 100}%`, backgroundColor: colors.highlight },
                ]}
              />
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText style={[styles.statIcon, { color: colors.accent }]}>✓</ThemedText>
              <ThemedText style={[styles.statNumber, { color: colors.textPrimary }]}>
                {profile.totalQuestsCompleted}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Quests completed
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText style={[styles.statIcon, { color: colors.accent }]}>♥</ThemedText>
              <ThemedText style={[styles.statNumber, { color: colors.textPrimary }]}>
                {currentStreak}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day streak
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText style={[styles.statIcon, { color: colors.accent }]}>🌍</ThemedText>
              <ThemedText style={[styles.statNumberSmall, { color: colors.textPrimary }]}>
                {currentWorld ? `${currentWorld.emoji} ${currentWorld.name}` : '—'}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Current world
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ThemedText style={[styles.statIcon, { color: colors.accent }]}>✦</ThemedText>
              <ThemedText style={[styles.statNumber, { color: colors.textPrimary }]}>
                {profile.unlockedWorldIds.length}/{worlds.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Worlds unlocked
              </ThemedText>
            </View>
          </View>

          {/* Visual style chooser */}
          <ThemedText style={[styles.sectionKicker, { color: colors.accent }]}>VISUAL STYLE</ThemedText>
          <View style={styles.styleRow}>
            {(Object.keys(VISUAL_STYLE_REGISTRY) as VisualStyle[]).map((styleKey) => {
              const option = VISUAL_STYLE_REGISTRY[styleKey];
              const selected = activeStyle === styleKey;
              return (
                <Pressable
                  key={styleKey}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !isEditing }}
                  disabled={!isEditing}
                  onPress={() => chooseDraftStyle(styleKey)}
                  style={({ pressed }) => [
                    styles.styleCard,
                    { backgroundColor: selected ? colors.accentSoft : colors.card, borderColor: selected ? colors.accent : colors.cardBorder },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.styleCardHeader}>
                    <ThemedText style={styles.styleEmoji}>{option.emoji}</ThemedText>
                    {selected ? (
                      <ThemedText style={[styles.styleCheck, { color: colors.accent }]}>✓</ThemedText>
                    ) : null}
                  </View>
                  <ThemedText style={[styles.styleName, { color: colors.textPrimary }]}>
                    {option.label}
                  </ThemedText>
                  <ThemedText style={[styles.styleTagline, { color: colors.textSecondary }]}>
                    {option.tagline}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Avatar picker */}
          <ThemedText style={[styles.sectionKicker, { color: colors.accent }]}>
            CHOOSE YOUR AVATAR
          </ThemedText>
          <View style={[styles.avatarGridPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.avatarGrid}>
              {getAvatarsForStyle(activeStyle).map((option) => {
                const selected = activeAvatarId === option.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: !isEditing }}
                    disabled={!isEditing}
                    onPress={() => setDraftAvatarId(option.id)}
                    style={({ pressed }) => [
                      styles.avatarOption,
                      pressed && styles.pressed,
                    ]}>
                    <View
                      style={[
                        styles.avatarBubble,
                        { backgroundColor: colors.accentSoft },
                        selected && { borderColor: colors.accent, borderWidth: 3 },
                      ]}>
                      <ThemedText style={styles.avatarEmoji}>{option.emoji}</ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.avatarName,
                        { color: selected ? colors.accent : colors.textSecondary },
                      ]}>
                      {option.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <ThemedText style={[styles.avatarTagline, { color: colors.textSecondary }]}>
              “{previewAvatar.tagline}”
            </ThemedText>
          </View>

          {/* Avatar name */}
          <ThemedText style={[styles.sectionKicker, { color: colors.accent }]}>AVATAR NAME</ThemedText>
          <View style={[styles.nameCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              editable={isEditing}
              maxLength={MAX_AVATAR_NAME_LENGTH}
              placeholder={`e.g. ${avatar.name}`}
              placeholderTextColor={colors.textSecondary}
              style={[styles.nameInput, { borderColor: colors.cardBorder, color: colors.textPrimary }]}
            />
            <ThemedText style={[styles.helperText, { color: colors.textSecondary }]}>
              Up to {MAX_AVATAR_NAME_LENGTH} characters. Leave empty to use {avatar.name}.
            </ThemedText>
          </View>

          {/* Current world picker */}
          <ThemedText style={[styles.sectionKicker, { color: colors.accent }]}>CURRENT WORLD</ThemedText>
          <View style={styles.worldChips}>
            {worlds.map((world) => {
              const selected = activeWorldId === world.id;
              return (
                <Pressable
                  key={world.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: !isEditing }}
                  disabled={!isEditing}
                  onPress={() => setDraftWorldId(world.id)}
                  style={({ pressed }) => [
                    styles.worldChip,
                    {
                      backgroundColor: selected ? colors.accent : colors.card,
                      borderColor: selected ? colors.accent : colors.cardBorder,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.worldChipEmoji}>{world.emoji}</ThemedText>
                  <ThemedText
                    style={[
                      styles.worldChipText,
                      { color: selected ? colors.onAccent : colors.textPrimary },
                    ]}>
                    {world.name}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText style={[styles.memberSince, { color: colors.textSecondary }]}>
            Adventuring since {formatMemberSince(profile.createdAt)}
          </ThemedText>

          <ThemedText style={[styles.footerNote, { color: colors.textSecondary }]}>
            Your style shapes future adventures — maps, quests and celebrations will follow it.
          </ThemedText>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function formatMemberSince(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 4,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 22,
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  editButtonHidden: {
    display: 'none',
  },
  heroPanel: {
    marginTop: 26,
    padding: 24,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarOrb: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 42,
  },
  avatarOrbEmoji: {
    fontSize: 44,
  },
  heroCopy: {
    flex: 1,
  },
  heroName: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroTagline: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
  },
  levelBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    transform: [{ rotate: '4deg' }],
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  levelNumber: {
    fontSize: 25,
    lineHeight: 27,
    fontWeight: '800',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 9,
  },
  progressLabelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressValueText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 11,
    overflow: 'hidden',
    borderRadius: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    marginTop: 8,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '800',
  },
  statNumberSmall: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionKicker: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  styleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  styleCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
  },
  styleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleEmoji: {
    fontSize: 26,
  },
  styleCheck: {
    fontSize: 18,
    fontWeight: '900',
  },
  styleName: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  styleTagline: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },
  avatarGridPanel: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  avatarOption: {
    width: '23%',
    minWidth: 74,
    alignItems: 'center',
  },
  avatarBubble: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarName: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatarTagline: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nameCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  nameInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  helperText: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 17,
  },
  worldChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  worldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  worldChipEmoji: {
    fontSize: 16,
  },
  worldChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  footerNote: {
    marginTop: 26,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  memberSince: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});