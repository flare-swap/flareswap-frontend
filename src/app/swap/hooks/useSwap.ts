import { Token } from "@/app/sdks/sdk-core";
import { swapRouterABI } from "@/app/shared/abis/swap-router";
import { wTokenABI } from "@/app/shared/abis/wrappedToken";
import { useEthersProvider } from "@/app/shared/hooks/useEthersProvider";
import { useEthersSigner } from "@/app/shared/hooks/useEthersSigner";
import { Helper } from "@/app/shared/utils/helper";
import { Contract, ethers } from "ethers";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import erc20ABI from "@/app/shared/abis/erc20";
import { PathQuote } from "./useFindBestRoute";
import { useGlobalContext } from "@/app/shared/contexts/GlobalContext";

export function useSwap() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainConfig } = useGlobalContext();

  const swap = async (fromToken: Token, toToken: Token, wToken: Token, typedInput: string, slippageTolerance: number, deadlineInMinutes: number, pathQuote: PathQuote) => {
    if (!signer || !address || !provider) {
      setError("Signer, address, or provider not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const swapRouter = new Contract(chainConfig.contractAddresses.swapRouter, swapRouterABI, signer);
      const deadline = Math.floor(Date.now() / 1000) + 60 * deadlineInMinutes;

      const amountIn = ethers.parseUnits(typedInput, fromToken.decimals);
      const isNativePair = Helper.checkNativePair(fromToken, toToken, wToken);

      // Handle native pair (NAT <-> WNAT)
      if (isNativePair) {
        const wTokenContract = new Contract(wToken.address, wTokenABI, signer);
        if (fromToken.isNative) {
          // Wrap NAT
          const tx = await wTokenContract.deposit({ value: amountIn });
          const receipt = await tx.wait();
          setLoading(false);
          return receipt;
        } else {
          // Unwrap WNAT
          const tx = await wTokenContract.withdraw(amountIn);
          const receipt = await tx.wait();
          setLoading(false);
          return receipt;
        }
      } else {
        // Handle other swap cases
        const amountOutMinimum = (BigInt(pathQuote.quotedAmountOut) * BigInt(((100 - slippageTolerance) * 1000).toFixed(0))) / 100000n;
        const swapParams = {
          path: pathQuote.path,
          recipient: toToken.isNative ? chainConfig.contractAddresses.swapRouter : address,
          deadline,
          amountIn,
          amountOutMinimum,
        };

        // From token is NAV
        if (fromToken.isNative) {
          const tx = await swapRouter.exactInput(swapParams, { value: amountIn });
          const receipt = await tx.wait();
          setLoading(false);
          return receipt;
        } else {
          const erc20Contract = new Contract(fromToken.address, erc20ABI, signer);
          // Approve
          const wrapTx = await erc20Contract.approve(chainConfig.contractAddresses.swapRouter, amountIn);
          await wrapTx.wait();

          // Unwrap WNAT if needed
          let swapTx;
          if (toToken.isNative) {
            swapTx = await swapRouter.multicall([swapRouter.interface.encodeFunctionData("exactInput", [swapParams]), swapRouter.interface.encodeFunctionData("unwrapWETH9", [0, address])]);
          } else {
            swapTx = await swapRouter.exactInput(swapParams);
          }
          const receipt = await swapTx.wait();
          setLoading(false);
          return receipt;
        }
      }
    } catch (error: any) {
      const errorMessage = error?.shortMessage || error?.message || "Swap failed!";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(`Error: `, error);
    } finally {
      setLoading(false);
    }
  };

  return {
    swap,
    loading,
    error,
  };
}
