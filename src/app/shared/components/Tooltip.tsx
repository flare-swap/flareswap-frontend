import React, { useState } from "react";
import Image from "next/image";

export default function Tooltip({ text, children }: { text?: string, children?: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Image src="/icons/info.svg" width={16} height={16} alt="info" className="cursor-pointer" />
      {isHovered && (
        <div className="text-[10px] md:text-[13px] leading-[14px] cursor-pointer absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[210px] md:w-[310px] rounded-[8px] bg-[#fff] bg-opacity-70 backdrop-filter backdrop-blur-xl text-[#1f1f1f] p-[12px] before:content-[''] before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-[#ffffffbb]">
          {text}
          {children}
        </div>
      )}
    </span>
  );
}
