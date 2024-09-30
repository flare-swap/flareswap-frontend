import { Token } from "@/app/sdks/sdk-core";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import erc20ABI from "../abis/erc20";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useEthersProvider } from "./useEthersProvider";

const REFRESH_INTERVAL = 20 * 1000; // 20s

export function useTokenBalances() {
  const { address } = useAccount();
  const provider = useEthersProvider();
  const chainId = useChainId();
  const { nativeCurrency } = useGlobalContext();
  // cache balances
  const [balances, setBalances] = useState<Record<string, bigint>>({});

  const fetchBalance = useCallback(
    async (token: Token, address: Address) => {
      if (!address || !provider || !chainId) return 0n;

      try {
        console.log("Try to fetch balance for ", token.symbol)
        if (token.isNative) {
          return await provider.getBalance(address);
        } else {
          const contract = new ethers.Contract(token.address, erc20ABI, provider);
          return await contract.balanceOf(address);
        }
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);
        return 0n;
      }
    },
    [provider, chainId]
  );

  const fetchBalances = useCallback(
    async (tokens: Token[]) => {
      if (!address || !provider || tokens.length === 0) return;

      const newBalances: Record<string, bigint> = {};
      const tokensToFetch = [...tokens.filter((i) => !!i && !i.isNative), nativeCurrency];

      await Promise.all(
        tokensToFetch.map(async (token) => {
          newBalances[token.address] = await fetchBalance(token, address);
        })
      );
      setBalances(newBalances);
    },
    [address, provider, fetchBalance, nativeCurrency]
  );

  return { balances, fetchBalances };
}
