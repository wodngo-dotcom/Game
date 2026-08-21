import { useState } from 'react';
import TopBar from '../components/TopBar';
import { useGameState } from '../state/GameStateContext';
import type { StoreConfig } from '../data/stores';
import { playDoorOpen } from '../utils/sound';
import './MainScreen.css';

interface MainScreenProps {
  store: StoreConfig;
  onOpenStore: () => void;
  onReset: () => void;
}

export default function MainScreen({ store, onOpenStore, onReset }: MainScreenProps) {
  const { level } = useGameState();
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    playDoorOpen();
    window.setTimeout(() => {
      onOpenStore();
    }, 650);
  }

  return (
    <div className="main-screen">
      <TopBar onReset={onReset} />
      <div className="main-content">
        <h2 className="store-name">{store.name}</h2>
        <div className={`storefront ${opening ? 'opening' : ''}`}>
          <div className="storefront-roof" />
          <div className="storefront-sign">
            <span>{store.items[0]?.emoji ?? '🍎'}</span>
            <span>{store.items[1]?.emoji ?? '🥕'}</span>
            <span>{store.items[2]?.emoji ?? '🍌'}</span>
          </div>
          <div className="storefront-door-frame">
            <div className="storefront-door left" />
            <div className="storefront-door right" />
          </div>
          <div className="storefront-window" />
        </div>
        <p className="main-hint">Lv.{level} 사장님, 오늘도 가게를 열어볼까요?</p>
        <button className="big-button open-store-btn" onClick={handleOpen} disabled={opening}>
          {opening ? '문이 열리고 있어요…' : '가게 열기!'}
        </button>
      </div>
    </div>
  );
}
