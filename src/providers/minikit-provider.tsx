import { MiniKit } from "@worldcoin/minikit-js";
import { type ReactNode, useEffect } from "react";
import { useWalletStore } from "../store/useWalletStore";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install();
    console.log(MiniKit.isInstalled());
    if (MiniKit.isInstalled()) {
      console.log("MiniKit is installed");
      useWalletStore
        .getState()
        .setWalletInfo("world-app-user", null, null, "world");
    }
  }, []);

  return <>{children}</>;
}
