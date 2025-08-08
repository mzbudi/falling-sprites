import { Contract, type Provider, type Signer } from "ethers";
import LeaderboardABI from "../contractABI/Leaderboard.json";

const leaderboardAddress = import.meta.env.VITE_LEADERBOARD_ADDRESS as string;

export function getLeaderboardContract(signerOrProvider: Signer | Provider) {
  return new Contract(leaderboardAddress, LeaderboardABI.abi, signerOrProvider);
}


