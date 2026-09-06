import React from 'react';
import { History, ShieldCheck, Cpu, Database, ExternalLink } from 'lucide-react';
import { GameState } from '../types';

interface BlockchainViewProps {
  gameState: GameState;
}

export const BlockchainView: React.FC<BlockchainViewProps> = ({ gameState }) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              SatoshiChain Ledger & Block Explorer
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time cryptographic proof-of-work records verified by your mining cluster.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-zinc-400">Total Blocks Mined:</span>
            <span className="text-emerald-400 font-bold">{gameState.blocksMined.length}</span>
          </div>
        </div>

        {/* Network Difficulty & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-zinc-400 font-medium">Current Height</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              #{gameState.blocksMined.length + 840120}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Target Difficulty: 84.2T</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-zinc-400 font-medium">Global Network Hashrate</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              640.5 EH/s
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">SHA-256 ASIC Consensus</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <span className="text-xs text-zinc-400 font-medium">Mempool Transactions</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              142,850 pending
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Avg Fee: 18 sat/vB</span>
          </div>
        </div>

        {/* Mined Blocks Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Confirmed Block History
          </h3>

          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Block #</th>
                    <th className="p-3">Cryptographic Hash</th>
                    <th className="p-3">Mining Pool</th>
                    <th className="p-3">Reward</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {gameState.blocksMined.slice().reverse().map((block, idx) => (
                    <tr key={`${block.hash || block.blockNumber}_${idx}`} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 text-emerald-400 font-bold">#{block.blockNumber}</td>
                      <td className="p-3 text-zinc-300 truncate max-w-xs">{block.hash}</td>
                      <td className="p-3 text-zinc-400">{block.pool}</td>
                      <td className="p-3 text-amber-400 font-bold">+{block.reward.toFixed(6)} BTC</td>
                      <td className="p-3 text-right text-zinc-500">{block.minedAt}</td>
                    </tr>
                  ))}
                  {gameState.blocksMined.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No blocks verified yet. Keep mining to record the first block on SatoshiChain!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
