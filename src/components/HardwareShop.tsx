import React from 'react';
import { ShoppingBag, Cpu, HardDrive, Zap, Server, Box, Activity, ShieldAlert, Check, Wrench, AlertTriangle } from 'lucide-react';
import { HardwareItem, GameState } from '../types';

interface HardwareShopProps {
  hardwareList: HardwareItem[];
  gameState: GameState;
  onBuyHardware: (item: HardwareItem) => void;
  onRepairHardware: (itemId: string) => void;
}

export const HardwareShop: React.FC<HardwareShopProps> = ({
  hardwareList,
  gameState,
  onBuyHardware,
  onRepairHardware,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return Cpu;
      case 'HardDrive': return HardDrive;
      case 'Zap': return Zap;
      case 'Server': return Server;
      case 'Box': return Box;
      case 'Activity': return Activity;
      default: return ShieldAlert;
    }
  };

  const ownedItems = hardwareList.filter((item) => (gameState.hardware[item.id] || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Maintenance & Wear and Tear Section */}
      {ownedItems.length > 0 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Hardware Wear & Tear & Maintenance
              </h3>
              <p className="text-xs text-zinc-400">
                Continuous uptime degrades hardware health and reduces efficiency. Repair components to restore 100% hash output.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedItems.map((item) => {
              const health = gameState.hardwareHealth?.[item.id] ?? 100;
              const repairCost = Math.max(5, Math.round(item.cost * 0.15 * ((100 - health) / 100)));
              const canAffordRepair = gameState.usdBalance >= repairCost;
              const isPerfect = health >= 99.9;

              return (
                <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      health > 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      health > 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {health.toFixed(1)}% Health
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          health > 70 ? 'bg-emerald-500' : health > 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${health}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Efficiency: {health.toFixed(0)}%</span>
                      <span>Owned: {gameState.hardware[item.id]}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-900">
                    <div className="text-xs font-mono">
                      <span className="text-zinc-400">Repair: </span>
                      <span className="text-white font-bold">${repairCost.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => onRepairHardware(item.id)}
                      disabled={isPerfect || !canAffordRepair}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        isPerfect
                          ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed'
                          : canAffordRepair
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold cursor-pointer'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      {isPerfect ? 'Optimal' : 'Repair'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Hardware Shop */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Hardware Rigs & ASIC Foundry
            </h2>
            <p className="text-xs text-zinc-400">
              Upgrade your mining infrastructure to increase hash output and discover blocks faster.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">USD:</span> <span className="text-white font-bold">${gameState.usdBalance.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">BTC:</span> <span className="text-emerald-400 font-bold">₿ {gameState.btcBalance.toFixed(6)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {hardwareList.map((item) => {
            const IconComponent = getIcon(item.icon);
            const ownedCount = gameState.hardware[item.id] || 0;
            const canAffordUsd = gameState.usdBalance >= item.cost;
            const canAffordBtc = gameState.btcBalance >= item.costBtc;
            const canAfford = canAffordUsd || canAffordBtc;

            return (
              <div 
                key={item.id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                      Owned: {ownedCount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="bg-zinc-900/60 rounded-lg p-3 space-y-1.5 text-xs font-mono border border-zinc-800/60">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Hashrate:</span>
                      <span className="text-emerald-400 font-bold">+{item.hashRate >= 1000 ? `${(item.hashRate/1000).toFixed(1)} TH/s` : `${item.hashRate} GH/s`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Power Draw:</span>
                      <span className="text-amber-400 font-bold">{item.powerConsumption} W</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center justify-between gap-3">
                  <div className="font-mono">
                    <div className="text-sm font-bold text-white">${item.cost.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500">or ₿ {item.costBtc}</div>
                  </div>

                  <button
                    onClick={() => onBuyHardware(item)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Acquire Rig
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
