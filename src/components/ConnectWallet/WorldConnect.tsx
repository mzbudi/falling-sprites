import {
  MiniKit,
  type WalletAuthInput,
  type User as MiniKitUser,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";
import { useWalletStore } from "../../store/useWalletStore";

const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    statement:
      "Sign in with World ID to the Falling Sprites Game! This request will not trigger a blockchain transaction or cost any gas fees.",
  };
};

export const WorldConnect = () => {
  const [user, setUser] = useState<MiniKitUser | null>(null);

  const handleWalletAuth = async () => {
    if (!MiniKit.isInstalled()) {
      console.warn(
        'Tried to invoke "walletAuth", but MiniKit is not installed.'
      );
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/minikit/nonce`
    );
    const { nonce } = await res.json();

    const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
      walletAuthInput(nonce)
    );

    if (finalPayload.status === "error") {
      return;
    } else {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/minikit/complete-siwe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,
            nonce,
          }),
        }
      );

      if (response.status === 200) {
        console.log("✅ Successfully signed in with World ID");
        console.log(finalPayload);

        useWalletStore
          .getState()
          .setWalletInfo(finalPayload.address, null, null, "world");

        setUser(MiniKit.user);
      }
    }
  };

  const handleSignOut = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {!user ? (
        <button onClick={handleWalletAuth}>Wallet Auth</button>
      ) : (
        <button onClick={handleSignOut}>Sign Out</button>
      )}
    </div>
  );
};
