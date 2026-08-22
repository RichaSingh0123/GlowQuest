import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestDeck } from '@/components/QuestDeck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { worldQuestCopy } from '@/constants/world-quest-copy';
import { useQuests } from '@/context/quest-context';
import { useWorlds } from '@/context/world-context';

const themeStyles = {
  dreamscape: {
    background: '#FFF0F6',
    accent: '#D96B9B',
    panel: '#FFE0ED',
  },
  'heros-journey': {
    background: '#F3F0FF',
    accent: '#6652C8',
    panel: '#E4DEFF',
  },
  'glow-up-city': {
    background: '#FFF2E9',
    accent: '#E9748D',
    panel: '#FFE0D2',
  },
  'future-lab': {
    background: '#EAF8FF',
    accent: '#378AB8',
    panel: '#D5F0FF',
  },
} as const;

type ThemeKey = keyof typeof themeStyles;

export function WorldAdventureScreen({ selectedWorldId }: { selectedWorldId?: string } = {}) {
  const { worldId: routeWorldId } = useLocalSearchParams<{ worldId: string }>();
  const { worlds } = useWorlds();
  const { quests, acceptQuest, saveQuestForLater, restoreQuest, completeQuest } = useQuests();
  const worldId = selectedWorldId ?? routeWorldId;
  const world = worlds.find((item) => item.id === worldId);

  if (!world) {
    return (
      <ThemedView style={styles.missingScreen}>
        <ThemedText type="subtitle">World not found</ThemedText>
        <Pressable onPress={() => router.replace('/explore')} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Return to Explore</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const colors = themeStyles[world.theme as ThemeKey] ?? themeStyles.dreamscape;
  const laterQuests = quests.filter(
    (quest) => quest.worldId === world.id && quest.status === 'later' && !quest.completed,
  );
  const copy = worldQuestCopy[world.id];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <ThemedText style={[styles.backLinkText, { color: colors.accent }]}>‹ Explore</ThemedText>
          </Pressable>

          <View style={[styles.worldBadge, { backgroundColor: colors.panel }]}>
            <ThemedText style={styles.worldEmoji}>{world.emoji}</ThemedText>
          </View>
          <ThemedText style={styles.kicker}>WORLD ADVENTURE</ThemedText>
          <ThemedText style={styles.title}>{world.name}</ThemedText>
          <ThemedText style={styles.description}>{world.description}</ThemedText>

          <View style={[styles.welcomePanel, { backgroundColor: colors.panel }]}>
            <ThemedText style={styles.panelSparkle}>✦</ThemedText>
            <ThemedText style={styles.welcomeTitle}>Welcome to {world.name}</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Your next chapter starts here. Take one small step and let the adventure unfold.
            </ThemedText>
          </View>

          <Pressable
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.beginButton, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
            <ThemedText style={styles.beginButtonText}>Begin this world's quests ✦</ThemedText>
          </Pressable>

          <QuestDeck
            quests={quests}
            worldId={world.id}
            onAccept={acceptQuest}
            onSaveForLater={saveQuestForLater}
            onComplete={completeQuest}
          />

          {copy ? (
            <View style={[styles.laterPanel, { backgroundColor: colors.panel }]}>
              <ThemedText style={styles.laterKicker}>SAVED FOR LATER</ThemedText>
              <ThemedText style={styles.laterTitle}>{copy.laterCollection}</ThemedText>
              {laterQuests.length > 0 ? (
                laterQuests.map((quest) => (
                  <View key={quest.id} style={styles.laterQuest}>
                    <ThemedText style={styles.laterQuestTitle}>
                      {quest.emoji} {quest.title}
                    </ThemedText>
                    <Pressable onPress={() => restoreQuest(quest.id)} style={styles.restoreButton}>
                      <ThemedText style={styles.restoreText}>Restore</ThemedText>
                    </Pressable>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.laterEmpty}>No quests saved yet.</ThemedText>
              )}
            </View>
          ) : null}
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

export default WorldAdventureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  missingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#FFF7F2',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '800',
  },
  worldBadge: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    borderRadius: 58,
  },
  worldEmoji: {
    fontSize: 58,
  },
  kicker: {
    marginTop: 28,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#B56F83',
  },
  title: {
    marginTop: 5,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    textAlign: 'center',
    color: '#3D2A51',
  },
  description: {
    maxWidth: 460,
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#776B80',
  },
  welcomePanel: {
    width: '100%',
    marginTop: 32,
    padding: 24,
    borderRadius: 26,
  },
  panelSparkle: {
    fontSize: 24,
    color: '#9E6EBA',
  },
  welcomeTitle: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#3D2A51',
  },
  welcomeText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: '#776B80',
  },
  beginButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 18,
  },
  beginButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  laterPanel: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
  },
  laterKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#B56F83',
  },
  laterTitle: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#3D2A51',
  },
  laterQuest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(61, 42, 81, 0.12)',
  },
  laterQuestTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#3D2A51',
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  restoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8052B4',
  },
  laterEmpty: {
    fontSize: 14,
    color: '#776B80',
  },
  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#E9748D',
  },
  backButtonText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
