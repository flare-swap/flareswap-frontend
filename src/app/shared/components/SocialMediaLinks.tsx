import Image from "next/image";
import Link from "next/link";

const SocialMediaLinks = () => {
  const socialLinks = [
    { icon: "/icons/social-media/x.svg", alt: "X (Twitter)", url: "https://x.com/FlareSwapDEX" },
    { icon: "/icons/social-media/discord.svg", alt: "Discord", url: "https://discord.com/invite/zr5ESYK9nF" },
    { icon: "/icons/social-media/doc.svg", alt: "Documentation", url: "https://docs.flareswap.finance" },
  ];

  return (
    <div className="flex items-center gap-[20px]">
      {socialLinks.map((link, index) => (
        <Link key={index} href={link.url} target="_blank" rel="noopener noreferrer">
          <div className="relative w-[14px] h-[14px] lg:min-w-[24px] lg:h-[24px]">
            <Image src={link.icon} alt={link.alt} fill sizes="(max-width: 1024px) 24px, 24px" className="object-contain" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SocialMediaLinks;
