import { useState, useCallback } from 'react';
import { Wifi, WifiOff, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { barbers as mockBarbers, partnerBookings } from '@/data/partnerMockData';
import type { Barber, PartnerBooking } from '@/data/partnerMockData';
import StaffSwitcher from '@/components/partner/StaffSwitcher';
import BarberStateCard from '@/components/partner/BarberStateCard';
import BookingCard from '@/components/partner/BookingCard';
import WalkInButton from '@/components/partner/WalkInButton';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';

export default function StaffHome() {
  const navigate = useNavigate();
  const [barberList, setBarberList] = useState<Barber[]>(mockBarbers);
  const [activeId, setActiveId] = useState(mockBarbers[0].id);
  const [drawerBooking, setDrawerBooking] = useState<PartnerBooking | null>(null);

  const activeBarber = barberList.find(b => b.id === activeId)!;
  const todayBookings = partnerBookings.filter(b => b.barberId === activeId);
  const nextBooking = todayBookings.find(b => b.status === 'upcoming');

  const toggleState = useCallback(() => {
    setBarberList(prev => prev.map(b =>
      b.id === activeId ? { ...b, state: b.state === 'FREE' ? 'BUSY' : 'FREE' } : b
    ));
  }, [activeId]);

  const handleWalkIn = () => {
    setBarberList(prev => prev.map(b =>
      b.id === activeId ? { ...b, state: 'BUSY' } : b
    ));
  };

  const handleMarkDone = () => {
    setBarberList(prev => prev.map(b =>
      b.id === activeId ? { ...b, state: 'FREE' } : b
    ));
    setDrawerBooking(null);
  };

  const isOnline = true;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi size={14} className="text-emerald-500" />
          ) : (
            <WifiOff size={14} className="text-amber-500" />
          )}
          <span className={`text-[10px] font-semibold ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <h1 className="font-bold text-base text-foreground font-heading">Staff Mode</h1>
        <button
          onClick={() => navigate('/owner')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center"
        >
          <Crown size={14} className="text-white" />
        </button>
      </div>

      <div className="space-y-4 pt-2">
        {/* Barber switcher */}
        <StaffSwitcher barbers={barberList} activeId={activeId} onSelect={setActiveId} />

        {/* Hero state card */}
        <BarberStateCard barber={activeBarber} onToggle={toggleState} />

        {/* Walk-in button */}
        <WalkInButton onPress={handleWalkIn} disabled={activeBarber.state === 'BUSY'} />

        {/* Next booking */}
        <div className="px-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 font-heading uppercase tracking-wider">Next Booking</p>
          {nextBooking ? (
            <BookingCard booking={nextBooking} isNext onTap={() => setDrawerBooking(nextBooking)} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">No upcoming bookings</p>
            </div>
          )}
        </div>

        {/* Today's bookings */}
        <div className="px-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 font-heading uppercase tracking-wider">Today's Bookings</p>
          <div className="space-y-2">
            {todayBookings.length > 0 ? todayBookings.map(b => (
              <BookingCard key={b.id} booking={b} onTap={() => setDrawerBooking(b)} />
            )) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">No bookings today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking detail drawer */}
      <Drawer open={!!drawerBooking} onOpenChange={o => !o && setDrawerBooking(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-heading">{drawerBooking?.customerName}</DrawerTitle>
          </DrawerHeader>
          {drawerBooking && (
            <div className="px-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{drawerBooking.service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{drawerBooking.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize text-foreground">{drawerBooking.status.replace('-', ' ')}</span>
              </div>
            </div>
          )}
          <DrawerFooter>
            <button
              onClick={handleMarkDone}
              className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold font-heading active:scale-[0.97] transition-all"
            >
              Mark as Done → FREE
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
