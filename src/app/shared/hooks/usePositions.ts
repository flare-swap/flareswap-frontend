import { Contract } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { decodeFunctionResult } from "viem";
import { useAccount } from "wagmi";
import { MulticallABI } from "../abis/multicall";
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

const usePositions = () => {
  const [loading, setLoading] = useState(true);
  const [nftTokenIds, setNftTokenIds] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const provider = useEthersProvider();
  const { address } = useAccount();
  const [rawPositions, setRawPositions] = useState<RawPosition[]>(null);
  const { networkTokens, chainConfig } = useGlobalContext();
  const [cache, setCache] = useState<string>(null);

  const nftManagerContract = useMemo(
    () => (chainConfig && provider ? new Contract(chainConfig?.contractAddresses?.positionManageAddress, nonfungiblePositionManagerABI, provider) : undefined),
    [chainConfig, provider]
  );
  const multiCallContract = useMemo(() => (chainConfig && provider ? new Contract(chainConfig?.contractAddresses?.multicall, MulticallABI, provider) : undefined), [chainConfig, provider]);

  const getTokenIds = async (owner: string): Promise<any> => {
    const balance: bigint = await nftManagerContract?.balanceOf(address);
    const arr = Array.from({ length: Number(balance) }).map((_, index) => index);
    const multicallData = arr.map((i) => ({
      target: chainConfig?.contractAddresses?.positionManageAddress,
      callData: nftManagerContract?.interface.encodeFunctionData("tokenOfOwnerByIndex", [owner, i]),
    }));
    const multicallResults = await multiCallContract.aggregate.staticCall(multicallData);
    const results = multicallResults[1].map((result: string) => BigInt(nftManagerContract?.interface.decodeFunctionResult("tokenOfOwnerByIndex", result)[0]));
    return results;
  };

  const fetchRawPositions = async (tokenIds: number[]): Promise<any> => {
    const multicallData = tokenIds.map((tokenId) => ({
      target: chainConfig?.contractAddresses?.positionManageAddress,
      callData: nftManagerContract.interface.encodeFunctionData("positions", [tokenId]),
    }));
    const multicallResults = await multiCallContract.aggregate.staticCall(multicallData);
    const results = multicallResults[1].map((result: any) => {
      const decodedResult: any = decodeFunctionResult({
        abi: nonfungiblePositionManagerABI,
        functionName: "positions",
        data: result,
      });
      return {
        nonce: decodedResult[0],
        operator: decodedResult[1],
        token0: decodedResult[2],
        token1: decodedResult[3],
        fee: decodedResult[4],
        tickLower: decodedResult[5],
        tickUpper: decodedResult[6],
        liquidity: decodedResult[7],
        feeGrowthInside0LastX128: decodedResult[8],
        feeGrowthInside1LastX128: decodedResult[9],
        tokensOwed0: decodedResult[10],
        tokensOwed1: decodedResult[11],
      };
    });
    return results;
  };


  const fetchPositions = useCallback(async () => {
    if (!address || !chainConfig?.contractAddresses?.positionManageAddress) return;
    const cacheKey = address + chainConfig?.contractAddresses?.positionManageAddress;
    if (cacheKey === cache) return;
    setCache(cacheKey);
    setLoading(true);
    setError(null);

    try {
      const rawTokenIds = await getTokenIds(address);
      const tokenIds = rawTokenIds.map((id: BigInt) => Number(id));
      setNftTokenIds(tokenIds);
      const rawPositions: RawPosition[] = await fetchRawPositions(tokenIds);
      setRawPositions(rawPositions);
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError("Failed to fetch positions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [address, chainConfig]);

  const findTokenByAddress = (address: string) => {
    return networkTokens?.find((t) => t.address.toLocaleLowerCase() === address.toLocaleLowerCase());
  };

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return { loading, error, refetch: fetchPositions, nftTokenIds, rawPositions, findTokenByAddress };
};

export default usePositions;
