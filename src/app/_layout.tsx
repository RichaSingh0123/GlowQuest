import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { QuestProvider } from '@/context/quest-context';
import { WorldProvider } from '@/context/world-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QuestProvider>
        <WorldProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </WorldProvider>
      </QuestProvider>
    </ThemeProvider>
  );
}
