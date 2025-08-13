import { EventLog, JsonRpcProvider } from "ethers";
import { getLeaderboardContract } from "./contract";

export async function getAllScores() {
  const provider = new JsonRpcProvider(
    "https://testnet-rpc.irys.xyz/v1/execution-rpc"
  );

  const contract = getLeaderboardContract(provider);

  const latestBlock = await provider.getBlockNumber();
  const startBlock = Math.max(latestBlock - 250_000, 0); // ambil 250k block terakhir

  const filter = contract.filters.ScoreSubmitted();

  const events = await contract.queryFilter(filter, 0, 100000);

  const firstBlockInfo = await provider.getBlock(startBlock);
  const lastBlockInfo = await provider.getBlock(latestBlock);

  console.log(
    `📅 fetch start block ${startBlock} (${new Date(
      firstBlockInfo!.timestamp * 1000
    ).toISOString()})`
  );
  console.log(
    `📅 to block ${latestBlock} (${new Date(
      lastBlockInfo!.timestamp * 1000
    ).toISOString()})`
  );
  console.log(`📊 Total event found: ${events.length}`);

  const scoresMap = new Map();

  for (const ev of events as EventLog[]) {
    const player = ev.args[0];
    const season = Number(ev.args[1]);
    const score = Number(ev.args[2]);

    if (!scoresMap.has(player) || score > scoresMap.get(player).score) {
      scoresMap.set(player, { player, season, score });
    }
  }

  const leaderboard = Array.from(scoresMap.values()).sort(
    (a, b) => b.score - a.score
  );

  console.log("🏆 Leaderboard (Top 10):");
  leaderboard.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.player} - ${p.score}`);
  });

  return leaderboard;
}
