import Image from "next/image";
// Import css files
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { NETWORKS } from "../constants/networks";

const Carousel = () => {
  return (
    <div className="max-w-[930px] md:mx-auto relative">
      <div className="overflow-hidden">
        <div className="flex gap-[8px] lg:gap-[16px] items-center flex-nowrap animate-scroll w-max">
          {[...NETWORKS, ...NETWORKS].map((item, index) => (
            <div key={index} className="flex-shrink-0">
              <div className="h-[22px] lg:h-[30px] flex items-center gap-[8px] rounded-[4px] bg-[#ffffff10] px-[12px] flex-nowrap w-max">
                <div className="relative w-[14px] h-[14px] lg:w-[18px] lg:h-[18px]">
                  <Image src={`/icons/networks/${item.image}`} alt={item.image} fill sizes="(max-width: 1024px) 18px, 18px" className="object-contain" />
                </div>
                <div className="text-[10px] leading-[12.5px] lg:text-[14px] lg:leading-[17.5px] text-white font-semibold text-nowrap">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-blur-left absolute left-0 w-[60px] lg:w-[80px] h-[22px] lg:h-[30px] top-0"></div>
      <div className="bg-gradient-blur-right absolute right-0 w-[60px] lg:w-[80px] h-[22px] lg:h-[30px] top-0"></div>
    </div>
  );
};

export default Carousel;
