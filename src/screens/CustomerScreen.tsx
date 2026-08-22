import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import NumberPad from '../components/NumberPad';
import type { ShopItem, StoreConfig } from '../data/stores';
import { getLevelConfig } from '../data/levels';
import { generateOrder, type GeneratedOrder } from '../logic/orderGenerator';
import { spawnCustomer, type CustomerSpawn } from '../data/customers';
import { useGameState } from '../state/GameStateContext';
import {
  playTap,
  playSuccess,
  playGentleRetry,
  playStar,
  playDoorbell,
  playVipFanfare,
  playCashRegister,
} from '../utils/sound';
import { shuffle } from '../utils/random';
import './CustomerScreen.css';

interface CustomerScreenProps {
  items: ShopItem[];
  level: number;
  store: StoreConfig;
  customersUntilRestock: number;
  onNeedRestock: () => void;
  onHome: () => void;
  onReset: () => void;
}

type Stage = 'shopping' | 'totalInput' | 'payment' | 'changeInput' | 'success';

function basketMatchesOrder(basket: Record<string, number>, order: GeneratedOrder): boolean {
  const orderEntries = order.lines.filter((l) => l.qty > 0);
  const basketEntries = Object.entries(basket).filter(([, qty]) => qty > 0);
  if (basketEntries.length !== orderEntries.length) return false;
  return orderEntries.every((line) => basket[line.itemId] === line.qty);
}

