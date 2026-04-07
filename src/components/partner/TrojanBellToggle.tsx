import { useState } from 'react';
import { Bell, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const sounds = ['Classic Bell', 'Chime', 'Doorbell', 'Digital Ping'];

export default function TrojanBellToggle() {
  const [enabled, setEnabled] = useState(true);
  const [sound, setSound] = useState('Classic Bell');

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground font-heading">Trojan Bell</p>
            <p className="text-xs text-muted-foreground">Notify on new walk-in</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 font-heading">Sound</p>
            <div className="flex gap-2 flex-wrap">
              {sounds.map(s => (
                <button
                  key={s}
                  onClick={() => setSound(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    sound === s ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm text-pink-500 font-semibold font-heading active:opacity-70 transition-opacity">
            <Volume2 size={16} />
            Test Sound
          </button>
        </>
      )}
    </div>
  );
}
