import { useEffect, useState } from "react";
import { useWalletStore } from "../../store/useWalletStore";
import { getAllScores, getAllScoresWithRelayer } from "../../lib/leaderboard";
import { type Leaderboard_Data } from "../../interface/leaderboard.types";

export default function Leaderboard() {
  const address = useWalletStore((state) => state.walletAddress);
  const [leaderboard, setLeaderboard] = useState<Leaderboard_Data[]>([]);
  // check wallet provider
  const walletProvider = useWalletStore((state) => state.provider);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!address) return;

      try {
        if (walletProvider === "world") {
          const leaderboardData: Leaderboard_Data[] =
            await getAllScoresWithRelayer();
          if (leaderboardData) {
            console.log(
              "Leaderboard data fetched with relayer:",
              leaderboardData
            );
          }
          setLeaderboard(leaderboardData);
          return;
        }
        const leaderboardData: Leaderboard_Data[] = await getAllScores();
        if (leaderboardData) {
          console.log("Leaderboard data fetched:", leaderboardData);
        }
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Failed to fetch best score:", err);
      }
    };

    fetchLeaderboard();
  }, [address]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 className="text-2xl font-bold text-center mb-4 text-white">
        🏆 Leaderboard
      </h2>
      {leaderboard.length === 0 ? (
        <p className="text-2xl font-bold text-center mb-4 text-white">
          Please Connect Your Wallet
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Rank</th>
              <th style={{ textAlign: "left" }}>Address</th>
              <th style={{ textAlign: "right" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={entry.player}>
                <td>{idx + 1}</td>
                <td>
                  {entry.player.slice(0, 6)}...{entry.player.slice(-4)}
                </td>
                <td style={{ textAlign: "right" }}>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
