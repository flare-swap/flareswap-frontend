"use client";

import { usePathname } from "next/navigation";
import ContactSupport from "./ContactSupport";
import SocialMediaLinks from "./SocialMediaLinks";

const Footer = () => {
  const pathname = usePathname();

  return (
    <div className={pathname === "/" ? "bg-secondary-bg": "bg-transparent"}>
      <div className="max-w-[1440px] px-[24px] flex items-center justify-center lg:justify-between h-[102px] lg:h-[64px] mx-auto flex-col lg:flex-row gap-[16px]">
        <div className="text-[12px] leading-[12px] lg:leading-[18px] text-[#FFFFFF99] text-nowrap flex items-center gap-[16px] lg:gap-[6px] flex-col lg:flex-row">
          Copyright © 2024. All Rights Reserved by FlareSwap - 
          <ContactSupport/>
        </div>
        <SocialMediaLinks />
      </div>
    </div>
  );
};

export default Footer;
