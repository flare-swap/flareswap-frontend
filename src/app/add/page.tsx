"use client";

import { encodeSqrtRatioX96, nearestUsableTick, Pool, Position, priceToClosestTick, TickMath, tickToPrice } from "@/app/sdks/v3-sdk";
import { Bound } from "@/app/shared/enums/bound";
import { parseUnits } from "ethers";
import JSBI from "jsbi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useChainId } from "wagmi";
import { Price, Token } from "../sdks/sdk-core";
import { Q192 } from "../sdks/utils/internalConstants";
import ActionButton from "../shared/components/ActionButton";
import PriceInputPanel from "../shared/components/PriceInputPanel";
import TokenInputPanel from "../shared/components/TokenInputPanel";
import TokenSelect from "../shared/components/TokenSelect";
import TransactionSettingModal from "../shared/components/TransactionSettingModal";
import WalletOptions from "../shared/components/WalletOptions";
import { useGlobalContext } from "../shared/contexts/GlobalContext";
import { useModal } from "../shared/contexts/ModalContext";
import { useAddLiquidity } from "../shared/hooks/useAddLiquidity";
import { useCreatePool } from "../shared/hooks/useCreatePool";
import { usePool } from "../shared/hooks/usePool";
import { useRangeHopCallbacks } from "../shared/hooks/useRangeHopCallbacks";
import { useTokenApproval } from "../shared/hooks/useTokenApproval";
import { useTokenBalances } from "../shared/hooks/useTokenBalances";
import { useTokenInputs } from "../shared/hooks/useTokenInputs";
import { useTokens } from "../shared/hooks/useTokens";
import { getTickToPrice } from "../shared/utils/getTickToPrice";
import { Helper } from "../shared/utils/helper";
import { TICK_SPACING } from "../shared/utils/mathUtil";
import { tryParseTick } from "../shared/utils/tryParseTick";
import InitialPrice from "./components/InitialPrice";
import SelectFeeTier from "./components/SelectFeeTier";
import Warning from "./components/Warning";

