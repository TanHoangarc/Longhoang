import React from 'react';

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
        src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png"
        alt="Long Hoàng Logistics Logo"
        className="max-h-12 md:max-h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
