import { Button } from '@mui/material';
import type { CustomButtonProps } from '../../../types/components';

const CustomButton: React.FC<CustomButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false, 
  variant = 'contained',
  color = 'primary'
}) => {
  const handleClick = () => {
    alert("I see you :)");
  };
  
  return (
    <Button 
      variant={variant}
      color={color}
      onClick={onClick || handleClick} 
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default CustomButton; 