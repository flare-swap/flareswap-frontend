"use client";

import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useModal } from "../contexts/ModalContext";
import { Helper } from "../utils/helper";
import WalletOptions from "./WalletOptions";

const ConnectWalletBtn = () => {
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { openModal, closeModal } = useModal();
  const globalContext = useGlobalContext();

  if (!isConnected) {
    return (
      <button
        className="bg-gradient-btn h-[32px] lg:h-[36px] px-[8px] md:px-[17px] text-white font-semibold rounded-[6px] leading-[18px] lg:text-[16px] lg:leading-[24px]"
        onClick={() => openModal(<WalletOptions />)}
      >
        Connect <span className="hidden md:inline">Wallet</span>
      </button>
    );
  }

  return (
    <button className="bg-[#ffffff50] h-[32px] lg:h-[36px] px-[17px] flex items-center gap-[8px] rounded-[99px] hover:opacity-80" onClick={() => disconnect()}>
      <div className="text-white font-semibold text-[12px] leading-[18px] lg:text-[14px] lg:leading-[17px]">{Helper.shortenAddress(address)}</div>
      <Image src="/icons/log-out-circle.svg" alt="network" width={24} height={24} />
    </button>
  );
};

export default ConnectWalletBtn;
