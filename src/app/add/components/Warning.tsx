import Image from "next/image"

export default function Warning({text}: {text: string}){
    return   <div className="my-[12px] text-[#d67e0a] border border-[#d67e0a] rounded-[12px] p-[12px] flex items-center bg-[#d67e0a50] gap-[12px]">
    <Image src="/icons/warning.svg" width={20} height={20} alt="warning" />
    <p className="text-[10px] leading-[12px] lg:text-[12px] lg:leading-[14px]">{text}</p>
  </div>
}