import { Currency } from "@/app/sdks/sdk-core"
import { FeeAmount, Pool, tickToPrice, TICK_SPACINGS } from "@/app/sdks/v3-sdk"
import { useMemo, useCallback } from "react"
import { Rounding } from "../utils/tickMath"

export function useRangeHopCallbacks(
    baseCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
    feeAmount: FeeAmount | undefined,
    tickLower: number | undefined,
    tickUpper: number | undefined,
    pool?: Pool | undefined | null,
  ) {
  
    const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
    const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])
  
    const getDecrementLower = useCallback(() => {
      if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickLower - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])
  
    const getIncrementLower = useCallback(() => {
      if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickLower + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      return ''
    }, [baseToken, quoteToken, tickLower, feeAmount, pool])
  
    const getDecrementUpper = useCallback(() => {
      if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])
  
    const getIncrementUpper = useCallback(() => {
      if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
        const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      // use pool current tick as starting tick if we have pool but no tick input
      if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
        const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
        return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
      }
      return ''
    }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

    return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper }
  }