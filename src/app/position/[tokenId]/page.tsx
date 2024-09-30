"use client";

import { nearestUsableTick, TickMath, tickToPrice } from "@/app/sdks/v3-sdk";
import { nonfungiblePositionManagerABI } from "@/app/shared/abis/nonfungiblePositionManager";
import { useGlobalContext } from "@/app/shared/contexts/GlobalContext";
import { Bound } from "@/app/shared/enums/bound";
import { useEthersProvider } from "@/app/shared/hooks/useEthersProvider";
import { useEthersSigner } from "@/app/shared/hooks/useEthersSigner";
import usePosition, { RawPosition } from "@/app/shared/hooks/usePosition";
import { calculateFees } from "@/app/shared/utils/calculateFees";
import { TICK_SPACING } from "@/app/shared/utils/mathUtil";
import { Contract } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function Position() {
  const params = useParams();
  const tokenId = params.tokenId;
  const { address } = useAccount();
  const { position, loading, error, refetch: fetchPosition, tokenUrl, rawPosition, rawPool } = usePosition({ tokenId: Number(tokenId) });
  const [removing, setRemoving] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [showNFT, setShowNFT] = useState(false);
  const { chainConfig } = useGlobalContext();
  const provider = useEthersProvider();
  const router = useRouter();

  const signer = useEthersSigner();
  const fee0 = useMemo(
    () =>
      rawPool && rawPosition
        ? calculateFees(rawPool.feeGrowthGlobal0X128, rawPool.feeGrowthOutsideLower0X128, rawPool.feeGrowthOutsideUpper0X128, rawPosition.feeGrowthInside0LastX128, rawPosition.liquidity)
        : null,
    [rawPool, rawPosition]
  );
  const fee1 = useMemo(
    () =>
      rawPool && rawPosition
        ? calculateFees(rawPool.feeGrowthGlobal1X128, rawPool.feeGrowthOutsideLower1X128, rawPool.feeGrowthOutsideUpper1X128, rawPosition.feeGrowthInside1LastX128, rawPosition.liquidity)
        : null,
    [rawPool, rawPosition]
  );

  // lower and upper limits in the tick space for `feeAmount`
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: Number(rawPosition?.fee) ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACING[Number(rawPosition.fee)]) : undefined,
      [Bound.UPPER]: Number(rawPosition?.fee) ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACING[Number(rawPosition.fee)]) : undefined,
    }),
    [rawPosition]
  );
  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: Number(rawPosition?.fee) && position?.tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: Number(rawPosition?.fee) && position?.tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, position, rawPosition]
  );
  // FUNCTIONS
  const removeLiquidity = async () => {
    try {
      const nonfungiblePositionManagerWrite = new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, signer);
      const nonfungiblePositionManagerContract = new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, provider);
      setRemoving(true);
      // Approve the position manager if not already approved
      const approvedAddress = await nonfungiblePositionManagerContract.getApproved(tokenId);
      if (approvedAddress !== chainConfig?.contractAddresses?.positionManageAddress) {
        toast.info("Approving...");
        const approvalTx = await nonfungiblePositionManagerWrite.approve(chainConfig?.contractAddresses?.positionManageAddress, tokenId);
        await approvalTx.wait();
      }

      // Decrease liquidity
      let newRawPosition: RawPosition = null;
      if (BigInt(position.liquidity.toString()) > 0n) {
        toast.info("Decreasing liquidity...");
        const decreaseLiquidityParams = {
          tokenId: tokenId,
          liquidity: position.liquidity.toString(),
          amount0Min: 0,
          amount1Min: 0,
          deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
        };

        const decreaseLiquidityTx = await nonfungiblePositionManagerWrite.decreaseLiquidity(decreaseLiquidityParams);
        await decreaseLiquidityTx.wait();
        newRawPosition = await nonfungiblePositionManagerContract.positions(tokenId);
      }

      // collect all tokens to user address before burn
      const { tokensOwed0, tokensOwed1 } = newRawPosition || rawPosition;
      if (tokensOwed0 > 0n || tokensOwed1 > 0n) {
        toast.info("Collecting...");
        const collectTx = await nonfungiblePositionManagerWrite.collect({
          tokenId: tokenId,
          recipient: address,
          amount0Max: tokensOwed0,
          amount1Max: tokensOwed1,
        });
        await collectTx.wait();
      }

      const burnTx = await nonfungiblePositionManagerWrite.burn(tokenId);
      await burnTx.wait();

      toast.success("Position burned successfully!");
      router.push("/liquidity");
      fetchPosition();
    } catch (error: any) {
      if (error?.info?.error?.code == 4001) {
        toast.warn("User reject transaction!");
        return;
      }
      console.error("Error removing liquidity:", error);
      toast.error("Error removing liquidity");
      fetchPosition();
    } finally {
      setRemoving(false);
    }
  };

  const collect = async () => {
    if(fee0 === 0n && fee1 === 0n) {
      toast.warn("You don't have any fees to collect");
      return
    }
    try {
      const nonfungiblePositionManagerWrite = new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, signer);
      const nonfungiblePositionManagerContract = new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, provider);

      setCollecting(true);
      // Approve the position manager if not already approved
      const approvedAddress = await nonfungiblePositionManagerContract.getApproved(tokenId);
      if (approvedAddress !== chainConfig?.contractAddresses?.positionManageAddress) {
        toast.info("Approving...");
        const approvalTx = await nonfungiblePositionManagerWrite.approve(chainConfig?.contractAddresses?.positionManageAddress, tokenId);
        await approvalTx.wait();
      }

      // collect all tokens to user address before burn
      if (fee1 > 0n || fee0 > 0n) {
        const collectTx = await nonfungiblePositionManagerWrite.collect({
          tokenId: tokenId,
          recipient: address,
          amount0Max: fee0,
          amount1Max: fee1,
        });
        await collectTx.wait();
        toast.success("Fees collected successfully!");
        fetchPosition();
      } else {
        toast.warn("You don't have any fees to collect");
      }
    } catch (error: any) {
      if (error?.info?.error?.code == 4001) {
        toast.warn("User reject transaction!");
        return;
      }
      console.error("Error removing liquidity:", error);
      toast.error("Error removing liquidity");
      fetchPosition();
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px-102px)] lg:min-h-[calc(100vh-84px-64px)] px-[20px]">
      <div className="w-[854px] max-w-full">
        <Link href={"/liquidity"}>
          <div className="flex items-center gap-[8px] mb-[16px] mt-[16px] md:mt-0">
            <Image src="/icons/arrow-left-long.svg" width={14} height={8} alt="left"></Image>
            <span className="text-[#FFFFFF80] text-[14px] leading-[21px] font-semibold">Back to pool overview</span>
          </div>
        </Link>

        {!!!address ? (
          <div className="rounded-[12px] bg-[#111111] flex items-center justify-center min-h-[400px] border border-[#FFFFFF1F]">
            <div>
              <Image src={"/images/empty.png"} width={64} height={64} className="mb-[16px] mx-auto" alt="empty" />
              <div className="text-[#FFFFFF80] text-[14px] leading-[16px]">{"Connect to a wallet to view your position."}</div>
            </div>
          </div>
        ) : (loading || !position?.pool) ? (
          <div className="rounded-[12px] bg-[#111111] flex items-center justify-center min-h-[400px] border border-[#FFFFFF1F]">
            <div className="loading"></div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-[16px] md:items-center justify-between mb-[16px] flex-col md:flex-row ">
              <div className="flex items-center flex-nowrap">
                <Image src={position?.pool?.token1?.logoURI || "/icons/tokens/unknown-token.svg"} height={28} width={28} className="rounded-full" alt="token1" />
                <Image src={position?.pool?.token0?.logoURI || "/icons/tokens/unknown-token.svg"} height={28} width={28} className="rounded-full mr-[4px]" alt="token1" />
                <div className="whitespace-nowrap ml-[8px] text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] font-semibold text-[#FFFFFF]">
                  {position?.pool?.token1?.symbol} / {position?.pool?.token0?.symbol}
                </div>
                <div className="whitespace-nowrap ml-[8px] border border-[#C0A4FF] bg-[#311F58] text-white p-[4px_8px_4px_8px] text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold rounded-full">
                  {position?.pool?.fee / 10000}%
                </div>
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  className={
                    "bg-gradient-btn hover:opacity-80 bg-[#111111] h-[28px] lg:h-[28px] px-[17px] flex items-center gap-[6px] rounded-[6px] justify-center " +
                    (removing ? "!bg-[#262626] !text-[#FFFFFF80] cursor-not-allowed" : "")
                  }
                  disabled={removing}
                  onClick={() => removeLiquidity()}
                >
                  {removing && <span className="spinner-2"></span>}
                  <div className="text-white font-semibold text-[14px] leading-[18px]">Remove Position</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div className="rounded-[12px] bg-[#111111] flex items-center justify-center min-h-[421px] h-fit border border-[#FFFFFF1F]">
                {!!tokenUrl ? (
                  <Image src={tokenUrl} height={300} width={174} alt="nft-placeholder" className="hover:opacity-80 cursor-pointer" onClick={() => setShowNFT(true)} />
                ) : (
                  <Image src={"/images/nft-placeholder.png"} height={174} width={174} alt="nft-placeholder" />
                )}
              </div>

              <div>
                {/* Liquidity */}
                <div className="rounded-[12px] bg-[#111111] border border-[#FFFFFF1F] p-[16px] mb-[12px]">
                  <div className="flex items-center justify-between  mb-[16px]">
                    <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">Liquidity</div>
                  </div>
                  <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">
                    <div className="bg-[#FFFFFF0D] border border-[#FFFFFF1F] p-[12px] rounded-[8px]">
                      <div className="flex items-center justify-between mb-[12px]">
                        <div className="flex items-center gap-[8px]">
                          <Image src={position?.pool?.token1?.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position?.pool.token1.symbol}</div>
                        </div>
                        <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position?.amount1.toSignificant()}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[8px]">
                          <Image src={position?.pool.token0.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position?.pool.token0.symbol}</div>
                        </div>
                        <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position?.amount0.toSignificant()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unclaimed Fees */}
                <div className="rounded-[12px] bg-[#111111] border border-[#FFFFFF1F] p-[16px] mb-[12px]">
                  <div className="flex items-center justify-between  mb-[16px]">
                    <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">Unclaimed Fees</div>
                    <button
                      className={
                        "bg-gradient-btn hover:opacity-80 bg-[#111111] h-[28px] lg:h-[28px] px-[17px] flex items-center gap-[6px] rounded-[6px] justify-center " +
                        (collecting ? "!bg-[#262626] !text-[#FFFFFF80] cursor-not-allowed" : "")
                      }
                      disabled={collecting}
                      onClick={() => collect()}
                    >
                      {collecting && <span className="spinner-2"></span>}
                      <div className="text-white font-semibold text-[14px] leading-[18px]">Collect fees</div>
                    </button>
                  </div>
                  <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">
                    <div className="bg-[#FFFFFF0D] border border-[#FFFFFF1F] p-[12px] rounded-[8px]">
                      <div className="flex items-center justify-between mb-[12px]">
                        <div className="flex items-center gap-[8px]">
                          <Image src={position.pool.token1.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position.pool.token1.symbol}</div>
                        </div>
                        <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{formatUnits(fee1, position.pool.token1.decimals)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[8px]">
                          <Image src={position.pool.token0.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position.pool.token0.symbol}</div>
                        </div>
                        <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{formatUnits(fee0, position.pool.token0.decimals)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unclaimed Tokens */}
                {(rawPosition.tokensOwed0 > 0n || rawPosition.tokensOwed1 > 0n) && (
                  <div className="rounded-[12px] bg-[#111111] border border-[#FFFFFF1F] p-[16px] mb-[12px]">
                    <div className="flex items-center justify-between  mb-[16px]">
                      <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">Unclaimed Tokens</div>
                      <button
                        className={
                          "bg-gradient-btn hover:opacity-80 bg-[#111111] h-[28px] lg:h-[28px] px-[17px] flex items-center gap-[6px] rounded-[6px] justify-center " +
                          (collecting ? "!bg-[#262626] !text-[#FFFFFF80] cursor-not-allowed" : "")
                        }
                        disabled={collecting}
                        onClick={() => collect()}
                      >
                        {collecting && <span className="spinner-2"></span>}
                        <div className="text-white font-semibold text-[14px] leading-[18px]">Collect tokens</div>
                      </button>
                    </div>
                    <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">
                      <div className="bg-[#FFFFFF0D] border border-[#FFFFFF1F] p-[12px] rounded-[8px]">
                        <div className="flex items-center justify-between mb-[12px]">
                          <div className="flex items-center gap-[8px]">
                            <Image src={position.pool.token1.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                            <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position.pool.token1.symbol}</div>
                          </div>
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">
                            {formatUnits(rawPosition.tokensOwed1, position.pool.token1.decimals)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[8px]">
                            <Image src={position.pool.token0.logoURI || "/icons/tokens/unknown-token.svg"} height={16} width={16} className="rounded-full" alt="token1" />
                            <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">{position.pool.token0.symbol}</div>
                          </div>
                          <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-[#FFFFFFB2]">
                            {formatUnits(rawPosition.tokensOwed0, position.pool.token0.decimals)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="rounded-[12px] bg-[#111111] border border-[#FFFFFF1F] p-[16px] mb-[12px]">
                  <div className="flex items-center justify-between  mb-[16px]">
                    <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold text-white">Price Range</div>
                  </div>
                  <div className="flex items-center gap-[8px] mb-[16px] flex-col md:flex-row">
                    {/* Min price */}
                    <div className="bg-[#FFFFFF0D] border border-[#FFFFFF1F] p-[12px] rounded-[8px] flex-1 w-full md:w-fit">
                      <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center mb-[12px]">Min Price</div>
                      <div className="text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] font-semibold text-[#FFFFFF] text-center mb-[12px] text-nowrap">
                        {ticksAtLimit[Bound.LOWER] ? 0 : Number(position.token0PriceLower.toSignificant())}
                      </div>
                      <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center">
                        {position.pool.token1.symbol} per {position.pool.token0.symbol}
                      </div>
                    </div>
                    {/* icon */}
                    <Image src={"/icons/two-way-arrow.svg"} width={20} height={8} alt="two-way" className="rotate-90 md:!rotate-0" />
                    {/* Max price */}
                    <div className="bg-[#FFFFFF0D] border border-[#FFFFFF1F] p-[12px] rounded-[8px] flex-1 w-full md:w-fit">
                      <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center mb-[12px]">Max Price</div>
                      <div className="text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] font-semibold text-[#FFFFFF] text-center mb-[12px] text-nowrap">
                        {ticksAtLimit[Bound.UPPER] ? "∞" : Number(position.token0PriceUpper.toSignificant())}
                      </div>
                      <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center">
                        {position.pool.token1.symbol} per {position.pool.token0.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#311F58] border border-[#C0A4FF] p-[12px] rounded-[8px]">
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center mb-[12px]">Current Price on Pool</div>
                    <div className="text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] font-semibold text-[#FFFFFF] text-center mb-[12px]">
                      {tickToPrice(position.pool.token0, position.pool.token1, position.pool.tickCurrent).toSignificant()}
                    </div>
                    <div className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-semibold text-[#FFFFFFB2] text-center">
                      {position.pool.token1.symbol} per {position.pool.token0.symbol}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal show NFT */}
            {showNFT && (
              <>
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[99] bg-[rgba(0,0,0,0.8)] md:bg-[rgba(0,0,0,0.5)]" onClick={() => setShowNFT(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                  {!!tokenUrl ? (
                    <Image src={tokenUrl} height={689.64} width={440} alt="nft-placeholder" />
                  ) : (
                    <Image src={"/images/nft-placeholder.png"} height={500} width={500} alt="nft-placeholder" />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
