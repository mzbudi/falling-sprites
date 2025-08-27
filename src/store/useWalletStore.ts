import type { Signer } from "ethers";
import { create } from "zustand";

interface WalletState {
  walletAddress: string | null;
  chainId: number | null;
  signer: Signer | null;
  provider: "world" | "metamask" | null;
  setWalletInfo: (
    welletAddress: string,
    signer: Signer | null,
    chainId: number | null,
    provider: "world" | "metamask" | null
  ) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  chainId: null,
  signer: null,
  provider: null,
  setWalletInfo: (walletAddress, signer, chainId, provider) => {
    set({ signer, walletAddress, chainId, provider });
  },
  resetWallet: () => set({ walletAddress: null, chainId: null, signer: null }),
}));
