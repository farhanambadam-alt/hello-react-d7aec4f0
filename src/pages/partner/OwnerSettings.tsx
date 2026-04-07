import { Banknote, Clock, Bell, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import TrojanBellToggle from '@/components/partner/TrojanBellToggle';

const settingsItems = [
  { icon: Banknote, label: 'Payment Mode', sub: 'Accept cash payments', key: 'cash' },
  { icon: Clock, label: 'Business Hours', sub: '9:00 AM - 9:00 PM', key: 'hours' },
  { icon: Bell, label: 'Notifications', sub: 'Push & SMS alerts', key: 'notif' },
  { icon: Shield, label: 'Security', sub: 'PIN & access control', key: 'security' },
];

export default function OwnerSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({ cash: true, notif: true });

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-bold text-lg text-foreground font-heading">Settings</h2>

      <div className="space-y-2">
        {settingsItems.map(item => (
          <div key={item.key} className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <item.icon size={18} className="text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground font-heading">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
            {(item.key === 'cash' || item.key === 'notif') && (
              <Switch
                checked={toggles[item.key] ?? false}
                onCheckedChange={v => setToggles(p => ({ ...p, [item.key]: v }))}
              />
            )}
          </div>
        ))}
      </div>

      {/* Trojan Bell */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-heading">Trojan Bell</p>
        <TrojanBellToggle />
      </div>
    </div>
  );
}
