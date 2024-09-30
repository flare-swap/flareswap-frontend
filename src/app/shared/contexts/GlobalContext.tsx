import { Token } from "@/app/sdks/sdk-core";
import axios from "axios";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import { IChainConfig, INetworkConfig } from "../dtos/network-config.dto";
import { useTransactionSettings } from "../hooks/useSettings";

interface GlobalContextType {
  config: INetworkConfig;
  chainConfig: IChainConfig;
  networkTokens: Token[];
  wToken: Token | null;
  nativeCurrency: Token | null;
  slippageTolerance: number;
  deadline: number;
  setSlippageTolerance: (v: number) => void;
  setDeadline: (v: number) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { slippageTolerance, setSlippageTolerance, deadline, setDeadline } = useTransactionSettings();

  const [config, setConfig] = useState<INetworkConfig | null>(null);
  const [networkTokens, setNetworkTokens] = useState<Token[]>([]);
  const [nativeCurrency, setNativeCurrency] = useState<Token | null>(null);
  const [wToken, setWToken] = useState<Token | null>(null);

  const getNetworks = useCallback(async () => {
    if (chainId) {
      const results: INetworkConfig = (await axios.get(process.env.NEXT_PUBLIC_API_ENDPOINT + "/config"))?.data;
      setConfig(results);

      if (!results[chainId]) {
        return;
      }
      const rawTokens = results[chainId]?.tokens || [];
      const mappedTokens = rawTokens.map((token) => new Token(token.chainId, token.address, token.decimals, token.symbol, token.name, undefined, undefined, undefined, token.logoURI, token.isNative));
      setNetworkTokens(mappedTokens);
      setNativeCurrency(mappedTokens?.find((t) => t.isNative) || null);
      setWToken(mappedTokens?.find((t) => t.address === results[chainId].contractAddresses.wTokenAddress) || null);
    }
  }, [chainId]);

  useEffect(() => {
    getNetworks();
  }, [chainId]);

  const memoizedSetSlippageTolerance = useCallback((v: number) => setSlippageTolerance(v), [setSlippageTolerance]);
  const memoizedSetDeadline = useCallback((v: number) => setDeadline(v), [setDeadline]);

  const value = useMemo(
    () => ({
      config: config,
      chainConfig: config?.[chainId],
      networkTokens,
      nativeCurrency,
      wToken,
      slippageTolerance,
      setSlippageTolerance: memoizedSetSlippageTolerance,
      deadline,
      setDeadline: memoizedSetDeadline,
    }),
    [networkTokens, nativeCurrency, wToken, slippageTolerance, memoizedSetSlippageTolerance, deadline, memoizedSetDeadline]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}
