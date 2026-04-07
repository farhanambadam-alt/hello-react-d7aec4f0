import { useState } from 'react';
import { Plus } from 'lucide-react';
import { barbers as mockBarbers } from '@/data/partnerMockData';
import type { Barber } from '@/data/partnerMockData';
import StaffCard from '@/components/partner/StaffCard';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OwnerStaff() {
  const [staff, setStaff] = useState<Barber[]>(mockBarbers);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleAdd = () => {
    if (!name) return;
    setStaff(prev => [...prev, {
      id: `b${Date.now()}`,
      name,
      specialty: specialty || 'Stylist',
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop`,
      state: 'FREE',
    }]);
    setName('');
    setSpecialty('');
    setDrawerOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-foreground font-heading">Staff</h2>
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {staff.map(b => <StaffCard key={b.id} barber={b} />)}
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-heading">Add Staff</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div>
              <Label className="text-xs font-heading">Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Staff name" />
            </div>
            <div>
              <Label className="text-xs font-heading">Specialty</Label>
              <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. Colorist" />
            </div>
          </div>
          <DrawerFooter>
            <button onClick={handleAdd} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold font-heading active:scale-[0.97] transition-all">
              Add Staff
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
