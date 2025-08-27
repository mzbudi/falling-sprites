import { MiniKit } from "@worldcoin/minikit-js";
import { type ReactNode, useEffect } from "react";
import { useWalletStore } from "../store/useWalletStore";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install();
    console.log("MiniKit installed?", MiniKit.isInstalled());

    if (MiniKit.isInstalled()) {
      const state = useWalletStore.getState();

      // ✅ Jangan overwrite kalau sudah ada walletAddress
      if (!state.walletAddress) {
        console.log("MiniKit is installed, setting world-app-user");
        state.setWalletInfo("world-app-user", null, null, "world");
      }
    }
  }, []);

  return <>{children}</>;
}
