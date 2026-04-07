import { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface AccessGateProps {
  onUnlock: () => void;
}

const CORRECT_PIN = '1234';

export default function AccessGate({ onUnlock }: AccessGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 600);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-pink-500 to-rose-400 flex flex-col items-center justify-center gap-8 p-6">
      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
        <Lock className="text-white" size={28} />
      </div>
      <div>
        <h2 className="text-white text-xl font-bold text-center font-heading">Owner Access</h2>
        <p className="text-white/70 text-sm text-center mt-1">Enter 4-digit PIN</p>
      </div>

      {/* Dots */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              error ? 'bg-red-300 animate-pulse' :
              i < pin.length ? 'bg-white scale-110' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {['1','2','3','4','5','6','7','8','9','','0','del'].map(k => (
          <button
            key={k}
            onClick={() => k === 'del' ? handleDelete() : k && handleDigit(k)}
            className={`w-16 h-16 rounded-full text-xl font-bold transition-all ${
              k === '' ? 'invisible' :
              k === 'del' ? 'bg-white/10 text-white flex items-center justify-center' :
              'bg-white/20 text-white active:bg-white/40 active:scale-95'
            } flex items-center justify-center`}
          >
            {k === 'del' ? <Delete size={20} /> : k}
          </button>
        ))}
      </div>
      <p className="text-white/50 text-xs">Default PIN: 1234</p>
    </div>
  );
}
