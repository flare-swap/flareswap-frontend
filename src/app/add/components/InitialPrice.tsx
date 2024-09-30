import { Token } from "@/app/sdks/sdk-core";
import { useState } from "react";
import { NumericFormat } from "react-number-format";

interface InitialPriceProps {
  token0: Token | null;
  token1: Token | null;

  startingPrice: string | null;
  setStartingPrice: (v: string) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export default function InitialPrice({ token0, token1, startingPrice = "", setStartingPrice, disabled = false, onBlur }: InitialPriceProps) {
  const [formattedValue, setFormattedValue] = useState(null);
  return (
    <div>
      <div className="text-[12px] leading-[12px] md:text-[14px] md:leading-[16px] bg-[#311F58] p-[12px] text-[#C0A4FF] my-[12px] rounded-[12px]">
        <strong>New Pool Initialization:</strong> This pool must be initialized before you can add liquidity. To initialize, select a starting price for the pool. Then, enter your liquidity price
        range and deposit amount. Gas fees will be higher than usual due to the initialization transaction.
      </div>
      <div className="flex items-center gap-[8px]">
        <div className="text-white text-[12px] md:text-[14px]">Starting price:</div>
        <div className="w-[150px] md:w-unset border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] py-[8px] flex justify-end flex-1">
          <NumericFormat
            value={startingPrice}
            onValueChange={(v) => {
              setFormattedValue(v.formattedValue);
              setStartingPrice(v.value);
            }}
            onBlur={onBlur}
            className="h-[20px] md:h-[24px] text-[12px] leading-[16px] md:text-[16px] md:leading-[20px] text-[#C0A4FF] font-semibold bg-transparent outline-none text-end"
            allowNegative={false}
            placeholder="0.0"
            thousandSeparator
          />
        </div>
        <div className="text-[#C0A4FF] text-[12px] md:text-[14px] font-semibold whitespace-nowrap">
          {token1?.symbol} / {token0?.symbol}
        </div>
      </div>
    </div>
  );
}
