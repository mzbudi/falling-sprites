import { useEffect, useState } from "react";
import { useWalletStore } from "../../store/useWalletStore";
import { getScoreByWallet } from "../../lib/scores";

export default function BestScore() {
  const address = useWalletStore((state) => state.walletAddress);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestScore = async () => {
      if (!address) return;

      try {
        const scoreData = await getScoreByWallet(address);
        if (scoreData) {
          setBestScore(scoreData.score);
          setLastUpdated(scoreData.lastUpdated);

          console.log(
            "Best score fetched:",
            scoreData.score,
            "Last updated:",
            scoreData.lastUpdated
          );
        }
      } catch (err) {
        console.error("Failed to fetch best score:", err);
      }
    };

    fetchBestScore();
  }, [address]);

  return (
    <>
      {address && (
        <div className="flex items-center space-x-4">
          <span className="text-white">Best Score:</span>
          <span className="text-yellow-400">
            {bestScore !== null ? bestScore : "Loading..."}
          </span>
          {lastUpdated && (
            <span className="text-gray-400 text-sm">
              (Last updated: {lastUpdated})
            </span>
          )}
        </div>
      )}
    </>
  );
}
