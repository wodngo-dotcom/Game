import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../components/TopBar';
import type { ShopItem } from '../data/stores';
import { shuffle, randInt } from '../utils/random';
import { playPop, playSuccess, playGentleRetry, playStar, playCatchSparkle } from '../utils/sound';
import { useGameState } from '../state/GameStateContext';
import './DisplayScreen.css';

interface DisplayScreenProps {
  items: ShopItem[];
  level: number;
  onComplete: () => void;
  onHome: () => void;
  onReset: () => void;
}

type PopupKind = 'item' | 'bonus';
type PopupPhase = 'popping' | 'floating' | 'caught' | 'missed';

interface BonusFlavor {
  id: string;
  emoji: string;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Flyer {
  item: ShopItem;
  from: Rect;
  to: Rect;
}

const BONUS_FLAVORS: BonusFlavor[] = [
  { id: 'golden-apple', emoji: '🍎' },
  { id: 'sparkle-star', emoji: '⭐' },
  { id: 'gem', emoji: '💎' },
];

// Tuned for a 5-year-old: a generous, slow-moving catch window and a low
// bonus rate, so nothing feels rushed or punishing to miss.
const BONUS_CHANCE = 0.16;
const POP_DURATION_MS = 280;
const FLOAT_WINDOW_MS = 2300;
const MISS_DURATION_MS = 450;
const CATCH_FLY_MS = 550;
const BONUS_CATCH_MS = 600;

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export default function DisplayScreen({ items, level, onComplete, onHome, onReset }: DisplayScreenProps) {
  const { addStars } = useGameState();
  // 초반엔 그림+글자 동시 표시, 레벨이 오르면 이름표는 글자만 (읽기 연습 강화)
  const showIconOnLabel = level <= 2;

  const boxes = useMemo(() => shuffle(items), [items]);
  const slotOrder = useMemo(() => shuffle(items), [items]);

  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set());
  const [justPlacedId, setJustPlacedId] = useState<string | null>(null);

  const [openBoxId, setOpenBoxId] = useState<string | null>(null);
  const [popupKind, setPopupKind] = useState<PopupKind | null>(null);
  const [popupPhase, setPopupPhase] = useState<PopupPhase | null>(null);
  const [bonusFlavor, setBonusFlavor] = useState<BonusFlavor | null>(null);
  const [bonusBurst, setBonusBurst] = useState(false);

  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [flyerActive, setFlyerActive] = useState(false);

  const popupRef = useRef<HTMLButtonElement | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timerRef = useRef<number | null>(null);

  const allPlaced = placedIds.size === boxes.length;

