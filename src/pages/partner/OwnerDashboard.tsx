import { IndianRupee, Users, Scissors, TrendingUp, Wallet } from 'lucide-react';
import { partnerStats } from '@/data/partnerMockData';
import StatCard from '@/components/partner/StatCard';

export default function OwnerDashboard() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Earnings" value={`₹${partnerStats.totalEarnings.toLocaleString()}`} icon={IndianRupee} color="bg-gradient-to-br from-pink-500 to-rose-400" />
        <StatCard title="This Month" value={`₹${partnerStats.monthEarnings.toLocaleString()}`} icon={TrendingUp} color="bg-gradient-to-br from-violet-500 to-purple-400" />
        <StatCard title="Total Clients" value={partnerStats.totalClients.toLocaleString()} icon={Users} color="bg-gradient-to-br from-blue-500 to-cyan-400" />
        <StatCard title="Services Done" value={partnerStats.servicesDone.toLocaleString()} icon={Scissors} color="bg-gradient-to-br from-amber-500 to-orange-400" />
      </div>

      {/* Payout section */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground font-heading">Payout</p>
            <p className="text-xs text-muted-foreground">Next payout in {partnerStats.nextPayoutDays} days</p>
          </div>
        </div>
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold font-heading active:scale-[0.97] transition-all">
          Request Payout
        </button>
      </div>
    </div>
  );
}
