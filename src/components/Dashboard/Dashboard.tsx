import { useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import GameCanvas from "../Game/GameCanvas";

export function Dashboard() {
  const [onGoing, setOnGoing] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const gameover = useGameStore((state) => state.gameOver);
  const gameOverLoading = useGameStore((state) => state.gameOverLoading);

  const handleStartGame = () => {
    setOnGoing(true);
    useGameStore.getState().setGameOver(false);
  };

  return (
    <div className="dashboard min-h-screen flex flex-col items-center justify-center">
      <h1>Game Dashboard</h1>
      <div className="game-controls">
        <button onClick={handleStartGame} disabled={onGoing || gameover}>
          Start Game
        </button>
        {gameover && !gameOverLoading && (
          <button onClick={() => setGameKey((prev) => prev + 1)}>
            Restart Game
          </button>
        )}
      </div>
      <div id="game-container" className="game-container">
        {onGoing && <GameCanvas key={gameKey} />}
      </div>
    </div>
  );
}
