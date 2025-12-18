import { createContext } from 'react';

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  chainId: number | undefined;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchToEthereum: () => Promise<void>;
  switchToOptimism: () => Promise<void>;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Web3Context.Provider
      value={{
        account: null,
        isConnected: false,
        chainId: undefined,
        connect: async () => console.log('Connect wallet'),
        disconnect: async () => console.log('Disconnect wallet'),
        switchToEthereum: async () => console.log('Switch to Ethereum'),
        switchToOptimism: async () => console.log('Switch to Optimism'),
        isConnecting: false,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;