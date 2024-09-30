import { Token } from "@/app/sdks/sdk-core";
import { useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import axios from "axios";
import { parseUnits } from "@ethersproject/units";
import { DecodedPath, Helper } from "@/app/shared/utils/helper";

export interface PathQuote {
  path: string;
  quotedAmountOut: string;
  // priceImpact: string;
  estimatedGasUsed: string;
  sqrtPriceX96AfterList: string[] | null;
  initializedTicksCrossedList: string[] | null;
}

export function useFindBestRoute() {
  const chainId = useChainId();
  const [bestRoute, setBestRoute] = useState<PathQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const decodedPath: DecodedPath = useMemo(() => (bestRoute?.path ? Helper.decodePath(bestRoute?.path) : null), [bestRoute]);

  const findRoute = async (tokenA: Token, tokenB: Token, amountIn: bigint, wToken: Token, isExactInput: boolean): Promise<void> => {
    console.log("Find route called");
    setIsLoading(true);
    setError(null);

    if(amountIn === 0n) {
      setBestRoute(null);
      setIsLoading(false);
      return 
    }

    if(Helper.checkNativePair(tokenA, tokenB, wToken)) {
      setBestRoute({
        path: "",
        quotedAmountOut: amountIn?.toString(),
        estimatedGasUsed: "210000",
        sqrtPriceX96AfterList: null,
        initializedTicksCrossedList: null
      })
      setIsLoading(false);
      return 
    }

    const tokenAMapped = tokenA?.isNative ? wToken : tokenA;
    const tokenBMapped = tokenB?.isNative ? wToken : tokenB;

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/swap-path-generator/quote`, {
        params: {
          chainId,
          tokenA: tokenAMapped.address,
          tokenB: tokenBMapped.address,
          amountIn,
        },
      });
      const quotedPaths = response?.data?.quotedPaths;
      if (!quotedPaths?.length) {
        setError("NO_PATH_AVAILABLE");
        setBestRoute(null);
        setIsLoading(false);
        return;
      }
      setBestRoute(quotedPaths[0]);
      setIsLoading(false);
    } catch (err) {
      console.log("Failed to fetch quote. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  return { findRoute, bestRoute, isLoading, decodedPath, error };
}
