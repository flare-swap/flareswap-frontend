import { nearestUsableTick, Pool, TickMath } from "@/app/sdks/v3-sdk";
import { ethers } from "ethers";
import { useState } from "react";
import { toast } from "react-toastify";
import { zeroAddress } from "viem";
import { flareSwapFactoryABI } from "../abis/flareSwapFactory";
import { flareSwapPoolABI } from "../abis/flareSwapPool";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useEthersSigner } from "./useEthersSigner";
import { PoolService } from "../services/pool-service";

export function useCreatePool() {
  const signer = useEthersSigner();
  const [isCreating, setIsCreating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { chainConfig } = useGlobalContext();

  const handle = async (mockPool: Pool): Promise<string> => {
    if (!signer || !mockPool) throw new Error("!signer || !fromToken || !toToken || !initialPrice || !wToken");
    // Step 1: Create pool
    console.log("Creating pool...", mockPool);
    const factory = new ethers.Contract(chainConfig.contractAddresses.factoryAddress, flareSwapFactoryABI, signer);
    let poolAddress = "";
    try {
      poolAddress = await factory.getPool(mockPool.token0.address, mockPool.token1.address, mockPool.fee);
    } catch (error) {
      poolAddress = zeroAddress;
    }

    if (!poolAddress || poolAddress === zeroAddress) {
      const createPoolTx = await factory.createPool(mockPool.token0.address, mockPool.token1.address, mockPool.fee);
      await createPoolTx.wait();
    }
    console.log("Initializing pool...");
    setIsInitializing(true);
    poolAddress = await factory.getPool(mockPool.token0.address, mockPool.token1.address, mockPool.fee);
    const pool = new ethers.Contract(poolAddress, flareSwapPoolABI, signer);
    const nearestTick = nearestUsableTick(mockPool.tickCurrent, mockPool.tickSpacing);
    const nearestSqrtRatioX96 = TickMath.getSqrtRatioAtTick(nearestTick);
    const initializeTx = await pool.initialize(nearestSqrtRatioX96.toString());
    const h = await initializeTx.wait();
    console.log(`Pool created and initialized at ${poolAddress} ${h?.recept}`);

    // refresh cache for this pool on server
    return poolAddress;
  };

  const createAndInitializePool = async (mockPool: Pool) => {
    if (!signer) throw new Error("Signer not available");
    try {
      setIsCreating(true);
      const poolAddress = await handle(mockPool);
      PoolService.refreshPool(mockPool.token0.chainId, mockPool.token0.address, mockPool.token1.address, mockPool.fee)
      toast.success("Pool created and initialized successfully.");
      return poolAddress;
    } catch (error: any) {
      if (error?.info?.error?.code == 4001) {
        toast.warn("User reject transaction!");
        return;
      }
      console.error("Failed to create or initialize pool:", error);
      toast.error("Failed to create or initialize pool.");
      throw error;
    } finally {
      setIsCreating(false);
      setIsInitializing(false);
    }
  };

  return { createAndInitializePool, isCreating, isInitializing };
}
