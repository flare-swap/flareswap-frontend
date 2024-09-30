import Image from "next/image";
import React from "react";
import { Token } from "@/app/sdks/sdk-core";
import { useModal } from "../contexts/ModalContext";
import { TokenOptions } from "./TokenOptions";

interface TokenSelectProps {
  tokens: Token[] | null;
  token: Token | null;
  onTokenChange: (token: Token) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ tokens = [], token = null, onTokenChange }) => {
  const { openModal } = useModal();

  return (
    <div
      className="border border-[#FFFFFF40] bg-[#FFFFFF1A] h-[32px] flex items-center justify-between pl-[6px] pr-[8px] md:pl-[8px] md:pr-[16px] rounded-full cursor-pointer hover:bg-[#FFFFFF5A] md:h-[44px]"
      onClick={() => openModal(<TokenOptions tokens={tokens?.filter((t) => t.address !== token?.address)} onSelectToken={onTokenChange} />)}
    >
      <div className="flex items-center">
        {token && <Image src={token?.logoURI} width={24} height={24} alt={token?.symbol} className="rounded-full" />}
        <div className="text-[14px] leading-[16px] md:text-[16px] md:leading-[24px] text-white ml-[8px] mr-[4px]">{token?.symbol || "Select a token"}</div>
      </div>
      <Image src="/icons/down.svg" width={12} height={8} alt="down-arrow" />
    </div>
  );
};

export default TokenSelect;
