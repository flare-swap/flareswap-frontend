"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const HeroImage = () => {
  return (
    <div className="relative w-[132.86px] h-[120px] lg:min-w-[186px] lg:h-[168px]">
      <DotLottieReact src="/lottie/frame.json" loop autoplay />
    </div>
  );
};

export default HeroImage;
