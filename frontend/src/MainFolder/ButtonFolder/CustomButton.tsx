import React from 'react';
import './CustomButton.css'; 

interface CustomButtonProps {
  label: string;
  onClick?: () => void; 
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}


const CustomButton: React.FC<CustomButtonProps> = ({ label, onClick, disabled = false, variant = 'primary' }) => {
    
  
  const handleClick = () => {
    alert("I see you :)");
  };
  
  return (
    <button 
      className={`custom-button ${variant}`} 
      onClick={onClick || handleClick} 
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default CustomButton;
