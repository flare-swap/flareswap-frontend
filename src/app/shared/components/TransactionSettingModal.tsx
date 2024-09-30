import React, { useEffect, useMemo, useState } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";
// import Switch from './Switch';  // Import the custom Switch component

interface SlippageOption {
  value: number;
  label: string;
}

interface TransactionSettingProps {
  slippage: number;
  setSlippage: (v: number) => void;
  deadline: number;
  setDeadline: (v: number) => void;
}

export default function TransactionSettingModal({ slippage, setSlippage, deadline, setDeadline }: TransactionSettingProps) {
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const isCustomSlippage = useMemo(() => slippage !== 0.1 && slippage !== 0.5 && slippage !== 1, [slippage]);

  useEffect(() => {
    if (isCustomSlippage) {
      setCustomSlippage(slippage.toString() || "");
    }
  }, [isCustomSlippage]);

  const options: SlippageOption[] = [
    { value: 0.1, label: "0.1%" },
    { value: 0.5, label: "0.5%" },
    { value: 1, label: "1%" },
  ];

  const handleSlippageChange = (v: number) => {
    setSlippage(v);
    setCustomSlippage("");
  };

  const handleBlur = () => {
    const parsedValue = parseFloat(customSlippage);
    if (parsedValue > 0 && parsedValue <= 100) {
      setSlippage(parsedValue);
    } else {
      setCustomSlippage("");
    }
  };

  return (
    <div className="w-[350px] md:w-[339px] rounded-[12px] border border-[#FFFFFF1F] bg-[#1a1a1a] bg-opacity-90 backdrop-filter backdrop-blur-xl text-white">
      <div className="p-[12px] md:p-[16px] text-[12px] leading-[12px] md:text-[16px] md:leading-[16px] font-semibold ">Transaction Settings</div>
      {/* Slippage Tolerance */}
      <div className="p-[12px] md:p-[16px]">
        <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[14px] mb-[8px] md:mb-[16px]">Slippage Tolerance</div>
        <div className="grid grid-cols-4 gap-[8px]">
          {options.map((option) => (
            <button
              key={option.value.toString()}
              onClick={() => handleSlippageChange(option.value)}
              className={`h-[24px] md:h-[30px] flex items-center justify-center rounded-[4px] md:rounded-[6px] text-[10px] md:text-[14px] bg-[#ffffff1a] border border-[rgba(0,0,0,0)] hover:opacity-75 ${
                slippage === option.value ? "!bg-[#311F58] !border-[#C0A4FF]" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="relative">
            <NumericFormat
              value={customSlippage}
              onValueChange={(values: NumberFormatValues) => setCustomSlippage(values.value)}
              onBlur={handleBlur}
              className={`h-[24px] md:h-[30px] max-w-full flex items-center justify-center rounded-[4px] md:rounded-[6px] text-[10px] md:text-[14px] bg-[rgba(0,0,0,0)] border border-[#ffffff1a] px-[16px] focus-visible:outline-[#C0A4FF] ${
                isCustomSlippage ? "!bg-[#311F58] !border-[#C0A4FF]" : ""
              }`}
              allowNegative={false}
              placeholder="1.00"
              thousandSeparator
            />
            <div className="absolute right-[8px] top-[5px] w-fit text-[#FFFFFF80] text-[10px] md:text-[14px]">%</div>
          </div>
        </div>
      </div>
      {/* Transaction Deadline */}
      <div className="p-[12px] md:p-[16px]">
        <div className="text-[10px] leading-[10px] md:text-[14px] md:leading-[14px] mb-[8px] md:mb-[16px]">Transaction Deadline</div>
        <div className="grid grid-cols-4 gap-[8px] items-center">
          <NumericFormat
            value={deadline}
            onValueChange={(values: NumberFormatValues) => {
              if (values.floatValue > 0) {
                setDeadline(values.floatValue);
              }
            }}
            className={`h-[24px] md:h-[30px] max-w-[70px] flex items-center justify-center rounded-[4px] md:rounded-[6px] text-[10px] md:text-[14px] !bg-[rgba(0,0,0,0)] border border-[#ffffff1a] px-[16px] focus-visible:outline-[#C0A4FF]`}
            allowNegative={false}
            placeholder="20"
            thousandSeparator
          />
          <span className="text-[10px] leading-[10px] md:text-[14px] md:leading-[14px]">Minutes</span>
        </div>

      </div>
    </div>
  );
}
