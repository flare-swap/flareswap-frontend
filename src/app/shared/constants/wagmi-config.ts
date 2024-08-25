import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { flare, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [mainnet, flare],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    connectors: [
      injected({ target: "metaMask" }),
      walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID }),
      coinbaseWallet({
        appName: "FlareSwap",
      }),
    ],
    transports: {
      [mainnet.id]: http(),
      [flare.id]: http(),
    },
  });
}
