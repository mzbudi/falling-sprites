import { IRYS_TESTNET_PARAMS } from "../../constants.ts"; // file berisi data RPC di atas
import { useWalletStore } from "../../store/useWalletStore.ts";

export async function connectWalletAndAddIrys() {
  try {
    if (!window.ethereum) {
      alert("Please install Metamask!");
      return;
    }

    const provider = window.ethereum;

    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const currentChainId = await provider.request({ method: "eth_chainId" });

    if (currentChainId !== IRYS_TESTNET_PARAMS.chainId) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [IRYS_TESTNET_PARAMS],
        });
        console.log("Irys Testnet added and switched");
      } catch (addError) {
        console.error("Failed to add/switch to Irys Testnet", addError);
      }
    } else {
      console.log("Already on Irys Testnet");
    }

    useWalletStore.getState().setWalletInfo(accounts[0], Number(currentChainId));

    return accounts[0];
  } catch (err) {
    console.error("Error connecting wallet:", err);
  }
}
