import { create } from "zustand";

type GameStore = {
  gameOver: boolean;
  gameScore: number;
  nickname: string;
  highScore: number;
  gameOverLoading: boolean;
  bgmState: boolean;
  muted: boolean;
  setHighScore: (highScore: number) => void;
  setGameOver: (gameOver: boolean) => void;
  setGameScore: (gameScore: number) => void;
  setNickname: (nickname: string) => void;
  setGameOverLoading: (gameOverLoading: boolean) => void;
  setBgmState: (bgmState: boolean) => void;
  setMuted: (muted: boolean) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  gameOver: false,
  gameScore: 0,
  nickname: "",
  highScore: 0,
  gameOverLoading: false,
  bgmState: false,
  muted: false,
  setHighScore: (highScore: number) => set({ highScore }),
  setGameOver: (gameOver: boolean) => set({ gameOver }),
  setGameScore: (gameScore: number) => set({ gameScore }),
  setNickname: (nickname: string) => set({ nickname }),
  setGameOverLoading: (gameOverLoading: boolean) => set({ gameOverLoading }),
  setBgmState: (bgmState: boolean) => set({ bgmState }),
  setMuted: (muted: boolean) => set({ muted }),
}));
