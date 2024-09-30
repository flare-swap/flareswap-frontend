"use client";

import { useAccount } from "wagmi";
import Image from "next/image";

export default function LiquidityPositionEmpty() {
  const { address } = useAccount();
  return (
    <div>
      <Image src={"/images/empty.png"} width={64} height={64} className="mb-[16px] mx-auto" alt="empty" />
      <div className="text-[#FFFFFF80] text-[12px] leading-[12px] md:text-[14px] md:leading-[14px]">{!!address ? "Your active liquidity positions will appear here." : "Connect to a wallet to view your liquidity."}</div>
    </div>
  );
}
