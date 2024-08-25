"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SocialMediaLinks from "./SocialMediaLinks";
import { AnimatePresence, motion } from "framer-motion";
import ConnectWalletBtn from "./ConnectWalletBtn";

const menus = [
  {
    label: "Home",
    route: "/",
  },
  {
    label: "Swap",
    route: "/swap",
  },
  {
    label: "NFTs",
    route: "/nfts",
  },
  {
    label: "Bridge",
    route: "/bridge",
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const modalVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <>
      <div className="h-[52px] lg:h-[84px] flex items-center justify-between max-w-[1440px] mx-auto px-[8px] md:px-[16px] lg:px-[24px]">
        <div className="flex gap-[24px] items-center">
          <Link href={"/"}>
            <div className="relative w-[32px] h-[32px] lg:w-[36px] lg:h-[36px]">
              <Image src="/logo.svg" alt="logo" fill sizes="(max-width: 1024px) 36px, 36px" className="object-contain" />
            </div>
          </Link>
          {menus.map((item, index) => (
            <Link
              key={index}
              href={item.route}
              className={`hidden lg:inline font-semibold ${pathname === item.route ? "text-white" : "text-grey-300 hover:text-white"} transition-colors duration-200`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-[10px] items-center">
          <ConnectWalletBtn/>
          <Image className="lg:hidden" src={"/icons/hamburger.svg"} width={32} height={32} alt="menu" onClick={() => setIsMenuOpen(true)}></Image>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-[80] z-[40]"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <motion.div className="fixed top-0 left-0 bottom-0 w-full z-[50]" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <div className="p-[8px] flex justify-end">
                <Image className="lg:hidden" src={"/icons/close.svg"} width={32} height={32} alt="menu" onClick={() => setIsMenuOpen(false)}></Image>
              </div>
              <div className="flex flex-col gap-[32px] px-[40px] mt-[32px]">
                {menus.map((item, index) => (
                  <Link
                    key={index}
                    href={item.route}
                    className={`font-semibold text-[16px] text-start ${pathname === item.route ? "text-white" : "text-grey-300 hover:text-white"} transition-colors duration-200`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-[16px] right-[16px]">
                <SocialMediaLinks />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
