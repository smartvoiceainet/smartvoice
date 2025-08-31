import React from 'react';
import Image from 'next/image';

type MainLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const MainLogo: React.FC<MainLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  // Size mapping
  const sizeMap = {
    sm: 'w-24 h-auto',
    md: 'w-48 h-auto',
    lg: 'w-64 h-auto',
    xl: 'w-96 h-auto'
  };

  const sizeClass = sizeMap[size];
  
  return (
    <div className={`${sizeClass} ${className} relative`}>
      <Image
        src="/images/logomain.png"
        alt="Smart Voice AI Main Logo"
        width={500}
        height={300}
        className="w-full h-auto rounded-md"
        priority
      />
    </div>
  );
};

export default MainLogo;
