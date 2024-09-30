"use client";

import Image from "next/image";
import { useAccount, useSwitchChain } from "wagmi";
import { useGlobalContext } from "../contexts/GlobalContext";

const SelectNetwork = () => {
  const { connector } = useAccount();
  const { switchChain } = useSwitchChain();
  const globalContext = useGlobalContext();

  return (
    <>
      <div className="bg-[#ffffff50] h-[32px] lg:h-[36px] pr-[12px] text-white font-semibold rounded-full text-[12px] leading-[18px] lg:text-[16px] lg:leading-[24px] relative group items-center flex group">
        {!!globalContext.chainConfig && (
          <div className="relative w-[32px] h-[32px] md:min-w-[36px] md:min-h-[32px] group-hover:opacity-75">
            <Image quality={100} src={globalContext.chainConfig?.logoURI} alt={globalContext.chainConfig?.name} fill sizes="(max-width: 767px) 32px, 32px" className="rounded-full object-contain" />
          </div>
        )}
        <p className="text-[12px] lg:text-[14px] px-[12px] md:block hidden">{globalContext.chainConfig?.name || "Select a valid network"}</p>
        {!globalContext.chainConfig?.name && <p className="text-[12px] lg:text-[14px] px-[12px] md:hidden">{"Select"}</p>}
        <Image src="/icons/down.svg" width={14} height={14} alt="down" className="ml-[8px] md:ml-0" />

        <div className="absolute top-full hidden group-hover:block left-0 right-0 pt-[8px] w-[200px] md:w-[unset] z-[99]">
          <div className="bg-black-100 rounded-[8px] border border-[#FFFFFF1F] flex flex-col gap-[1px] overflow-hidden">
            {Object.keys(globalContext.config || {})?.map((k) => (
              <div
                key={k}
                onClick={() => switchChain({ connector, chainId: Number(k) })}
                className={`p-[4px] px-[8px] hover:bg-[#ffffff20] cursor-pointer flex gap-[8px] items-center ${
                  globalContext.config[Number(k)].id === globalContext.chainConfig.id ? " font-semibold bg-[#ffffff20]" : ""
                }`}
              >
                <Image src={globalContext.config[Number(k)].logoURI} width={24} height={24} alt="warning" />
                <div className="text-nowrap text-[12px] font-medium">{globalContext.config[Number(k)]?.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectNetwork;
