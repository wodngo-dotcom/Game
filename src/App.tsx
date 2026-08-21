import { useState, type CSSProperties } from 'react';
import { GameStateProvider, useGameState } from './state/GameStateContext';
import { getStoreForLevel, type ShopItem } from './data/stores';
import { pickTodaysItems } from './logic/inventory';
import MainScreen from './screens/MainScreen';
import DisplayScreen from './screens/DisplayScreen';
import CustomerScreen from './screens/CustomerScreen';

type Screen = 'main' | 'display' | 'customer';

const CUSTOMERS_PER_RESTOCK = 3;

function GameApp() {
  const { level } = useGameState();
  const [screen, setScreen] = useState<Screen>('main');
  const [todaysItems, setTodaysItems] = useState<ShopItem[]>([]);
  const store = getStoreForLevel(level);

  function goHome() {
    setScreen('main');
  }

  function openStore() {
    setTodaysItems(pickTodaysItems(store, level));
    setScreen('display');
  }

  function handleDisplayComplete() {
    setScreen('customer');
  }

  function handleRestock() {
    setTodaysItems(pickTodaysItems(store, level));
    setScreen('display');
  }

  const themeStyle = {
    '--color-primary': store.colors.primary,
    '--color-primary-dark': store.colors.primaryDark,
    '--color-accent': store.colors.accent,
    '--color-bg': store.colors.background,
    '--color-bg-soft': store.colors.backgroundSoft,
  } as CSSProperties;

  return (
    <div className="store-theme" style={themeStyle}>
      {screen === 'display' && (
        <DisplayScreen items={todaysItems} level={level} onComplete={handleDisplayComplete} onHome={goHome} />
      )}
      {screen === 'customer' && (
        <CustomerScreen
          items={todaysItems}
          level={level}
          customersUntilRestock={CUSTOMERS_PER_RESTOCK}
          onNeedRestock={handleRestock}
          onHome={goHome}
        />
      )}
      {screen === 'main' && <MainScreen store={store} onOpenStore={openStore} />}
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