export default function Add() {
  const router = useRouter();
  const { address, isConnecting, isConnected } = useAccount();
  const chainId = useChainId();
  const { openModal, closeModal } = useModal();
  const { networkTokens, wToken, slippageTolerance, setSlippageTolerance, deadline, setDeadline } = useGlobalContext();
  const { tokens, setTokens } = useTokens(networkTokens); // tokens with additional custom token from user
  const { fromToken, toToken, fromAmount, toAmount, setFromToken, setToToken, setFromAmount, setToAmount, independentField, setIndependentField } = useTokenInputs(networkTokens);
  const { token0, token1 } = useMemo(() => Helper.getPairToken(fromToken, toToken, wToken), [fromToken, toToken, wToken]);

  const { balances, fetchBalances } = useTokenBalances();
  const { addLiquidity, isAdding } = useAddLiquidity();
  const { createAndInitializePool, isCreating, isInitializing } = useCreatePool();

  const invertPrice = useMemo(() => token0?.address === toToken?.address, [toToken, token0]);

  // LOCAL STATES
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [feeTier, setFeeTier] = useState<number | null>(null);
  const [price, setPrice] = useState<string | null>(null); // price token1/token0
  const [minPrice, setMinPrice] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string | null>(null);
  const { poolData, isFetchingPoolData, fetchPoolData, errorFetchingPoolData } = usePool(token0, token1, feeTier);
  const {
    isApproved: fromTokenIsApproved,
    isApproving: fromTokenIsApproving,
    approve: fromTokenApprove,
    checkAllowance: fromTokenCheckAllowance,
    isFetchingAllowance: fromTokenIsFetchingAllowance,
  } = useTokenApproval(!invertPrice ? token0: token1, !invertPrice ? fromAmount : toAmount);

  const {
    isApproved: toTokenIsApproved,
    isApproving: toTokenIsApproving,
    approve: toTokenApprove,
    checkAllowance: toTokenCheckAllowance,
    isFetchingAllowance: toTokenIsFetchingAllowance,
  } = useTokenApproval(toToken, invertPrice ? fromAmount : toAmount);

  const isExistAmount = useMemo(() => Number(fromAmount) && Number(toAmount), [toAmount, fromAmount]);

  const insufficientFromBalance = useMemo(() => {
    if (!fromAmount || !fromToken || !balances) {
      return false;
    }
    return parseUnits(fromAmount, fromToken?.decimals) > balances?.[fromToken?.address];
  }, [fromAmount, fromToken, balances]);

  const insufficientToBalance = useMemo(() => {
    if (!toAmount || !toToken || !balances) {
      return false;
    }
    return parseUnits(toAmount, toToken?.decimals) > balances?.[toToken?.address];
  }, [toAmount, toToken, balances]);

  const showFromApprovalBtn = useMemo(
    () => !!address && isExistAmount && !!!fromTokenIsApproved && !!!fromTokenIsFetchingAllowance && !!!insufficientFromBalance,
    [isExistAmount, fromTokenIsApproved, fromTokenIsFetchingAllowance, insufficientFromBalance]
  );
  const showToApprovalBtn = useMemo(
    () => !!address && isExistAmount && !!!toTokenIsApproved && !!!toTokenIsFetchingAllowance && !!!insufficientToBalance,
    [isExistAmount, toTokenIsApproved, toTokenIsFetchingAllowance, insufficientToBalance]
  );

  const invalidPair = useMemo(() => Helper.checkNativePair(fromToken, toToken, wToken), [fromToken, toToken, wToken]);

  const nativeCurrencyDetected = useMemo(() => {
    if (!fromToken?.isNative && !toToken?.isNative) return null;
    if (fromToken?.isNative) return !invertPrice ? "token0" : "token1";
    if (toToken?.isNative) return invertPrice ? "token0" : "token1";
    return null;
  }, [fromToken, toToken, token0, invertPrice]);

  const disablePriceRange = useMemo(() => !address || isFetchingPoolData || !feeTier || !poolData?.isInitialized, [isFetchingPoolData, feeTier, address, price, poolData]);

  const priceModel: Price<Token, Token> | undefined = useMemo(() => {
    if (!poolData?.liquidity) {
      const parsedQuoteAmount = Helper.tryParseCurrencyAmount(price, token1);
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = Helper.tryParseCurrencyAmount("1", token0);
        const p = baseAmount && parsedQuoteAmount ? new Price(baseAmount.currency, parsedQuoteAmount.currency, baseAmount.quotient, parsedQuoteAmount.quotient) : undefined;
        return p ?? undefined;
      }
      return undefined;
    } else {
      const sqrtPriceX96: JSBI = JSBI.BigInt(poolData.sqrtPriceX96.toString());
      const token0Price = new Price(token0, token1, Q192, JSBI.multiply(sqrtPriceX96, sqrtPriceX96));
      return poolData && token0 ? token0Price : undefined;
    }
  }, [poolData, price, token0, token1]);

  const currentSqrt = useMemo(
    () => (priceModel && !invalidPair && !(token0?.chainId !== chainId || token1?.chainId !== chainId) ? encodeSqrtRatioX96(priceModel.numerator, priceModel.denominator) : undefined),
    [priceModel, invalidPair, token0, token1]
  );
  const currentTick = useMemo(
    () => (priceModel && !invalidPair && !(token0?.chainId !== chainId || token1?.chainId !== chainId) ? priceToClosestTick(priceModel) : undefined),
    [priceModel, invalidPair, token0, token1]
  );

  const mockPool = useMemo(() => {
    if (Helper.isNotEmpty(currentTick) && Helper.isNotEmpty(currentSqrt) && !invalidPair && feeTier) {
      return new Pool(token0, token1, feeTier, currentSqrt, JSBI.BigInt(0), currentTick, []);
    } else {
      return undefined;
    }
  }, [feeTier, token0, token1, currentTick, currentSqrt, invalidPair]);

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = poolData?.pool ?? mockPool;

  // lower and upper limits in the tick space for `feeAmount`
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: feeTier ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACING[feeTier]) : undefined,
      [Bound.UPPER]: feeTier ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACING[feeTier]) : undefined,
    }),
    [feeTier]
  );
  // ticks
  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]: tryParseTick(token0, token1, feeTier, minPrice),
      [Bound.UPPER]: tryParseTick(token0, token1, feeTier, maxPrice),
    };
  }, [token0, token1, feeTier, minPrice, maxPrice]);
  // tickLower / tickUpper
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {};
  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeTier && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeTier && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeTier]
  );
  // invalidRange
  const invalidRange = Boolean(typeof tickLower === "number" && typeof tickUpper === "number" && tickLower >= tickUpper);

  // Price by ticks
  const pricesAtLimit = useMemo(() => {
    if (token0?.address === token1?.address) {
      return {
        [Bound.LOWER]: null,
        [Bound.UPPER]: null,
      };
    }
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    };
  }, [token0, token1, tickSpaceLimits?.LOWER, tickSpaceLimits?.UPPER]);
  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    if (token0?.address === token1?.address) {
      return {
        [Bound.LOWER]: null,
        [Bound.UPPER]: null,
      };
    }
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    };
  }, [token0, token1, ticks]);
  // lowerPrice // upperPrice
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks;
  // liquidity range warning
  const outOfRange = Boolean(priceModel && lowerPrice && upperPrice && (priceModel.lessThan(lowerPrice) || priceModel.greaterThan(upperPrice)));

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(typeof tickUpper === "number" && poolForPosition && poolForPosition.tickCurrent >= tickUpper);
  const deposit1Disabled = Boolean(typeof tickLower === "number" && poolForPosition && poolForPosition.tickCurrent <= tickLower);

  const depositADisabled = invalidRange || Boolean(deposit0Disabled && !invertPrice) || Boolean(deposit1Disabled && invertPrice);
  const depositBDisabled = invalidRange || Boolean(deposit1Disabled && !invertPrice) || Boolean(deposit0Disabled && invertPrice);
  const isSingleSidePosition = useMemo(
    () => outOfRange && ((depositADisabled && Boolean(toAmount)) || (depositBDisabled && Boolean(fromAmount))),
    [outOfRange, depositADisabled, toAmount, depositBDisabled, fromAmount]
  );

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(token0 ?? undefined, token1 ?? undefined, feeTier, tickLower, tickUpper, poolForPosition);

  // EFFECTS
  useEffect(() => {
    if (!token0 || !token1 || token0?.chainId !== chainId || token1?.chainId !== chainId) return;
    fetchBalances([token0, token1]);
  }, [address, chainId, token0, token1]);

  useEffect(() => {
    clearAll();
  }, [chainId]);

  useEffect(() => {
    if (!fromToken || !toToken || !tickLower || !tickUpper || !poolForPosition || tickLower >= tickUpper) return;

    if (independentField === "from") {
      const v = fromAmount;
      if (!v) {
        setToAmount("0");
        return;
      }
      if (!invertPrice) {
        const amount0 = JSBI.BigInt(parseUnits(v || "0", fromToken.decimals).toString());
        const singleSidePosition = Position.fromAmount0({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount0,
          useFullPrecision: true,
        });
        setToAmount(singleSidePosition.amount1.toSignificant(8));
      }
      if (invertPrice) {
        const amount1 = JSBI.BigInt(parseUnits(v || "0", fromToken.decimals).toString());
        const singleSidePosition = Position.fromAmount1({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount1,
        });
        setToAmount(singleSidePosition.amount0.toSignificant(8));
      }
    }
    if (independentField === "to") {
      const v = toAmount;
      if (!v) {
        setFromAmount("0");
        return;
      }
      if (invertPrice) {
        const amount0 = JSBI.BigInt(parseUnits(v || "0", toToken.decimals).toString());
        const singleSidePosition = Position.fromAmount0({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount0,
          useFullPrecision: true,
        });
        setFromAmount(singleSidePosition.amount1.toSignificant(8));
      }
      if (!invertPrice) {
        const amount1 = JSBI.BigInt(parseUnits(v || "0", toToken.decimals).toString());
        const singleSidePosition = Position.fromAmount1({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount1,
        });
        setFromAmount(singleSidePosition.amount0.toSignificant(8));
      }
    }
  }, [invertPrice, fromAmount, toAmount, fromToken, toToken, tickLower, tickUpper, poolForPosition]);

  // FUNCTIONS
  const selectFromToken = (token: Token) => {
    if (Helper.checkNativePair(token, toToken, wToken)) {
      setFeeTier(null);
      clearAll();
    }
    setTimeout(() => {
      if (!tokens.find((t) => token.address === t.address)) {
        setTokens([...tokens, token]);
      }
      if (token.address === toToken?.address) {
        setToToken(fromToken);
      }
      setFromToken(token);
      closeModal();
    });
  };

  const selectToToken = (token: Token) => {
    if (Helper.checkNativePair(token, fromToken, wToken)) {
      setFeeTier(null);
      clearAll();
    }
    setTimeout(() => {
      if (!tokens.find((t) => token.address === t.address)) {
        setTokens([...tokens, token]);
      }
      if (token.address === fromToken?.address) {
        setFromToken(toToken);
      }
      setToToken(token);
      closeModal();
    });
  };

  const clearAll = () => {
    setFeeTier(null);
    setFromAmount("");
    setToAmount("");
    setMinPrice("");
    setMaxPrice("");
    setPrice("");
  };

  const setPriceRangeByPercentage = (percentage: number) => {
    if (percentage === 100) {
      setMinPrice(pricesAtLimit[Bound.LOWER].toSignificant());
      setMaxPrice(pricesAtLimit[Bound.UPPER].toSignificant());
      return;
    }
    const currentPrice = poolData?.tick ? tickToPrice(token0, token1, poolData?.tick)?.toSignificant() : price;
    const newLowerPrice = Number(currentPrice) * (1 - percentage / 100);
    const nearestLowerUsableTick = nearestUsableTick(tryParseTick(token0, token1, feeTier, String(newLowerPrice)), TICK_SPACING[feeTier]);
    const newMinPrice = getTickToPrice(token0, token1, nearestLowerUsableTick);
    setMinPrice(newMinPrice.toSignificant());

    const rangeTick = (poolData?.tick ? poolData?.tick : currentTick) - nearestLowerUsableTick;
    const nearestUpperUsableTick = nearestUsableTick(Math.abs(rangeTick) + (poolData?.tick ? poolData?.tick : currentTick), TICK_SPACING[feeTier]);
    const newMaxPrice = getTickToPrice(token0, token1, nearestUpperUsableTick);
    setMaxPrice(newMaxPrice.toSignificant());
  };

  const getSubmitBtnText = () => {
    if (invalidPair) {
      return "Invalid pair";
    }
    if (!poolData?.address) {
      return `Create Pool`;
    }
    if (!poolData?.isInitialized) {
      return `Initialize Pool`;
    }
    if (invalidRange) {
      return "Invalid price range";
    }
    if (insufficientFromBalance) {
      return `Insufficient ${fromToken?.symbol} balance`;
    }
    if (insufficientToBalance) {
      return `Insufficient ${toToken?.symbol} balance`;
    }
    if (isSingleSidePosition) {
      if (depositADisabled && !toAmount) {
        return "Enter an amount";
      }
      if (depositBDisabled && !fromAmount) {
        return "Enter an amount";
      }
      return "Add single side position";
    }
    if (!Number(fromAmount) || !Number(toAmount)) {
      return "Enter an amount";
    }
    return "Add";
  };

  const handleSubmit = async () => {
    if (!poolData?.isInitialized && priceModel) {
      await createAndInitializePool(mockPool);
      await fetchPoolData();
    }
    if (poolData?.isInitialized && poolData?.token0 && fromToken && toToken && fromAmount && toAmount) {
      const token0Amount = !invertPrice ? fromAmount : toAmount;
      const token1Amount = !invertPrice ? toAmount : fromAmount;
      try {
        await addLiquidity(
          token0Amount,
          token1Amount,
          poolData,
          nearestUsableTick(tickLower, TICK_SPACING[feeTier]),
          nearestUsableTick(tickUpper, TICK_SPACING[feeTier]),
          deadline,
          slippageTolerance,
          nativeCurrencyDetected,
          isSingleSidePosition,
          deposit0Disabled,
          deposit1Disabled
        );
        toast.success("Liquidity added successfully!");
        router.push("/liquidity");
      } catch (e: any) {
        if (e?.info?.error?.code == 4001) {
          toast.warn("User reject transaction!");
          return;
        }
        toast.error(e?.shortMessage || "Liquidity added failed!");
        console.error(`Error: `, JSON.stringify(e));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px-102px)] lg:min-h-[calc(100vh-84px-64px)] px-[20px] my-[24px] md:my-0">
      <div className="w-[614px] p-[12px] md:p-[24px] border border-[#FFFFFF1F] rounded-[16px] bg-black-100 max-w-full">
        {/* TITLE */}
        <div className="flex justify-between items-center mb-[24px] relative">
          <Link href={"/liquidity"} className="leading-[14.53px]">
            <div className="relative w-[16px] h-[12px] md:min-w-[20] md:h-[14.53]">
              <Image quality={100} src={"/icons/arrow-left-long.svg"} alt="low-fees" fill sizes="(max-width: 767px) 20px, 14.53" className="object-contain" />
            </div>
          </Link>
          <div className="text-[16px] leading-[16px] md:text-[20px] md:leading-[20px] text-white font-semibold absolute top-[6px] md:top-[8px] left-1/2 -translate-x-1/2">Add Liquidity</div>
          <div className="flex items-center gap-[8px]">
            <span className="hover:opacity-80 underline underline-offset-2 text-[#C0A4FF] text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] font-semibold cursor-pointer" onClick={clearAll}>
              Clear All
            </span>
            <span className="relative">
              <div className="relative w-[24px] h-[24px] md:min-w-[32px] md:h-[32px]">
                <Image quality={100} src={"/icons/settings.svg"} alt="low-fees" fill sizes="(max-width: 767px) 32px, 32px" className="object-contain" onClick={() => setShowSetting(true)} />
              </div>
              {showSetting && (
                <>
                  <div className="fixed top-0 left-0 right-0 bottom-0 z-[99] md:bg-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.8)]" onClick={() => setShowSetting(false)}></div>
                  <div className="absolute top-[50px] left-[-100px] z-[100]">
                    <TransactionSettingModal slippage={slippageTolerance} setSlippage={setSlippageTolerance} deadline={deadline} setDeadline={setDeadline} />
                  </div>
                </>
              )}
            </span>
          </div>
        </div>

        {/* SELECT PAIR */}
        <div
          className={
            "grid grid-cols-2 gap-[8px] md:gap-[12px] border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] mb-[12px] " +
            (!fromToken || !toToken || !address ? "opacity-50 pointer-events-none" : "")
          }
        >
          <div className="col-span-2 text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-white">Select pair</div>
          <TokenSelect tokens={tokens} token={fromToken} onTokenChange={selectFromToken} />
          <TokenSelect tokens={tokens} token={toToken} onTokenChange={selectToToken} />
        </div>

        {invalidPair && (
          <div className="my-[12px] text-[#d67e0a] border border-[#d67e0a] rounded-[12px] p-[12px] flex items-center bg-[#d67e0a50] gap-[8px] md:gap-[12px]">
            <Image src="/icons/warning.svg" width={20} height={20} alt="warning" />
            <p className="text-[12px] leading-[12px] lg:text-[12px] lg:leading-[14px]">Invalid pair</p>
          </div>
        )}

        <SelectFeeTier
          feeTier={feeTier}
          setFeeTier={(fee) => {
            clearAll();
            setTimeout(() => setFeeTier(fee));
          }}
          disabled={!address || !fromToken || !toToken || invalidPair}
        />

        {/* INITIALIZED POOL & PRICE  */}
        {(errorFetchingPoolData || (!poolData?.isInitialized && poolData)) && address && (
          <InitialPrice token0={token0} token1={token1} startingPrice={price} setStartingPrice={setPrice} onBlur={() => {}} />
        )}
        {poolData?.isInitialized && poolData && feeTier && (
          <div
            className={"flex items-center justify-between border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] mt-[12px] " + (disablePriceRange ? "opacity-50 pointer-events-none" : "")}
          >
            <div className="text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-white">Current price:</div>
            <div className="flex items-center gap-[8px]">
              <div className="text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] font-semibold text-[#C0A4FF]">
                {!invalidPair && !(token0?.chainId !== chainId || token1?.chainId !== chainId) ? tickToPrice(token0, token1, poolData.tick).toSignificant() : "--"}
              </div>
              <div className="text-[12px] leading-[14px] font-semibold text-[#C0A4FF]">
                {token1.symbol} / {token0.symbol}
              </div>
            </div>
          </div>
        )}

        {/* PRICE RANGE */}
        <div className={"border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] mt-[12px] " + (disablePriceRange ? "opacity-50 pointer-events-none" : "")}>
          <div className="col-span-2 text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-white mb-[16px]">Set price range</div>
          <div className="flex gap-[8px] md:gap-[12px] flex-col md:flex-row">
            <PriceInputPanel
              label="Min price"
              amount={minPrice}
              feeTier={feeTier}
              onAmountChange={setMinPrice}
              token0={token0}
              token1={token1}
              tick={tickLower}
              onDecrease={() => setMinPrice(getDecrementLower())}
              onIncrease={() => setMinPrice(getIncrementLower())}
              isZero={ticksAtLimit[Bound.LOWER]}
            />
            <PriceInputPanel
              label="Max price"
              amount={maxPrice}
              feeTier={feeTier}
              onAmountChange={setMaxPrice}
              token0={token0}
              token1={token1}
              tick={tickUpper}
              onDecrease={() => setMaxPrice(getDecrementUpper())}
              onIncrease={() => setMaxPrice(getIncrementUpper())}
              isInfinite={ticksAtLimit[Bound.UPPER]}
            />
          </div>
          <div className="grid grid-cols-5 gap-[8px] mt-[16px]">
            {[10, 20, 50, 100].map((percentage) => (
              <button
                key={percentage}
                className={`h-[28px] md:h-[32px] flex items-center justify-center rounded-[99px] font-semibold text-[12px] md:text-[14px] border-[2px] border-[#C0A4FF] hover:bg-[#311F58] text-[#C0A4FF] ${
                  percentage === 100 ? " col-span-2" : ""
                }`}
                onClick={() => setPriceRangeByPercentage(percentage)}
              >
                {percentage !== 100 ? percentage + "%" : "Full range"}
              </button>
            ))}
          </div>
        </div>

        {outOfRange && <Warning text={"Your position will not earn fees or be used in trades until the market price moves into your range."} />}
        {invalidRange && <Warning text={"Invalid range selected. The min price must be lower than the max price."} />}

        <div
          className={
            "border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] mt-[12px] " +
            (Boolean(!address) || Boolean(!feeTier) || (errorFetchingPoolData && !Number(price)) || Number(minPrice) >= Number(maxPrice) || !minPrice || !maxPrice
              ? "opacity-50 pointer-events-none"
              : "")
          }
        >
          <div className="col-span-2 text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-white mb-[16px]">Deposit amounts</div>

          <TokenInputPanel
            tokens={tokens}
            amount={fromAmount}
            token={fromToken}
            balance={balances[fromToken?.address]}
            disabled={depositADisabled}
            disabledSelectToken={true}
            locked={depositADisabled}
            showMax={true}
            onFocus={() => setIndependentField("from")}
            onAmountChange={(v) => setFromAmount(v)}
            onTokenChange={selectFromToken}
          />
          <div className="pt-[12px]" />
          <TokenInputPanel
            tokens={tokens}
            amount={toAmount}
            token={toToken}
            balance={balances[toToken?.address]}
            disabled={depositBDisabled}
            disabledSelectToken={true}
            locked={depositBDisabled}
            showMax={true}
            onFocus={() => setIndependentField("to")}
            onAmountChange={(v) => setToAmount(v)}
            onTokenChange={selectToToken}
          />
        </div>

        <div className="pt-[16px]"></div>
        <div className="flex flex-col gap-[8px]">
          {Boolean(showFromApprovalBtn) && (
            <ActionButton
              disabled={fromTokenIsApproving}
              isLoading={fromTokenIsApproving}
              loadingText={"Approving..."}
              onClick={async () => {
                await fromTokenApprove();
                await fromTokenCheckAllowance();
              }}
            >
              Enable {fromToken?.isNative ? wToken.symbol : fromToken?.symbol}
            </ActionButton>
          )}
          {Boolean(showToApprovalBtn) && (
            <ActionButton
              disabled={toTokenIsApproving}
              isLoading={toTokenIsApproving}
              loadingText={"Approving..."}
              onClick={async () => {
                await toTokenApprove();
                await toTokenCheckAllowance();
              }}
            >
              Enable {toToken?.isNative ? wToken.symbol : toToken?.symbol}
            </ActionButton>
          )}
          {!!!address ? (
            <ActionButton isLoading={isConnecting} loadingText="Connecting Wallet" onClick={() => openModal(<WalletOptions />)}>
              Connect Wallet
            </ActionButton>
          ) : price && !poolData?.pool ? (
            <ActionButton
              disabled={isInitializing || isCreating || invalidPair}
              isLoading={isCreating || isInitializing}
              loadingText={isInitializing ? "Initializing pool..." : isCreating ? "Creating pool..." : "Loading..."}
              onClick={handleSubmit}
            >
              {getSubmitBtnText()}
            </ActionButton>
          ) : (
            <ActionButton
              disabled={
                showFromApprovalBtn ||
                showToApprovalBtn ||
                invalidPair ||
                invalidRange ||
                (isSingleSidePosition && depositADisabled && !Number(toAmount)) ||
                (isSingleSidePosition && depositBDisabled && !Number(fromAmount)) ||
                (!isSingleSidePosition && (!Number(fromAmount) || !Number(toAmount))) ||
                insufficientFromBalance ||
                insufficientToBalance
              }
              isLoading={isCreating || isAdding || isInitializing}
              loadingText={isAdding ? "Adding liquidity..." : isInitializing ? "Initializing pool..." : isCreating ? "Creating pool..." : "Loading..."}
              onClick={handleSubmit}
            >
              {getSubmitBtnText()}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
