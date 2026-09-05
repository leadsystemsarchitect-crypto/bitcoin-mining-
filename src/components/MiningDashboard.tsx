import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Thermometer, ShieldCheck, Play, Pause, RefreshCw, Flame, ArrowUpRight, Server } from 'lucide-react';
import { GameState, HardwareItem } from '../types';

interface MiningDashboardProps {
  gameState: GameState;
  hardwareList: HardwareItem[];
  onManualHash: () => void;
  blockProgress: number;
  totalHashRate: number;
  totalPower: number;
}

export const MiningDashboard: React.FC<MiningDashboardProps> = ({
  gameState,
  hardwareList,
  onManualHash,
  blockProgress,
  totalHashRate,
  totalPower,
}) => {
  const [clickAnims, setClickAnims] = useState<{ id: number; x: number; y: number }[]>([]);
  const [temperature, setTemperature] = useState(48);

  // Temperature fluctuate based on overclock and power
  useEffect(() => {
    const baseTemp = 42 + (totalPower / 250) * gameState.overclockLevel;
    const jitter = (Math.random() - 0.5) * 3;
    setTemperature(Math.min(88, Math.max(38, Math.round(baseTemp + jitter))));
  }, [totalPower, gameState.overclockLevel]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onManualHash();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newAnim = { id: Date.now() + Math.random(), x, y };
    setClickAnims((prev) => [...prev.slice(-10), newAnim]);
  };

  const formatHashRate = (ghs: number) => {
    if (ghs >= 1000000) return `${(ghs / 1000000).toFixed(2)} PH/s`;
    if (ghs >= 1000) return `${(ghs / 1000).toFixed(2)} TH/s`;
    return `${ghs.toFixed(1)} GH/s`;
  };

  const hourlyPowerCost = (totalPower / 1000) * gameState.electricityRatePerKwH;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Clicker */}
      <div 
        onClick={handleContainerClick}
        className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl cursor-pointer group select-none transition-all hover:border-emerald-500/50"
      >
        {/* Background glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating click animations */}
        {clickAnims.map((anim) => (
          <span
            key={anim.id}
            style={{ left: anim.x, top: anim.y }}
            className="absolute text-emerald-400 font-mono font-bold text-sm pointer-events-none animate-float-up z-30"
          >
            +1 Hash ⚡
          </span>
        ))}

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SHA-256 Mining Rig Online
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Click to Mine & Solve Nonce
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg">
              Manual compute injection accelerates block discovery. Click anywhere on this rack to inject manual hash shares directly into the active worker pool.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-800 rounded-xl px-6 py-4 min-w-[220px]">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Mining Efficiency</span>
            <div className="text-3xl font-black text-emerald-400 font-mono my-1">
              {formatHashRate(totalHashRate)}
            </div>
            <span className="text-xs text-zinc-500">Overclock: {gameState.overclockLevel}x Active</span>
          </div>
        </div>

        {/* Block Progress bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Current Block Hash Target (#{gameState.blocksMined.length + 840120})
            </span>
            <span className="text-emerald-400 font-bold">{blockProgress.toFixed(1)}% Solved</span>
          </div>
          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/20"
              style={{ width: `${Math.min(100, blockProgress)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Grid of Stats and Hardware Racks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Racks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                Active Hardware Racks ({Object.values(gameState.hardware).reduce((a: number, b: number) => a + b, 0)} units)
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-mono ${
                  temperature > 75 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <Thermometer className="w-3.5 h-3.5" />
                  {temperature}°C
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  {totalPower} W
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hardwareList.map((item) => {
                const count = gameState.hardware[item.id] || 0;
                if (count === 0) return null;
                return (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-4 flex items-center justify-between hover:border-zinc-700 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          x{count}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        {(item.hashRate * count).toLocaleString()} GH/s • {(item.powerConsumption * count).toLocaleString()}W
                      </p>
                    </div>
                    {/* Rotating server fan icon simulation */}
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 animate-spin" style={{ animationDuration: `${Math.max(0.5, 3 - count * 0.1)}s` }}>
                      <Cpu className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}

              {Object.values(gameState.hardware).every((c) => c === 0) && (
                <div className="col-span-2 py-8 text-center text-zinc-500 text-sm">
                  No active hardware deployed. Visit the Hardware Shop to acquire mining units!
                </div>
              )}
            </div>
          </div>

          {/* Mined Blocks History Feed */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Recent Mined Blocks & Payouts
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {gameState.blocksMined.slice(-5).reverse().map((block, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="text-emerald-400 font-bold">Block #{block.blockNumber}</div>
                    <div className="text-zinc-500 truncate max-w-[200px] sm:max-w-xs">{block.hash}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">+{block.reward.toFixed(6)} BTC</div>
                    <div className="text-zinc-500">{block.pool} • {block.minedAt}</div>
                  </div>
                </div>
              ))}
              {gameState.blocksMined.length === 0 && (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  No blocks mined yet. Keep your hash rate active to solve the first block!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Operations & Power Stats */}
        <div className="space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Mining Operations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Total Hashes Generated</span>
                <span className="text-white font-mono font-bold">{gameState.totalHashesGenerated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Power Consumption</span>
                <span className="text-amber-400 font-mono font-bold">{totalPower.toLocaleString()} Watts</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Est. Electricity Cost</span>
                <span className="text-rose-400 font-mono font-bold">${hourlyPowerCost.toFixed(3)} / hr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Electricity Rate</span>
                <span className="text-white font-mono">${gameState.electricityRatePerKwH} / kWh</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Total Blocks Mined</span>
                <span className="text-emerald-400 font-mono font-bold">{gameState.blocksMined.length}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Secure SHA-256 Protocol
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  All shares are validated locally against the difficulty target. Rewards deposit directly into your SatoshiRig vault.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
