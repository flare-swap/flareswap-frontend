import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { nonfungiblePositionManagerABI } from "../abis/nonfungiblePositionManager";
import { wTokenABI } from "../abis/wrappedToken";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useEthersProvider } from "./useEthersProvider";
import { useEthersSigner } from "./useEthersSigner";
import { PoolData } from "./usePool";
import { PoolService } from "../services/pool-service";

export function useAddLiquidity() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [isAdding, setIsAdding] = useState(false);
  const { chainConfig } = useGlobalContext();

  const addLiquidity = useCallback(
    async (
      token0Amount: string,
      token1Amount: string,
      poolData: PoolData,
      tickLower: number,
      tickUpper: number,
      deadlineInMinutes: number,
      slippageTolerancePercent: number,
      isNativeIncluded: "token0" | "token1" | null = null,
      isSingleSidePosition?: boolean,
      deposit0Disabled?: boolean,
      deposit1Disabled?: boolean
    ) => {
      if (!signer || !address || !provider || !poolData.isInitialized) throw new Error("!signer || !address || !provider || !poolData.isInitialized");

      setIsAdding(true);
      try {
        const feeData = await provider.getFeeData();
        if (isNativeIncluded === "token0" && !(isSingleSidePosition && deposit0Disabled)) {
          const wTokenContract = new ethers.Contract(poolData.token0, wTokenABI, signer);
          const value = ethers.parseUnits(token0Amount, poolData.token0Decimals).toString();
          const tx = await wTokenContract.deposit({ value });
          const r = await tx.wait();
        }
        if (isNativeIncluded === "token1" && !(isSingleSidePosition && deposit1Disabled)) {
          const wTokenContract = new ethers.Contract(poolData.token1, wTokenABI, signer);
          const value = ethers.parseUnits(token1Amount, poolData.token1Decimals).toString();
          const tx = await wTokenContract.deposit({ value });
          const r = await tx.wait();
        }

        const positionManager = new ethers.Contract(chainConfig.contractAddresses.positionManageAddress, nonfungiblePositionManagerABI, signer);
        const deadline = Math.floor(Date.now() / 1000) + 60 * deadlineInMinutes; // minutes from now
        const amount0Desired = ethers.parseUnits(token0Amount, poolData.token0Decimals);
        const amount1Desired = ethers.parseUnits(token1Amount, poolData.token1Decimals);
        const amount0Min = (amount0Desired * BigInt(((1 - slippageTolerancePercent / 100) * 1000).toFixed(0))) / 1000n;
        const amount1Min = (amount1Desired * BigInt(((1 - slippageTolerancePercent / 100) * 1000).toFixed(0))) / 1000n;
        const params = {
          token0: poolData.token0,
          token1: poolData.token1,
          fee: poolData.fee,
          tickLower,
          tickUpper,
          amount0Desired: isSingleSidePosition && deposit0Disabled ? 0n : amount0Desired,
          amount1Desired: isSingleSidePosition && deposit1Disabled ? 0n : amount1Desired,
          amount0Min: isSingleSidePosition && deposit0Disabled ? 0 : amount0Min,
          amount1Min: isSingleSidePosition && deposit1Disabled ? 0 : amount1Min,
          recipient: address,
          deadline,
        };

        console.log("Mint parameters:", params);

        // 5. Estimate gas
        const gasEstimate = await positionManager.mint.estimateGas(params);
        console.log("Estimated gas:", gasEstimate.toString());

        // 6. Call mint function with extra gas and debug trace
        const tx = await positionManager.mint(params, {
          gasLimit: (gasEstimate * 110n) / 100n, // buffer 10%
          gasPrice: feeData.gasPrice,
        });

        console.log("Transaction sent:", tx.hash);

        // 7. Wait for transaction receipt
        const receipt = await tx.wait();
        PoolService.refreshPool(chainConfig.id, poolData.token0,  poolData.token1,  poolData.fee)
        return receipt?.hash;
      } catch (error: any) {
        throw error;
      } finally {
        setIsAdding(false);
      }
    },
    [chainConfig, signer, provider]
  );

  return {
    addLiquidity,
    isAdding,
  };
}
