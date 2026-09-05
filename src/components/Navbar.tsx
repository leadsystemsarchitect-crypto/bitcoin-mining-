import React from 'react';
import { Cpu, Wallet, ShoppingBag, Server, History, Award, TrendingUp, Zap, ShieldCheck, Search, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  btcBalance: number;
  usdBalance: number;
  bitcoinPrice: number;
  priceChange24h: number;
  totalHashRate: number; // in GH/s
  overclockLevel: number;
  setOverclockLevel: (level: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  btcBalance,
  usdBalance,
  bitcoinPrice,
  priceChange24h,
  totalHashRate,
  overclockLevel,
  setOverclockLevel
}) => {
  const tabs = [
    { id: 'mining', label: 'Mining Rig', icon: Cpu },
    { id: 'shop', label: 'Hardware Shop', icon: ShoppingBag },
    { id: 'lost_wallets', label: 'Search Lost Bitcoin', icon: Search },
    { id: 'dormant_accounts', label: 'Dormant Account Sweeper', icon: Radio },
    { id: 'pools', label: 'Mining Pools', icon: Server },
    { id: 'wallet', label: 'Wallet & Market', icon: Wallet },
    { id: 'blockchain', label: 'Blockchain', icon: History },
    { id: 'achievements', label: 'Milestones', icon: Award },
  ];


  const formatHashRate = (ghs: number) => {
    if (ghs >= 1000000) return `${(ghs / 1000000).toFixed(2)} PH/s`;
    if (ghs >= 1000) return `${(ghs / 1000).toFixed(2)} TH/s`;
    return `${ghs.toFixed(1)} GH/s`;
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top bar with stats & price */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-lg shadow-amber-500/10 animate-pulse">
              ₿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">SatoshiRig OS</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v3.8 Secure
                </span>
              </div>
              <p className="text-xs text-zinc-400">Decentralized Bitcoin Generation & Rig Simulator</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* BTC Price */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-zinc-400">BTC/USD:</span>
              <span className="text-white font-mono font-bold">${bitcoinPrice.toLocaleString()}</span>
              <span className={`flex items-center font-mono ${priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className={`w-3 h-3 mr-0.5 ${priceChange24h < 0 ? 'rotate-180' : ''}`} />
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h}%
              </span>
            </div>

            {/* Total Hashrate */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-zinc-400">Hashrate:</span>
              <span className="text-emerald-400 font-mono font-bold">{formatHashRate(totalHashRate)}</span>
            </div>

            {/* Overclock Toggle */}
            <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setOverclockLevel(1)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  overclockLevel === 1 ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1x Eco
              </button>
              <button
                onClick={() => setOverclockLevel(1.5)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  overclockLevel === 1.5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1.5x Turbo
              </button>
              <button
                onClick={() => setOverclockLevel(2)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  overclockLevel === 2 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2x Beast
              </button>
            </div>
          </div>

          {/* Wallet summary */}
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-right">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Wallet Balance</div>
              <div className="text-emerald-400 font-mono font-bold text-sm">
                ₿ {btcBalance.toFixed(8)}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                ≈ ${(btcBalance * bitcoinPrice + usdBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-3 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
