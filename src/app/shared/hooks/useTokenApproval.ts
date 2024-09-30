import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import erc20ABI from "../abis/erc20";
import { useEthersSigner } from "./useEthersSigner";
import { useAccount } from "wagmi";
import { Token } from "@/app/sdks/sdk-core";
import { useGlobalContext } from "../contexts/GlobalContext";

export function useTokenApproval(token: Token, amount: string) {
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [isApproved, setIsApproved] = useState(false);
  const [isFetchingAllowance, setIsFetchingAllowance] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<Error | null>(null);
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const { chainConfig } = useGlobalContext();

  const checkAllowance = useCallback(async () => {
    if (!signer || !token?.address || !amount || !chainConfig) return;

    if (token.isNative) {
      setIsApproved(true);
      return;
    }

    const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);

    try {
      setIsFetchingAllowance(true)
      const currentAllowance = await tokenContract.allowance(address, chainConfig.contractAddresses.positionManageAddress);
      setAllowance(currentAllowance);

      const requiredAmount = ethers.parseUnits(Number(amount).toFixed(token.decimals), token.decimals);
      setIsApproved(currentAllowance >= requiredAmount);
      setIsFetchingAllowance(false)
    } catch (error) {
      console.error("Error checking allowance: ", token.address, address, chainConfig.contractAddresses.positionManageAddress, error);
      setApproveError(error instanceof Error ? error : new Error("Unknown error checking allowance"));
      setIsFetchingAllowance(false)
    }
  }, [signer, token, amount, chainConfig, address]);

  const approve = useCallback(async (): Promise<void> => {
    if (!signer || !address) throw new Error("Signer or address not available");
    if (!token) throw new Error("Not found token");
    if (token?.isNative) throw new Error("Native token");
    setIsApproving(true);
    try {
      const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);
      const approveTx = await tokenContract.approve(chainConfig.contractAddresses.positionManageAddress, ethers.MaxUint256);
      await approveTx.wait();
      await checkAllowance();
    } catch (e: any) {
      console.error("Approve token error: ", e);
      setApproveError(e?.message || "Unknown error.");
    } finally {
      setIsApproving(false);
    }
  }, [signer, address, token]);

  useEffect(() => {
    checkAllowance();
  }, [checkAllowance]);

  return {
    isApproved,
    isApproving,
    approve,
    checkAllowance,
    approveError,
    allowance,
    isFetchingAllowance
  };
}
