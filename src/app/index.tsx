import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestCard } from '@/components/QuestCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getLevelFromXp, getXpWithinLevel, HOME_QUEST_WORLD_ID, useQuests } from '@/context/quest-context';

export default function HomeScreen() {
  const { quests, completedQuestIds, totalXp, completeQuest, addQuest } = useQuests();
  const homeQuests = quests.filter((quest) => quest.worldId === HOME_QUEST_WORLD_ID);
  const homeCompletedCount = homeQuests.filter((quest) => completedQuestIds.includes(quest.id)).length;
  const [celebration, setCelebration] = useState('');
  const [isAddQuestVisible, setIsAddQuestVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('15');
  const [xp, setXp] = useState('10');
  const [category, setCategory] = useState('Personal');
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationOffset = useRef(new Animated.Value(8)).current;

  const level = getLevelFromXp(totalXp);
  const currentXp = getXpWithinLevel(totalXp);
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

  function finishQuest(quest: (typeof quests)[number]) {
    if (completedQuestIds.includes(quest.id)) {
      return;
    }

    completeQuest(quest);
    setCelebration(`Quest complete! +${quest.xp} XP`);
  }

  function createQuest() {
    const parsedDuration = Number.parseInt(duration, 10);
    const parsedXp = Number.parseInt(xp, 10);
    if (!title.trim() || !Number.isFinite(parsedDuration) || parsedDuration <= 0 || !Number.isFinite(parsedXp) || parsedXp <= 0) {
      return;
    }

    addQuest({
      emoji: '✨',
      title: title.trim(),
      description: description.trim() || 'A little step toward your brighter day.',
      duration: `${parsedDuration} min`,
      xp: parsedXp,
      category: category.trim() || 'Personal',
    });
    setTitle('');
    setDescription('');
    setDuration('15');
    setXp('10');
    setCategory('Personal');
    setIsAddQuestVisible(false);
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
            <View style={styles.heroMoon} />
            <View style={styles.heroCloudOne} />
            <View style={styles.heroCloudTwo} />
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
            <View style={styles.sectionActions}>
              <ThemedText style={styles.questCount}>
                {homeCompletedCount}/{homeQuests.length}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAddQuestVisible(true)}
                style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}>
                <ThemedText style={styles.addButtonText}>+ Add Quest</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.questList}>
            {homeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                {...quest}
                completed={completedQuestIds.includes(quest.id)}
                onComplete={() => finishQuest(quest)}
              />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent
        visible={isAddQuestVisible}
        onRequestClose={() => setIsAddQuestVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalKicker}>NEW ADVENTURE</ThemedText>
                <ThemedText style={styles.modalTitle}>Add a quest</ThemedText>
              </View>
              <Pressable onPress={() => setIsAddQuestVisible(false)} style={styles.closeButton}>
                <ThemedText style={styles.closeText}>×</ThemedText>
              </Pressable>
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder="Quest title" placeholderTextColor="#A292A8" style={styles.input} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Description (optional)" placeholderTextColor="#A292A8" style={[styles.input, styles.descriptionInput]} multiline />
            <View style={styles.inputRow}>
              <TextInput value={duration} onChangeText={setDuration} placeholder="Minutes" keyboardType="number-pad" placeholderTextColor="#A292A8" style={[styles.input, styles.smallInput]} />
              <TextInput value={xp} onChangeText={setXp} placeholder="XP reward" keyboardType="number-pad" placeholderTextColor="#A292A8" style={[styles.input, styles.smallInput]} />
            </View>
            <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor="#A292A8" style={styles.input} />
            <Pressable onPress={createQuest} style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.createButtonText}>Create Quest ✦</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  safeArea: {
    width: '100%',
    maxWidth: 560,
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
    color: '#B56F83',
  },

  brand: {
    marginTop: 4,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#3D2A51',
  },

  levelBadge: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD889',
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
    position: 'relative',
    overflow: 'hidden',
    padding: 26,
    borderRadius: 32,
    backgroundColor: '#7861C9',
    shadowColor: '#6B4AA0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 7,
  },

  sparkleRow: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  sparkle: {
    fontSize: 21,
    color: '#FFE39A',
  },

  sparkleSmall: {
    fontSize: 14,
    color: '#FFD1DF',
  },

  greeting: {
    zIndex: 1,
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFDFC',
  },

  heroCopy: {
    zIndex: 1,
    marginTop: 5,
    fontSize: 15,
    color: '#F2E9FF',
  },

  progressMeta: {
    zIndex: 1,
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
    color: '#FFE39A',
  },

  progressTrack: {
    zIndex: 1,
    height: 11,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#5D489F',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#FFE39A',
  },

  heroMoon: {
    position: 'absolute',
    top: -30,
    right: 34,
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255, 226, 164, 0.24)',
  },

  heroCloudOne: {
    position: 'absolute',
    right: -12,
    bottom: 28,
    width: 130,
    height: 34,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  heroCloudTwo: {
    position: 'absolute',
    right: 54,
    bottom: 42,
    width: 58,
    height: 42,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  celebration: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3D98B',
    backgroundColor: '#FFF4C9',
  },

  celebrationText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#71501D',
  },

  sectionHeader: {
    alignItems: 'flex-start',
    marginTop: 32,
    marginBottom: 14,
  },

  sectionActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  addButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: '#E9748D',
    shadowColor: '#C95873',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },

  sectionKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#B56F83',
  },

  sectionTitle: {
    marginTop: 3,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    color: '#3D2A51',
  },

  questCount: {
    paddingBottom: 4,
    fontSize: 15,
    fontWeight: '800',
    color: '#A06AB3',
  },

  questList: {
    gap: 14,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(61, 42, 81, 0.42)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#FFF9F7',
    shadowColor: '#3D2A51',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#B56F83',
  },

  modalTitle: {
    marginTop: 3,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#3D2A51',
  },

  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#F3E5F1',
  },

  closeText: {
    fontSize: 25,
    lineHeight: 28,
    color: '#8052B4',
  },

  input: {
    minHeight: 48,
    marginBottom: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8D7E5',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    color: '#3D2A51',
    fontSize: 15,
  },

  descriptionInput: {
    minHeight: 76,
    paddingTop: 13,
    textAlignVertical: 'top',
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  smallInput: {
    flex: 1,
  },

  createButton: {
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#7861C9',
  },

  createButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});