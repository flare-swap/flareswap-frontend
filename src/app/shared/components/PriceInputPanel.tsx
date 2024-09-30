import { Token } from "@/app/sdks/sdk-core";
import Image from "next/image";
import React from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { getTickToPrice } from "../utils/getTickToPrice";
import { nearestUsableTick } from "@/app/sdks/v3-sdk";
import { TICK_SPACING } from "../utils/mathUtil";
import { Helper } from "../utils/helper";

interface PriceInputPanelProps {
  label?: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  token0: Token;
  token1: Token;
  disabled?: boolean;
  feeTier: number | null;
  tick: number | null;
  onIncrease: () => void;
  onDecrease: () => void;
  isZero?: boolean;
  isInfinite?: boolean;
}

const PriceInputPanel: React.FC<PriceInputPanelProps> = ({
  label = "",
  amount = "",
  onAmountChange,
  disabled = false,
  feeTier = 3000,
  token0,
  token1,
  onIncrease,
  onDecrease,
  tick,
  isZero,
  isInfinite,
}) => {
  const handleBlur = () => {
    if (Helper.isNotEmpty(tick)) {
      const newPrice = getTickToPrice(token0, token1, nearestUsableTick(tick, TICK_SPACING[feeTier]));
      onAmountChange(newPrice.toSignificant(5));
    }
  };

  return (
    <div className="border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] w-full flex justify-between">
      <div className="flex-1">
        <div className="text-[10px] leading-[14px] md:text-[12px] md:leading-[18px] text-[#FFFFFF] mb-[4px]">{label}</div>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="flex mb-[4px]">
              <div className="flex items-center bg-grey-800 rounded-md">
                <div className="relative">
                  {!isZero && !isInfinite && (
                    <NumericFormat
                      value={amount}
                      onValueChange={(values: NumberFormatValues) => onAmountChange(values.value)}
                      onBlur={handleBlur}
                      className="h-[16px] text-[16px] leading-[16px] md:h-[24px] md:text-[24px] md:leading-[24px] text-white bg-transparent outline-none max-w-[130px] md:max-w-[180px]"
                      allowNegative={false}
                      placeholder="0.0"
                      thousandSeparator
                      disabled={disabled}
                    />
                  )}
                  {isZero && <div className="h-[16px] text-[16px] leading-[16px] md:h-[24px] md:text-[24px] md:leading-[24px] text-white bg-transparent outline-none max-w-[130px] md:max-w-[180px]">0</div> }
                  {isInfinite && <div className="h-[24px] text-[32px] leading-[24px] text-white bg-transparent outline-none max-w-[130px] md:max-w-[180px]">∞</div> }
                </div>
              </div>
            </div>
            <div className="text-[10px] leading-[14px] md:text-[12px] md:leading-[18px] text-[#FFFFFF70]">
              {token1?.symbol} per {token0?.symbol}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center flex-col justify-center">
        <button className="border border-[#FFFFFF40] bg-[#FFFFFF1A] flex items-center rounded-[16px] p-[2px] md:p-[4px] cursor-pointer hover:bg-[#311F58] hover:text-[#C0A4FF] mb-[8px]" onClick={onIncrease}>
          <Image src="/icons/plus.svg" width={16} height={16} alt="plus" />
        </button>
        <button className="border border-[#FFFFFF40] bg-[#FFFFFF1A] flex items-center rounded-[16px] p-[2px] md:p-[4px] cursor-pointer hover:bg-[#311F58] hover:text-[#C0A4FF]" onClick={onDecrease}>
          <Image src="/icons/minus.svg" width={16} height={16} alt="minus" />
        </button>
      </div>
    </div>
  );
};

export default PriceInputPanel;
