import { Token } from './token'

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const WETH9: { [chainId: number]: Token } = {
  16: new Token(16, '0x767b25A658E8FC8ab6eBbd52043495dB61b4ea91', 18, 'WCFLR', 'Wrapped Coston Flare'),
}
