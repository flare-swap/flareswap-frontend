import { Token } from "@/app/sdks/sdk-core";
import { useCallback, useEffect, useRef, useState } from "react";

export function useTokenInputs(tokens: Token[]) {
  const [fromToken, setFromToken] = useState<Token | null>(tokens[0] || null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [independentField, setIndependentField] = useState<"from" | "to">("from")

  const previousTokensRef = useRef<Token[]>(tokens);

  useEffect(() => {
    setFromToken(tokens[0] || null);
    setToToken(tokens[2] || null);
    setToAmount("");
    setFromAmount("");
    previousTokensRef.current = tokens;
  }, [tokens]);

  const memoizedSetFromToken = useCallback((token: Token | null) => setFromToken(token), []);
  const memoizedSetToToken = useCallback((token: Token | null) => setToToken(token), []);
  const memoizedSetFromAmount = useCallback((amount: string) => setFromAmount(amount), []);
  const memoizedSetToAmount = useCallback((amount: string) => setToAmount(amount), []);

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    setFromToken: memoizedSetFromToken,
    setToToken: memoizedSetToToken,
    setFromAmount: memoizedSetFromAmount,
    setToAmount: memoizedSetToAmount,
    independentField,
    setIndependentField
  };
}
