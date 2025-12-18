import { useState, useCallback } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, optimism } from 'wagmi/chains';

export const useWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { open } = useWeb3Modal();

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await open();
      setIsConnecting(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  }, [open]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnect]);

  const switchToEthereum = useCallback(async () => {
    try {
      await switchChain({ chainId: mainnet.id });
    } catch (error) {
      console.error('Failed to switch to Ethereum:', error);
    }
  }, [switchChain]);

  const switchToOptimism = useCallback(async () => {
    try {
      await switchChain({ chainId: optimism.id });
    } catch (error) {
      console.error('Failed to switch to Optimism:', error);
    }
  }, [switchChain]);

  return {
    account: address || null,
    chainId: chainId || null,
    isConnected,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
    switchToEthereum,
    switchToOptimism,
  };
};

// Placeholder for contract interactions
export const useContract = () => {
  return {
    read: async (contractName: string, method: string, params: unknown[]) => {
      console.log(`Reading ${contractName}.${method}`, params);
      return null;
    },
    write: async (contractName: string, method: string, params: unknown[]) => {
      console.log(`Writing ${contractName}.${method}`, params);
      return null;
    },
    balanceOf: async (address: string) => {
      console.log('Getting balance for:', address);
      return '0';
    },
    totalSupply: async () => {
      console.log('Getting total supply');
      return '0';
    }
  };
};