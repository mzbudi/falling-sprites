import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import GameCanvas from "../Game/GameCanvas";
import { Play } from "lucide-react";
import SoundModal from "../modals/SoundModal";
import { playBackgroundMusic } from "../Sound/sound";

export function Dashboard() {
  const [onGoing, setOnGoing] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameOverLoading = useGameStore((state) => state.gameOverLoading);
  const bgmState = useGameStore((state) => state.bgmState);

  const handleStartGame = () => {
    setOnGoing(true);
    useGameStore.getState().setGameOver(false);
  };

  const handleBackToMenu = () => {
    setOnGoing(false);
    useGameStore.getState().setGameOver(false);
  };

  const handlePlayAgain = () => {
    useGameStore.getState().setGameOver(false);
    setGameKey((prevKey) => prevKey + 1); // Update game key untuk memicu rerender
  };

  if (onGoing) {
    return (
      <>
        <GameCanvas key={gameKey} />

        {gameOverLoading && (
          <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-x-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">Submitting Score...</span>
              <svg
                className="animate-spin h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  strokeWidth="4"
                  stroke="currentColor"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-x-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-lg font-semibold"
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
            <button
              className="bg-gray-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-lg font-semibold"
              onClick={handleBackToMenu}
            >
              Back to Menu
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!bgmState && (
        <SoundModal
          onAccept={() => {
            playBackgroundMusic();
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl font-bold mb-8 text-center tracking-wide drop-shadow-lg">
          🎮 Falling Sprites ✨✨
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleStartGame}
            disabled={onGoing || gameOver}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition 
              ${
                onGoing || gameOver
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            <Play size={20} />
            Start Game
          </button>
        </div>
      </div>
    </>
  );
}
