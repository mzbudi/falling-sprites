import { MiniKit, type WalletAuthInput } from "@worldcoin/minikit-js";
import { useCallback, useEffect, useState } from "react";
import { useWalletStore } from "../../store/useWalletStore";

const PERSIST_KEY = "wallet-storage"; // samakan dengan `name` di persist middleware

const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    statement:
      "Sign in with World ID to the Falling Sprites Game! This request will not trigger a blockchain transaction or cost any gas fees.",
  };
};

export const WorldConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Ambil actions/state dari zustand
  const { walletAddress, setWalletInfo } = useWalletStore();

  const handleWalletAuth = async () => {
    if (!MiniKit.isInstalled()) {
      console.warn(
        'Tried to invoke "walletAuth", but MiniKit is not installed.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/minikit/nonce`
      );
      if (!res.ok) {
        console.error("Failed to fetch nonce", res.status);
        return;
      }
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(
        walletAuthInput(nonce)
      );

      if (!finalPayload || finalPayload.status === "error") {
        // user cancelled or error from MiniKit
        console.warn("MiniKit returned error or cancelled");
        return;
      }

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

      if (response.ok) {
        console.log("✅ Successfully signed in with World ID");
        // Simpan ke zustand via action (pakai action dari hook)
        setWalletInfo(finalPayload.address, null, null, "world");
      } else {
        console.error("complete-siwe failed:", await response.text());
      }
    } catch (err) {
      console.error("handleWalletAuth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = useCallback(() => {
    // reset persisted state
    useWalletStore
      .getState()
      .setWalletInfo("world-app-user", null, null, "world");
  }, []);

  useEffect(() => {
    // Run once on mount only.
    // But: saat app pertama render, zustand persist mungkin belum rehydrated,
    // jadi kita cek localStorage dulu untuk melihat apakah ada persisted wallet.
    if (typeof window === "undefined") return;

    const persisted = localStorage.getItem(PERSIST_KEY);
    let persistedAddress: string | null = null;

    if (persisted) {
      try {
        // Zustand persist biasanya menyimpan { state: { ... } } or { ... }
        const parsed = JSON.parse(persisted);
        persistedAddress =
          parsed?.state?.walletAddress ?? parsed?.walletAddress ?? null;
      } catch {
        persistedAddress = null;
      }
    }

    // Jika tidak ada persisted address dan store juga belum punya walletAddress,
    // maka tampilkan popup otomatis sekali saat buka tab.
    if (!persistedAddress && !walletAddress) {
      // panggil auth popup
      handleWalletAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // kosong -> hanya sekali di mount

  const shortAddr = (a?: string | null) =>
    a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "";

  return (
    <div className="flex flex-col items-center">
      {!walletAddress ? (
        <button
          onClick={handleWalletAuth}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Connect World App"
          )}
        </button>
      ) : (
        <button onClick={handleSignOut} className="px-3 py-1 rounded-md border">
          Sign Out ({shortAddr(walletAddress)})
        </button>
      )}
    </div>
  );
};
