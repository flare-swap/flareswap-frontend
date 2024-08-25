'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { useModal } from '../contexts/ModalContext';

interface ModalProps {}

const Modal: React.FC<ModalProps> = () => {
  const { isModalOpen, closeModal, modalContent } = useModal();

  if (!isModalOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
      <div className="w-full max-w-lg mx-3">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex justify-end text-2xl">
            <Image 
              src="/icons/close-black.svg" 
              alt="Close"
              width={24} 
              height={24} 
              onClick={() => closeModal()}
              className="cursor-pointer"
            />
          </div>
          {modalContent}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default Modal;