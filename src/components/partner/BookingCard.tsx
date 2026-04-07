import type { PartnerBooking } from '@/data/partnerMockData';
import { Clock, User } from 'lucide-react';

interface BookingCardProps {
  booking: PartnerBooking;
  isNext?: boolean;
  onTap?: () => void;
}

const statusColors: Record<string, string> = {
  'upcoming': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'completed': 'bg-emerald-100 text-emerald-700',
  'cancelled': 'bg-red-100 text-red-700',
};

export default function BookingCard({ booking, isNext, onTap }: BookingCardProps) {
  return (
    <button
      onClick={onTap}
      className={`w-full text-left rounded-xl border bg-card p-4 transition-all active:scale-[0.98] ${
        isNext ? 'border-pink-200 shadow-md shadow-pink-100/50' : 'border-border'
      }`}
    >
      {isNext && <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-2 font-heading">Next Up</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
            <User size={16} className="text-pink-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground font-heading">{booking.customerName}</p>
            <p className="text-xs text-muted-foreground">{booking.service}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {booking.time}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[booking.status]}`}>
            {booking.status.replace('-', ' ')}
          </span>
        </div>
      </div>
    </button>
  );
}
