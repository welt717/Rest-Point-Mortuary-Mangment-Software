import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #CBD5E1;

  h3 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    margin: 0;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748B;
    transition: color 0.2s ease;

    &:hover {
      color: #DC2626;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #CBD5E1;
`;

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <h3>{title}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          {/* Footer buttons would be passed as children */}
        </ModalFooter>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;