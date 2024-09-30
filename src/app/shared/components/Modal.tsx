"use client";

import React from "react";
import ReactDOM from "react-dom";
import { useModal } from "../contexts/ModalContext";

interface ModalProps {}

const Modal: React.FC<ModalProps> = () => {
  const { isModalOpen, closeModal, modalContent } = useModal();

  if (!isModalOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[50]" onClick={() => closeModal()}></div>
      <div className="fixed z-[51] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{modalContent}</div>
    </>,
    document.getElementById("modal-root")!
  );
};

export default Modal;
