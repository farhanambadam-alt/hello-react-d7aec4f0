import type { Barber } from '@/data/partnerMockData';

interface StaffSwitcherProps {
  barbers: Barber[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function StaffSwitcher({ barbers, activeId, onSelect }: StaffSwitcherProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 font-heading">Who is on the floor?</p>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {barbers.map(b => (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
              activeId === b.id ? 'scale-105' : 'opacity-60'
            }`}
          >
            <div className={`relative w-12 h-12 rounded-full overflow-hidden ring-2 transition-all ${
              activeId === b.id
                ? b.state === 'BUSY' ? 'ring-red-400' : 'ring-emerald-400'
                : 'ring-transparent'
            }`}>
              <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
              {activeId === b.id && (
                <div className={`absolute bottom-0 inset-x-0 text-[8px] font-bold text-white text-center py-0.5 ${
                  b.state === 'BUSY' ? 'bg-red-500/90' : 'bg-emerald-500/90'
                }`}>
                  {b.state}
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-foreground font-heading truncate max-w-[60px]">{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
