import { useEffect, type CSSProperties } from 'react';
import type { StoreConfig } from '../data/stores';
import { playLevelUp } from '../utils/sound';
import './StoreCelebrationScreen.css';

interface StoreCelebrationScreenProps {
  store: StoreConfig;
  onContinue: () => void;
}

const CONFETTI = ['🎉', '✨', '🎊', '⭐', '✨', '🎉'];

export default function StoreCelebrationScreen({ store, onContinue }: StoreCelebrationScreenProps) {
  useEffect(() => {
    playLevelUp();
  }, []);

  return (
    <div className="celebration-screen">
      <div className="celebration-confetti" aria-hidden="true">
        {CONFETTI.map((piece, i) => (
          <span key={i} className="confetti-piece" style={{ '--i': i } as CSSProperties}>
            {piece}
          </span>
        ))}
      </div>

      <p className="celebration-kicker">두구두구두구…</p>
      <h2 className="celebration-title">새 가게 오픈!</h2>

      <div className="celebration-card" style={{ '--store-accent': store.colors.accent } as CSSProperties}>
        <p className="celebration-store-name">{store.name}</p>
        <div className="celebration-items">
          {store.items.map((item) => (
            <span key={item.id} className="celebration-item-emoji">
              {item.emoji}
            </span>
          ))}
        </div>
      </div>

      <p className="celebration-hint">사장님이 실력이 늘어서 더 큰 가게를 열게 됐어요!</p>

      <button
        className="big-button celebration-continue-btn"
        style={{ background: store.colors.accent }}
        onClick={onContinue}
      >
        구경하러 가기!
      </button>
    </div>
  );
}
