import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AccessGate from '@/components/partner/AccessGate';
import OwnerBottomNav from '@/components/partner/OwnerBottomNav';
import { ArrowLeft } from 'lucide-react';

export default function OwnerLayout() {
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useNavigate();

  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/staff')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <h1 className="font-bold text-base text-foreground font-heading">Owner Mode</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <OwnerBottomNav />
    </div>
  );
}