export default function CustomerScreen({
  items,
  level,
  store,
  customersUntilRestock,
  onNeedRestock,
  onHome,
  onReset,
}: CustomerScreenProps) {
  const { addStars } = useGameState();
  const config = getLevelConfig(level);

  const [spawn, setSpawn] = useState<CustomerSpawn>(() => spawnCustomer(store.customers));
  const { customer, line, isVip } = spawn;
  const [order, setOrder] = useState<GeneratedOrder>(() => generateOrder(level, items, store));
  const [stage, setStage] = useState<Stage>('shopping');
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [mismatchHint, setMismatchHint] = useState(false);
  const [servedCount, setServedCount] = useState(0);
  const [earnedStars, setEarnedStars] = useState(1);

  const [totalInput, setTotalInput] = useState('');
  const [totalWrong, setTotalWrong] = useState(false);
  const [totalShake, setTotalShake] = useState(false);

  const [changeInput, setChangeInput] = useState('');
  const [changeWrong, setChangeWrong] = useState(false);
  const [changeShake, setChangeShake] = useState(false);

  const shelfItems = useMemo(() => shuffle(items), [items]);

  const totalAddends = order.lines.flatMap((line) => {
    const item = items.find((it) => it.id === line.itemId);
    return item ? Array<number>(line.qty).fill(item.price) : [];
  });

  useEffect(() => {
    playDoorbell();
    if (isVip) {
      window.setTimeout(playVipFanfare, 220);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id, servedCount]);

  function startNewRound() {
    setSpawn(spawnCustomer(store.customers));
    setOrder(generateOrder(level, items, store));
    setBasket({});
    setMismatchHint(false);
    setTotalInput('');
    setTotalWrong(false);
    setChangeInput('');
    setChangeWrong(false);
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
      setTotalInput('');
      setTotalWrong(false);
      setStage('totalInput');
    } else {
      playGentleRetry();
      setMismatchHint(true);
    }
  }

  function handleTotalInputChange(next: string) {
    setTotalWrong(false);
    setTotalInput(next);
  }

  function handleTotalConfirm() {
    if (totalInput === '') return;
    if (Number(totalInput) === order.totalPrice) {
      playSuccess();
      window.setTimeout(playCashRegister, 450);
      setStage('payment');
    } else {
      playGentleRetry();
      setTotalWrong(true);
      setTotalShake(true);
      window.setTimeout(() => {
        setTotalShake(false);
        setTotalInput('');
      }, 500);
    }
  }

  function goToChangeOrSuccess() {
    if (order.change === 0) {
      finishRound();
    } else {
      setChangeInput('');
      setChangeWrong(false);
      setStage('changeInput');
    }
  }

  function handleChangeInputChange(next: string) {
    setChangeWrong(false);
    setChangeInput(next);
  }

  function handleChangeConfirm() {
    if (changeInput === '') return;
    if (Number(changeInput) === order.change) {
      playSuccess();
      finishRound();
    } else {
      playGentleRetry();
      setChangeWrong(true);
      setChangeShake(true);
      window.setTimeout(() => {
        setChangeShake(false);
        setChangeInput('');
      }, 500);
    }
  }

  function finishRound() {
    const stars = isVip ? 2 : 1;
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

  return (
    <div className="customer-screen">
      <TopBar onHome={onHome} onReset={onReset} />

      <div className="customer-content">
        <div className="customer-banner" key={customer.id + servedCount}>
          <span className="customer-emoji">{customer.emoji}</span>
          <div className={`speech-bubble ${isVip ? 'vip' : ''}`}>
            {isVip && <div className="vip-tag">✨ 특별 손님</div>}
            <p className="customer-name">{customer.name}</p>
            <p className="customer-quip">{line}</p>
            <div className="order-lines">
              {order.lines.map((orderLine) => {
                const item = items.find((it) => it.id === orderLine.itemId);
                if (!item) return null;
                return (
                  <span className="order-chip" key={orderLine.itemId}>
                    {config.showOrderIcons && <span>{item.emoji}</span>}
                    <span>
                      {item.name} {orderLine.qty}개
                    </span>
                  </span>
                );
              })}
            </div>
            <div className="order-please">{customer.closing}</div>
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
              {mismatchHint && <p className="hint-text">다시 한번 볼까요? 손님이 부탁한 걸 확인해봐요 🙂</p>}
              <button className="big-button" onClick={handleDoneBasket}>
                다 담았어요!
              </button>
            </div>
          </div>
        )}

        {stage === 'totalInput' && (
          <div className="stage-panel anim-pop">
            <p className="calc-title">물건 값을 다 더하면 얼마일까요?</p>
            <div className="calc-basket-list">
              {order.lines.map((line) => {
                const item = items.find((it) => it.id === line.itemId);
                if (!item) return null;
                return (
                  <div className="calc-basket-row" key={line.itemId}>
                    <span>
                      {item.emoji} {item.name}
                    </span>
                    <span>{line.qty}개</span>
                  </div>
                );
              })}
            </div>
            <div className="calc-formula">
              {totalAddends.map((price, i) => (
                <span key={i} className="calc-formula-term">
                  {i > 0 && <span className="calc-op">+</span>}
                  {price}원
                </span>
              ))}
              <span className="calc-op">=</span>
              <span className="calc-question-mark">?</span>
            </div>
            <div className={`answer-display ${totalShake ? 'anim-shake' : ''}`}>
              {totalInput ? `${totalInput}원` : <span className="answer-placeholder">숫자를 눌러보세요</span>}
            </div>
            {totalWrong && <p className="hint-text">다시 한번 볼까요? 천천히 더해봐요 🙂</p>}
            <NumberPad value={totalInput} onChange={handleTotalInputChange} onConfirm={handleTotalConfirm} />
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

        {stage === 'changeInput' && (
          <div className="stage-panel anim-pop">
            <p className="calc-title">거스름돈은 얼마일까요?</p>
            <div className="calc-formula">
              <span>{order.payment}원</span>
              <span className="calc-op">−</span>
              <span>{order.totalPrice}원</span>
              <span className="calc-op">=</span>
              <span className="calc-question-mark">?</span>
            </div>
            <div className={`answer-display ${changeShake ? 'anim-shake' : ''}`}>
              {changeInput ? `${changeInput}원` : <span className="answer-placeholder">숫자를 눌러보세요</span>}
            </div>
            {changeWrong && <p className="hint-text">다시 한번 볼까요? 천천히 빼 봐요 🙂</p>}
            <NumberPad value={changeInput} onChange={handleChangeInputChange} onConfirm={handleChangeConfirm} />
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
