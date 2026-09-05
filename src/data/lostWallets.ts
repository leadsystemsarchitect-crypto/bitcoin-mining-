export interface LostWalletTarget {
  id: string;
  name: string;
  source: string;
  difficulty: number; // in GH/s required or hash cycles
  rewardBtc: number;
  description: string;
  status: 'hidden' | 'scanning' | 'cracking' | 'recovered' | 'failed';
  progress: number;
  hint: string;
}

export const INITIAL_LOST_WALLETS: LostWalletTarget[] = [
  {
    id: 'old_laptop_2011',
    name: '2011 ThinkPad HDD (Basement)',
    source: 'Found in old cardboard box in Mom\'s garage',
    difficulty: 500,
    rewardBtc: 0.15,
    description: 'An old 320GB Western Digital drive with a legacy wallet.dat file from college days.',
    status: 'hidden',
    progress: 0,
    hint: 'Password hint: First pet\'s name + graduation year (4 digits).'
  },
  {
    id: 'office_pc_2013',
    name: 'Abandoned Office Desktop',
    source: 'Old work PC left in storage locker',
    difficulty: 2500,
    rewardBtc: 1.25,
    description: 'Contains a mining test folder from 2013 with unspent block rewards.',
    status: 'hidden',
    progress: 0,
    hint: 'Password hint: Coffee brand + office floor number.'
  },
  {
    id: 'usb_thumb_drive',
    name: 'Corrupted Kingston 4GB USB',
    source: 'Found inside kitchen drawer junk pile',
    difficulty: 12000,
    rewardBtc: 5.0,
    description: 'Partition table damaged, but raw sectors contain a 24-word BIP39 seed fragment.',
    status: 'hidden',
    progress: 0,
    hint: 'Seed fragment: [apple ... ??? ... rocket].'
  },
  {
    id: 'satoshi_testnet_drive',
    name: 'Early Genesis Test Rig SSD',
    source: 'Auctioned surplus server hardware',
    difficulty: 65000,
    rewardBtc: 21.0,
    description: 'High-density enterprise SSD with encrypted Satoshi-era wallet backup.',
    status: 'hidden',
    progress: 0,
    hint: 'Requires extreme compute power to crack SHA-256 salt.'
  }
];
