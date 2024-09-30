import { Token } from "@/app/sdks/sdk-core";
import { Pool, Position } from "@/app/sdks/v3-sdk";
import { Contract } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { flareSwapFactoryABI } from "../abis/flareSwapFactory";
import { flareSwapPoolABI } from "../abis/flareSwapPool";
import { nonfungiblePositionManagerABI } from "../abis/nonfungiblePositionManager";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useEthersProvider } from "./useEthersProvider";

export interface RawPosition {
  nonce: bigint;
  operator: string;
  token0: string;
  token1: string;
  fee: bigint;
  tickLower: bigint;
  tickUpper: bigint;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

interface RawPool {
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: bigint;
  feeGrowthGlobal0X128: bigint;
  feeGrowthGlobal1X128: bigint;
  feeGrowthOutsideLower0X128: bigint;
  feeGrowthOutsideLower1X128: bigint;
  feeGrowthOutsideUpper0X128: bigint;
  feeGrowthOutsideUpper1X128: bigint;
}

const usePosition = ({ tokenId }: { tokenId: number }) => {
  const [position, setPosition] = useState<Position>(null);
  const [rawPosition, setRawPosition] = useState<RawPosition>(null);
  const [rawPool, setRawPool] = useState<RawPool>(null);
  const [loading, setLoading] = useState(true);
  const [tokenUrl, setTokenUrl] = useState<string>(null);
  const [error, setError] = useState<string | null>(null);
  const provider = useEthersProvider();
  const { address } = useAccount();
  const { networkTokens, chainConfig } = useGlobalContext();
  const [cache, setCache] = useState<string>(null);
  const chainId = useChainId();

  const nftManagerContract = useMemo(
    () => (chainConfig && provider ? new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, provider) : undefined),
    [chainConfig, provider]
  );
  const factoryContract = useMemo(() => (chainConfig && provider ? new Contract(chainConfig?.contractAddresses?.factoryAddress, flareSwapFactoryABI, provider) : undefined), [chainConfig, provider]);

  const fetchRawPool = async (token0: Token, token1: Token, fee: number, positionTickLower: bigint, positionTickUpper: bigint): Promise<RawPool> => {
    const poolAddress = await factoryContract.getPool(token0?.address, token1?.address, fee);
    const poolContract = new Contract(poolAddress, flareSwapPoolABI, provider);
    const [
      slot0,
      liquidity,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
      { feeGrowthOutside0X128: feeGrowthOutsideLower0X128, feeGrowthOutside1X128: feeGrowthOutsideLower1X128 },
      { feeGrowthOutside0X128: feeGrowthOutsideUpper0X128, feeGrowthOutside1X128: feeGrowthOutsideUpper1X128 },
    ] = await Promise.all([
      poolContract.slot0(),
      poolContract.liquidity(),
      poolContract.feeGrowthGlobal0X128(),
      poolContract.feeGrowthGlobal1X128(),
      poolContract.ticks(positionTickLower),
      poolContract.ticks(positionTickUpper),
    ]);
    return {
      sqrtPriceX96: slot0.sqrtPriceX96,
      liquidity,
      tick: slot0.tick,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
      feeGrowthOutsideLower0X128,
      feeGrowthOutsideLower1X128,
      feeGrowthOutsideUpper0X128,
      feeGrowthOutsideUpper1X128,
    };
  };

  const fetchPosition = useCallback(async () => {
    if (!address || !chainConfig || !networkTokens || (networkTokens?.[0]?.chainId !== chainId) || !nftManagerContract) return;

    const cacheKey = address + chainConfig?.contractAddresses?.positionManageAddress;
    if (cacheKey === cache) return;
    setCache(cacheKey);
    setLoading(true);
    setError(null);

    try {
      const rawPosition = await nftManagerContract.positions(tokenId);
      const token0 = networkTokens.find((t) => t.address.toLocaleLowerCase() === rawPosition.token0.toLocaleLowerCase());
      const token1 = networkTokens.find((t) => t.address.toLocaleLowerCase() === rawPosition.token1.toLocaleLowerCase());
      const fee = Number(rawPosition.fee);
      if (!token0 || !token1) return;
      const poolInfo = await fetchRawPool(token0, token1, fee, rawPosition.tickLower, rawPosition.tickUpper);

      setRawPosition(rawPosition);
      setRawPool(poolInfo);

      const base64String: string = (await nftManagerContract.tokenURI(tokenId)) as string;
      if (base64String) {
        const decodedJson = atob(base64String.split(",")[1]);
        const jsonData = JSON.parse(decodedJson);
        setTokenUrl(jsonData.image);
      }

      const pool = new Pool(token0, token1, fee, poolInfo.sqrtPriceX96.toString(), poolInfo.liquidity.toString(), Number(poolInfo.tick));
      const position = new Position({
        pool,
        liquidity: rawPosition.liquidity.toString(),
        tickLower: Number(rawPosition.tickLower),
        tickUpper: Number(rawPosition.tickUpper),
      });
      setPosition(position);
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError("Failed to fetch positions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [address, networkTokens, chainConfig, chainId, nftManagerContract]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, loading, error, refetch: fetchPosition, tokenUrl, rawPosition, rawPool };
};

export default usePosition;
