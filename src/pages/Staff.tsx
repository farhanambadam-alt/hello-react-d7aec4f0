import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  User, Clock, CheckCircle, Smartphone, BellRing,
  Coffee, Check, Plus, Banknote, CreditCard, History,
  List, Calendar, MapPin, Hash, ChevronRight, AlertCircle, Play,
  Settings, Award, TrendingUp, LogOut, ChevronLeft,
  Star, MessageSquare, Camera, Scissors, Quote, Trash2,
  ExternalLink, Zap, X, AlertTriangle, ArrowRight
} from 'lucide-react';

// --- TYPES ---
interface Barber {
  id: string;
  name: string;
  init: string;
  color: string;
  role: string;
}

interface Booking {
  id: number;
  name: string;
  barberId: string;
  type: 'online' | 'walkin';
  status: 'serving' | 'waiting';
  scheduledTime: string;
  queueNo: number;
  services: string[];
  duration: number;
  price: number;
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  duration: number;
}

// --- DATA ---
const BARBERS: Barber[] = [
  { id: 'b1', name: 'Arjun', init: 'AS', color: 'bg-indigo-600 text-white', role: 'Senior Stylist' },
  { id: 'b2', name: 'Binod', init: 'BK', color: 'bg-emerald-600 text-white', role: 'Barber' },
  { id: 'b3', name: 'Divya', init: 'DN', color: 'bg-rose-600 text-white', role: 'Master Stylist' },
];

const SERVICES: ServiceItem[] = [
  { id: 1, name: "Haircut", price: 250, duration: 30 },
  { id: 2, name: 'Beard Trim', price: 150, duration: 20 },
  { id: 3, name: 'Facial', price: 500, duration: 45 },
  { id: 4, name: 'Hair Color', price: 800, duration: 60 },
  { id: 5, name: 'Head Massage', price: 300, duration: 30 },
];

