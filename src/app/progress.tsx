import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuests } from '@/context/quest-context';

export default function ProgressScreen() {
  const { completedQuestIds, totalXp, currentStreak } = useQuests();
  const level = Math.floor(totalXp / 100) + 1;
  const currentXp = totalXp % 100;
  const questsCompleted = completedQuestIds.length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.content}>
          <ThemedText style={styles.kicker}>YOUR GLOWING JOURNEY</ThemedText>
          <ThemedText style={styles.title}>Progress</ThemedText>
          <ThemedText style={styles.subtitle}>Every little quest moves your story forward.</ThemedText>

          <View style={styles.levelPanel}>
            <View style={styles.levelCopy}>
              <ThemedText style={styles.panelLabel}>CURRENT LEVEL</ThemedText>
              <ThemedText style={styles.level}>Level {level}</ThemedText>
              <ThemedText style={styles.xpText}>{currentXp} XP earned this level</ThemedText>
            </View>
            <View style={styles.levelOrb}>
              <ThemedText style={styles.orbSparkle}>✦</ThemedText>
              <ThemedText style={styles.orbNumber}>{level}</ThemedText>
            </View>
          </View>

          <View style={styles.xpPanel}>
            <View style={styles.rowBetween}>
              <ThemedText style={styles.cardTitle}>Next level</ThemedText>
              <ThemedText style={styles.nextLevel}>{100 - currentXp} XP to go</ThemedText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(currentXp / 100) * 100}%` }]} />
            </View>
            <ThemedText style={styles.helperText}>Keep your magic moving today.</ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.pinkCard]}>
              <ThemedText style={styles.statIcon}>✦</ThemedText>
              <ThemedText style={styles.statNumber}>{totalXp}</ThemedText>
              <ThemedText style={styles.statLabel}>Current XP</ThemedText>
            </View>
            <View style={[styles.statCard, styles.goldCard]}>
              <ThemedText style={styles.statIcon}>✓</ThemedText>
              <ThemedText style={styles.statNumber}>{questsCompleted}</ThemedText>
              <ThemedText style={styles.statLabel}>Quests completed</ThemedText>
            </View>
            <View style={[styles.statCard, styles.mintCard]}>
              <ThemedText style={styles.statIcon}>☀</ThemedText>
              <ThemedText style={styles.statNumber}>{questsCompleted}</ThemedText>
              <ThemedText style={styles.statLabel}>Today's quests</ThemedText>
            </View>
            <View style={[styles.statCard, styles.lavenderCard]}>
              <ThemedText style={styles.statIcon}>♥</ThemedText>
              <ThemedText style={styles.statNumber}>{currentStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Day streak</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#B56F83',
  },
  title: {
    marginTop: 4,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    color: '#3D2A51',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 22,
    color: '#776B80',
  },
  levelPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#7861C9',
    shadowColor: '#6B4AA0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  levelCopy: {
    flex: 1,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#EADFFF',
  },
  level: {
    marginTop: 5,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpText: {
    marginTop: 4,
    fontSize: 14,
    color: '#F2E9FF',
  },
  levelOrb: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: '#FFD889',
  },
  orbSparkle: {
    fontSize: 15,
    color: '#8E6330',
  },
  orbNumber: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '800',
    color: '#4F3516',
  },
  xpPanel: {
    marginTop: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1DDE9',
    borderRadius: 24,
    backgroundColor: '#FFFDFC',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3D2A51',
  },
  nextLevel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A06AB3',
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: '#EDE3F0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#E9748D',
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: '#776B80',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    width: '48%',
    minHeight: 126,
    padding: 16,
    borderRadius: 22,
  },
  pinkCard: {
    backgroundColor: '#FFE5ED',
  },
  goldCard: {
    backgroundColor: '#FFF0C8',
  },
  mintCard: {
    backgroundColor: '#DDF7EA',
  },
  lavenderCard: {
    backgroundColor: '#EDE6FF',
  },
  statIcon: {
    fontSize: 22,
    color: '#8052B4',
  },
  statNumber: {
    marginTop: 9,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '800',
    color: '#3D2A51',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#776B80',
  },
});
