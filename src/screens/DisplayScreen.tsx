import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import type { ShopItem } from '../data/stores';
import { shuffle } from '../utils/random';
import { playTap, playSuccess, playGentleRetry } from '../utils/sound';
import './DisplayScreen.css';

interface DisplayScreenProps {
  items: ShopItem[];
  level: number;
  onComplete: () => void;
  onHome: () => void;
}

export default function DisplayScreen({ items, level, onComplete, onHome }: DisplayScreenProps) {
  // 초반엔 그림+글자 동시 표시, 레벨이 오르면 이름표는 글자만 (읽기 연습 강화)
  const showIconOnLabel = level <= 2;

  const slotOrder = useMemo(() => shuffle(items), [items]);
  const boxOrder = useMemo(() => shuffle(items), [items]);

  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongSlotId, setWrongSlotId] = useState<string | null>(null);
  const [justPlacedId, setJustPlacedId] = useState<string | null>(null);

  const allPlaced = placedIds.size === items.length;

  useEffect(() => {
    if (allPlaced) {
      const t = window.setTimeout(onComplete, 900);
      return () => window.clearTimeout(t);
    }
  }, [allPlaced, onComplete]);

  function handleBoxTap(id: string) {
    if (placedIds.has(id)) return;
    playTap();
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleSlotTap(slotItem: ShopItem) {
    if (placedIds.has(slotItem.id)) return;
    if (!selectedId) return;

    if (selectedId === slotItem.id) {
      playSuccess();
      setPlacedIds((prev) => {
        const next = new Set(prev);
        next.add(slotItem.id);
        return next;
      });
      setJustPlacedId(slotItem.id);
      setSelectedId(null);
      window.setTimeout(() => setJustPlacedId(null), 500);
    } else {
      playGentleRetry();
      setWrongSlotId(slotItem.id);
      window.setTimeout(() => setWrongSlotId(null), 400);
    }
  }

  return (
    <div className="display-screen">
      <TopBar onHome={onHome} />
      <div className="display-content">
        <h2 className="display-title">오늘 물건을 진열해볼까요?</h2>
        <p className="display-subtitle">물건을 먼저 누르고, 이름표가 맞는 칸을 눌러보세요</p>

        <div className="shelf-grid">
          {slotOrder.map((item) => {
            const placed = placedIds.has(item.id);
            const wrong = wrongSlotId === item.id;
            const justPlaced = justPlacedId === item.id;
            return (
              <button
                key={item.id}
                className={[
                  'shelf-slot',
                  placed ? 'filled' : '',
                  wrong ? 'anim-shake' : '',
                  justPlaced ? 'anim-sparkle' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSlotTap(item)}
                disabled={placed}
              >
                {placed ? (
                  <span className="shelf-slot-emoji">{item.emoji}</span>
                ) : (
                  <span className="shelf-slot-placeholder">
                    {showIconOnLabel && <span className="shelf-slot-icon-hint">{item.emoji}</span>}
                    <span className="shelf-slot-name">{item.name}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="item-tray">
          {boxOrder
            .filter((item) => !placedIds.has(item.id))
            .map((item) => (
              <button
                key={item.id}
                className={`item-box ${selectedId === item.id ? 'selected' : ''}`}
                onClick={() => handleBoxTap(item.id)}
              >
                <span className="item-box-emoji">{item.emoji}</span>
                <span className="item-box-name">{item.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
