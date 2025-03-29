import React from 'react';
import { useLocation } from 'wouter';
import { hideBackButton } from '@/lib/telegram';

const BackButton = ({ title, onBack }) => {
  const [, setLocation] = useLocation();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation('/');
      hideBackButton();
    }
  };
  
  return (
    <div className="flex items-center" onClick={handleBack}>
      <i className='bx bx-chevron-left text-2xl text-primary'></i>
      <span className="font-medium">{title}</span>
    </div>
  );
};

export default BackButton;
