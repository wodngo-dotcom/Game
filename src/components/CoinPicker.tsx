import { useState } from 'react';
import { COIN_DENOMINATIONS, sumCoins } from '../logic/change';
import { playCoin, playTap, playSuccess, playGentleRetry } from '../utils/sound';
import './CoinPicker.css';

interface CoinPickerProps {
  target: number;
  onCorrect: () => void;
}

export default function CoinPicker({ target, onCorrect }: CoinPickerProps) {
  const [counts, setCounts] = useState<Partial<Record<number, number>>>({});
  const [shakeTray, setShakeTray] = useState(false);

  const sum = sumCoins(counts);

  function addCoin(denom: number) {
    playCoin();
    setCounts((prev) => ({ ...prev, [denom]: (prev[denom] ?? 0) + 1 }));
  }

  function removeCoin(denom: number) {
    playTap();
    setCounts((prev) => {
      const current = prev[denom] ?? 0;
      if (current <= 0) return prev;
      return { ...prev, [denom]: current - 1 };
    });
  }

  function reset() {
    setCounts({});
  }

  function confirm() {
    if (sum === target) {
      playSuccess();
      onCorrect();
    } else {
      playGentleRetry();
      setShakeTray(true);
      window.setTimeout(() => {
        setShakeTray(false);
        reset();
      }, 500);
    }
  }

  const trayCoins: number[] = [];
  for (const denom of COIN_DENOMINATIONS) {
    for (let i = 0; i < (counts[denom] ?? 0); i++) trayCoins.push(denom);
  }

  return (
    <div className="coin-picker">
      <p className="coin-target">
        거스름돈 <strong>{target}원</strong>을 만들어주세요
      </p>
      <div className={`coin-tray ${shakeTray ? 'anim-shake' : ''}`}>
        {trayCoins.length === 0 && <span className="coin-tray-empty">동전을 눌러 담아보세요</span>}
        {trayCoins.map((denom, i) => (
          <button key={`${denom}-${i}`} className="coin-chip" onClick={() => removeCoin(denom)}>
            {denom}원
          </button>
        ))}
      </div>
      <p className="coin-sum">지금까지 {sum}원</p>
      <div className="coin-buttons">
        {COIN_DENOMINATIONS.map((denom) => (
          <button key={denom} className="coin-button" onClick={() => addCoin(denom)}>
            <span className="coin-face">{denom}</span>
            <span className="coin-unit">원</span>
          </button>
        ))}
      </div>
      <div className="coin-actions">
        <button className="big-button ghost" onClick={reset}>
          다시 담기
        </button>
        <button className="big-button" onClick={confirm}>
          확인!
        </button>
      </div>
    </div>
  );
}
