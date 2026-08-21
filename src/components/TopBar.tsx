import { useState } from 'react';
import { useGameState } from '../state/GameStateContext';
import './TopBar.css';

interface TopBarProps {
  onHome?: () => void;
  onReset?: () => void;
}

export default function TopBar({ onHome, onReset }: TopBarProps) {
  const { stars, level, soundOn, toggleSound } = useGameState();
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleConfirmReset() {
    setConfirmingReset(false);
    onReset?.();
  }

  return (
    <>
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
          {onReset && (
            <button
              className="top-bar-icon-btn"
              onClick={() => setConfirmingReset(true)}
              aria-label="처음부터 다시 시작"
            >
              🔄
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

      {confirmingReset && (
        <div className="reset-confirm-backdrop">
          <div className="reset-confirm-card anim-pop">
            <p className="reset-confirm-title">정말 처음부터 다시 시작할까요?</p>
            <p className="reset-confirm-subtext">모은 별과 레벨이 모두 사라져요.</p>
            <div className="reset-confirm-actions">
              <button className="big-button ghost" onClick={() => setConfirmingReset(false)}>
                아니요
              </button>
              <button className="big-button" onClick={handleConfirmReset}>
                처음부터 시작할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
