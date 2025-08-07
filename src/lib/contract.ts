import { Contract, JsonRpcProvider, type Provider, type Signer } from "ethers";
import LeaderboardABI from "../contractABI/Leaderboard.json";
import { useWalletStore } from "../store/useWalletStore";

const leaderboardAddress = import.meta.env.VITE_LEADERBOARD_ADDRESS as string;

export function getLeaderboardContract(signerOrProvider: Signer | Provider) {
  return new Contract(leaderboardAddress, LeaderboardABI.abi, signerOrProvider);
}

// export async function getAllScores() {
//   const provider = new JsonRpcProvider(
//     "https://testnet-rpc.irys.xyz/v1/execution-rpc"
//   );
//   const contract = getLeaderboardContract(provider);

//   // Ambil fragment event
//   const iface = new Interface(LeaderboardABI.abi);
//   const eventFragment = iface.getEvent("ScoreSubmitted");
//   const topicHash = iface.getEventTopic(eventFragment); // error: karena getEventTopic tidak ada

//   // FIX: gunakan `ethers.id()` langsung untuk topic
//   const eventTopic = ethers.id("ScoreSubmitted(address,uint256,uint256)");

//   const logs = await provider.getLogs({
//     address: contract.target as string,
//     topics: [eventTopic],
//     fromBlock: 0n,
//     toBlock: "latest",
//   });

//   const playerSet = new Set<string>();

//   for (const log of logs) {
//     const event = iface.decodeEventLog("ScoreSubmitted", log.data, log.topics);
//     playerSet.add(event.player);
//   }

//   const uniquePlayers = Array.from(playerSet);

//   const scores = await Promise.all(
//     uniquePlayers.map(async (player: string) => {
//       const scoreEntry = await contract.getScore(player);
//       return {
//         player,
//         score: Number(scoreEntry.score),
//       };
//     })
//   );

//   scores.sort((a, b) => b.score - a.score);
//   return scores;
// }

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
    console.error("❌ Failed to submit score:", err);
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
