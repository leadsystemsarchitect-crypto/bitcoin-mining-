import React from 'react';
import { Award, CheckCircle2, Lock, Coins, Cpu, Box, Zap } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsViewProps {
  achievements: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coins': return Coins;
      case 'Cpu': return Cpu;
      case 'Box': return Box;
      case 'Zap': return Zap;
      default: return Award;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="pb-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Milestones & Trophies
          </h2>
          <p className="text-xs text-zinc-400">
            Unlock crypto achievements and earn bonus Satoshi rewards as your mining operation expands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => {
            const IconComponent = getIcon(ach.icon);
            return (
              <div
                key={ach.id}
                className={`border rounded-xl p-5 flex items-start gap-4 transition-all ${
                  ach.unlocked
                    ? 'bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-zinc-950 border-zinc-800/80 opacity-70'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.unlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {ach.title}
                    </h3>
                    {ach.unlocked ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{ach.description}</p>
                  {ach.rewardBtc && (
                    <div className="text-xs font-mono text-amber-400 pt-1">
                      Reward: +{ach.rewardBtc} BTC
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
