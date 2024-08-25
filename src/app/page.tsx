import Image from "next/image";
import Carousel from "./shared/components/Carousel";
import HeroImage from "./shared/components/HeroImage";

export default function Home() {
  return (
    <div className="relative z-[2]">
      <div className="flex justify-center mt-[32px] lg:mt-[48px] mb-[32px] lg:mb-[64px]">
        <HeroImage />
      </div>
      <div className="px-[12.5px] lg:p-0">
        <div className="text-[16px] leading-[20px] lg:text-[24px] lg:leading-[30px] text-white font-semibold text-center mb-[12px]">Flare Swap - Decentralize Exchange</div>
        <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-white font-medium text-center opacity-[0.7] mb-[32px] lg:mb-[64px]">
          Welcome to FlareSwap – your gateway to seamless swaps,
          <br className="lg:hidden" />
          rewarding staking, and immersive NFT experiences,
          <br />
          all in one dynamic ecosystem built for the future of
          <br className="lg:hidden" />
          decentralized finance.
        </div>
        <Carousel />
        <div className="my-[32px] lg:my-[64px] h-[1px] bg-gradient-line max-w-[1140px] mx-auto"></div>
        <div className="grid grid-cols-2 lg:flex items-center justify-center gap-[20px] lg:gap-[64px] max-w-[1140px] mx-auto relative">
          <div>
            <div className="text-[16px] leading-[16px] lg:text-[32px] lg:leading-[32px] text-white text-center mb-[4px] lg:mb-[8px]">--</div>
            <div className="text-[10px] leading-[10px] lg:text-[12px] lg:leading-[12px] text-[#ffffff70] text-center">Trade Volume</div>
          </div>
          <div>
            <div className="text-[16px] leading-[16px] lg:text-[32px] lg:leading-[32px] text-white text-center mb-[4px] lg:mb-[8px]">--</div>
            <div className="text-[10px] leading-[10px] lg:text-[12px] lg:leading-[12px] text-[#ffffff70] text-center">All Time Trades</div>
          </div>
          <div>
            <div className="text-[16px] leading-[16px] lg:text-[32px] lg:leading-[32px] text-white text-center mb-[4px] lg:mb-[8px]">--</div>
            <div className="text-[10px] leading-[10px] lg:text-[12px] lg:leading-[12px] text-[#ffffff70] text-center">Integrations</div>
          </div>
          <div>
            <div className="text-[16px] leading-[16px] lg:text-[32px] lg:leading-[32px] text-white text-center mb-[4px] lg:mb-[8px]">--</div>
            <div className="text-[10px] leading-[10px] lg:text-[12px] lg:leading-[12px] text-[#ffffff70] text-center">Community Delegates</div>
          </div>
          <div className="absolute hidden lg:block left-0 w-[1px] bg-gradient-line-vertical h-[1140px]"></div>
          <div className="absolute hidden lg:block right-0 w-[1px] bg-gradient-line-vertical h-[1140px]"></div>
        </div>
        <div className="my-[32px] lg:my-[64px] h-[1px] bg-gradient-line max-w-[1140px] mx-auto"></div>
        <div className="max-w-[938px] bg-secondary-bg p-[20px] pt-[60px] md:p-[48px] md:pb-[40px] mx-[20px] lg:mx-auto">
          <div className="flex items-center justify-between gap-[20px] lg:gap-[48px] mb-[20px] lg:mb-[48px] flex-col-reverse lg:flex-row">
            <div>
              <div className="text-[14px] leading-[14px] lg:text-[24px] lg:leading-[24px] font-semibold text-white mb-[12px] lg:mb-[16px] text-center lg:text-start">High-Performance DeFi</div>
              <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-center lg:text-start text-[#ffffff70] font-normal">
                Step into the future of decentralized finance with FlareSwap’s high-performance DeFi platform. Engineered for speed, scalability, and seamless user experience, this is where DeFi truly
                excels. Enjoy lightning-fast transactions, optimized liquidity, and advanced features that empower you to maximize your strategies without delays or bottlenecks.
                <br />
                <br />
                Whether you're staking, swapping, or exploring innovative yield opportunities, FlareNetwork gives you the edge you need in the rapidly evolving world of DeFi.
              </div>
            </div>
            <div className="relative w-[187.83px] h-[161px] lg:min-w-[350px] lg:h-[300px]">
              <Image quality={100} src={"/images/img-01.png"} alt="high-performance" fill sizes="(max-width: 1024px) 350px, 300px" className="object-contain" />
              <div className="absolute top-[50px] lg:top-[100px] left-1/2 rounded-[12px] overflow-hidden -translate-x-1/2 w-[121px] h-[121px] lg:min-w-[227px] lg:h-[227px]">
                <Image quality={100} src={"/images/img-01.gif"} alt="high-performance-gif" fill sizes="(max-width: 1024px) 227px, 227px" className="object-contain " />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-[20px] lg:gap-[48px] flex-col lg:flex-row mb-[20px] lg:mb-[48px]">
            <div className="relative w-[238px] h-[224px] lg:min-w-[350px] lg:h-[300px]">
              <Image quality={100} src={"/images/img-02.png"} alt="multi-chain" fill sizes="(max-width: 1024px) 350px, 300px" className="object-contain" />
            </div>
            <div>
              <div className="text-[14px] leading-[14px] lg:text-[24px] lg:leading-[24px] font-semibold text-white mb-[12px] lg:mb-[16px] text-center lg:text-start">
                Expanding Multi-Chain Trading Capabilities on FlareNetwork
              </div>
              <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-center lg:text-start text-[#ffffff70] font-normal">
                Unlock the power of cross-chain trading with the Swap platform on FlareNetwork! This feature allows you to seamlessly exchange assets across different blockchains with just a few
                clicks, opening the door to limitless investment opportunities and enhanced profitability.
                <br />
                <br />
                No longer confined to a single ecosystem, you can now leverage the best of various chains—from fast transaction speeds to low costs.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-[20px] lg:gap-[48px] flex-col-reverse lg:flex-row">
            <div>
              <div className="text-[14px] leading-[14px] lg:text-[24px] lg:leading-[24px] font-semibold text-white mb-[12px] lg:mb-[16px] text-center lg:text-start">Low Fees</div>
              <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-center lg:text-start text-[#ffffff70] font-normal">
                Experience the advantage of low fees with FlareSwap's platform, where every trade is optimized for value. Say goodbye to high transaction costs that eat into your profits—our platform
                is designed to keep fees minimal while maintaining top-tier speed and security.
                <br />
                <br />
                Whether you're a frequent trader or just getting started, FlareSwap ensures that more of your earnings stay where they belong—in your pocket.
              </div>
            </div>
            <div className="relative w-[240px] h-[174px] lg:min-w-[350px] lg:h-[254px]">
              <Image quality={100} src={"/images/img-03.png"} alt="low-fees" fill sizes="(max-width: 1024px) 350px, 254px" className="object-contain" />
            </div>
          </div>
        </div>
        <div className="pb-[87.46px] lg:pb-[109px]">
          <div className="max-w-[1024px] mx-auto bg-cover h-[calc((100vw-25px)*506.54/350)] md:h-[324px] lg:h-[445px] bg-[url('/images/overflow-hidden-mb.png')] md:bg-[url('/images/overflow-hidden.png')]">
            <div className="pt-[37px] px-[17px] lg:pt-[75px] lg:px-[53px]">
              <div className="text-white text-[14px] leading-[17.5px] lg:text-[24px] lg:leading-[30px] text-center">FlareSwap - Built on Flare Network</div>
              <div className="text-[#A3A3A3] text-[14px] leading-[17.5px] lg:text-[24px] lg:leading-[30px] text-center mb-[24px] lg:mb-[48px]">Shaping Futures, Redefining Trades</div>
              <div className="hidden md:flex items-center gap-[24px] justify-between">
                <Image src={"/images/swap.png"} height={371} width={371} quality={100} alt="swap" />
                <Image src={"/images/integrations-in-feature.png"} height={256} width={520} quality={100} alt="integrations-in-feature" />
              </div>
              <div className="md:hidden">
                <Image className="mb-[24px] mx-auto" src={"/images/integrations-in-feature-mb.png"} height={256} width={520} quality={100} alt="integrations-in-feature" />
                <Image className="mx-auto" src={"/images/swap-mb.png"} height={371} width={371} quality={100} alt="swap" />
              </div>
            </div>
          </div>
        </div>
        <div className="my-[32px] lg:my-[64px] h-[1px] bg-gradient-line max-w-[1140px] mx-auto"></div>
        <div className="text-[14px] leading-[17.5px] lg:text-[24px] lg:leading-[30px] text-white font-semibold text-center mb-[16px] lg:mb-[24px]">Supported by</div>
        <div className="text-[10px] leading-[12.5px] lg:text-[16px] lg:leading-[20px] text-white font-medium text-center opacity-[0.7] mb-[32px] lg:mb-[48px]">Wait for exciting news!</div>
      </div>
    </div>
  );
}
