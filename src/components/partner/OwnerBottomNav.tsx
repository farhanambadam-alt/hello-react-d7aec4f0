import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scissors, Users, Calendar, Settings } from 'lucide-react';

const tabs = [
  { path: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/owner/services', icon: Scissors, label: 'Services' },
  { path: '/owner/staff', icon: Users, label: 'Staff' },
  { path: '/owner/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/owner/settings', icon: Settings, label: 'Settings' },
];

export default function OwnerBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky bottom-0 z-50 bg-card/95 backdrop-blur border-t border-border">
      <div className="flex justify-around py-2">
        {tabs.map(t => {
          const active = pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                active ? 'text-pink-500' : 'text-muted-foreground'
              }`}
            >
              <t.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium font-heading">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
