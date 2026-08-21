import { useState, type CSSProperties } from 'react';
import { GameStateProvider, useGameState } from './state/GameStateContext';
import { getStoreForLevel, STORES, type ShopItem } from './data/stores';
import { pickTodaysItems } from './logic/inventory';
import MainScreen from './screens/MainScreen';
import DisplayScreen from './screens/DisplayScreen';
import CustomerScreen from './screens/CustomerScreen';
import StoreCelebrationScreen from './screens/StoreCelebrationScreen';

type Screen = 'main' | 'display' | 'customer' | 'storeCelebration';
type PendingNav = 'open' | 'home' | 'restock';

const CUSTOMERS_PER_RESTOCK = 3;

function GameApp() {
  const { level } = useGameState();
  const [screen, setScreen] = useState<Screen>('main');
  const [todaysItems, setTodaysItems] = useState<ShopItem[]>([]);
  // The store whose theme/items are currently "live" on screen. This only
  // advances once the player has seen the new-store celebration, so a
  // mid-session level-up never yanks the colors/items out from under them.
  const [activeStoreId, setActiveStoreId] = useState(() => getStoreForLevel(level).id);

  const activeStore = STORES.find((s) => s.id === activeStoreId) ?? STORES[0];
  const latestStore = getStoreForLevel(level);
  const hasNewStore = latestStore.id !== activeStoreId;

  function runNav(nav: PendingNav, storeToUse = activeStore) {
    if (nav === 'home') {
      setScreen('main');
      return;
    }
    setTodaysItems(pickTodaysItems(storeToUse, level));
    setScreen('display');
  }

  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);

  function withStoreGate(nav: PendingNav) {
    if (hasNewStore) {
      setPendingNav(nav);
      setScreen('storeCelebration');
    } else {
      runNav(nav);
    }
  }

  function handleCelebrationContinue() {
    setActiveStoreId(latestStore.id);
    const nav = pendingNav;
    setPendingNav(null);
    if (nav) runNav(nav, latestStore);
  }

  function goHome() {
    withStoreGate('home');
  }

  function openStore() {
    withStoreGate('open');
  }

  function handleDisplayComplete() {
    setScreen('customer');
  }

  function handleRestock() {
    withStoreGate('restock');
  }

  const themeStyle = {
    '--color-primary': activeStore.colors.primary,
    '--color-primary-dark': activeStore.colors.primaryDark,
    '--color-accent': activeStore.colors.accent,
    '--color-bg': activeStore.colors.background,
    '--color-bg-soft': activeStore.colors.backgroundSoft,
  } as CSSProperties;

  return (
    <div className="store-theme" style={themeStyle}>
      {screen === 'storeCelebration' && (
        <StoreCelebrationScreen store={latestStore} onContinue={handleCelebrationContinue} />
      )}
      {screen === 'display' && (
        <DisplayScreen items={todaysItems} level={level} onComplete={handleDisplayComplete} onHome={goHome} />
      )}
      {screen === 'customer' && (
        <CustomerScreen
          items={todaysItems}
          level={level}
          store={activeStore}
          customersUntilRestock={CUSTOMERS_PER_RESTOCK}
          onNeedRestock={handleRestock}
          onHome={goHome}
        />
      )}
      {screen === 'main' && <MainScreen store={activeStore} onOpenStore={openStore} />}
    </div>
  );
}

export default function App() {
  return (
    <GameStateProvider>
      <GameApp />
    </GameStateProvider>
  );
}
