import { createContext, useContext, type ReactNode } from 'react';

import { worlds, type World } from '@/data/worlds';

type WorldContextValue = {
  worlds: World[];
};

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  return <WorldContext.Provider value={{ worlds }}>{children}</WorldContext.Provider>;
}

export function useWorlds() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorlds must be used inside WorldProvider');
  }
  return context;
}
