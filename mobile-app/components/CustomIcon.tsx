import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface CustomIconProps {
  name: string;
  size: number;
  color: string;
  style?: any;
}

const CustomIcon: React.FC<CustomIconProps> = ({ name, size, color, style }) => {
  return (
    <Ionicons
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default CustomIcon; 