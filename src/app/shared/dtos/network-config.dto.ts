import { IToken } from "./token.dto";

export interface IChainConfig {
  contractAddresses: {
    factoryAddress: string;
    positionManageAddress: string;
    wTokenAddress: string;
    quoterV2: string;
    multicall: string;
    swapRouter: string;
  };
  logoURI: string;
  tokens: Array<IToken>;
  id: number;
  name: string;
  nativeCurrency: {
    decimals: number;
    name: string;
    symbol: string;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
      apiUrl: string;
    };
  };
  testnet: boolean;
}

export interface INetworkConfig {
  [chainId: number]: IChainConfig;
}