  useEffect(() => {
    if (allPlaced) {
      const t = window.setTimeout(onComplete, 700);
      return () => window.clearTimeout(t);
    }
  }, [allPlaced, onComplete]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetPopup() {
    clearTimer();
    setOpenBoxId(null);
    setPopupKind(null);
    setPopupPhase(null);
    setBonusFlavor(null);
    setBonusBurst(false);
  }

  function handleBoxTap(item: ShopItem) {
    if (placedIds.has(item.id) || openBoxId !== null) return;
    playPop();
    const isBonus = Math.random() < BONUS_CHANCE;
    setOpenBoxId(item.id);
    setPopupKind(isBonus ? 'bonus' : 'item');
    setBonusFlavor(isBonus ? BONUS_FLAVORS[randInt(0, BONUS_FLAVORS.length - 1)] : null);
    setPopupPhase('popping');

    timerRef.current = window.setTimeout(() => {
      setPopupPhase('floating');
      timerRef.current = window.setTimeout(() => {
        playGentleRetry();
        setPopupPhase('missed');
        timerRef.current = window.setTimeout(resetPopup, MISS_DURATION_MS);
      }, FLOAT_WINDOW_MS);
    }, POP_DURATION_MS);
  }

  function handleCatch(item: ShopItem) {
    if (popupPhase !== 'floating') return;
    clearTimer();

    if (popupKind === 'bonus') {
      playCatchSparkle();
      window.setTimeout(playStar, 120);
      addStars(1);
      setPopupPhase('caught');
      setBonusBurst(true);
      timerRef.current = window.setTimeout(resetPopup, BONUS_CATCH_MS);
      return;
    }

    playCatchSparkle();
    setPopupPhase('caught');
    const popupEl = popupRef.current;
    const slotEl = slotRefs.current[item.id];
    if (popupEl && slotEl) {
      setFlyer({ item, from: rectOf(popupEl), to: rectOf(slotEl) });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFlyerActive(true));
      });
    }
    timerRef.current = window.setTimeout(() => {
      playSuccess();
      setPlacedIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
      setJustPlacedId(item.id);
      setFlyer(null);
      setFlyerActive(false);
      resetPopup();
      window.setTimeout(() => setJustPlacedId(null), 500);
    }, CATCH_FLY_MS);
  }

  return (
    <div className="display-screen">
      <TopBar onHome={onHome} onReset={onReset} />
      <div className="display-content">
        <h2 className="display-title">상자를 열어서 진열해볼까요?</h2>
        <p className="display-subtitle">상자를 누르면 물건이 튀어나와요. 떠 있을 때 잡아보세요!</p>

        <div className="shelf-grid">
          {slotOrder.map((item) => {
            const placed = placedIds.has(item.id);
            const justPlaced = justPlacedId === item.id;
            const incoming = flyerActive && flyer?.item.id === item.id;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  slotRefs.current[item.id] = el;
                }}
                className={['shelf-slot', placed ? 'filled' : '', justPlaced ? 'anim-sparkle' : '', incoming ? 'incoming' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {placed ? (
                  <span className="shelf-slot-emoji">{item.emoji}</span>
                ) : (
                  <span className="shelf-slot-placeholder">
                    {showIconOnLabel && <span className="shelf-slot-icon-hint">{item.emoji}</span>}
                    <span className="shelf-slot-name">{item.name}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="box-grid">
          {boxes
            .filter((item) => !placedIds.has(item.id))
            .map((item) => {
              const isOpen = openBoxId === item.id;
              return (
                <div key={item.id} className="box-wrap">
                  <button
                    className={`treasure-box ${isOpen ? 'lid-open' : ''}`}
                    onClick={() => handleBoxTap(item)}
                    disabled={isOpen}
                    aria-label="물건 상자"
                  >
                    📦
                  </button>

                  {isOpen && popupKind === 'item' && popupPhase !== 'caught' && (
                    <button
                      ref={popupRef}
                      className={`popup-thing phase-${popupPhase}`}
                      onClick={() => handleCatch(item)}
                      disabled={popupPhase !== 'floating'}
                    >
                      {popupPhase === 'popping' && <span className="popup-pop-text">짜잔!</span>}
                      <span className="popup-emoji">{item.emoji}</span>
                    </button>
                  )}

                  {isOpen && popupKind === 'bonus' && bonusFlavor && (
                    <button
                      ref={popupRef}
                      className={`popup-thing bonus phase-${popupPhase}`}
                      onClick={() => handleCatch(item)}
                      disabled={popupPhase !== 'floating'}
                    >
                      {popupPhase === 'popping' && <span className="popup-pop-text">깜짝 선물!</span>}
                      <span className="popup-emoji">{bonusFlavor.emoji}</span>
                      {bonusBurst && <span className="bonus-burst">+1⭐</span>}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {flyer && (
        <div
          className="flying-item"
          style={{
            transform: flyerActive
              ? `translate(${flyer.to.left + flyer.to.width / 2}px, ${flyer.to.top + flyer.to.height / 2}px) scale(0.5)`
              : `translate(${flyer.from.left + flyer.from.width / 2}px, ${flyer.from.top + flyer.from.height / 2}px) scale(1)`,
          }}
        >
          {flyer.item.emoji}
        </div>
      )}
    </div>
  );
}
