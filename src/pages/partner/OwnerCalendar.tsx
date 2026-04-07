import { useMemo } from 'react';
import { partnerBookings } from '@/data/partnerMockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function OwnerCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = viewDate.getDay();

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Simple booking markers on specific days
  const bookingDays = useMemo(() => {
    const days = new Set<number>();
    partnerBookings.forEach((_, i) => {
      days.add(5 + i * 3); // Spread bookings across days for visual demo
    });
    return days;
  }, []);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = now.getDate();
  const isCurrentMonth = monthOffset === 0;

  return (
    <div className="p-4 space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMonthOffset(m => m - 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft size={16} />
        </button>
        <h2 className="font-bold text-base text-foreground font-heading">{monthName}</h2>
        <button onClick={() => setMonthOffset(m => m + 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground font-heading py-1">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const hasBooking = bookingDays.has(day);
          const isToday = isCurrentMonth && day === today;
          const hasBuffer = hasBooking; // Buffer shown on booking days

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium relative transition-all ${
                isToday ? 'bg-gradient-to-br from-pink-500 to-rose-400 text-white font-bold' :
                hasBooking ? 'bg-pink-50 text-foreground' :
                'text-foreground'
              }`}
            >
              {day}
              {hasBooking && (
                <div className="w-1 h-1 rounded-full bg-pink-500 mt-0.5" />
              )}
              {hasBuffer && !isToday && (
                <div className="absolute bottom-0.5 inset-x-1 h-0.5 rounded-full bg-muted-foreground/20" title="30-min buffer" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          Booking
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 rounded-full bg-muted-foreground/30" />
          30-min buffer
        </div>
      </div>
    </div>
  );
}
