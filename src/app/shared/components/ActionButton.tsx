import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  children?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, isLoading = false, loadingText, className = "", children }) => {
  const buttonText = isLoading ? loadingText || "Loading..." : children;
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`w-full h-[40px] md:h-[54px] flex items-center justify-center gap-[8px] rounded-[8px] md:rounded-[12px] text-[12px] leading-[18px] md:text-[16px] md:leading-[24px] font-semibold
        ${isDisabled ? "bg-[#262626] text-[#FFFFFF80] cursor-not-allowed" : "bg-gradient-btn text-white"}
        ${isLoading ? "opacity-70" : ""}
        ${className}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {isLoading && <div className="spinner-2" />}
      {buttonText}
    </button>
  );
};

export default ActionButton;
