import { useState } from 'react';
import { Plus } from 'lucide-react';
import { partnerServices } from '@/data/partnerMockData';
import type { PartnerService } from '@/data/partnerMockData';
import ServiceFormDrawer from '@/components/partner/ServiceFormDrawer';

export default function OwnerServices() {
  const [services, setServices] = useState(partnerServices);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerService | null>(null);

  const grouped = services.reduce<Record<string, PartnerService[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const handleSave = (s: Omit<PartnerService, 'id'>) => {
    if (editing) {
      setServices(prev => prev.map(p => p.id === editing.id ? { ...p, ...s } : p));
    } else {
      setServices(prev => [...prev, { ...s, id: `ps${Date.now()}` }]);
    }
    setEditing(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground font-heading">Services</h2>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-heading">{cat}</p>
          <div className="space-y-2">
            {items.map(s => (
              <button
                key={s.id}
                onClick={() => { setEditing(s); setDrawerOpen(true); }}
                className="w-full text-left rounded-xl border bg-card p-4 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground font-heading">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </div>
                <p className="font-bold text-foreground font-heading">₹{s.price}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      <ServiceFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        service={editing}
        onSave={handleSave}
      />
    </div>
  );
}
