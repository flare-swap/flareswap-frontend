import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useChainId, usePublicClient } from "wagmi";
import { Address, isAddress } from "viem";
import { toast } from "react-toastify";
import { Token } from "@/app/sdks/sdk-core";

const erc20ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

type TokenOptionsProps = {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
};

export const TokenOptions: React.FC<TokenOptionsProps> = ({ tokens, onSelectToken }) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const [additionalTokens, setAdditionalTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetchingTokenInfo, setIsFetchingTokenInfo] = useState(false);

  const fetchTokenInfo = useCallback(
    async (address: Address) => {
      setIsFetchingTokenInfo(true);
      try {
        const [name, symbol, decimals]: any = await Promise.all([
          publicClient.readContract({ address, abi: erc20ABI, functionName: "name" }),
          publicClient.readContract({ address, abi: erc20ABI, functionName: "symbol" }),
          publicClient.readContract({ address, abi: erc20ABI, functionName: "decimals" }),
        ]);

        const newToken: Token = new Token(chainId, address, decimals, symbol, name, undefined, undefined, undefined, "/icons/tokens/unknown-token.svg");

        return newToken;
      } catch (err) {
        console.error("Error fetching token info:", err);
        toast.error("Failed to fetch token information. Please check the address and try again.");
      } finally {
        setIsFetchingTokenInfo(false);
      }
    },
    [chainId, publicClient]
  );

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (isAddress(query) && !tokens.some((token) => token.address === query)) {
      const newToken = await fetchTokenInfo(query as Address);
      setAdditionalTokens([newToken, ...additionalTokens?.filter((t) => t.address !== newToken.address)]);
    }
  };

  return (
    <div className="w-[350px] md:w-[339px] h-[442px] rounded-[12px] border border-[#FFFFFF1F] bg-opacity-10 backdrop-filter backdrop-blur-xl">
      <div className="p-[16px] text-white text-[12px] leading-[12px] md:text-[16px] md:leading-[16px] font-semibold">Select a token</div>
      <div className="px-[12px] md:px-[16px]">
        <input
          className="h-[32px] md:h-[42px] w-full bg-transparent border border-[#FFFFFF26] rounded-[6px] px-[8px] text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] text-[#FFFFFF80] !outline-none focus-visible:border-[#FFFFFF40]"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search name or paste address"
        />
      </div>
      <div className="max-h-[352px] overflow-y-auto p-[8px] mt-[8px]">
        {[...tokens, ...additionalTokens]
          ?.filter(
            (token) =>
              token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
              token.address.toLowerCase().includes(searchQuery.toLowerCase())
          )
          ?.map((token) => (
            <div key={token.symbol} className="flex items-center hover:bg-[#FFFFFF0D] cursor-pointer p-[8px] rounded-[8px] mb-[2px]" onClick={() => onSelectToken(token)}>
              <div className="flex gap-[10px] w-full">
                {/* <Image src={token.logoURI} width={32} height={32} alt={token.name} className="rounded-full" /> */}

                <div className="relative w-[24px] h-[24px] md:min-w-[32px] md:h-[32px]">
                  <Image quality={100} src={token.logoURI} alt={token.name} fill sizes="(max-width: 767px) 32px, 32px" className="rounded-full object-contain" />
                </div>
                <div>
                  <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[14px] text-white font-semibold mb-[4px]">{token.name}</div>
                  <div className="text-[10px] leading-[10px] md:text-[12px] md:leading-[12px] text-[#FFFFFF80] font-normal">{token.symbol}</div>
                </div>
              </div>
              {/* <div className="text-[14px] leading-[14px] text-[#FFFFFF80] font-normal">0.00</div> */}
            </div>
          ))}
        {isFetchingTokenInfo && <div className="loading mx-auto mt-[32px]"></div>}
      </div>
    </div>
  );
};
