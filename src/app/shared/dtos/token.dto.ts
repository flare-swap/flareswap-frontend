export interface IToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI: string;
  isNative: boolean;
  isWrapped: boolean;
}
