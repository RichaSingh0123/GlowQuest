import { Link, Slot, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.appContainer}>
      <Slot />
      <CustomTabList pathname={pathname} />
    </View>
  );
}

export function TabButton({
  children,
  href,
  isFocused,
}: {
  children: string;
  href: '/' | '/explore' | '/progress' | '/profile';
  isFocused: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
      </Pressable>
    </Link>
  );
}

export function CustomTabList({ pathname }: { pathname: string }) {
  return (
    <View style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          GlowQuest ✦
        </ThemedText>

        <TabButton href="/" isFocused={pathname === '/'}>Home</TabButton>
        <TabButton href="/explore" isFocused={pathname === '/explore'}>Explore</TabButton>
        <TabButton href="/progress" isFocused={pathname === '/progress'}>Progress</TabButton>
        <TabButton href="/profile" isFocused={pathname === '/profile'}>Profile</TabButton>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
