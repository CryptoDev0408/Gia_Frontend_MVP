export const SOCIAL_LINKS = {
  telegram: 'https://t.me',
  discord: 'https://discord.gg',
  twitter: 'https://x.com'
} as const;

export const NETWORKS = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    blockExplorer: 'https://etherscan.io'
  },
  OPTIMISM: {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/your-api-key',
    blockExplorer: 'https://optimistic.etherscan.io'
  }
} as const;

export const CONTRACT_ADDRESSES = {
  // Placeholder addresses - replace with actual contract addresses
  GIA_TOKEN: {
    [NETWORKS.ETHEREUM.id]: '0x1234567890123456789012345678901234567890',
    [NETWORKS.OPTIMISM.id]: '0x0987654321098765432109876543210987654321'
  },
  GIA_STAKING: {
    [NETWORKS.ETHEREUM.id]: '0x1111111111111111111111111111111111111111',
    [NETWORKS.OPTIMISM.id]: '0x2222222222222222222222222222222222222222'
  }
} as const;

// CDN placeholders for future libraries
export const CDN_LIBRARIES = {
  // Ethers.js v6
  ETHERS: '<!-- <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script> -->',
  
  // Viem (modern alternative)
  VIEM: '<!-- <script type="module">import { createPublicClient, http } from "https://esm.sh/viem@latest"</script> -->',
  
  // Web3Modal (wallet connection)
  WEB3MODAL: '<!-- <script type="module">import { EthereumProvider } from "https://unpkg.com/@walletconnect/ethereum-provider@latest"</script> -->',
  
  // Chart.js for future analytics
  CHART_JS: '<!-- <script src="https://cdn.jsdelivr.net/npm/chart.js@latest"></script> -->',
  
  // Web3.js (legacy)
  WEB3: '<!-- <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script> -->'
} as const;