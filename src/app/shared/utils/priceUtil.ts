import { Price, Token } from "@/app/sdks/sdk-core";
import JSBI from "jsbi";

export class PriceUtil {
  public static tryParsePrice(baseToken?: Token, quoteToken?: Token, value?: string) {
    if (!baseToken || !quoteToken || !value) {
      return undefined;
    }
    if (!value.match(/^\d*\.?\d+$/)) {
      return undefined;
    }
    const [whole, fraction] = value.split(".");
    const decimals = fraction?.length ?? 0;
    const withoutDecimals = JSBI.BigInt((whole ?? "") + (fraction ?? ""));
    return new Price(baseToken, quoteToken, JSBI.multiply(JSBI.BigInt(10 ** decimals), JSBI.BigInt(10 ** baseToken.decimals)), JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals)));
  }
}
