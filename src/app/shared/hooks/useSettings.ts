import { useMemo, useState } from "react";

export function useTransactionSettings() {
    const [slippageTolerance, setSlippageTolerance] = useState(0.5); // 0.5% slippage tolerance
    const [deadline, setDeadline] = useState(20); // 20 mins
    return {slippageTolerance, setSlippageTolerance, deadline, setDeadline}
}