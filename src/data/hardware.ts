import { HardwareItem, MiningPool, Achievement } from '../types';

export const INITIAL_HARDWARE: HardwareItem[] = [
  {
    id: 'usb_erupter',
    name: 'Block Erupter USB',
    category: 'usb',
    hashRate: 2.5, // 2.5 GH/s
    powerConsumption: 5,
    cost: 50,
    costBtc: 0.0005,
    owned: 1, // Start with 1 free beginner USB stick
    icon: 'Cpu',
    description: 'Classic entry-level USB ASIC miner. Great for nostalgic beginners.'
  },
  {
    id: 'gpu_rig_3080',
    name: 'Rig RTX 3080x4',
    category: 'gpu',
    hashRate: 450, // 450 GH/s
    powerConsumption: 850,
    cost: 1200,
    costBtc: 0.012,
    owned: 0,
    icon: 'HardDrive',
    description: 'Quad GPU mining rig churning through SHA-256 with high parallel threads.'
  },
  {
    id: 'gpu_rig_5090',
    name: 'Rig RTX 5090 Quantum',
    category: 'gpu',
    hashRate: 1800, // 1.8 TH/s
    powerConsumption: 1600,
    cost: 4500,
    costBtc: 0.045,
    owned: 0,
    icon: 'Zap',
    description: 'Ultra-tier consumer graphics array with liquid cooling.'
  },
  {
    id: 'fpga_board',
    name: 'DragonMint FPGA X1',
    category: 'fpga',
    hashRate: 8500, // 8.5 TH/s
    powerConsumption: 1200,
    cost: 9500,
    costBtc: 0.095,
    owned: 0,
    icon: 'Server',
    description: 'Field-programmable gate array optimized purely for cryptocurrency hash loops.'
  },
  {
    id: 'asic_antminer',
    name: 'Antminer S21+ Pro',
    category: 'asic',
    hashRate: 45000, // 45 TH/s
    powerConsumption: 3250,
    cost: 28000,
    costBtc: 0.28,
    owned: 0,
    icon: 'Box',
    description: 'Industrial-grade Bitcoin ASIC miner delivering massive hashrate efficiency.'
  },
  {
    id: 'asic_hydro',
    name: 'Bitmain Hydro Immersion Farm',
    category: 'asic',
    hashRate: 220000, // 220 TH/s
    powerConsumption: 7500,
    cost: 125000,
    costBtc: 1.25,
    owned: 0,
    icon: 'Activity',
    description: 'Containerized hydro-cooled immersion mining datacenter rack.'
  },
  {
    id: 'quantum_core',
    name: 'Satoshi Quantum Vault V1',
    category: 'quantum',
    hashRate: 1500000, // 1.5 PH/s (Petahashes)
    powerConsumption: 25000,
    cost: 750000,
    costBtc: 7.5,
    owned: 0,
    icon: 'ShieldAlert',
    description: 'Experimental superconducting quantum annealer solving block hashes instantly.'
  }
];

export const MINING_POOLS: MiningPool[] = [
  {
    id: 'solo',
    name: 'Solo Mining (No Pool)',
    feePercent: 0,
    luckBonus: 1.0,
    description: 'Keep 100% of block rewards, but find blocks entirely on your own (very high variance).'
  },
  {
    id: 'slush',
    name: 'SlushPool (Braiins)',
    feePercent: 1.0,
    luckBonus: 1.15,
    description: 'The oldest reliable pool. Smoother payouts with a minor 15% luck bonus boost.'
  },
  {
    id: 'f2pool',
    name: 'F2Pool Global',
    feePercent: 2.5,
    luckBonus: 1.35,
    description: 'High hash distribution pool providing steady reward payouts and high stability.'
  },
  {
    id: 'antpool',
    name: 'AntPool Enterprise',
    feePercent: 2.0,
    luckBonus: 1.50,
    description: 'Top tier industrial mining pool with maximum luck multipliers.'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_satoshi',
    title: 'First Satoshi',
    description: 'Mine your very first 0.00001 BTC.',
    unlocked: false,
    icon: 'Coins',
    rewardBtc: 0.0001
  },
  {
    id: 'usb_tycoon',
    title: 'Flash Drive Tycoon',
    description: 'Own 5 USB Erupter miners.',
    unlocked: false,
    icon: 'Cpu'
  },
  {
    id: 'whole_bitcoin',
    title: 'Whole Coiner',
    description: 'Accumulate 1.0 Bitcoin in your wallet.',
    unlocked: false,
    icon: 'Award',
    rewardBtc: 0.01
  },
  {
    id: 'asic_power',
    title: 'ASIC Overlord',
    description: 'Deploy your first industrial Antminer S21+ Pro.',
    unlocked: false,
    icon: 'Box'
  },
  {
    id: 'quantum_leap',
    title: 'Quantum Singularity',
    description: 'Acquire the Satoshi Quantum Vault V1.',
    unlocked: false,
    icon: 'Zap'
  },
  {
    id: 'block_finder',
    title: 'Block Reward Winner',
    description: 'Successfully solve and mine an entire Bitcoin block.',
    unlocked: false,
    icon: 'CheckCircle',
    rewardBtc: 0.05
  }
];
