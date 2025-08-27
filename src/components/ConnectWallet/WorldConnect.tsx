import {
  MiniKit,
  type WalletAuthInput,
  type User as MiniKitUser,
} from "@worldcoin/minikit-js";
import { useCallback, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletAuth = async () => {
    if (!MiniKit.isInstalled()) {
      console.warn(
        'Tried to invoke "walletAuth", but MiniKit is not installed.'
      );
      return;
    }

    setIsLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/minikit/nonce`
    );
    const { nonce } = await res.json();

    const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
      walletAuthInput(nonce)
    );

    if (finalPayload.status === "error") {
      setIsLoading(false);
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

        useWalletStore
          .getState()
          .setWalletInfo(finalPayload.address, null, null, "world");

        setUser(MiniKit.user);
      }
    }
    setIsLoading(false);
  };

  const handleSignOut = useCallback(() => {
    setUser(null);
  }, []);

  // ✅ Pop-up login otomatis saat pertama kali buka
  useEffect(() => {
    if (!user) {
      handleWalletAuth();
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center">
      {!user ? (
        <button
          onClick={handleWalletAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Connect World App"
          )}
        </button>
      ) : (
        <button onClick={handleSignOut}>Sign Out</button>
      )}
    </div>
  );
};