// --- TIME HELPERS ---
const timeToMins = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(' ');
  const time = parts[0];
  const period = parts[1];
  const timeParts = time.split(':').map(Number);
  let h = timeParts[0];
  const m = timeParts[1] || 0;
  if (period?.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period?.toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const minsToTime = (mins: number): string => {
  let h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return `${h}:${m.toString().padStart(2, '0')} ${period}`;
};

const OPEN_TIME = 9 * 60;
const CLOSE_TIME = 21 * 60;
const SLOT_INTERVAL = 30;

// --- DURATION DIAL ---
const DurationDial: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpdate = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    const mins = Math.max(15, Math.min(120, Math.round((normalizedAngle / 360) * 120 / 5) * 5));
    onChange(mins);
  }, [onChange]);

  const rotation = (value / 120) * 360;

  return (
    <div className="flex items-center justify-center py-4">
      <div
        ref={dialRef}
        className="relative w-40 h-40 rounded-full cursor-pointer select-none"
        onMouseMove={(e) => isDragging && handleUpdate(e.clientX, e.clientY)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={(e) => isDragging && handleUpdate(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        <svg viewBox="0 0 160 160" className="w-full h-full">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="70"
            fill="none" stroke="#4f46e5" strokeWidth="8"
            strokeDasharray={`${(rotation / 360) * 440} 440`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-zinc-900">{value}</span>
          <span className="text-xs font-bold text-zinc-400 tracking-widest">MINS</span>
        </div>
        <div
          className="absolute w-5 h-5 bg-indigo-600 rounded-full shadow-lg border-2 border-white"
          style={{
            top: `${80 - 70 * Math.cos((rotation * Math.PI) / 180)}px`,
            left: `${80 + 70 * Math.sin((rotation * Math.PI) / 180)}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Staff() {
  const [activeBarberTab, setActiveBarberTab] = useState('b1');
  const [viewMode, setViewMode] = useState<'queue' | 'profile'>('queue');
  const [barberOnBreak, setBarberOnBreak] = useState<Record<string, boolean>>({ b1: false, b2: false, b3: false });
  const [breakDetails, setBreakDetails] = useState<Record<string, { startMins: number; endMins: number; end: string } | null>>({ b1: null, b2: null, b3: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, name: 'Rahul M.', barberId: 'b1', type: 'online', status: 'serving', scheduledTime: '10:00 AM', queueNo: 1, services: ['Skin Fade', 'Beard Trim'], duration: 45, price: 400 },
    { id: 2, name: 'Amit Singh', barberId: 'b1', type: 'online', status: 'waiting', scheduledTime: '11:00 AM', queueNo: 2, services: ['Haircut'], duration: 30, price: 250 },
  ]);

  const [wiDrawer, setWiDrawer] = useState<{ open: boolean; barberId: string | null }>({ open: false, barberId: null });
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [walkInName, setWalkInName] = useState('');
  const [manualDuration, setManualDuration] = useState(30);

  const completeService = (id: number) => setBookings(prev => prev.filter(b => b.id !== id));

  const startJob = (id: number) => {
    const target = bookings.find(b => b.id === id);
    if (!target) return;
    setBookings(prev =>
      prev.map(b => {
        if (b.barberId === target.barberId && b.status === 'serving') return { ...b, status: 'waiting' as const };
        if (b.id === id) return { ...b, status: 'serving' as const };
        return b;
      })
    );
  };

  const handleBreak = (barberId: string, duration: number) => {
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    setBarberOnBreak(prev => ({ ...prev, [barberId]: true }));
    setBreakDetails(prev => ({
      ...prev,
      [barberId]: { startMins: nowMins, endMins: nowMins + duration, end: minsToTime(nowMins + duration) },
    }));
  };

  const getNextAvailableSlot = useCallback((barberId: string, duration: number): number | null => {
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const barberBookings = bookings
      .filter(b => b.barberId === barberId)
      .map(b => ({ start: timeToMins(b.scheduledTime), end: timeToMins(b.scheduledTime) + b.duration }))
      .sort((a, b) => a.start - b.start);

    const breakData = barberOnBreak[barberId] ? breakDetails[barberId] : null;
    let searchPointer = Math.max(nowMins, OPEN_TIME);
    let found = false;

    while (!found && searchPointer + duration <= CLOSE_TIME) {
      const bookingConflict = barberBookings.find(b =>
        (searchPointer >= b.start && searchPointer < b.end) ||
        (searchPointer + duration > b.start && searchPointer + duration <= b.end) ||
        (searchPointer <= b.start && searchPointer + duration >= b.end)
      );
      const breakConflict = breakData && searchPointer < breakData.endMins && searchPointer + duration > breakData.startMins;

      if (bookingConflict) {
        searchPointer = bookingConflict.end;
      } else if (breakConflict && breakData) {
        searchPointer = breakData.endMins;
      } else {
        found = true;
      }
    }

    return found ? searchPointer : null;
  }, [bookings, barberOnBreak, breakDetails, currentTime]);

  const nextSlot = useMemo(() => {
    if (!wiDrawer.open || !wiDrawer.barberId) return null;
    return getNextAvailableSlot(wiDrawer.barberId, manualDuration);
  }, [wiDrawer.open, wiDrawer.barberId, manualDuration, getNextAvailableSlot]);

  const addWalkIn = () => {
    if (!wiDrawer.barberId || nextSlot === null) return;
    const svcs = SERVICES.filter(s => selectedServices.includes(s.id));
    setBookings(p => [...p, {
      id: Date.now(),
      name: walkInName || 'Walk-in',
      barberId: wiDrawer.barberId!,
      type: 'walkin',
      status: 'waiting',
      scheduledTime: minsToTime(nextSlot),
      queueNo: p.length + 1,
      services: svcs.map(s => s.name),
      duration: manualDuration,
      price: svcs.reduce((acc, curr) => acc + curr.price, 0),
    }]);
    setWiDrawer({ open: false, barberId: null });
    setWalkInName('');
    setSelectedServices([]);
    setManualDuration(30);
  };

  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let m = OPEN_TIME; m < CLOSE_TIME; m += SLOT_INTERVAL) slots.push(m);
    return slots;
  }, []);

  const renderTimeline = (barber: Barber) => {
    const bBookings = bookings.filter(b => b.barberId === barber.id);

    return (
      <div key={barber.id} className={activeBarberTab === barber.id ? 'block' : 'hidden'}>
        {/* Barber Header */}
        <div className="bg-zinc-900 text-white rounded-3xl p-5 mx-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${barber.color}`}>
                {barber.init}
              </div>
              <div>
                <p className="font-black text-lg">{barber.name}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2 h-2 rounded-full ${barberOnBreak[barber.id] ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-white/60 font-bold tracking-wider uppercase">
                    {barberOnBreak[barber.id] ? `Break: ends ${breakDetails[barber.id]?.end}` : 'Serving Walk-ins'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold">
              <Clock size={12} />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-32">
          {viewMode === 'queue' ? (
            <div className="mt-4">
              {/* Queue header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-black text-zinc-900 text-sm tracking-tight">Queue Logic</p>
                  <p className="text-xs text-zinc-400 font-bold">{bBookings.filter(b => b.type === 'walkin').length} Pending Walk-ins</p>
                </div>
                <button
                  onClick={() => setWiDrawer({ open: true, barberId: barber.id })}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-3xl text-xs font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                >
                  <Plus size={14} /> QUEUE CUSTOMER
                </button>
              </div>

              {/* Timeline slots */}
              <div className="space-y-1">
                {timeSlots.map(mins => {
                  const booking = bBookings.find(b => {
                    const bStart = timeToMins(b.scheduledTime);
                    const bEnd = bStart + b.duration;
                    return mins >= bStart && mins < bEnd;
                  });

                  const isBreak = barberOnBreak[barber.id] && breakDetails[barber.id] &&
                    mins >= breakDetails[barber.id]!.startMins && mins < breakDetails[barber.id]!.endMins;

                  return (
                    <div key={mins} className="flex gap-3">
                      {/* Time label */}
                      <div className="w-14 text-right pt-3 flex-shrink-0">
                        <span className="text-[11px] font-black text-zinc-300 block leading-none">{minsToTime(mins).split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-zinc-300/60">{minsToTime(mins).split(' ')[1]}</span>
                      </div>

                      {/* Slot content */}
                      <div className="flex-1 relative min-h-[48px]">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-zinc-100" />
                        <div className="absolute left-[13px] top-4 w-[6px] h-[6px] rounded-full bg-zinc-200 border-2 border-white" />

                        {booking ? (
                          <div className={`ml-8 rounded-3xl p-4 ${booking.status === 'serving' ? 'bg-indigo-600 text-white' : 'bg-zinc-50 border-2 border-zinc-100 text-zinc-900'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${booking.status === 'serving' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                                    QUEUE #{booking.queueNo}
                                  </span>
                                  <span className={`text-[10px] font-bold flex items-center gap-1 ${booking.status === 'serving' ? 'text-white/70' : 'text-zinc-400'}`}>
                                    {booking.type === 'online' ? <Smartphone size={10} /> : <User size={10} />} {booking.type}
                                  </span>
                                </div>
                                <p className="font-black text-base">{booking.name}</p>
                              </div>
                              <div className={`text-right text-[10px] font-bold ${booking.status === 'serving' ? 'text-white/60' : 'text-zinc-400'}`}>
                                <span className="block">{booking.duration} MIN</span>
                                <span>EST. START: {booking.scheduledTime}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              {booking.status === 'serving' ? (
                                <button onClick={() => completeService(booking.id)} className="flex-1 bg-white text-indigo-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                  COMPLETE
                                </button>
                              ) : (
                                <button onClick={() => startJob(booking.id)} className="flex-1 bg-zinc-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                  START JOB
                                </button>
                              )}
                            </div>
                          </div>
                        ) : isBreak ? (
                          <div className="ml-8 rounded-3xl p-4 bg-amber-50 border-2 border-amber-200/50">
                            <div className="flex items-center gap-2">
                              <Coffee size={16} className="text-amber-500" />
                              <div>
                                <p className="font-black text-sm text-amber-700">Barber Break</p>
                                <p className="text-[10px] font-bold text-amber-400">Reserved Time Block</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="ml-8 rounded-2xl p-3 border-2 border-dashed border-zinc-100 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                            onClick={() => setWiDrawer({ open: true, barberId: barber.id })}
                          >
                            <div className="flex items-center gap-2 text-zinc-300">
                              <Plus size={14} />
                              <span className="text-xs font-bold">Available Slot</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-zinc-400" />
              </div>
              <p className="font-black text-zinc-900 text-lg">{barber.name}'s Profile</p>
              <p className="text-sm text-zinc-400 mt-1">Barber Analytics</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Tab Bar */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto no-scrollbar">
        {BARBERS.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveBarberTab(b.id)}
            className={`flex-1 min-w-[110px] py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border-2 text-sm ${
              activeBarberTab === b.id
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl scale-[1.02]'
                : 'border-zinc-100 bg-zinc-50 text-zinc-400 opacity-60'
            }`}
          >
            <span className="font-black text-xs">{b.init}</span>
            <span className="font-bold">{b.name}</span>
          </button>
        ))}
      </div>

      {/* Timelines */}
      {BARBERS.map(b => renderTimeline(b))}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[2rem] px-4 py-2 z-50 safe-area-bottom">
        <div className="flex">
          <button
            onClick={() => setViewMode('queue')}
            className={`flex-1 py-3.5 rounded-3xl flex items-center justify-center gap-2 transition-all ${
              viewMode === 'queue' ? 'bg-white text-zinc-900' : 'text-white/50'
            }`}
          >
            <List size={16} />
            <span className="text-sm font-bold">Queue</span>
          </button>
          <button
            onClick={() => setViewMode('profile')}
            className={`flex-1 py-3.5 rounded-3xl flex items-center justify-center gap-2 transition-all ${
              viewMode === 'profile' ? 'bg-white text-zinc-900' : 'text-white/50'
            }`}
          >
            <User size={16} />
            <span className="text-sm font-bold">Profile</span>
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-6 left-4 right-4 bg-red-500 text-white rounded-2xl p-4 z-[200] flex items-center gap-3 shadow-2xl animate-bounce-in">
          <AlertTriangle size={20} />
          <p className="font-bold text-sm flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="p-1 bg-white/20 rounded-lg">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Walk-in Drawer */}
      {wiDrawer.open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWiDrawer({ open: false, barberId: null })} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[90vh] flex flex-col animate-slide-up">
            {/* Drawer handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-zinc-200" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-black text-2xl text-zinc-900">Add Walk-in</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Hash size={12} className="text-indigo-600" />
                  <span className="text-xs font-black text-indigo-600 tracking-wider">QUEUE POSITION #{bookings.length + 1}</span>
                </div>
              </div>
              <button onClick={() => setWiDrawer({ open: false, barberId: null })} className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 active:scale-90 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
              {/* Estimated Start */}
              <div className="bg-zinc-50 rounded-3xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Start</p>
                  <p className="text-2xl font-black text-zinc-900 mt-1">{nextSlot !== null ? minsToTime(nextSlot) : 'No Gaps!'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <Clock size={20} className="text-indigo-600" />
                </div>
              </div>

              {/* Name input */}
              <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Customer Profile</p>
                <input
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="ENTER CLIENT NAME"
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 font-black text-lg outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Duration dial */}
              <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Set Service Duration</p>
                <DurationDial value={manualDuration} onChange={setManualDuration} />
              </div>

              {/* Services */}
              <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Select Services</p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedServices(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedServices.includes(s.id)
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl scale-[1.02]'
                          : 'border-zinc-100 bg-white text-zinc-500'
                      }`}
                    >
                      <p className="font-black text-sm">{s.name}</p>
                      <p className="text-xs font-bold mt-0.5 opacity-60">₹{s.price}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={addWalkIn}
                disabled={nextSlot === null}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-2xl active:scale-[0.97] transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                ADD TO QUEUE <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in { 0% { opacity: 0; transform: translateY(-20px); } 60% { transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards; }
        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .safe-area-bottom { padding-bottom: max(0.5rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
}
