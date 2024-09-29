import { Button } from '@/components/ui/button'
import React, { useState } from "react";
import HowToPlay from './howToPlay';
import { X } from 'lucide-react';


// モーダルコンポーネントのプロパティ型
interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// モーダルコンポーネントの定義
const ModalComponent = ({ show, onClose, children }: ModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className='z-10' style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        {children}
        <button className='absolute top-24 right-64 text-white' onClick={onClose}>
        <X />
        </button>
      </div>
    </div>
  );
};

// 親コンポーネント
const HowToPlaySection = () => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Button className="bg-[#808080] text-[#ffffff]  w-full" onClick={openModal}>あそびかた</Button>
      <ModalComponent show={showModal} onClose={closeModal}>
        <div>
          <HowToPlay />
        </div>
      </ModalComponent>
    </div>
  );
};

// スタイル定義
const styles = {
  modalBackdrop: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "transparent",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default HowToPlaySection;

