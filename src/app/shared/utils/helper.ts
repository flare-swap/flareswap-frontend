import { Currency, CurrencyAmount, Token } from "@/app/sdks/sdk-core";
import { nearestUsableTick, TickMath } from "@/app/sdks/v3-sdk";
import { formatUnits } from "ethers";
import JSBI from "jsbi";
import { Address, parseUnits } from "viem";
import { TICK_SPACING } from "./mathUtil";

export const FEE_AMOUNT_ENCODING = {
  100: 0, // 0.01%
  500: 1, // 0.05%
  3000: 2, // 0.3%
  10000: 3, // 1%
};

export interface DecodedPath {
  tokenAddresses: string[];
  fees: number[];
}

export class Helper {
  // v # undefined & # null
  public static isNotEmpty(v: any): boolean {
    return !(typeof v === "undefined" || v === null);
  }

  public static shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-3)}`;
  };

  public static sortTokens(tokenA: Token, tokenB: Token): [Token, Token] {
    if (!tokenA && !tokenB) {
      return [null, null];
    }
    if (!tokenB) {
      return [tokenA, null];
    }
    if (!tokenA) {
      return [null, tokenB];
    }
    return tokenA?.address?.toLowerCase() < tokenB?.address?.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  }
  public static sortAddresses(tokenA: Address, tokenB: Address): [Address, Address] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  }
  public static sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): string {
    const priceX192 = sqrtPriceX96 * sqrtPriceX96;
    const price = priceX192 / 2n ** 192n;
    const adjustedPrice = price * 10n ** BigInt(decimals1 - decimals0);
    const stringValue = adjustedPrice.toString();
    const integerPart = stringValue.slice(0, -18) || "0";
    const fractionalPart = stringValue.slice(-18).padStart(18, "0");
    return `${integerPart}.${fractionalPart}`;
  }
  public static calculateEncodedPrice(price: number): bigint {
    const sqrtPriceX96 = BigInt(Math.floor(Math.sqrt(price) * 2 ** 96));
    return sqrtPriceX96;
  }

  /**
   * Formats a bigint balance to a human-readable string
   * @param balance The balance as a bigint
   * @param decimals The number of decimal places for the token
   * @param displayDecimals The number of decimal places to display (default: 4)
   * @param useCommas Whether to use commas in the formatted number (default: true)
   * @returns A formatted string representation of the balance
   */
  public static formatBalance(balance: bigint, decimals: number, displayDecimals: number = 4, useCommas: boolean = true): string {
    if (balance === 0n || !balance || !decimals) return "0";

    // Use ethers.js formatUnits function to handle the initial conversion
    let result = formatUnits(balance, decimals);

    // Truncate to the desired number of decimal places
    const parts = result.split(".");
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, displayDecimals);
      result = parts.join(".");
    }

    // Remove trailing zeros after the decimal point
    result = result.replace(/\.?0+$/, "");

    // Add commas for readability
    if (useCommas) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      result = parts.join(".");
    }

    // Handle cases where the result is "0" but there were non-zero digits
    if (result === "0" && balance > 0n) {
      result = "< 0." + "0".repeat(displayDecimals - 1) + "1";
    }

    return result;
  }

  /**
   * Parses a string representation of a number to bigint
   * @param amount The amount as a string
   * @param decimals The number of decimal places for the token
   * @returns A bigint representation of the amount
   */
  public static parseToBigInt(amount: string, decimals: number): bigint {
    if (!amount) return 0n;

    const [wholePart, fractionalPart = ""] = amount.split(".");
    const paddedFractionalPart = fractionalPart.padEnd(decimals, "0").slice(0, decimals);
    const combinedString = wholePart + paddedFractionalPart;

    return BigInt(combinedString);
  }

  // Helper function for deep equality check
  public static isEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    const keysA = Object.keys(a),
      keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!keysB.includes(key) || !Helper.isEqual(a[key], b[key])) return false;
    }
    return true;
  };

  public static checkNativePair(token0: Token, token1: Token, wToken: Token) {
    if (!token0 || !token1 || !wToken) {
      return false;
    }
    if (token0.isNative && token1.address === wToken.address) {
      return true;
    }
    if (token1.isNative && token0.address === wToken.address) {
      return true;
    }
    return false;
  }

  public static getPairToken(fromToken: Token, toToken: Token, wToken: Token) {
    const adjustedFromToken = fromToken?.isNative ? wToken : fromToken;
    const adjustedToToken = toToken?.isNative ? wToken : toToken;
    const [token0, token1] = Helper.sortTokens(adjustedFromToken, adjustedToToken);
    return { token0, token1 };
  }

  public static truncateValue(value: string, decimals: number): string {
    const parts = value.split(/[.,]/);
    const symbol = value.includes(".") ? "." : ",";
    if (parts.length > 1 && parts[1].length > decimals) {
      return parts[0] + symbol + parts[1].slice(0, decimals);
    }
    return value;
  }

  /**
   * Parses a CurrencyAmount from the passed string.
   * Returns the CurrencyAmount, or undefined if parsing fails.
   */
  public static tryParseCurrencyAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
    if (!value || !currency || isNaN(parseFloat(value))) {
      return undefined;
    }
    try {
      const typedValueParsed = parseUnits(Helper.truncateValue(value, currency.decimals), currency.decimals).toString();
      if (typedValueParsed !== "0") {
        return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed));
      }
    } catch (error) {
      // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
      console.log("tryParseCurrencyAmount", "tryParseCurrencyAmount", `Failed to parse input amount: "${value}"`, error);
    }
    return undefined;
  }

  public static encodePath(path: string[], fees: number[]): string {
    if (path.length !== fees.length + 1) {
      throw new Error("path/fee lengths do not match");
    }

    let encoded = "0x";
    for (let i = 0; i < fees.length; i++) {
      // 20 byte encoding of the address
      encoded += path[i].slice(2);
      // 3 byte encoding of the fee
      encoded += fees[i].toString(16).padStart(6, "0");
    }
    // encode the final token
    encoded += path[path.length - 1].slice(2);

    return encoded.toLowerCase();
  }

  public static decodePath(pathBytes: string): DecodedPath {
    if (pathBytes.startsWith("0x")) {
      pathBytes = pathBytes.slice(2);
    }

    const tokenPath: string[] = [];
    const fees: number[] = [];

    for (let i = 0; i < pathBytes.length; i += 46) {
      if (i + 40 > pathBytes.length) {
        break;
      }

      const token = "0x" + pathBytes.slice(i, i + 40);
      tokenPath.push(token);

      if (i + 46 <= pathBytes.length) {
        const fee = parseInt(pathBytes.slice(i + 40, i + 46), 16);
        fees.push(fee);
      }
    }

    return { tokenAddresses: tokenPath, fees };
  }

  public static calculateTradingFee(decodedPath: DecodedPath, inputAmount: string, decimals: number): string {
    if (!decodedPath?.fees?.length) {
      return "0";
    }
    let remainingAmount = parseUnits(inputAmount, decimals);
    let totalFee = 0n;

    for (const fee of decodedPath.fees) {
      const feeAmount = (remainingAmount * BigInt(fee)) / 1000000n; // fee is in hundredths of a bip, so divide by 1,000,000
      totalFee += feeAmount;
      remainingAmount = remainingAmount - feeAmount;
    }

    return formatUnits(totalFee, decimals);
  }
  public static isZero = (feeTier: number, tickLower: number) => feeTier && tickLower === nearestUsableTick(TickMath.MIN_TICK, TICK_SPACING[feeTier]);
  public static isInfinite = (feeTier: number, tickUpper: number) => feeTier && tickUpper === nearestUsableTick(TickMath.MAX_TICK, TICK_SPACING[feeTier]);
}
