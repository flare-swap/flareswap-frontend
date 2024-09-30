/**
 * @param feeGrowthGlobal The current global fee growth
 * @param feeGrowthOutsideLower The fee growth outside the lower tick
 * @param feeGrowthOutsideUpper The fee growth outside the upper tick
 * @param feeGrowthInsideLast The last fee growth inside the position's range
 * @param liquidity The liquidity of the position
 * @returns The calculated fees
 */
export function calculateFees(
  feeGrowthGlobal: bigint,
  feeGrowthOutsideLower: bigint,
  feeGrowthOutsideUpper: bigint,
  feeGrowthInsideLast: bigint,
  liquidity: bigint
): bigint {
  const Q128 = BigInt(2) ** BigInt(128);

  // Calculate feeGrowthInside
  const feeGrowthBelow = feeGrowthOutsideLower;
  const feeGrowthAbove = feeGrowthOutsideUpper;
  const feeGrowthInside = feeGrowthGlobal - feeGrowthBelow - feeGrowthAbove;

  // Calculate fees
  const fees = (liquidity * (feeGrowthInside - feeGrowthInsideLast)) / Q128;

  return fees;
}