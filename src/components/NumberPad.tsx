import { playTap } from '../utils/sound';
import './NumberPad.css';

interface NumberPadProps {
  value: string;
  onChange: (next: string) => void;
  onConfirm: () => void;
  maxLength?: number;
}

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function NumberPad({ value, onChange, onConfirm, maxLength = 4 }: NumberPadProps) {
  function pressDigit(digit: string) {
    if (value.length >= maxLength) return;
    playTap();
    // avoid a leading run of zeros ("00" etc.)
    onChange(value === '0' ? digit : value + digit);
  }

  function backspace() {
    if (value.length === 0) return;
    playTap();
    onChange(value.slice(0, -1));
  }

  return (
    <div className="number-pad">
      <div className="number-pad-grid">
        {DIGIT_KEYS.map((digit) => (
          <button key={digit} className="number-key" onClick={() => pressDigit(digit)}>
            {digit}
          </button>
        ))}
        <button className="number-key number-key-erase" onClick={backspace} disabled={value.length === 0}>
          ⌫
        </button>
        <button className="number-key" onClick={() => pressDigit('0')}>
          0
        </button>
        <button className="number-key number-key-confirm" onClick={onConfirm} disabled={value.length === 0}>
          확인
        </button>
      </div>
    </div>
  );
}
