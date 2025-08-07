import type { Signer } from "ethers";
import { create } from "zustand";

interface WalletState {
  walletAddress: string | null;
  chainId: number | null;
  signer: Signer | null;
  setWalletInfo: (
    welletAddress: string,
    signer: Signer,
    chainId: number
  ) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  chainId: null,
  signer: null,
  setWalletInfo: (walletAddress, signer, chainId) => {
    set({ signer, walletAddress, chainId });
  },
  resetWallet: () => set({ walletAddress: null, chainId: null, signer: null }),
}));
