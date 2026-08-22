import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestCard } from '@/components/QuestCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Quest = {
  id: string;
  emoji: string;
  title: string;
  duration: string;
  xp: number;
};

const quests: Quest[] = [
  { id: 'study-java', emoji: '📚', title: 'Study Java', duration: '20 min', xp: 30 },
  { id: 'morning-workout', emoji: '🧘', title: 'Morning Workout', duration: '15 min', xp: 20 },
  { id: 'drink-water', emoji: '💧', title: 'Drink Water', duration: '5 min', xp: 10 },
];

export default function HomeScreen() {
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [celebration, setCelebration] = useState('');
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationOffset = useRef(new Animated.Value(8)).current;

  const level = Math.floor(totalXp / 100) + 1;
  const currentXp = totalXp % 100;
  const progress = currentXp / 100;

  useEffect(() => {
    if (!celebration) {
      return;
    }

    celebrationOpacity.setValue(0);
    celebrationOffset.setValue(8);
    Animated.parallel([
      Animated.timing(celebrationOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(celebrationOffset, { toValue: 0, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => setCelebration(''), 2400);
    return () => clearTimeout(timeout);
  }, [celebration, celebrationOffset, celebrationOpacity]);

  function completeQuest(quest: Quest) {
    if (completedQuestIds.includes(quest.id)) {
      return;
    }

    setCompletedQuestIds((current) => [...current, quest.id]);
    setTotalXp((current) => current + quest.xp);
    setCelebration(`Quest complete! +${quest.xp} XP`);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <View>
              <ThemedText style={styles.eyebrow}>YOUR DAILY ADVENTURE</ThemedText>
              <ThemedText style={styles.brand}>GlowQuest ✦</ThemedText>
            </View>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelLabel}>LEVEL</ThemedText>
              <ThemedText style={styles.levelNumber}>{level}</ThemedText>
            </View>
          </View>

          <View style={styles.heroPanel}>
            <View style={styles.sparkleRow}>
              <ThemedText style={styles.sparkle}>✦</ThemedText>
              <ThemedText style={styles.sparkleSmall}>✧</ThemedText>
              <ThemedText style={styles.sparkle}>✦</ThemedText>
            </View>
            <ThemedText style={styles.greeting}>Ready to make today glow?</ThemedText>
            <ThemedText style={styles.heroCopy}>
              Small steps become legendary adventures.
            </ThemedText>
            <View style={styles.progressMeta}>
              <ThemedText style={styles.progressLabel}>Level {level} progress</ThemedText>
              <ThemedText style={styles.progressValue}>{currentXp}/100 XP</ThemedText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {celebration ? (
            <Animated.View
              style={[
                styles.celebration,
                { opacity: celebrationOpacity, transform: [{ translateY: celebrationOffset }] },
              ]}>
              <ThemedText style={styles.celebrationText}>🎉 {celebration}</ThemedText>
            </Animated.View>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionKicker}>FOR TODAY</ThemedText>
              <ThemedText style={styles.sectionTitle}>Today's Quests</ThemedText>
            </View>
            <ThemedText style={styles.questCount}>
              {completedQuestIds.length}/{quests.length}
            </ThemedText>
          </View>

          <View style={styles.questList}>
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                {...quest}
                completed={completedQuestIds.includes(quest.id)}
                onComplete={() => completeQuest(quest)}
              />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  safeArea: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 22,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#A36E59',
  },

  brand: {
    marginTop: 4,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#33254A',
  },

  levelBadge: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFCE70',
    transform: [{ rotate: '4deg' }],
  },

  levelLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#76501F',
  },

  levelNumber: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '800',
    color: '#4F3516',
  },

  heroPanel: {
    overflow: 'hidden',
    padding: 24,
    borderRadius: 30,
    backgroundColor: '#6652C8',
    shadowColor: '#4B378E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
  },

  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sparkle: {
    fontSize: 21,
    color: '#FFD978',
  },

  sparkleSmall: {
    fontSize: 14,
    color: '#BFE8FF',
  },

  greeting: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  heroCopy: {
    marginTop: 5,
    fontSize: 15,
    color: '#E7E1FF',
  },

  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 9,
  },

  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD978',
  },

  progressTrack: {
    height: 11,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#4D3D9E',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#FFD978',
  },

  celebration: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFF0BD',
  },

  celebrationText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#71501D',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 14,
  },

  sectionKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#A36E59',
  },

  sectionTitle: {
    marginTop: 3,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    color: '#33254A',
  },

  questCount: {
    paddingBottom: 4,
    fontSize: 15,
    fontWeight: '800',
    color: '#8E6FB6',
  },

  questList: {
    gap: 14,
  },
});