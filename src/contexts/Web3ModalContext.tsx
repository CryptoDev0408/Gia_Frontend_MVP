import React from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, optimism } from 'wagmi/chains';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'; // Replace with your actual project ID

// 2. Create metadata
const metadata = {
  name: 'GIA Token',
  description: 'The Future of AI-Powered Blockchain Technology',
  url: 'https://gia-token.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 3. Create wagmiConfig
const chains = [mainnet, optimism] as const;

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  auth: {
    email: false // Disable email login
  }
});

// 4. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#132531',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#c5a267',
  }
});

interface Web3ModalContextProps {
  children: React.ReactNode;
}

export const Web3ModalContext: React.FC<Web3ModalContextProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};