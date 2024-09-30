"use client";

import Image from "next/image";
import Link from "next/link";
import usePositions from "../shared/hooks/usePositions";
import LiquidityPositionEmpty from "./components/liquidity-position-empty";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Helper } from "../shared/utils/helper";
import { tickToPrice } from "../sdks/v3-sdk";

export default function Liquidity() {
  const { loading, nftTokenIds, rawPositions, findTokenByAddress } = usePositions();
  const { address } = useAccount();
  const router = useRouter();

  const navigate = (index: number) => {
    router.push("/position/" + nftTokenIds[index]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px-102px)] lg:min-h-[calc(100vh-84px-64px)] px-[20px]">
      <div className="w-[854px] max-w-full">
        <div className="flex justify-between mb-[16px] items-center">
          <div className="text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] font-semibold text-white">Positions</div>
          <Link href={"/add"}>
            <button className="bg-gradient-btn hover:opacity-80 bg-[#111111] h-[32px] lg:h-[36px] px-[17px] flex items-center gap-[6px] rounded-[6px] justify-center">
              <Image src={"/icons/plus.svg"} width={18} height={18} alt="plus"></Image>
              <div className="text-white font-semibold text-[14px] leading-[18px] lg:text-[16px] lg:leading-[24px]">New Position</div>
            </button>
          </Link>
        </div>

        <div className="rounded-[12px] bg-[#111111] flex items-center justify-center min-h-[400px] border border-[#FFFFFF1F]">
          {!!!address && <LiquidityPositionEmpty />}
          {!!address && loading && <div className="loading"></div>}
          {!!address && !loading && !rawPositions?.length && <LiquidityPositionEmpty />}
          {!!address && !loading && rawPositions?.length > 0 && (
            <>
              <div className="w-full p-[12px] md:p-[16px]">
                <div className="flex items-center mb-[12px] md:mb-[16px] w-full">
                  <div className="w-[30%]">
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[18px] text-[#FFFFFF80] md:pr-[32px]">Liquidity pool</div>
                  </div>
                  <div className="w-[15%]">
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[18px] text-[#FFFFFF80] px-[8px] md:px-[16px]">Fee Tier</div>
                  </div>
                  <div className="w-[25%]">
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[18px] text-[#FFFFFF80] px-[8px] md:px-[16px]">Low Price</div>
                  </div>
                  <div className="w-[25%]">
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[18px] text-[#FFFFFF80] px-[8px] md:px-[16px]">High Price</div>
                  </div>
                  <div className="w-[5%] px-[8px] md:px-[16px] min-w-[40px]"></div>
                </div>

                <div className="min-h-[400px] max-h-[60vh] overflow-auto">
                  {rawPositions?.map((rawPosition, index: number) => (
                    <div
                      key={index}
                      className="flex items-center mb-[8px] border border-[#FFFFFF1F] bg-[#00000040] rounded-[8px] h-[40px] md:h-[52px] cursor-pointer duration-200 hover:border-[#C0A4FF] hover:!bg-[#311F58] min-w-full w-max"
                      onClick={() => navigate(index)}
                    >
                      <div className="w-[30%]">
                        <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[21px] font-semibold text-[#FFFFFF] px-[8px] md:px-[16px]">
                          <div className="flex items-center md:gap-[4px] flex-nowrap">
                            <Image src={findTokenByAddress(rawPosition.token1)?.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                            <Image src={findTokenByAddress(rawPosition.token0)?.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full mr-[4px]" alt="token1" />
                            <div className="whitespace-nowrap md:block hidden">
                              {findTokenByAddress(rawPosition.token1)?.symbol} / {findTokenByAddress(rawPosition.token0)?.symbol}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[15%]">
                        <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[21px] font-semibold text-[#FFFFFF] px-[8px] md:px-[16px]">{Number(rawPosition.fee) / 10000}%</div>
                      </div>
                      <div className="w-[25%]">
                        <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[21px] font-semibold text-[#FFFFFF] px-[8px] md:px-[16px]">
                          {Helper.isZero(Number(rawPosition.fee), Number(rawPosition.tickLower))
                            ? 0
                            : tickToPrice(findTokenByAddress(rawPosition.token0), findTokenByAddress(rawPosition.token1), Number(rawPosition.tickLower))?.toSignificant()}
                        </div>
                      </div>
                      <div className="w-[25%]">
                        {Helper.isInfinite(Number(rawPosition.fee), Number(rawPosition.tickUpper)) ? (
                          <div className="text-[20px] md:text-[24px] leading-[21px] font-semibold text-[#FFFFFF] px-[8px] md:px-[16px]">∞</div>
                        ) : (
                          <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[21px] font-semibold text-[#FFFFFF] px-[8px] md:px-[16px]">
                            {tickToPrice(findTokenByAddress(rawPosition.token0), findTokenByAddress(rawPosition.token1), Number(rawPosition.tickUpper))?.toSignificant()}
                          </div>
                        )}
                      </div>
                      <div className="w-[5%] px-[8px] min-w-[24px] md:px-[16px] md:min-w-[40px] flex justify-end items-center">
                        <Image src={"/icons/arrow-right.svg"} width={7} height={12} alt="right"></Image>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
