import { useState, useRef } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useWalletStore } from "../../store/useWalletStore";
import { Play } from "lucide-react";
import { playBackgroundMusic } from "../Sound/sound";
import { GameLayout } from "../../layout/GameLayout";
import { submitScore, submitScoreWithRelayer } from "../../lib/scores";

import GameCanvas from "../Game/GameCanvas";
import SoundModal from "../modals/SoundModal";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import HowToPlayModal from "../modals/HowToPlayModal";
import BestScore from "../BestScore/BestScore";
import Leaderboard from "../Leaderboard/Leaderboard";
import ScoreSubmitSuccessModal from "../modals/ScoreSubmitSuccessModal";
import ForceConnectWalletModal from "../modals/ForceConnectWalletModal";
import { WorldConnect } from "../ConnectWallet/WorldConnect";

export function Dashboard() {
  const [onGoing, setOnGoing] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [scoreSubmitSuccessModal, setScoreSubmitSuccessModal] = useState(false);
  const [showForceConnectWalletModal, setShowForceConnectWalletModal] =
    useState(false);
  const [submitScoreLoading, setSubmitScoreLoading] = useState(false);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameOverLoading = useGameStore((state) => state.gameOverLoading);
  const bgmState = useGameStore((state) => state.bgmState);
  const walletAddress = useWalletStore((state) => state.walletAddress);
  const walletProvider = useWalletStore((state) => state.provider);
  const leaderboardRef = useRef<HTMLDivElement | null>(null);

  const handleStartGame = () => {
    if (!walletAddress || walletAddress === "world-app-user") {
      setShowForceConnectWalletModal(true);
      return;
    }
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

  const handleHowToPlay = () => {
    setShowHowToPlay(true);
    // setHighScoreNotPassedModal(true);
  };

  const scrollToLeaderboard = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmitScore = async () => {
    const score = useGameStore.getState().gameScore;
    if (score === null || score === undefined) {
      console.error("No score to submit");
      return;
    }

    setSubmitScoreLoading(true);

    if (walletProvider === "world") {
      try {
        await submitScoreWithRelayer(walletAddress!, score);
        console.log("✅ Score successfully submitted to contract");
        setScoreSubmitSuccessModal(true);
      } catch (err) {
        console.error("❌ Failed to submit score:", err);
      } finally {
        setSubmitScoreLoading(false);
      }
    } else {
      try {
        await submitScore(score);
        console.log("✅ Score successfully submitted to contract");
        setScoreSubmitSuccessModal(true);
      } catch (err) {
        setSubmitScoreLoading(false);
        console.error("❌ Failed to submit score:", err);
      } finally {
        setSubmitScoreLoading(false);
      }
    }
  };

  if (onGoing) {
    return (
      <GameLayout>
        <GameCanvas key={gameKey} />

        {scoreSubmitSuccessModal && (
          <ScoreSubmitSuccessModal onAccept={setScoreSubmitSuccessModal} />
        )}

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
          <div
            className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <button
              onClick={handlePlayAgain}
              style={{ backgroundColor: "#56FCCA", color: "#000" }}
              className={`flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-xl font-bold transition italic 
                 text-lg sm:text-2xl md:text-3xl cursor-pointer hover:brightness-90`}
            >
              Play Again
            </button>

            <button
              onClick={handleSubmitScore}
              className={`${
                submitScoreLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:brightness-90"
              } flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-xl font-bold transition italic 
                 text-lg sm:text-2xl md:text-3xl bg-orange-400 cursor-pointer hover:brightness-90`}
            >
              {submitScoreLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                "Submit Score"
              )}
            </button>

            <button
              onClick={handleBackToMenu}
              className={`flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-xl font-bold transition italic 
                 text-lg sm:text-2xl md:text-3xl bg-gray-800 cursor-pointer hover:brightness-90`}
            >
              Back to Menu
            </button>
          </div>
        )}
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      {!bgmState && (
        <SoundModal
          onAccept={() => {
            playBackgroundMusic();
          }}
        />
      )}

      {showHowToPlay && <HowToPlayModal onAccept={setShowHowToPlay} />}
      {showForceConnectWalletModal && (
        <ForceConnectWalletModal onAccept={setShowForceConnectWalletModal} />
      )}

      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <div className="absolute top-4 left-0 right-0 px-4 z-50 flex flex-col items-center gap-2 sm:block">
          {/* Mobile layout (flex-col) */}
          <div className="flex flex-col items-center gap-2 sm:hidden">
            {/* if provider wallet connect render worldconnect, else render wallet connect */}

            {walletProvider === "world"
              ? bgmState && <WorldConnect />
              : bgmState && <ConnectWallet />}
            <BestScore />
          </div>

          {/* Desktop layout (left-right) */}
          <div className="hidden sm:flex justify-between items-center w-full">
            <div className="flex justify-start">
              <BestScore />
            </div>
            <div className="flex justify-end">
              {bgmState && <ConnectWallet />}
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-bold mb-8 text-center tracking-wide drop-shadow-lg italic">
          Falling Sprites ✨
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleStartGame}
            disabled={onGoing || gameOver}
            style={{ backgroundColor: "#56FCCA", color: "#000" }}
            className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition italic text-2xl sm:text-3xl md:text-4xl ${
              onGoing || gameOver ? "cursor-not-allowed" : "hover:brightness-90"
            }`}
          >
            <Play size={20} className="fill-black transform -skew-x-12" />
            START
          </button>
          <button
            onClick={handleHowToPlay}
            disabled={onGoing || gameOver}
            style={{ color: "#000" }}
            className={`bg-blue-400 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition italic text-2xl sm:text-3xl md:text-4xl ${
              onGoing || gameOver ? "cursor-not-allowed" : "hover:brightness-90"
            }`}
          >
            <Play size={20} className="fill-black transform -skew-x-12" />
            HOW TO PLAY
          </button>
          <button
            onClick={scrollToLeaderboard}
            disabled={onGoing || gameOver}
            style={{ color: "#000" }}
            className={`bg-orange-400 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold transition italic text-2xl sm:text-3xl md:text-4xl ${
              onGoing || gameOver ? "cursor-not-allowed" : "hover:brightness-90"
            }`}
          >
            <Play size={20} className="fill-black transform -skew-x-12" />
            LEADERBOARD
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm pb-4">
          <p className="sm:text-sm md: text-sm lg:text-lg">Powered by</p>
          <img src="/assets/logo1.gif" alt="Irys Logo" className="h-7" />
        </div>
      </div>

      {/* Leaderboard Section */}
      <div
        className="w-full max-w-3xl bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg mb-8 mx-auto mt-0"
        ref={leaderboardRef}
      >
        <Leaderboard />
      </div>

      <div className="text-center text-gray-400 mt-4">
        <p className="text-sm">
          Made with ❤️ by{" "}
          <a
            href="https://x.com/MzBudi97"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            MzBudi
          </a>
        </p>
      </div>
      <div className="text-center text-gray-400 mt-4">
        <p className="text-sm">
          Music by{" "}
          <a
            href="https://www.youtube.com/watch?v=vX1xq4Ud2z8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            HeatleyBros
          </a>
        </p>
      </div>
      {/* <div className="mt-2 flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm pb-4">
        <p className="text-sm">Powered by</p>
        <img src="/assets/logo1.gif" alt="Irys Logo" className="h-7" />
      </div> */}
    </GameLayout>
  );
}
