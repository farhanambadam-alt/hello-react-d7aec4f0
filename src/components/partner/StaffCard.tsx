import type { Barber } from '@/data/partnerMockData';

interface StaffCardProps {
  barber: Barber;
}

export default function StaffCard({ barber }: StaffCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col items-center gap-2 text-center">
      <div className="relative">
        <img src={barber.avatar} alt={barber.name} className="w-16 h-16 rounded-full object-cover" />
        <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
          barber.state === 'FREE' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {barber.state}
        </span>
      </div>
      <p className="font-semibold text-sm text-foreground font-heading">{barber.name}</p>
      <p className="text-xs text-muted-foreground">{barber.specialty}</p>
    </div>
  );
}
