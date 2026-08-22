import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type QuestCardProps = {
  emoji: string;
  title: string;
  duration: string;
  xp: number;
  completed: boolean;
  onComplete: () => void;
};

export function QuestCard({ emoji, title, duration, xp, completed, onComplete }: QuestCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: completed, disabled: completed }}
      disabled={completed}
      onPress={onComplete}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <ThemedView style={[styles.card, completed && styles.completedCard]}>
        <View style={styles.topRow}>
          <View style={[styles.emojiBubble, completed && styles.completedBubble]}>
            <ThemedText style={styles.emoji}>{completed ? '✓' : emoji}</ThemedText>
          </View>
          <View style={styles.xpPill}>
            <ThemedText style={styles.xpText}>+{xp} XP</ThemedText>
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>

        <View style={styles.details}>
          <ThemedText style={styles.detailText}>⏱ {duration}</ThemedText>
          <ThemedText style={completed ? styles.completeText : styles.actionText}>
            {completed ? 'Quest complete' : 'Tap to complete'}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E7D9FF',
    backgroundColor: '#FFFBFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 5,
  },

  pressable: {
    width: '100%',
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  completedCard: {
    backgroundColor: '#F1FFF7',
    borderColor: '#A8E5C5',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  emojiBubble: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0C7',
  },

  completedBubble: {
    backgroundColor: '#B8F0D0',
  },

  emoji: {
    fontSize: 30,
  },

  title: {
    fontSize: 25,
    lineHeight: 32,
    color: '#33254A',
  },

  xpPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F1E8FF',
  },

  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7443B7',
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailText: {
    fontSize: 15,
    color: '#6D637A',
  },

  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F06B4F',
  },

  completeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#218B58',
  },
});