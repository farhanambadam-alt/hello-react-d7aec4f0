import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  User, Clock, Coffee, Plus, Hash,
  List, Award, Smartphone,
  X, AlertTriangle, ArrowRight, Play, CheckCircle, Users
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
  status: 'serving' | 'waiting' | 'completed';
  startMins: number; // absolute minutes from midnight
  duration: number;
  queueNo: number;
  services: string[];
  price: number;
}

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface BreakBlock {
  startMins: number;
  endMins: number;
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
const minsToTime = (mins: number): string => {
  let h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return `${h}:${m.toString().padStart(2, '0')} ${period}`;
};

const OPEN_TIME = 9 * 60;  // 9 AM
const CLOSE_TIME = 21 * 60; // 9 PM
const TOTAL_MINS = CLOSE_TIME - OPEN_TIME; // 720 mins
const PX_PER_MIN = 3; // each minute = 3px height
const TIMELINE_HEIGHT = TOTAL_MINS * PX_PER_MIN; // 2160px

// --- SLOT FINDER: finds next gap for a barber given existing bookings + breaks ---
const findNextSlot = (
  barberId: string,
  duration: number,
  bookings: Booking[],
  breakBlock: BreakBlock | null,
  nowMins: number
): number | null => {
  const occupied = bookings
    .filter(b => b.barberId === barberId && b.status !== 'completed')
    .map(b => ({ start: b.startMins, end: b.startMins + b.duration }));

  if (breakBlock) {
    occupied.push({ start: breakBlock.startMins, end: breakBlock.endMins });
  }

  occupied.sort((a, b) => a.start - b.start);

  let pointer = Math.max(nowMins, OPEN_TIME);

  for (let i = 0; i < 500; i++) { // safety limit
    if (pointer + duration > CLOSE_TIME) return null;

    const conflict = occupied.find(o =>
      (pointer < o.end && pointer + duration > o.start)
    );

    if (conflict) {
      pointer = conflict.end;
    } else {
      return pointer;
    }
  }
  return null;
};

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
    <div className="flex items-center justify-center py-2">
      <div
        ref={dialRef}
        className="relative w-36 h-36 rounded-full cursor-pointer select-none"
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
          <span className="text-3xl font-black text-zinc-900">{value}</span>
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest">MINS</span>
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
  const [barberBreaks, setBarberBreaks] = useState<Record<string, BreakBlock | null>>({ b1: null, b2: null, b3: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll timeline to current time on mount
  useEffect(() => {
    if (timelineRef.current) {
      const scrollTo = Math.max(0, (nowMins - OPEN_TIME) * PX_PER_MIN - 100);
      timelineRef.current.scrollTop = scrollTo;
    }
  }, [activeBarberTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, name: 'Rahul M.', barberId: 'b1', type: 'online', status: 'serving', startMins: 10 * 60, queueNo: 1, services: ['Skin Fade', 'Beard Trim'], duration: 45, price: 400 },
    { id: 2, name: 'Amit Singh', barberId: 'b1', type: 'online', status: 'waiting', startMins: 11 * 60, queueNo: 2, services: ['Haircut'], duration: 30, price: 250 },
  ]);

  const [wiDrawer, setWiDrawer] = useState<{ open: boolean; barberId: string | null }>({ open: false, barberId: null });
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [walkInName, setWalkInName] = useState('');
  const [manualDuration, setManualDuration] = useState(30);

  // Global queue counter
  const nextQueueNo = useMemo(() => Math.max(0, ...bookings.map(b => b.queueNo)) + 1, [bookings]);

  const completeService = (id: number) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' as const } : b));
  };

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

  // Next available slot for walk-in drawer
  const nextSlot = useMemo(() => {
    if (!wiDrawer.open || !wiDrawer.barberId) return null;
    return findNextSlot(wiDrawer.barberId, manualDuration, bookings, barberBreaks[wiDrawer.barberId], nowMins);
  }, [wiDrawer.open, wiDrawer.barberId, manualDuration, bookings, barberBreaks, nowMins]);

  const addWalkIn = () => {
    if (!wiDrawer.barberId || nextSlot === null) return;
    const svcs = SERVICES.filter(s => selectedServices.includes(s.id));
    setBookings(p => [...p, {
      id: Date.now(),
      name: walkInName || 'Walk-in',
      barberId: wiDrawer.barberId!,
      type: 'walkin',
      status: 'waiting',
      startMins: nextSlot,
      queueNo: nextQueueNo,
      services: svcs.map(s => s.name),
      duration: manualDuration,
      price: svcs.reduce((acc, curr) => acc + curr.price, 0),
    }]);
    setWiDrawer({ open: false, barberId: null });
    setWalkInName('');
    setSelectedServices([]);
    setManualDuration(30);
  };

  // --- Hour markers for the timeline ---
  const hourMarkers = useMemo(() => {
    const marks: number[] = [];
    for (let h = Math.ceil(OPEN_TIME / 60); h <= Math.floor(CLOSE_TIME / 60); h++) {
      marks.push(h * 60);
    }
    return marks;
  }, []);

  // --- RENDER PROPORTIONAL TIMELINE ---
  const renderTimeline = (barber: Barber) => {
    const bBookings = bookings.filter(b => b.barberId === barber.id && b.status !== 'completed');
    const activeBookings = bBookings.sort((a, b) => a.startMins - b.startMins);
    const breakBlock = barberBreaks[barber.id];
    const waitingQueue = bBookings.filter(b => b.status === 'waiting').sort((a, b) => a.startMins - b.startMins);

    // Current time needle position
    const needleY = nowMins >= OPEN_TIME && nowMins <= CLOSE_TIME
      ? (nowMins - OPEN_TIME) * PX_PER_MIN
      : -1;

    return (
      <div key={barber.id} className={activeBarberTab === barber.id ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
        {/* Barber Header Card */}
        <div className="bg-zinc-900 text-white rounded-3xl p-4 mx-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs ${barber.color}`}>
                {barber.init}
              </div>
              <div>
                <p className="font-black text-base">{barber.name}</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className={`w-1.5 h-1.5 rounded-full ${breakBlock ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-white/50 font-bold tracking-wider uppercase">
                    {breakBlock ? `Break until ${minsToTime(breakBlock.endMins)}` : `${waitingQueue.length} in queue`}
                  </span>
                </div>
              </div>
            </div>
            {/* Live clock */}
            <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-black text-sm tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Summary Strip */}
        {waitingQueue.length > 0 && viewMode === 'queue' && (
          <div className="mx-4 mt-2 bg-indigo-50 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-indigo-600" />
                <span className="text-[11px] font-black text-indigo-600 tracking-wider uppercase">Live Queue</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400">{waitingQueue.length} waiting</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {waitingQueue.map((b, i) => (
                <div key={b.id} className="flex-shrink-0 bg-white rounded-xl px-3 py-2 border border-indigo-100 min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-black text-zinc-800 truncate">{b.name}</span>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500 mt-0.5 ml-6.5">
                    EST {minsToTime(b.startMins)} · {b.duration}m
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue / Add button */}
        {viewMode === 'queue' && (
          <div className="flex items-center justify-between px-4 mt-3 mb-1">
            <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Timeline</p>
            <button
              onClick={() => setWiDrawer({ open: true, barberId: barber.id })}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Plus size={13} /> WALK-IN
            </button>
          </div>
        )}

        {/* PROPORTIONAL TIMELINE */}
        {viewMode === 'queue' ? (
          <div ref={timelineRef} className="flex-1 overflow-y-auto px-4 pb-28 relative" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="relative ml-14" style={{ height: TIMELINE_HEIGHT }}>
              {/* Hour gridlines + labels */}
              {hourMarkers.map(hm => {
                const y = (hm - OPEN_TIME) * PX_PER_MIN;
                return (
                  <div key={hm} className="absolute left-0 right-0" style={{ top: y }}>
                    {/* Label in gutter */}
                    <div className="absolute -left-14 w-12 text-right -translate-y-1/2">
                      <span className="text-[11px] font-black text-zinc-300 leading-none">{minsToTime(hm).split(' ')[0]}</span>
                      <span className="text-[8px] font-bold text-zinc-300/50 ml-0.5">{minsToTime(hm).split(' ')[1]}</span>
                    </div>
                    {/* Grid line */}
                    <div className="h-[1px] bg-zinc-100 w-full" />
                  </div>
                );
              })}

              {/* Vertical spine */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-100 ml-3" />

              {/* NOW needle */}
              {needleY >= 0 && (
                <div className="absolute left-0 right-0 z-30 flex items-center" style={{ top: needleY }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-[1px] shadow-md" />
                  <div className="flex-1 h-[2px] bg-red-500/60" />
                  <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-1">NOW</span>
                </div>
              )}

              {/* Break block */}
              {breakBlock && (
                <div
                  className="absolute left-8 right-0 bg-amber-50 border-2 border-amber-200/50 rounded-2xl flex items-center gap-2 px-3 z-10"
                  style={{
                    top: (breakBlock.startMins - OPEN_TIME) * PX_PER_MIN,
                    height: Math.max(40, (breakBlock.endMins - breakBlock.startMins) * PX_PER_MIN),
                  }}
                >
                  <Coffee size={14} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-black text-xs text-amber-700">Break</p>
                    <p className="text-[9px] font-bold text-amber-400">{minsToTime(breakBlock.startMins)} – {minsToTime(breakBlock.endMins)}</p>
                  </div>
                </div>
              )}

              {/* Booking blocks — proportional height */}
              {activeBookings.map(booking => {
                const top = (booking.startMins - OPEN_TIME) * PX_PER_MIN;
                const height = Math.max(60, booking.duration * PX_PER_MIN);
                const isServing = booking.status === 'serving';

                return (
                  <div
                    key={booking.id}
                    className={`absolute left-8 right-0 rounded-2xl p-3 z-20 transition-all ${
                      isServing
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                        : 'bg-white border-2 border-zinc-100 text-zinc-900 shadow-sm'
                    }`}
                    style={{ top, height, minHeight: 60 }}
                  >
                    {/* Connector dot */}
                    <div className={`absolute -left-[22px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${isServing ? 'bg-indigo-600' : 'bg-zinc-300'}`} />

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-black tracking-widest px-1.5 py-[1px] rounded-full ${isServing ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'}`}>
                            #{booking.queueNo}
                          </span>
                          <span className={`text-[9px] font-bold flex items-center gap-0.5 ${isServing ? 'text-white/60' : 'text-zinc-400'}`}>
                            {booking.type === 'online' ? <Smartphone size={9} /> : <User size={9} />}
                            {booking.type}
                          </span>
                        </div>
                        <p className="font-black text-sm truncate">{booking.name}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${isServing ? 'text-white/50' : 'text-zinc-400'}`}>
                          {minsToTime(booking.startMins)} – {minsToTime(booking.startMins + booking.duration)} · {booking.duration}m
                        </p>
                      </div>
                    </div>

                    {/* Actions — only show if card is tall enough */}
                    {height >= 90 && (
                      <div className="flex gap-2 mt-2">
                        {isServing ? (
                          <button onClick={() => completeService(booking.id)} className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow active:scale-95 transition-all flex items-center justify-center gap-1">
                            <CheckCircle size={12} /> COMPLETE
                          </button>
                        ) : (
                          <button onClick={() => startJob(booking.id)} className="flex-1 bg-zinc-900 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow active:scale-95 transition-all flex items-center justify-center gap-1">
                            <Play size={12} /> START
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-28">
            <div className="mt-6 text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-zinc-400" />
              </div>
              <p className="font-black text-zinc-900 text-lg">{barber.name}'s Profile</p>
              <p className="text-sm text-zinc-400 mt-1">Barber Analytics</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Tab Bar */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar flex-shrink-0">
        {BARBERS.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveBarberTab(b.id)}
            className={`flex-1 min-w-[100px] py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border-2 text-sm ${
              activeBarberTab === b.id
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl scale-[1.02]'
                : 'border-zinc-100 bg-zinc-50 text-zinc-400 opacity-60'
            }`}
          >
            <span className="font-black text-xs">{b.init}</span>
            <span className="font-bold text-xs">{b.name}</span>
          </button>
        ))}
      </div>

      {/* Timeline panels */}
      {BARBERS.map(b => renderTimeline(b))}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[2rem] px-4 py-2 z-50 safe-area-bottom flex-shrink-0">
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
            <div className="flex justify-center pt-3 pb-1"><div className="w-12 h-1.5 rounded-full bg-zinc-200" /></div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
              <div>
                <p className="font-black text-xl text-zinc-900">Add Walk-in</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash size={11} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 tracking-wider">QUEUE #{nextQueueNo}</span>
                </div>
              </div>
              <button onClick={() => setWiDrawer({ open: false, barberId: null })} className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 active:scale-90 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
              {/* Estimated Start + Live Clock */}
              <div className="flex gap-2">
                <div className="flex-1 bg-zinc-50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Start Time</p>
                  <p className="text-xl font-black text-zinc-900 mt-0.5">{nextSlot !== null ? minsToTime(nextSlot) : 'Full!'}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[90px]">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Now</p>
                  <p className="text-lg font-black text-indigo-600 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Timeline preview — visual block */}
              {nextSlot !== null && (
                <div className="bg-zinc-50 rounded-2xl p-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Timeline Preview</p>
                  <div className="relative h-12 bg-zinc-100 rounded-xl overflow-hidden">
                    {/* Existing bookings for this barber (mini) */}
                    {bookings
                      .filter(b => b.barberId === wiDrawer.barberId && b.status !== 'completed')
                      .map(b => {
                        const left = ((b.startMins - OPEN_TIME) / TOTAL_MINS) * 100;
                        const width = (b.duration / TOTAL_MINS) * 100;
                        return (
                          <div key={b.id} className="absolute top-1 bottom-1 bg-zinc-300 rounded-lg" style={{ left: `${left}%`, width: `${width}%` }} />
                        );
                      })
                    }
                    {/* New booking preview */}
                    <div
                      className="absolute top-1 bottom-1 bg-indigo-500 rounded-lg border-2 border-indigo-300 animate-pulse"
                      style={{
                        left: `${((nextSlot - OPEN_TIME) / TOTAL_MINS) * 100}%`,
                        width: `${(manualDuration / TOTAL_MINS) * 100}%`,
                      }}
                    />
                    {/* Now marker */}
                    {nowMins >= OPEN_TIME && nowMins <= CLOSE_TIME && (
                      <div className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10" style={{ left: `${((nowMins - OPEN_TIME) / TOTAL_MINS) * 100}%` }} />
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-zinc-300 font-bold">9 AM</span>
                    <span className="text-[8px] text-zinc-300 font-bold">9 PM</span>
                  </div>
                </div>
              )}

              {/* Name input */}
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">Client Name</p>
                <input
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3.5 font-bold text-base outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Duration dial */}
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Duration</p>
                <DurationDial value={manualDuration} onChange={setManualDuration} />
              </div>

              {/* Services */}
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">Services</p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedServices(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedServices.includes(s.id)
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg scale-[1.02]'
                          : 'border-zinc-100 bg-white text-zinc-500'
                      }`}
                    >
                      <p className="font-black text-xs">{s.name}</p>
                      <p className="text-[10px] font-bold mt-0.5 opacity-60">₹{s.price} · {s.duration}m</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button
                onClick={addWalkIn}
                disabled={nextSlot === null}
                className="w-full bg-indigo-600 text-white py-4.5 rounded-2xl font-black text-base shadow-2xl active:scale-[0.97] transition-all disabled:opacity-20 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                ADD TO QUEUE <ArrowRight size={16} />
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
