import { ethers } from "ethers";
import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { TickMath } from "./tickMath";

// Define constants
export const MAX_UINT256 = 2n ** 256n - 1n;
export const Q96 = 2n ** 96n;
export const TICK_SPACING: any = {
  100: 1, // 0.01%
  500: 10, // 0.05%
  3000: 60, // 0.3%
  10000: 200, // 1%
};
export const MAX_SAFE_INTEGER = JSBI.BigInt(Number.MAX_SAFE_INTEGER);

export class MathUtil {
  public static convertJSBIToBigInt(jsbiBigInt: JSBI): bigint {
    return BigInt(jsbiBigInt.toString());
  }

  public static convertBigIntToJSBI(b: bigint): JSBI {
    return JSBI.BigInt(b.toString());
  }

  public static sqrt(v: bigint): bigint {
    const value = JSBI.BigInt(v.toString());
    invariant(JSBI.greaterThanOrEqual(value, JSBI.BigInt(0)), "NEGATIVE");

    // rely on built in sqrt if possible
    if (JSBI.lessThan(value, MAX_SAFE_INTEGER)) {
      return this.convertJSBIToBigInt(JSBI.BigInt(Math.floor(Math.sqrt(JSBI.toNumber(value)))));
    }

    let z: JSBI;
    let x: JSBI;
    z = value;
    x = JSBI.add(JSBI.divide(value, JSBI.BigInt(2)), JSBI.BigInt(1));
    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(value, x), x), JSBI.BigInt(2));
    }
    return BigInt(z.toString());
  }

  // from token ratio (display on UI) to SqrtPriceX96
  public static calculateSqrtPriceX96(price: string, token0Decimals: number, token1Decimals: number) {
    const amount1 = JSBI.BigInt(ethers.parseUnits(price, token1Decimals).toString());
    const amount0 = JSBI.BigInt(ethers.parseUnits("1", token0Decimals).toString());
    const numerator = JSBI.leftShift(JSBI.BigInt(amount1), JSBI.BigInt(192));
    const denominator = JSBI.BigInt(amount0);
    const ratioX192 = JSBI.divide(numerator, denominator);
    return this.sqrt(this.convertJSBIToBigInt(ratioX192));
  }

  // from SqrtPriceX96 to token ratio (display on UI)
  public static calculatePriceFromSqrtPriceX96(sqrtPriceX96: bigint, token0Decimals: number, token1Decimals: number): string {
    const ratioX192 = sqrtPriceX96 * sqrtPriceX96;
    const shiftedRatioX192 = ratioX192 >> 192n;
    const decimalDifference = token1Decimals - token0Decimals;
    const adjustedRatio = decimalDifference >= 0 ? shiftedRatioX192 * 10n ** BigInt(decimalDifference) : shiftedRatioX192 / 10n ** BigInt(-decimalDifference);
    return adjustedRatio.toString();
  }

  // Adjust token ratio (display on UI) by nearestUsable tick
  public static nearestUsablePrice(price: string, token0Decimals: number, token1Decimals: number, feeTier: number): string {
    const sqrtPriceX96 = MathUtil.calculateSqrtPriceX96(price, token0Decimals, token1Decimals);
    const tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);
    const nearestUsableTick = TickMath.nearestUsableTick(tick, TICK_SPACING[feeTier]);
    const tickToSqrtPriceX96 = TickMath.getSqrtRatioAtTick(nearestUsableTick);
    const sqrtPriceX96ToPrice = MathUtil.calculatePriceFromSqrtPriceX96(tickToSqrtPriceX96, token0Decimals, token1Decimals);
    return sqrtPriceX96ToPrice;
  }
  // Calculate range token ratio (display on UI) by percentage
  public static calculatePriceRange(currentPrice: string, percentageRange: number): { minPrice: number; maxPrice: number } {
    const sqrtRatio = Math.sqrt(1 + percentageRange / 100);
    const minPrice = Number(currentPrice) / sqrtRatio;
    const maxPrice = Number(currentPrice) * sqrtRatio;
    return { minPrice, maxPrice };
  }
}
