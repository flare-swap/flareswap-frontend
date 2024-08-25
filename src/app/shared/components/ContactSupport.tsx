"use client";

const ContactSupport = () => {
  const mailTo = () => {
    const email = "business.flareswap@gmail.com";
    const subject = "FlareSwap Support Ticket: Your subject";
    const body = "";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };
  return (
    <div className="text-[12px] leading-[12px] lg:leading-[18px] text-white font-semibold underline underline-offset-2 inline-block cursor-pointer" onClick={mailTo}>
      Contact & Support
    </div>
  );
};

export default ContactSupport;
