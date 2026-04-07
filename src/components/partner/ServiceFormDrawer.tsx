import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PartnerService } from '@/data/partnerMockData';

interface ServiceFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: PartnerService | null;
  onSave: (s: Omit<PartnerService, 'id'>) => void;
}

const categories = ['Hair', 'Skin', 'Wellness', 'Packages'];

export default function ServiceFormDrawer({ open, onOpenChange, service, onSave }: ServiceFormDrawerProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(String(service?.price ?? ''));
  const [duration, setDuration] = useState(service?.duration ?? '');
  const [category, setCategory] = useState(service?.category ?? 'Hair');

  const handleSave = () => {
    if (!name || !price) return;
    onSave({ name, price: Number(price), duration, category });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="font-heading">{service ? 'Edit Service' : 'Add Service'}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <div>
            <Label className="text-xs font-heading">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Service name" />
          </div>
          <div>
            <Label className="text-xs font-heading">Price (₹)</Label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="499" />
          </div>
          <div>
            <Label className="text-xs font-heading">Duration <span className="text-muted-foreground">(for display only)</span></Label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="45 min" />
          </div>
          <div>
            <Label className="text-xs font-heading">Category</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    category === c ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DrawerFooter>
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold font-heading active:scale-[0.97] transition-all">
            Save Service
          </button>
          <DrawerClose asChild>
            <button className="w-full py-3 rounded-xl border text-muted-foreground font-heading">Cancel</button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
