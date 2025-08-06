import { connectWalletAndAddIrys } from "./connectAndAddIrys";
import { useWalletStore } from "../../store/useWalletStore";

export default function ConnectWallet() {
  const address = useWalletStore((state) => state.walletAddress);

  const handleConnect = async () => {
    const account = await connectWalletAndAddIrys();
    console.log("Connected account:", account);

    if (account) {
      console.log("Wallet connected:", account);
    }
  };

  const handleDisconnect = () => {
    useWalletStore.getState().resetWallet();
    console.log("Wallet disconnected");
  };

  return (
    <>
      {address ? (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}
