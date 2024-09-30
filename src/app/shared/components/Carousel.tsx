import Image from "next/image";

const chains = [
  { name: "Flare", image: "/icons/networks/flare.png" },
  { name: "Arbitrum One", image: "/icons/networks/arbitrum-one.png" },
  { name: "Aurora", image: "/icons/networks/aura.png" },
  { name: "Avalanche", image: "/icons/networks/avalanche.png" },
  { name: "Base", image: "/icons/networks/base.png" },
  { name: "Berachain", image: "/icons/networks/bera_1.png" },
  { name: "Blast", image: "/icons/networks/blast.png" },
  { name: "BNB Chain", image: "/icons/networks/bnb-chain.png" },
  { name: "Bitgert", image: "/icons/networks/brise.png" },
  { name: "Coin98", image: "/icons/networks/c98.png" },
  { name: "Celo", image: "/icons/networks/celo_1.png" },
  { name: "Cronos", image: "/icons/networks/cronos.png" },
  { name: "CyberConnect", image: "/icons/networks/cyberconnect.png" },
  { name: "Ethereum", image: "/icons/networks/ethereum.png" },
  { name: "Fantom", image: "/icons/networks/fantom2.png" },
  { name: "Fantom Testnet", image: "/icons/networks/fantom1.png" },
  { name: "Injective", image: "/icons/networks/injeetive.png" },
  { name: "Klaytn", image: "/icons/networks/klay.png" },
  { name: "Linea", image: "/icons/networks/linea.png" },
  { name: "Manta Network", image: "/icons/networks/manta.png" },
  { name: "Mantle", image: "/icons/networks/mantle.png" },
  { name: "Metis", image: "/icons/networks/metis.png" },
  { name: "Moonbeam", image: "/icons/networks/moonbeam.png" },
  { name: "Neon EVM", image: "/icons/networks/neon_1.png" },
  { name: "opBNB", image: "/icons/networks/opbnb.png" },
  { name: "Optimism", image: "/icons/networks/optimism.png" },
  { name: "Polygon", image: "/icons/networks/polygon.png" },
  { name: "Scroll", image: "/icons/networks/scroll.png" },
  { name: "Taiko", image: "/icons/networks/taiko.png" },
  { name: "Viction", image: "/icons/networks/viction.png" },
  { name: "X Layer", image: "/icons/networks/xlayer.png" },
  { name: "ZetaChain", image: "/icons/networks/zeta.png" },
  { name: "zkSync", image: "/icons/networks/zk-sync.png" },
  { name: "ZKFair", image: "/icons/networks/zkfair.png" },
  { name: "Zora", image: "/icons/networks/zora.png" },
];

const Carousel = () => {
  return (
    <div className="max-w-[930px] md:mx-auto relative">
      <div className="overflow-hidden">
        <div className="flex gap-[8px] lg:gap-[16px] items-center flex-nowrap animate-scroll w-max">
          {[...chains, ...chains].map((item, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="h-[22px] lg:h-[30px] flex items-center gap-[8px] rounded-[4px] bg-[#ffffff10] px-[12px] flex-nowrap w-max">
                <div className="relative w-[14px] h-[14px] lg:w-[18px] lg:h-[18px]">
                  <Image src={item.image} alt={item.image} fill sizes="(max-width: 1024px) 18px, 18px" className="object-contain" />
                </div>
                <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-white font-semibold text-nowrap">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-blur-left absolute left-0 w-[60px] lg:w-[80px] h-[22px] lg:h-[30px] top-0"></div>
      <div className="bg-gradient-blur-right absolute right-0 w-[60px] lg:w-[80px] h-[22px] lg:h-[30px] top-0"></div>
    </div>
  );
};

export default Carousel;
