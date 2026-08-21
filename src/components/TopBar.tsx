import { useGameState } from '../state/GameStateContext';
import './TopBar.css';

interface TopBarProps {
  onHome?: () => void;
}

export default function TopBar({ onHome }: TopBarProps) {
  const { stars, level, soundOn, toggleSound } = useGameState();

  return (
    <div className="top-bar">
      <div className="top-bar-pill stars-pill">
        <span aria-hidden="true">⭐</span>
        <span>{stars}</span>
      </div>
      <div className="top-bar-actions">
        {onHome && (
          <button className="top-bar-icon-btn" onClick={onHome} aria-label="홈으로">
            🏠
          </button>
        )}
        <button
          className="top-bar-icon-btn"
          onClick={toggleSound}
          aria-label={soundOn ? '소리 끄기' : '소리 켜기'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <div className="top-bar-pill level-pill">
          <span>Lv.{level}</span>
        </div>
      </div>
    </div>
  );
}
