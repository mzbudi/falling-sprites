import { useEffect, useState } from "react";
import { useWalletStore } from "../../store/useWalletStore";
import { getAllScores } from "../../lib/leaderboard";
import { type Leaderboard_Data } from "../../interface/leaderboard.types";

export default function Leaderboard() {
  const address = useWalletStore((state) => state.walletAddress);
  const [leaderboard, setLeaderboard] = useState<Leaderboard_Data[]>([]);
  //   const dummyData: Leaderboard_Data[] = [
  //     {
  //       player: "0x1234567890abcdef1234567890abcdef12345678",
  //       season: 1,
  //       score: 100,
  //     },
  //     {
  //       player: "0xabcdef1234567890abcdef1234567890abcdef12",
  //       season: 1,
  //       score: 90,
  //     },
  //     {
  //       player: "0x7890abcdef1234567890abcdef12345678901234",
  //       season: 1,
  //       score: 80,
  //     },
  //     {
  //       player: "0x4567890abcdef1234567890abcdef1234567890",
  //       season: 1,
  //       score: 70,
  //     },
  //     {
  //       player: "0x90abcdef1234567890abcdef1234567890123456",
  //       season: 1,
  //       score: 60,
  //     },
  //     {
  //       player: "0x234567890abcdef1234567890abcdef12345678",
  //       season: 1,
  //       score: 50,
  //     },
  //     {
  //       player: "0x567890abcdef1234567890abcdef123456789012",
  //       season: 1,
  //       score: 40,
  //     },
  //     {
  //       player: "0x890abcdef1234567890abcdef12345678901234",
  //       season: 1,
  //       score: 30,
  //     },
  //     {
  //       player: "0x0123456789abcdef1234567890abcdef12345678",
  //       season: 1,
  //       score: 20,
  //     },
  //     {
  //       player: "0x34567890abcdef1234567890abcdef1234567890",
  //       season: 1,
  //       score: 10,
  //     },
  //   ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!address) return;

      try {
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
