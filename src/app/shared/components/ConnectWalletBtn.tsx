"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { getNetworkImageUrl } from "../constants/networks";
import { useModal } from "../contexts/ModalContext";
import { Helper } from "../utils/helper";
import WalletOptions from "./WalletOptions";

const ConnectWalletBtn = () => {
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { openModal, closeModal } = useModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    closeModal();
  }, [isConnected]);

  if (!address) {
    return (
      <button
        className="bg-gradient-btn h-[32px] lg:h-[36px] px-[17px] text-white font-semibold rounded-[6px] text-[12px] leading-[18px] lg:text-[16px] lg:leading-[24px]"
        onClick={() => openModal(<WalletOptions />)}
      >
        Connect <span className="hidden md:inline">Wallet</span>
      </button>
    );
  }

  return (
    <button className="bg-[rgba(255,255,255,0.1)] h-[32px] lg:h-[36px] px-[17px] flex items-center gap-[8px] rounded-[6px] " onClick={() => disconnect()}>
      <div className="text-white font-semibold text-[12px] leading-[18px] lg:text-[14px] lg:leading-[17px]">{Helper.shortenAddress(address)}</div>
      <div className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white">
        <Image src={getNetworkImageUrl(chainId)} alt="network" width={18} height={18} />
      </div>
    </button>
  );
};

export default ConnectWalletBtn;
