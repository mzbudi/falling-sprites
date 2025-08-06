import { useEffect } from "react";
import Phaser from "phaser";
import FallingSpritesGame from "./FallingSpritesGame";
import { useGameStore } from "../../store/useGameStore";

const configPcCanvas: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: window.innerHeight,
  parent: "game-container",
  scene: [FallingSpritesGame],
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
};

const configMobileCanvas: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  scene: [FallingSpritesGame],
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Math.min(window.innerWidth, 800),
    height: window.innerHeight,
  },
};

export default function GameCanvas() {
  const nickname = useGameStore((state) => state.nickname);
  useEffect(() => {
    const isMobile = window.innerWidth < 800;
    const config = isMobile ? configMobileCanvas : configPcCanvas;

    const game = new Phaser.Game(config);

    game.events.once("ready", () => {
      const scene = game.scene.getScene("falling-sprites");
      scene.events.on("gameover", async (payload: { score: number }) => {
        const { score } = payload;
        console.log("Game Over, Score: ", score);

        useGameStore.getState().setGameOverLoading(false);
        useGameStore.getState().setGameScore(score);
        useGameStore.getState().setGameOver(true);
      });
    });

    const handleResize = () => {
      game.scale.resize(Math.max(window.innerWidth, 800), window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
    };
  }, [nickname]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        id="game-container"
        className="flex items-center justify-center
        w-full h-full"
        style={{ maxWidth: "100vw", maxHeight: "100vh" }}
      />
    </div>
  );
}
