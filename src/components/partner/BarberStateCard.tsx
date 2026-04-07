import { useState, useEffect } from 'react';
import type { Barber } from '@/data/partnerMockData';

interface BarberStateCardProps {
  barber: Barber;
  onToggle: () => void;
}

export default function BarberStateCard({ barber, onToggle }: BarberStateCardProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (barber.state !== 'BUSY') { setElapsed(0); return; }
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [barber.state]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="px-4">
      <button
        onClick={onToggle}
        className={`w-full rounded-2xl p-6 transition-all duration-300 active:scale-[0.98] shadow-lg ${
          barber.state === 'FREE'
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200/50'
            : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200/50'
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-white">
          <div className="text-5xl font-bold font-heading tracking-tight">
            {barber.state}
          </div>
          {barber.state === 'BUSY' ? (
            <>
              <p className="text-white/80 text-sm font-medium">Serving Customer</p>
              <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1 mt-1">
                <span className="text-sm font-mono font-bold">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
              </div>
            </>
          ) : (
            <p className="text-white/80 text-sm font-medium">Tap to mark as Busy</p>
          )}
          <p className="text-white/60 text-xs mt-2">{barber.name} • {barber.specialty}</p>
        </div>
      </button>
    </div>
  );
}
