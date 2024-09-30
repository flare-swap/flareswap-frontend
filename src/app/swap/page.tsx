"use client";

import { debounce } from "lodash";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Token } from "../sdks/sdk-core";
import ActionButton from "../shared/components/ActionButton";
import TokenInputPanel from "../shared/components/TokenInputPanel";
import Tooltip from "../shared/components/Tooltip";
import TransactionSettingModal from "../shared/components/TransactionSettingModal";
import WalletOptions from "../shared/components/WalletOptions";
import { useGlobalContext } from "../shared/contexts/GlobalContext";
import { useModal } from "../shared/contexts/ModalContext";
import { useTokenBalances } from "../shared/hooks/useTokenBalances";
import { useTokenInputs } from "../shared/hooks/useTokenInputs";
import { useTokens } from "../shared/hooks/useTokens";
import { Helper } from "../shared/utils/helper";
import { useFindBestRoute } from "./hooks/useFindBestRoute";
import { useSwap } from "./hooks/useSwap";

export default function Swap() {
  const { address, isConnecting, isConnected } = useAccount();
  const { openModal, closeModal } = useModal();
  const { networkTokens, wToken, slippageTolerance, setSlippageTolerance, deadline, setDeadline } = useGlobalContext();
  const { tokens, setTokens } = useTokens(networkTokens); // tokens with additional custom token from user
  const { fromToken, toToken, setFromToken, setToToken, independentField, setIndependentField } = useTokenInputs(networkTokens);
  const { balances, fetchBalances } = useTokenBalances();
  const [showSetting, setShowSetting] = useState<boolean>(false);

  const [typedValue, setTypedValue] = useState("");
  const { findRoute, bestRoute, isLoading: finding, decodedPath, error: bestRouteError } = useFindBestRoute();

  const amountIn = useMemo(
    () => (fromToken && toToken && typedValue ? parseUnits(typedValue, independentField === "from" ? fromToken.decimals : toToken.decimals) : 0n),
    [typedValue, fromToken, toToken, independentField]
  );
  const outputValue = useMemo(
    () => (bestRoute && toToken && fromToken ? formatUnits(BigInt(bestRoute?.quotedAmountOut) || 0n, independentField === "from" ? toToken.decimals : fromToken.decimals) : "0"),
    [bestRoute, fromToken, toToken, independentField]
  );

  const insufficientBalance = useMemo(() => (fromToken && balances && amountIn ? balances[fromToken.address] < amountIn : false), [amountIn, balances, fromToken]);

  const { swap, loading: swapping, error } = useSwap();

  // EFFECTS
  useEffect(() => {
    if (!fromToken && !toToken) return;
    const arr = [fromToken, toToken].filter((i) => !!i);
    if (arr?.length) {
      fetchBalances(arr);
    }
  }, [fromToken, toToken, address]);

  const debouncedFindRoute = useCallback(
    debounce((fromToken: Token, toToken: Token, amount: bigint, wToken: Token, isExactInput: boolean) => {
      findRoute(fromToken, toToken, amount, wToken, isExactInput);
    }, 300),
    [findRoute]
  );

  useEffect(() => {
    if (!fromToken || !toToken) return;
    debouncedFindRoute(fromToken, toToken, amountIn, wToken, independentField === "from");

    return () => {
      debouncedFindRoute.cancel();
    };
  }, [fromToken, toToken, amountIn]);

  // FUNCTIONS
  const selectFromToken = (token: Token) => {
    if (!tokens.find((t) => token.address === t.address)) {
      setTokens([...tokens, token]);
    }
    if (token.address === toToken?.address) {
      setToToken(fromToken);
    }
    setFromToken(token);
    closeModal();
  };

  const selectToToken = (token: Token) => {
    if (!tokens.find((t) => token.address === t.address)) {
      setTokens([...tokens, token]);
    }
    if (token.address === fromToken?.address) {
      setFromToken(toToken);
    }
    setToToken(token);
    closeModal();
  };

  const switchToken = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSwap = useCallback(async (): Promise<void> => {
    if (!fromToken || !toToken || !typedValue || !bestRoute) {
      toast.error("Invalid swap parameters");
      return;
    }

    try {
      const recept = await swap(fromToken, toToken, wToken, typedValue, slippageTolerance, deadline, bestRoute);
      if (recept) {
        toast.success(`Swap successful!`);
        // Reset input or update balances here
        setTypedValue("");
        fetchBalances([fromToken, toToken]);
      }
    } catch (error: any) {
      if (error?.info?.error?.code == 4001) {
        toast.warn("User reject transaction!");
        return;
      }
      console.error("Swap failed:", error);
      toast.error("Swap failed. Please try again.");
    }
  }, [fromToken, toToken, typedValue, outputValue, independentField, slippageTolerance, deadline, bestRoute, swap, fetchBalances]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px-102px)] lg:min-h-[calc(100vh-84px-64px)] px-[20px]">
      <div className="w-[436px] p-[12px] md:p-[24px] border border-[#FFFFFF1F] rounded-[12px] md:rounded-[16px] bg-black-100 max-w-full">
        <div className="flex items-center justify-between mb-[8px]">
          <div className="text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] text-white font-semibold">Swap</div>
          <span className="relative">
            <div className="relative w-[24px] h-[24px] md:min-w-[32px] md:h-[32px]">
              <Image quality={100} src={"/icons/settings.svg"} alt="low-fees" fill sizes="(max-width: 767px) 32px, 32px" className="object-contain" onClick={() => setShowSetting(true)} />
            </div>
            {showSetting && (
              <>
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[99] bg-[rgba(0,0,0,0.8)] md:bg-[rgba(0,0,0,0.5)]" onClick={() => setShowSetting(false)}></div>
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:absolute md:top-[50px] md:left-[-100px] z-[100]">
                  <TransactionSettingModal slippage={slippageTolerance} setSlippage={setSlippageTolerance} deadline={deadline} setDeadline={setDeadline} />
                </div>
              </>
            )}
          </span>
        </div>

        <div className="text-[#FFFFFF80] text-[10px] leading-[10px] md:text-[14px] md:leading-[14px] mb-[12px] md:mb-[24px]">Easy way to trade your tokens</div>
        <TokenInputPanel
          label="From"
          tokens={tokens}
          amount={independentField === "from" ? typedValue : outputValue + ""}
          token={fromToken}
          balance={balances[fromToken?.address]}
          disabled={false}
          locked={false}
          showMax={true}
          onFocus={() => setIndependentField("from")}
          onAmountChange={(v) => {
            if (independentField === "from") {
              setTypedValue(v);
            }
          }}
          onTokenChange={selectFromToken}
        />
        {/* Switch button */}
        <button
          className="my-[10px] md:my-[16px] bg-[rgba(255,255,255,0.06)] hover:bg-[#372f47] rounded-[8px] w-[24px] h-[24px] md:w-[32px] md:h-[32px] mx-auto flex items-center justify-center cursor-pointer duration-200 group relative"
          onClick={switchToken}
        >
          <Image className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block rotate-in" src="/icons/up-down.svg" width={20} height={20} alt="swap" />
          <Image className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block group-hover:hidden rotate-out" src="/icons/arrow-down.svg" width={16} height={17} alt="to" />
        </button>
        {/* Switch button */}
        <TokenInputPanel
          label="To"
          tokens={tokens}
          amount={independentField === "to" ? typedValue : outputValue + ""}
          token={toToken}
          balance={balances[toToken?.address]}
          disabled={finding}
          disabledInput={true}
          locked={false}
          showMax={false}
          onFocus={() => setIndependentField("to")}
          onAmountChange={(v) => {
            if (independentField === "to") {
              setTypedValue(v);
            }
          }}
          onTokenChange={selectToToken}
        />

        <div className="pt-[12px] md:pt-[24px]"></div>

        {/* SWAP BUTTON */}
        <ActionButton
          isLoading={isConnecting || swapping}
          loadingText={isConnecting ? "Connecting Wallet" : swapping ? "Swapping..." : "Loading..."}
          disabled={isConnecting || finding || swapping || !typedValue || !bestRoute || (balances[fromToken?.address] < amountIn && !!address) || ((bestRouteError === "NO_PATH_AVAILABLE") && !!address)}
          onClick={address ? () => handleSwap() : () => openModal(<WalletOptions />)}
        >
          {!address
            ? "Connect Wallet"
            : !typedValue
            ? "Enter an amount"
            : insufficientBalance
            ? `Insufficient ${fromToken?.symbol} Balance`
            : bestRouteError === "NO_PATH_AVAILABLE"
            ? "No Liquidity Available"
            : "Swap"}
        </ActionButton>

        {/* SWAP DETAILS */}
        {bestRoute && !Helper.checkNativePair(fromToken, toToken, wToken) && (
          <div className="pt-[18px] md:pt-[24px]">
            <div className="flex justify-between text-[#FFFFFF] text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] mb-[4px] md:mb-[8px]">
              <div className="flex items-center gap-[4px]">
                <div>Minimum received</div>
                <Tooltip text={"Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."} />
              </div>
              <div className="text-[10px] md:text-[13px] font-medium">
                {Number(outputValue) * (1 - slippageTolerance / 100)} {toToken.symbol}
              </div>
            </div>

            <div className="flex justify-between text-[#FFFFFF] text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] mb-[4px] md:mb-[8px]">
              <div className="flex items-center gap-[4px]">
                <div>Max. slippage</div>
                <Tooltip text={"The maximum price movement before your transaction will revert."} />
              </div>
              <div className="text-[10px] md:text-[13px] font-medium">{slippageTolerance}%</div>
            </div>

            <div className="flex justify-between text-[#FFFFFF] text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] mb-[4px] md:mb-[8px]">
              <div className="flex items-center gap-[4px]">
                <div>Trading fee</div>
                <Tooltip>
                  <strong>AMM:</strong> Fee ranging from 0.1% to 0.01% depending on the pool fee tier.
                  <br />
                  <br />
                  <strong>MM:</strong> FlareSwap does not charge any fees for trades. However, the market makers charge an implied fee of 0.05% - 0.25% (non-stablecoin) / 0.01% (stablecoin) factored
                  into the quotes provided by them.
                </Tooltip>
              </div>
              <div className="text-[10px] md:text-[13px] font-medium">
                {Helper.calculateTradingFee(decodedPath, typedValue, independentField === "from" ? fromToken?.decimals : toToken?.decimals)}{" "}
                {independentField === "from" ? fromToken?.symbol : toToken?.symbol}
              </div>
            </div>

            <div className="flex justify-between text-[#FFFFFF] text-[10px] leading-[12px] md:text-[12px] md:leading-[14px]">
              <div className="flex items-center gap-[4px]">
                <div>Route</div>
                <Tooltip text={"Route is automatically calculated based on your routing preference to achieve the best price for your trade."} />
              </div>
              <div className="flex items-center gap-[4px]">
                {decodedPath?.tokenAddresses?.map((address: string, index: number) => (
                  <div className="flex items-center gap-[4px]" key={address}>
                    <div className="text-[10px] md:text-[13px] font-medium">{tokens?.find((t) => t.address.toLocaleLowerCase() === address.toLocaleLowerCase())?.symbol}</div>
                    {index <= decodedPath?.tokenAddresses?.length - 2 && <Image src="/icons/arrow-right.svg" width={5} height={5} alt="info" className="cursor-pointer" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
