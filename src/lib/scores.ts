import { JsonRpcProvider } from "ethers";
import { useWalletStore } from "../store/useWalletStore";
import { getLeaderboardContract } from "./contract";

export async function submitScore(score: number) {
  const { signer } = useWalletStore.getState();
  if (!signer) {
    throw new Error("Signer not available. Please connect wallet.");
  }

  const contract = getLeaderboardContract(signer);

  try {
    const tx = await contract.submitScore(score);
    console.log("Submitting score tx:", tx.hash);
    await tx.wait();
    console.log("✅ Score submitted successfully!");
  } catch (err) {
    const e = err as Error;
    throw new Error("Failed to submit score: " + e.message);
  }
}

export async function getScoreByWallet(address: string) {
  const provider = new JsonRpcProvider(
    "https://testnet-rpc.irys.xyz/v1/execution-rpc"
  );
  const contract = getLeaderboardContract(provider);

  try {
    const scoreEntry = await contract.getScore(address);
    const score = scoreEntry[1];
    const lastUpdated = scoreEntry[0];
    return {
      score: Number(score),
      lastUpdated: new Date(Number(lastUpdated) * 1000).toLocaleString(),
    };
  } catch (err) {
    console.error("Failed to get score for wallet:", err);
    return null;
  }
}

export async function getScoreByWalletWithRelayer(address: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/score/${address}`
  );
  console.log(response, "this is response");

  if (!response.ok) {
    throw new Error("Failed to fetch score from relayer");
  }
  const data = await response.json();
  const responseData = {
    score: data.score,
    lastUpdated: new Date(data.lastUpdated).toLocaleString(),
  };
  return responseData;
}
