import React from 'react';
import logoHd from '../assets/logo-hd.png';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
}

export const LongHoangLogo: React.FC<LogoProps> = ({
  className = 'h-12',
}) => {
  return (
    <div className={`flex items-center justify-center select-none cursor-pointer ${className}`}>
      <img
        src={logoHd}
        alt="Long Hoàng Logistics Logo"
        className="max-h-12 md:max-h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
        loading="eager"
      />
    </div>
  );
};

