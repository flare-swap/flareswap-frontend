import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { BigintIsh, Price, Token } from "../../sdk-core";
import { FeeAmount, TICK_SPACINGS } from "../constants";
import { Q192 } from "../internalConstants";
import { TickMath } from "../utils/tickMath";
import { Tick, TickConstructorArgs } from "./tick";
import { NoTickDataProvider, TickDataProvider } from "./tickDataProvider";
import { TickListDataProvider } from "./tickListDataProvider";

const NO_TICK_DATA_PROVIDER_DEFAULT = new NoTickDataProvider();

export class Pool {
  public readonly token0: Token;
  public readonly token1: Token;
  public readonly fee: FeeAmount;
  public readonly sqrtRatioX96: JSBI;
  public readonly liquidity: JSBI;
  public readonly tickCurrent: number;
  public readonly tickDataProvider: TickDataProvider;

  private _token0Price?: Price<Token, Token>;
  private _token1Price?: Price<Token, Token>;

  public constructor(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtRatioX96: BigintIsh,
    liquidity: BigintIsh,
    tickCurrent: number,
    ticks: TickDataProvider | (Tick | TickConstructorArgs)[] = NO_TICK_DATA_PROVIDER_DEFAULT
  ) {
    invariant(Number.isInteger(fee) && fee < 1_000_000, "FEE");

    const tickCurrentSqrtRatioX96 = TickMath.getSqrtRatioAtTick(tickCurrent);
    const nextTickSqrtRatioX96 = TickMath.getSqrtRatioAtTick(tickCurrent + 1);
    invariant(JSBI.greaterThanOrEqual(JSBI.BigInt(sqrtRatioX96), tickCurrentSqrtRatioX96) && JSBI.lessThanOrEqual(JSBI.BigInt(sqrtRatioX96), nextTickSqrtRatioX96), "PRICE_BOUNDS");
    // always create a copy of the list since we want the pool's tick list to be immutable
    [this.token0, this.token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
    this.fee = fee;
    this.sqrtRatioX96 = JSBI.BigInt(sqrtRatioX96);
    this.liquidity = JSBI.BigInt(liquidity);
    this.tickCurrent = tickCurrent;
    this.tickDataProvider = Array.isArray(ticks) ? new TickListDataProvider(ticks, TICK_SPACINGS[fee]) : ticks;
  }

  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1);
  }

  public get token0Price(): Price<Token, Token> {
    return this._token0Price ?? (this._token0Price = new Price(this.token0, this.token1, Q192, JSBI.multiply(this.sqrtRatioX96, this.sqrtRatioX96)));
  }

  public get token1Price(): Price<Token, Token> {
    return this._token1Price ?? (this._token1Price = new Price(this.token1, this.token0, JSBI.multiply(this.sqrtRatioX96, this.sqrtRatioX96), Q192));
  }

  public priceOf(token: Token): Price<Token, Token> {
    invariant(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }

  public get chainId(): number {
    return this.token0.chainId;
  }

  public get tickSpacing(): number {
    return TICK_SPACINGS[this.fee];
  }
}
