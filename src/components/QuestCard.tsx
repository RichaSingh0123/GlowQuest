import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type QuestCardProps = {
  emoji: string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  completed: boolean;
  onComplete: () => void;
};

export function QuestCard({
  emoji,
  title,
  description,
  duration,
  xp,
  completed,
  onComplete,
}: QuestCardProps) {
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

        <ThemedText style={styles.description}>{description}</ThemedText>

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
    padding: 18,
    borderRadius: 26,
    gap: 15,
    borderWidth: 1,
    borderColor: '#F1DDE9',
    backgroundColor: '#FFFDFC',

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
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  completedCard: {
    backgroundColor: '#F1FFF7',
    borderColor: '#A9DFC0',
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
    backgroundColor: '#FFE9D7',
  },

  completedBubble: {
    backgroundColor: '#BCEFD0',
  },

  emoji: {
    fontSize: 30,
  },

  title: {
    fontSize: 24,
    lineHeight: 31,
    color: '#3D2A51',
  },

  description: {
    marginTop: -7,
    fontSize: 14,
    lineHeight: 20,
    color: '#776B80',
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
    color: '#8052B4',
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailText: {
    fontSize: 15,
    color: '#776B80',
  },

  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D45D6F',
  },

  completeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#218B58',
  },
});