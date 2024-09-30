import Image from "next/image";
import { Connector, useAccount, useChainId, useConnect } from "wagmi";
import { flare, flareTestnet, songbirdTestnet } from "wagmi/chains";
import { useModal } from "../contexts/ModalContext";
import { useEffect } from "react";
import { toast } from "react-toastify";

const WALLET_CONNECT_CONNECTOR_ID = "walletConnect";
const COINBASE_CONNECTOR_ID = "coinbaseWalletSDK";
const METAMASK_CONNECTOR_ID = "metaMask";
const ALLOW_CONNECTOR_IDS = [WALLET_CONNECT_CONNECTOR_ID, COINBASE_CONNECTOR_ID, METAMASK_CONNECTOR_ID];

const WalletOptions = () => {
  const chainId = useChainId();
  const { connectors, connect } = useConnect();
  const { closeModal } = useModal();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      toast("Connect wallet successfully");
      closeModal();
    }
  }, [isConnected]);

  const getIcon = (connector: Connector) => {
    switch (connector.id) {
      case WALLET_CONNECT_CONNECTOR_ID:
        return "/icons/connectors/walletconnect.svg";
      case METAMASK_CONNECTOR_ID:
        return "/icons/connectors/metamask.svg";
      case COINBASE_CONNECTOR_ID:
        return "/icons/connectors/coinbase.webp";
      default:
        return connector.icon;
    }
  };

  const isMobile = () => {
    if (typeof navigator === "undefined") return false;
    const userAgent = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);
  };

  const getName = (connector: Connector) => {
    const ext = connector.id === METAMASK_CONNECTOR_ID && !isMetamaskInstalled() ? " (Not installed)" : "";
    return connector?.name + ext;
  };

  const isMetamaskInstalled = () => {
    return typeof window !== "undefined" && !!window.ethereum;
  };

  const connectConnector = async (connector: Connector) => {
    try {
      if (connector.id === METAMASK_CONNECTOR_ID && !isMetamaskInstalled()) {
        window.open(isMobile() ? "https://metamask.app.link/dapp/flareswap.finance" : "https://metamask.io/download/");
        return;
      }
      connect({ connector, chainId });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-[450px] mx-3 relative max-w-[calc(100vw-24px)]">
      <div className="bg-white rounded-2xl p-2 md:p-4">
        <div className="flex justify-end text-2xl">
          <Image src="/icons/close-black.svg" alt="Close" width={24} height={24} onClick={() => closeModal()} className="cursor-pointer" />
        </div>
        <div className="p-[16px] lg:p-5">
          <h2 className="text-[16px] md:text-[24px] font-bold mb-4">Connect wallet</h2>
          {connectors
            ?.filter((connector) => ALLOW_CONNECTOR_IDS.includes(connector.id))
            ?.map((connector: Connector, index, array) => (
              <div key={connector.id}>
                <button onClick={() => connectConnector(connector)} className="w-full h-10 rounded-lg bg-gray-200 flex justify-center items-center font-medium gap-4 cursor-pointer">
                  <Image src={getIcon(connector)} width={20} height={20} alt={connector.name} />
                  {getName(connector)}
                </button>
                {index !== array?.length - 1 && (
                  <div className="flex items-center justify-center my-3">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="mx-4 text-sm text-gray-500">or</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WalletOptions;
