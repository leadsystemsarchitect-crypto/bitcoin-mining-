export interface HardwareItem {
  id: string;
  name: string;
  category: 'usb' | 'gpu' | 'fpga' | 'asic' | 'quantum';
  hashRate: number; // in GH/s
  powerConsumption: number; // in Watts
  cost: number; // in USD
  costBtc: number; // in BTC
  owned: number;
  icon: string;
  description: string;
}

export interface MiningPool {
  id: string;
  name: string;
  feePercent: number;
  luckBonus: number; // multiplier for block reward chances
  description: string;
}

export interface BlockRecord {
  blockNumber: number;
  hash: string;
  reward: number;
  minedAt: string;
  pool: string;
}

export interface Transaction {
  id: string;
  type: 'mined' | 'sold' | 'bought_hardware' | 'electricity_fee' | 'lost_wallet_recovered' | 'dormant_swept';
  amountBtc: number;
  amountUsd: number;
  timestamp: string;
}


export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  rewardBtc?: number;
}

export interface LostWallet {
  id: string;
  name: string;
  source: string;
  difficulty: number;
  rewardBtc: number;
  description: string;
  status: 'hidden' | 'scanning' | 'cracking' | 'recovered' | 'failed';
  progress: number;
  hint: string;
}

export interface GameState {
  btcBalance: number;
  usdBalance: number;
  bitcoinPrice: number;
  totalHashesGenerated: number;
  electricityRatePerKwH: number; // $0.12
  activePoolId: string;
  hardware: Record<string, number>; // hardwareId -> count
  blocksMined: BlockRecord[];
  transactions: Transaction[];
  achievements: Achievement[];
  totalPowerConsumed: number; // Watts
  overclockLevel: number; // 1x, 1.5x, 2x (costs extra power)
  autoClickerActive: boolean;
  lostWallets: Record<string, { status: 'hidden' | 'scanning' | 'cracking' | 'recovered'; progress: number }>;
  dormantSwept: Record<string, boolean>;
  hardwareHealth: Record<string, number>; // hardwareId -> health % (0-100)
  lastActiveTimestamp?: number;
}


