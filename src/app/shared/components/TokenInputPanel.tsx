import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { Token } from "@/app/sdks/sdk-core";
import { useModal } from "../contexts/ModalContext";
import { TokenOptions } from "./TokenOptions";
import { formatUnits, parseUnits } from "ethers";
import { Helper } from "../utils/helper";

interface TokenInputPanelProps {
  label?: string;
  tokens: Token[] | null;
  token: Token | null;
  amount: string;
  onTokenChange: (token: Token) => void;
  onAmountChange: (amount: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  balance?: bigint;
  disabled?: boolean;
  disabledInput?: boolean;
  disabledSelectToken?: boolean;
  locked?: boolean;
  showMax?: boolean;
}

const TokenInputPanel: React.FC<TokenInputPanelProps> = ({
  tokens = [],
  amount = "",
  token = null,
  balance = null,
  showMax = true,
  disabled = false,
  disabledSelectToken = false,
  disabledInput = false,
  locked = false,
  onTokenChange,
  onAmountChange,
  onFocus,
  onBlur,
  label,
}) => {
  const { openModal } = useModal();
  const [formattedValue, setFormattedValue] = useState("");
  const [inputWidth, setInputWidth] = useState(35);
  const measureRef = useRef(null);

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth > 35 ? measureRef.current.offsetWidth : 35;
      setInputWidth(width);
    }
  }, [formattedValue]);

  const handleMaxClick = () => {
    onFocus();
    setTimeout(() => onAmountChange(formatUnits(balance, token.decimals)));
  };

  const amountChange = (values: NumberFormatValues) => {
    onAmountChange(values.value);
    setFormattedValue(values.formattedValue);
  };

  return (
    <div className="border border-[#FFFFFF0D] rounded-[8px] md:rounded-[12px] bg-[#00000040] p-[8px] md:!p-[12px] relative">
      {disabled && <div className="absolute top-0 left-0 right-0 bottom-0 z-[98] rounded-[8px] md:rounded-[12px] bg-[rgba(0,0,0,0.4)]"></div>}
      {!!label && <div className="text-[#C3C5CB] text-[10px] leading-[15px] md:text-[14px] font-normal md:leading-[16px] mb-[6px] md:mb-[12px]">{label}</div>}
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex mb-[4px]">
            <div className="flex items-center bg-grey-800 rounded-md">
              <div className="relative">
                <NumericFormat
                  value={amount}
                  onValueChange={amountChange}
                  className="h-[16px] text-[16px] leading-[16px] md:h-[24px] md:text-[24px] md:leading-[24px] text-white bg-transparent outline-none max-w-[130px] md:max-w-[180px]"
                  allowNegative={false}
                  placeholder="0.0"
                  thousandSeparator
                  disabled={disabled || disabledInput}
                  style={{ width: `${inputWidth}px` }}
                  onFocus={() => onFocus()}
                  onBlur={() => onBlur && onBlur()}
                />
                <span ref={measureRef} className="absolute invisible whitespace-pre text-[16px] leading-[16px] md:text-[24px] md:leading-[24px] text-white">
                  {formattedValue || "0.0"}
                </span>
              </div>

              {showMax && (
                <button onClick={handleMaxClick} className="pr-[6px] text-white text-[10px] leading-[15px] md:text-[12px] md:leading-[18px] font-semibold ml-[10px] hover:text-[#ffffff80]">
                  Max
                </button>
              )}
            </div>
          </div>
          <div className="text-[10px] leading-[15px] md:text-[12px] md:leading-[18px] text-[#FFFFFF40]">
            Balance: {token && Helper.isNotEmpty(balance) ? formatUnits(balance, token.decimals) : "--"}
          </div>
        </div>
        <div
          className={
            "border border-[#FFFFFF40] bg-[#FFFFFF1A] h-[28px] md:h-[36px] flex items-center pl-[6px] md:pl-[8px] pr-[8px] md:pr-[16px] rounded-full cursor-pointer hover:bg-[#FFFFFF5A] " +
            (disabledSelectToken || disabled ? "opacity-80 pointer-events-none" : "")
          }
          onClick={() => openModal(<TokenOptions tokens={tokens?.filter((t) => t.address !== token?.address)} onSelectToken={onTokenChange} />)}
        >
          {token && (
            <div className="relative w-[18px] h-[18px] md:min-w-[24px] md:min-h-[24px]">
              <Image quality={100} src={token?.logoURI} alt={token.symbol} fill sizes="(max-width: 767px) 24px, 24px" className="rounded-full object-contain" />
            </div>
          )}
          <div className="text-[12px] leading-[18px] md:text-[16px] md:leading-[24px] text-white ml-[4px] md:ml-[8px] mr-[4px]">{token?.symbol || "Select a token"}</div>
          {!disabledSelectToken && <Image src="/icons/down.svg" width={12} height={8} alt="down-arrow" />}
        </div>
      </div>

      {/* LOCKED */}
      {locked && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-row md:flex-col items-center justify-center gap-[6px] bg-[#524b63] z-[10] pointer-events-none rounded-[12px] px-[12px]">
          <Image src="/icons/locked.svg" width={24} height={24} alt="locked" />
          <div className="text-white text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] font-medium text-center px-[16px] md:px-[24px]">
            The market price is outside your specified price range. <br className="hidden md:block" /> Single-asset deposit only.
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenInputPanel;
