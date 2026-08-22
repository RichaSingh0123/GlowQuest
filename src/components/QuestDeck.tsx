import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { QuestCard } from '@/components/QuestCard';
import { ThemedText } from '@/components/themed-text';
import { worldQuestCopy } from '@/constants/world-quest-copy';
import type { Quest } from '@/context/quest-context';

type QuestDeckProps = {
  quests: Quest[];
  worldId: string;
  onAccept: (id: string) => void;
  onSaveForLater: (id: string) => void;
  onComplete: (quest: Quest) => void;
};

const SWIPE_THRESHOLD = 120;

export function QuestDeck({ quests, worldId, onAccept, onSaveForLater, onComplete }: QuestDeckProps) {
  const availableQuests = quests.filter(
    (quest) => quest.worldId === worldId && quest.status === 'available' && !quest.completed,
  );
  const acceptedQuests = quests.filter(
    (quest) => quest.worldId === worldId && quest.status === 'accepted' && !quest.completed,
  );
  const savedQuests = quests.filter(
    (quest) => quest.worldId === worldId && quest.status === 'later' && !quest.completed,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const position = useRef(new Animated.ValueXY()).current;
  const activeQuestRef = useRef<Quest | undefined>(undefined);
  const copy = worldQuestCopy[worldId] ?? {
    accept: 'Accept this quest',
    later: 'Save for later',
    laterCollection: 'Later',
  };
  const activeQuest = availableQuests[activeIndex];
  activeQuestRef.current = activeQuest;

  function finishSwipe(direction: 'right' | 'left') {
    const quest = activeQuestRef.current;
    if (!quest) return;
    const destination = direction === 'right' ? 500 : -500;
    Animated.timing(position, {
      toValue: { x: destination, y: 0 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'right') {
        onAccept(quest.id);
        setNotice(copy.accept);
      } else {
        onSaveForLater(quest.id);
        setNotice(`Saved to ${copy.laterCollection}`);
      }
      position.setValue({ x: 0, y: 0 });
      setActiveIndex(0);
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
      onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: 0 }),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) >= SWIPE_THRESHOLD) {
          finishSwipe(gesture.dx > 0 ? 'right' : 'left');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!activeQuest) {
    return (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyIcon}>✦</ThemedText>
        <ThemedText style={styles.emptyTitle}>Your deck is clear</ThemedText>
        <ThemedText style={styles.emptyText}>
          {savedQuests.length > 0
            ? `${savedQuests.length} quest${savedQuests.length === 1 ? '' : 's'} waiting in ${copy.laterCollection}.`
            : 'New quests will appear here when this world has an adventure for you.'}
        </ThemedText>
        {acceptedQuests.length > 0 ? (
          <View style={styles.acceptedList}>
            <ThemedText style={styles.acceptedHeading}>Accepted quests</ThemedText>
            {acceptedQuests.map((quest) => (
              <Pressable key={quest.id} onPress={() => onComplete(quest)} style={styles.completeButton}>
                <ThemedText style={styles.completeButtonText}>Complete {quest.title} ✓</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  const rotate = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
  const rightCueOpacity = position.x.interpolate({ inputRange: [0, 80, 140], outputRange: [0, 0.5, 1], extrapolate: 'clamp' });
  const leftCueOpacity = position.x.interpolate({ inputRange: [-140, -80, 0], outputRange: [1, 0.5, 0], extrapolate: 'clamp' });

  return (
    <View style={styles.deck}>
      <View style={styles.deckHeader}>
        <View>
          <ThemedText style={styles.kicker}>QUEST DECK</ThemedText>
          <ThemedText style={styles.title}>Choose your next step</ThemedText>
        </View>
        <ThemedText style={styles.count}>{activeIndex + 1}/{availableQuests.length}</ThemedText>
      </View>
      <View style={styles.cardStage}>
        <Animated.View style={[styles.swipeCue, styles.rightCue, { opacity: rightCueOpacity }]}>
          <ThemedText style={styles.rightCueText}>ACCEPT</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.swipeCue, styles.leftCue, { opacity: leftCueOpacity }]}>
          <ThemedText style={styles.leftCueText}>LATER</ThemedText>
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.animatedCard, { transform: [{ translateX: position.x }, { rotate }] }]}>
          <QuestCard
            {...activeQuest}
            status={activeQuest.status}
            completed={false}
            showActions
            onAccept={() => finishSwipe('right')}
            onLater={() => finishSwipe('left')}
          />
        </Animated.View>
      </View>
      <View style={styles.fallbackRow}>
        <Pressable onPress={() => finishSwipe('left')} style={[styles.fallbackButton, styles.laterButton]}>
          <ThemedText style={styles.fallbackText}>← {copy.laterCollection}</ThemedText>
        </Pressable>
        <Pressable onPress={() => finishSwipe('right')} style={[styles.fallbackButton, styles.acceptButton]}>
          <ThemedText style={styles.fallbackText}>Accept →</ThemedText>
        </Pressable>
      </View>
      {notice ? <ThemedText style={styles.notice}>{notice}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { width: '100%', marginTop: 28 },
  deckHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#B56F83' },
  title: { marginTop: 4, fontSize: 23, lineHeight: 29, fontWeight: '800', color: '#3D2A51' },
  count: { paddingBottom: 3, fontSize: 14, fontWeight: '800', color: '#A06AB3' },
  cardStage: { minHeight: 285, position: 'relative', justifyContent: 'center' },
  animatedCard: { width: '100%', zIndex: 2 },
  swipeCue: { position: 'absolute', top: 20, zIndex: 3, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 2, borderRadius: 10 },
  rightCue: { left: 18, borderColor: '#2D9A61', transform: [{ rotate: '-10deg' }] },
  leftCue: { right: 18, borderColor: '#D45D6F', transform: [{ rotate: '10deg' }] },
  rightCueText: { fontSize: 15, fontWeight: '900', color: '#2D9A61' },
  leftCueText: { fontSize: 15, fontWeight: '900', color: '#D45D6F' },
  fallbackRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  fallbackButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 15 },
  laterButton: { backgroundColor: '#F1E8FF' },
  acceptButton: { backgroundColor: '#E9748D' },
  fallbackText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  notice: { marginTop: 12, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#8052B4' },
  emptyState: { alignItems: 'center', marginTop: 28, padding: 24, borderRadius: 24, backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#F1DDE9' },
  emptyIcon: { fontSize: 28, color: '#D96B9B' },
  emptyTitle: { marginTop: 8, fontSize: 22, fontWeight: '800', color: '#3D2A51' },
  emptyText: { marginTop: 7, fontSize: 14, lineHeight: 21, textAlign: 'center', color: '#776B80' },
  acceptedList: { width: '100%', marginTop: 18, gap: 8 },
  acceptedHeading: { fontSize: 14, fontWeight: '800', color: '#3D2A51' },
  completeButton: { alignItems: 'center', paddingVertical: 11, borderRadius: 14, backgroundColor: '#BCEFD0' },
  completeButtonText: { fontSize: 13, fontWeight: '800', color: '#218B58' },
});
