import React from 'react';
import Image from 'next/image';

type ImageLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SmartVoiceAIImageLogo: React.FC<ImageLogoProps> = ({ 
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
        src="/images/smartvoiceclearbackcropped.png"
        alt="Smart Voice AI Logo"
        width={900}
        height={500}
        className="w-full h-auto rounded-md"
        style={{objectFit: 'contain'} as React.CSSProperties}
        priority
      />
    </div>
  );
};

export default SmartVoiceAIImageLogo;
