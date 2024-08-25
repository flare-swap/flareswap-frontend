import { flare, arbitrum, aurora } from "wagmi/chains";

export interface NetworkConfig {
  id: number;
  name: string;
  image: string;
}

export const NETWORKS: NetworkConfig[] = [
  { id: flare.id, name: "Flare", image: "flare.png" },
  { id: arbitrum.id, name: "Arbitrum One", image: "arbitrum-one.png" },
  { id: aurora.id, name: "Aurora", image: "aura.png" },
  { id: 43114, name: "Avalanche", image: "avalanche.png" },
  { id: 8453, name: "Base", image: "base.png" },
  { id: 204, name: "Bera Chain", image: "bera_1.png" },
  { id: 81457, name: "Blast", image: "blast.png" },
  { id: 56, name: "BNB Chain", image: "bnb-chain.png" },
  { id: 32520, name: "Bitgert", image: "brise.png" },
  { id: 2001, name: "Coin98", image: "c98.png" },
  { id: 42220, name: "Celo", image: "celo_1.png" },
  { id: 25, name: "Cronos", image: "cronos.png" },
  { id: 42069, name: "CyberConnect", image: "cyberconnect.png" },
  { id: 1, name: "Ethereum", image: "ethereum.png" },
  { id: 250, name: "Fantom", image: "fantom2.png" },
  { id: 4002, name: "Fantom Testnet", image: "fantom1.png" },
  { id: 1738, name: "Injective", image: "injeetive.png" },
  { id: 8217, name: "Klaytn", image: "klay.png" },
  { id: 59144, name: "Linea", image: "linea.png" },
  { id: 169, name: "Manta Network", image: "manta.png" },
  { id: 5000, name: "Mantle", image: "mantle.png" },
  { id: 1088, name: "Metis", image: "metis.png" },
  { id: 1284, name: "Moonbeam", image: "moonbeam.png" },
  { id: 245022934, name: "Neon EVM", image: "neon_1.png" },
  { id: 204, name: "opBNB", image: "opbnb.png" },
  { id: 10, name: "Optimism", image: "optimism.png" },
  { id: 137, name: "Polygon", image: "polygon.png" },
  { id: 534352, name: "Scroll", image: "scroll.png" },
  { id: 167004, name: "Taiko", image: "taiko.png" },
  { id: 88, name: "Viction", image: "viction.png" },
  { id: 202212, name: "X Layer", image: "xlayer.png" },
  { id: 7000, name: "ZetaChain", image: "zeta.png" },
  { id: 324, name: "zkSync Era", image: "zk-sync.png" },
  { id: 42766, name: "ZKFair", image: "zkfair.png" },
  { id: 7777777, name: "Zora", image: "zora.png" },
];

// Create a mapping of chain IDs to network configs for easy lookup
export const CHAIN_ID_TO_NETWORK: { [key: number]: NetworkConfig } = NETWORKS.reduce((acc, network) => {
  acc[network.id] = network;
  return acc;
}, {} as { [key: number]: NetworkConfig });

// Function to get network config by chain ID
export function getNetworkConfigById(chainId: number): NetworkConfig | undefined {
  return CHAIN_ID_TO_NETWORK[chainId];
}

// Function to get image URL by chain ID
export function getNetworkImageUrl(chainId: number): string {
  const network = CHAIN_ID_TO_NETWORK[chainId];
  return network ? `/icons/networks/${network.image}` : "/icons/networks/unknown-network.png";
}
