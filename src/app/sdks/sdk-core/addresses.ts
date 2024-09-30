import { ChainId, SUPPORTED_CHAINS, SupportedChainsType } from './chains'

type AddressMap = { [chainId: number]: string }

type ChainAddresses = {
  factoryAddress: string
  multicallAddress: string
  quoterAddress: string
  nonfungiblePositionManagerAddress?: string
  tickLensAddress?: string
  swapRouter02Address?: string
  mixedRouteQuoterV1Address?: string
}

const COSTON_ADDRESSES: ChainAddresses = {
  factoryAddress: '0x6601f072B06c47B69645551b1B33f261f1e92330',
  multicallAddress: '',
  quoterAddress: '0x05220B8b5D8636181d8d26ACD63E013b2d418Ff3',
  nonfungiblePositionManagerAddress: '0xcBc74567Ff655D7560F3341c243c42510F1764b9',
  tickLensAddress: '',
  swapRouter02Address: '0xF0E27c07B52D51bCE42095279036Ff87d9220E5E',
}

export const CHAIN_TO_ADDRESSES_MAP: Record<SupportedChainsType, ChainAddresses> = {
  [ChainId.COSTON]: COSTON_ADDRESSES,
}

export const FACTORY_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].factoryAddress
    return memo
  }, {}),
}

export const POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...SUPPORTED_CHAINS.reduce<AddressMap>((memo, chainId) => {
    memo[chainId] = CHAIN_TO_ADDRESSES_MAP[chainId].nonfungiblePositionManagerAddress
    return memo
  }, {}),
}