import { BrowserProvider } from "ethers";
import { IRYS_TESTNET_PARAMS } from "../../constants.ts";
import { useWalletStore } from "../../store/useWalletStore.ts";

export async function connectWalletAndAddIrys() {
  try {
    if (!window.ethereum) {
      alert("Please install Metamask!");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    const currentChainId = `0x${network.chainId.toString(16)}`;

    if (currentChainId !== IRYS_TESTNET_PARAMS.chainId) {
      try {
        await window.ethereum.request({
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

    useWalletStore
      .getState()
      .setWalletInfo(
        await signer.getAddress(),
        signer,
        Number(network.chainId)
      );

    return signer;
  } catch (err) {
    console.error("Error connecting wallet:", err);
  }
}
