import { Token } from "@/app/sdks/sdk-core";
import { FeeAmount, encodeSqrtRatioX96, priceToClosestTick, nearestUsableTick } from "@/app/sdks/v3-sdk";
import JSBI from "jsbi";
import { TICK_SPACING } from "./mathUtil";
import { PriceUtil } from "./priceUtil";
import { TickMath } from "./tickMath";

export function tryParseTick(baseToken?: Token, quoteToken?: Token, feeAmount?: FeeAmount, value?: string): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined;
  }
  const price = PriceUtil.tryParsePrice(baseToken, quoteToken, value);
  if (!price) {
    return undefined;
  }
  let tick: number;
  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator);
  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK;
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK;
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price);
  }
  return nearestUsableTick(tick, TICK_SPACING[feeAmount]);
}
