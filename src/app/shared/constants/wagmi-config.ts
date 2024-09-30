import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { flareTestnet, songbirdTestnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [songbirdTestnet, flareTestnet],
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
      [songbirdTestnet.id]: http(),
      [flareTestnet.id]: http(),
    },
  });
}
