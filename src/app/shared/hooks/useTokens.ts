import { useEffect, useState, useCallback, useRef } from "react";
import { Token } from "@/app/sdks/sdk-core";
import { Helper } from "../utils/helper";

export function useTokens(networkTokens: Token[]) {
  const [tokens, setTokens] = useState<Token[]>(networkTokens);
  const previousNetworkTokensRef = useRef<Token[]>(networkTokens);

  const areTokensEqual = useCallback((tokensA: Token[], tokensB: Token[]): boolean => {
    if (tokensA.length !== tokensB.length) return false;
    return tokensA.every((tokenA, index) => Helper.isEqual(tokenA, tokensB[index]));
  }, []);

  useEffect(() => {
    if (!areTokensEqual(networkTokens, previousNetworkTokensRef.current)) {
      setTokens(networkTokens);
      previousNetworkTokensRef.current = networkTokens;
    }
  }, [networkTokens, areTokensEqual]);

  const updateTokens = useCallback((newTokens: Token[]) => {
    setTokens(newTokens);
    previousNetworkTokensRef.current = newTokens;
  }, []);

  return {
    tokens,
    setTokens: updateTokens,
  };
}