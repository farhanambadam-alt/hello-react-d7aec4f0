import { UserPlus } from 'lucide-react';

interface WalkInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function WalkInButton({ onPress, disabled }: WalkInButtonProps) {
  return (
    <div className="px-4">
      <button
        onClick={onPress}
        disabled={disabled}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-pink-200/50 active:scale-[0.97] transition-all disabled:opacity-50 disabled:active:scale-100 font-heading"
      >
        <UserPlus size={20} />
        Start Walk-in
      </button>
    </div>
  );
}
