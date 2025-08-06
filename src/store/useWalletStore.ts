import { create } from "zustand";

interface WalletState {
  walletAddress: string | null;
  chainId: number | null;
  setWalletInfo: (address: string, chainId: number) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  chainId: null,
  setWalletInfo: (address, chainId) => set({ walletAddress: address, chainId }),
  resetWallet: () => set({ walletAddress: null, chainId: null }),
}));
