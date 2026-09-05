import React from 'react';
import { Server, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { MiningPool, GameState } from '../types';

interface PoolsViewProps {
  pools: MiningPool[];
  gameState: GameState;
  onSelectPool: (poolId: string) => void;
}

export const PoolsView: React.FC<PoolsViewProps> = ({
  pools,
  gameState,
  onSelectPool,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="pb-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Decentralized Mining Pools
          </h2>
          <p className="text-xs text-zinc-400">
            Connect your hash power to professional mining pools to balance payout frequency, pool fees, and luck bonuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
          {pools.map((pool) => {
            const isActive = gameState.activePoolId === pool.id;
            return (
              <div
                key={pool.id}
                className={`border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-emerald-500/5 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {pool.name}
                        {isActive && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Connected
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400">{pool.description}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                      <span className="text-zinc-500 block">Pool Fee</span>
                      <span className="text-white font-bold">{pool.feePercent}%</span>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2">
                      <span className="text-zinc-500 block">Luck Multiplier</span>
                      <span className="text-emerald-400 font-bold">{(pool.luckBonus * 100 - 100).toFixed(0)}% Bonus</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-900/80">
                  <button
                    onClick={() => onSelectPool(pool.id)}
                    disabled={isActive}
                    className={`w-full py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 cursor-pointer'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    {isActive ? 'Active Mining Pool' : 'Connect Worker'}
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
