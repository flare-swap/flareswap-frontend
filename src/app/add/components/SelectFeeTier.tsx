import { useState } from "react";

const feeTiers = [
  {
    value: 100,
    label: "Best for very stable pairs.",
  },
  {
    value: 500,
    label: "Best for stable pairs.",
  },

  {
    value: 3000,
    label: "Best for most pairs.",
  },
  {
    value: 10000,
    label: "Best for exotic pairs.",
  },
];

interface SelectFeeTierProps {
  feeTier: number | null;
  setFeeTier: (v: number) => void;
  disabled?: boolean;
}

export default function SelectFeeTier({ feeTier, setFeeTier, disabled = false }: SelectFeeTierProps) {
  const [showFeeTier, setShowFeeTier] = useState(true);

  return (
    <>
      <div className={"border border-[#FFFFFF0D] rounded-[12px] bg-[#00000040] p-[12px] " + (disabled ? "opacity-50 pointer-events-none" : "")}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-white mb-[4px] font-semibold">{feeTier ? (feeTier / 10000).toFixed(2) + "%" : ""} Fee tier</div>
            <div className="text-[10px] leading-[10px] md:text-[12px] md:leading-[16px] text-[#ffffff80]">The % you will earn in fees.</div>
          </div>
          <span className="hover:opacity-80 underline underline-offset-2 text-[#C0A4FF] text-[12px] leading-[14px] md:text-[14px] md:leading-[14px] font-semibold cursor-pointer" onClick={() => setShowFeeTier(!showFeeTier)}>{showFeeTier ? "Hide" : "Edit"}</span>
        </div>

        {showFeeTier && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px] mt-[12px]">
            {feeTiers.map((f) => (
              <button
                key={f.value}
                className={"border border-[#FFFFFF0D] text-white bg-[#FFFFFF0D] p-[10px] rounded-[8px] hover:opacity-80 " + (feeTier === f.value ? "!border-[#C0A4FF] !bg-[#311F58]" : "")}
                onClick={() => setFeeTier(f.value)}
              >
                <div className="text-[12px] leading-[14px] md:text-[14px] md:leading-[18px] text-start mb-[6px] font-semibold">{(f.value / 10000).toFixed(2)}%</div>
                <div className="text-[10px] leading-[10px] text-start text-[#FFFFFF80]">{f.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
