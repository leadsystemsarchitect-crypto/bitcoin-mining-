export interface DormantAccount {
  id: string;
  address: string;
  ownerAlias: string;
  inactiveYears: number;
  balanceBtc: number;
  lastActiveBlock: number;
  status: 'dormant' | 'scanning' | 'swept';
  securityProtocol: 'Legacy ECDSA' | 'P2PKH Salt' | 'Schnorr Sig' | 'Quantum Vulnerable';
}

export const INITIAL_DORMANT_ACCOUNTS: DormantAccount[] = [
  {
    id: 'dormant_1',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ownerAlias: 'Early Satoshi Era Wallet #1',
    inactiveYears: 15,
    balanceBtc: 50.0,
    lastActiveBlock: 9,
    status: 'dormant',
    securityProtocol: 'Legacy ECDSA'
  },
  {
    id: 'dormant_2',
    address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
    ownerAlias: 'Dormant Mt. Gox Cold Storage Node',
    inactiveYears: 12,
    balanceBtc: 250.0,
    lastActiveBlock: 142050,
    status: 'dormant',
    securityProtocol: 'P2PKH Salt'
  },
  {
    id: 'dormant_3',
    address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
    ownerAlias: 'Lost SilkRoad Custodial Reserve',
    inactiveYears: 11,
    balanceBtc: 520.5,
    lastActiveBlock: 289100,
    status: 'dormant',
    securityProtocol: 'Schnorr Sig'
  },
  {
    id: 'dormant_4',
    address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
    ownerAlias: 'Pizza Day Forgotten Auxiliary Node',
    inactiveYears: 14,
    balanceBtc: 100.0,
    lastActiveBlock: 57120,
    status: 'dormant',
    securityProtocol: 'Quantum Vulnerable'
  }
];
