import { Token } from "@/app/sdks/sdk-core";
import { Pool } from "@/app/sdks/v3-sdk/entities";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useChainId } from "wagmi";
import { flareSwapFactoryABI } from "../abis/flareSwapFactory";
import { flareSwapPoolABI } from "../abis/flareSwapPool";
import { useEthersProvider } from "./useEthersProvider";
import { useGlobalContext } from "../contexts/GlobalContext";

export interface PoolData {
  address: string;
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
  tickSpacing: number;
  fee: number;
  token0: string;
  token1: string;
  token0Decimals: number;
  token1Decimals: number;
  isInitialized: boolean;
  pool: Pool;
}

export function usePool(token0: Token, token1: Token, feeTier: number) {
  const chainId = useChainId();
  const provider = useEthersProvider();
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [isFetchingPoolData, setIsFetchingPoolData] = useState(true);
  const [errorFetchingPoolData, setErrorFetchingPoolData] = useState<string>(null);
  const {chainConfig} = useGlobalContext()

  const fetchPoolData = useCallback(async () => {
    setErrorFetchingPoolData(null);

    if (!provider || !token0 || !token1 || !feeTier) return;
    setIsFetchingPoolData(true);

    try {
      if(!chainConfig.contractAddresses.factoryAddress) return
      const factory = new ethers.Contract(chainConfig.contractAddresses.factoryAddress, flareSwapFactoryABI, provider);
      console.log("getPool: ", token0.address, token1.address, feeTier);
      const poolAddress = await factory.getPool(token0.address, token1.address, feeTier);
      if (poolAddress === ethers.ZeroAddress) {
        setPoolData(null);
        setErrorFetchingPoolData(poolAddress);
        return;
      }
      const poolContract = new ethers.Contract(poolAddress, flareSwapPoolABI, provider);

      const [slot0, liquidity, tickSpacing, fee, token0Address, token1Address] = await Promise.all([
        poolContract.slot0(),
        poolContract.liquidity(),
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.token0(),
        poolContract.token1(),
      ]);

      const isInitialized = slot0.sqrtPriceX96 > 0n;
      const pool = isInitialized ? new Pool(token0, token1, Number(fee), slot0.sqrtPriceX96.toString(), liquidity.toString(), Number(slot0.tick)): null;
      console.log("Current pool data: ", {
        address: poolAddress,
        liquidity,
        sqrtPriceX96: slot0.sqrtPriceX96,
        tick: Number(slot0.tick), // Convert to number
        tickSpacing: Number(tickSpacing), // Convert to number
        fee: Number(fee), // Ensure fee is a number
        token0: token0Address,
        token1: token1Address,
        token0Decimals: token0.decimals,
        token1Decimals: token1.decimals,
        isInitialized,
        pool
      });
      setPoolData({
        address: poolAddress,
        liquidity,
        sqrtPriceX96: slot0.sqrtPriceX96,
        tick: Number(slot0.tick), // Convert to number
        tickSpacing: Number(tickSpacing), // Convert to number
        fee: Number(fee), // Ensure fee is a number
        token0: token0Address,
        token1: token1Address,
        token0Decimals: token0.decimals,
        token1Decimals: token1.decimals,
        isInitialized,
        pool
      });
    } catch (err) {
      console.error(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setIsFetchingPoolData(false);
    }
  }, [chainId, token0, token1, feeTier]);

  useEffect(() => {
    fetchPoolData();
  }, [fetchPoolData]);

  return { poolData, isFetchingPoolData, fetchPoolData, errorFetchingPoolData };
}
