import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import CoinPicker from '../components/CoinPicker';
import type { ShopItem } from '../data/stores';
import { getLevelConfig } from '../data/levels';
import { generateOrder, type GeneratedOrder } from '../logic/orderGenerator';
import { generateChangeOptions } from '../logic/change';
import { pickRandomCustomer, type Customer } from '../data/customers';
import { useGameState } from '../state/GameStateContext';
import { playTap, playSuccess, playGentleRetry, playStar } from '../utils/sound';
import { shuffle } from '../utils/random';
import './CustomerScreen.css';

interface CustomerScreenProps {
  items: ShopItem[];
  level: number;
  customersUntilRestock: number;
  onNeedRestock: () => void;
  onHome: () => void;
}

type Stage = 'shopping' | 'payment' | 'change' | 'success';

function basketMatchesOrder(basket: Record<string, number>, order: GeneratedOrder): boolean {
  const orderEntries = order.lines.filter((l) => l.qty > 0);
  const basketEntries = Object.entries(basket).filter(([, qty]) => qty > 0);
  if (basketEntries.length !== orderEntries.length) return false;
  return orderEntries.every((line) => basket[line.itemId] === line.qty);
}

export default function CustomerScreen({
  items,
  level,
  customersUntilRestock,
  onNeedRestock,
  onHome,
}: CustomerScreenProps) {
  const { addStars } = useGameState();
  const config = getLevelConfig(level);

  const [customer, setCustomer] = useState<Customer>(() => pickRandomCustomer());
  const [order, setOrder] = useState<GeneratedOrder>(() => generateOrder(level, items));
  const [stage, setStage] = useState<Stage>('shopping');
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [mismatchHint, setMismatchHint] = useState(false);
  const [servedCount, setServedCount] = useState(0);
  const [wrongOptionValue, setWrongOptionValue] = useState<number | null>(null);
  const [earnedStars, setEarnedStars] = useState(1);

  const changeOptions = useMemo(() => generateChangeOptions(order.change), [order]);
  const shelfItems = useMemo(() => shuffle(items), [items]);

  function startNewRound() {
    const nextCustomer = pickRandomCustomer();
    setCustomer(nextCustomer);
    setOrder(generateOrder(level, items));
    setBasket({});
    setMismatchHint(false);
    setWrongOptionValue(null);
    setStage('shopping');
  }

  function handleShelfTap(itemId: string) {
    playTap();
    setMismatchHint(false);
    setBasket((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
  }

  function handleBasketTap(itemId: string) {
    playTap();
    setMismatchHint(false);
    setBasket((prev) => {
      const qty = (prev[itemId] ?? 0) - 1;
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  }

  function handleDoneBasket() {
    if (basketMatchesOrder(basket, order)) {
      playSuccess();
      setStage('payment');
    } else {
      playGentleRetry();
      setMismatchHint(true);
    }
  }

  function goToChangeOrSuccess() {
    if (order.change === 0) {
      finishRound(false);
    } else {
      setStage('change');
    }
  }

  function handleNumericOption(value: number) {
    if (value === order.change) {
      playSuccess();
      finishRound(false);
    } else {
      playGentleRetry();
      setWrongOptionValue(value);
      window.setTimeout(() => setWrongOptionValue(null), 400);
    }
  }

  function finishRound(fromCoins: boolean) {
    void fromCoins;
    const stars = customer.vip ? 2 : 1;
    setEarnedStars(stars);
    setStage('success');
    window.setTimeout(playStar, 150);
    addStars(stars);
  }

  useEffect(() => {
    if (stage !== 'success') return;
    const t = window.setTimeout(() => {
      const nextServed = servedCount + 1;
      setServedCount(nextServed);
      if (nextServed >= customersUntilRestock) {
        onNeedRestock();
      } else {
        startNewRound();
      }
    }, 2200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function handleContinueNow() {
    const nextServed = servedCount + 1;
    setServedCount(nextServed);
    if (nextServed >= customersUntilRestock) {
      onNeedRestock();
    } else {
      startNewRound();
    }
  }

  const basketTotal = Object.entries(basket).reduce((sum, [id, qty]) => {
    const item = items.find((it) => it.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div className="customer-screen">
      <TopBar onHome={onHome} />

      <div className="customer-content">
        <div className="customer-banner" key={customer.id + servedCount}>
          <span className="customer-emoji">{customer.emoji}</span>
          <div className={`speech-bubble ${customer.vip ? 'vip' : ''}`}>
            {customer.vip && <div className="vip-tag">✨ 특별 손님</div>}
            <div className="order-lines">
              {order.lines.map((line) => {
                const item = items.find((it) => it.id === line.itemId);
                if (!item) return null;
                return (
                  <span className="order-chip" key={line.itemId}>
                    {config.showOrderIcons && <span>{item.emoji}</span>}
                    <span>
                      {item.name} {line.qty}개
                    </span>
                  </span>
                );
              })}
            </div>
            <div className="order-please">주세요!</div>
          </div>
        </div>

        {stage === 'shopping' && (
          <div className="stage-panel anim-pop">
            <div className="shelf-row">
              {shelfItems.map((item) => (
                <button key={item.id} className="shelf-item" onClick={() => handleShelfTap(item.id)}>
                  <span className="shelf-item-emoji">{item.emoji}</span>
                  <span className="shelf-item-name">{item.name}</span>
                  <span className="shelf-item-price">{item.price}원</span>
                </button>
              ))}
            </div>

            <div className="basket-panel">
              <p className="basket-title">바구니</p>
              <div className="basket-items">
                {Object.keys(basket).length === 0 && <span className="basket-empty">물건을 눌러 담아보세요</span>}
                {Object.entries(basket).map(([id, qty]) => {
                  if (qty <= 0) return null;
                  const item = items.find((it) => it.id === id);
                  if (!item) return null;
                  return (
                    <button key={id} className="basket-chip" onClick={() => handleBasketTap(id)}>
                      {item.emoji} {item.name} x{qty}
                    </button>
                  );
                })}
              </div>
              <p className="basket-total">총 {basketTotal}원</p>
              {mismatchHint && <p className="hint-text">다시 한번 볼까요? 손님이 부탁한 걸 확인해봐요 🙂</p>}
              <button className="big-button" onClick={handleDoneBasket}>
                다 담았어요!
              </button>
            </div>
          </div>
        )}

        {stage === 'payment' && (
          <div className="stage-panel anim-pop">
            <div className="receipt">
              <p className="receipt-line">총 가격</p>
              <p className="receipt-total">{order.totalPrice}원</p>
              <p className="receipt-line">손님이 낸 돈</p>
              <p className="receipt-payment">{order.payment}원</p>
            </div>
            <button className="big-button" onClick={goToChangeOrSuccess}>
              다음
            </button>
          </div>
        )}

        {stage === 'change' && config.changeMode === 'numeric' && (
          <div className="stage-panel anim-pop">
            <p className="change-question">거스름돈은 얼마일까요?</p>
            <div className="numeric-options">
              {changeOptions.map((value) => (
                <button
                  key={value}
                  className={`big-button numeric-option ${wrongOptionValue === value ? 'anim-shake' : ''}`}
                  onClick={() => handleNumericOption(value)}
                >
                  {value}원
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'change' && config.changeMode === 'coins' && (
          <div className="stage-panel anim-pop">
            <CoinPicker target={order.change} onCorrect={() => finishRound(true)} />
          </div>
        )}

        {stage === 'success' && (
          <div className="stage-panel success-panel anim-bounce-in">
            <div className="success-emoji">{customer.emoji} 😊</div>
            <p className="success-text">감사합니다!</p>
            <p className="success-stars">
              {'⭐'.repeat(earnedStars)} +{earnedStars}
            </p>
            <button className="big-button secondary" onClick={handleContinueNow}>
              다음 손님 만나기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
