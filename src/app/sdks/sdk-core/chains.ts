export enum ChainId {
  COSTON = 1,
}

export const SUPPORTED_CHAINS = [
  ChainId.COSTON,
] as const
export type SupportedChainsType = (typeof SUPPORTED_CHAINS)[number]

export enum NativeCurrencyName {
  CFLR = 'CFLR',
}