import React from 'react';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SmartVoiceAILogo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  // Size mapping
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizeClass = sizeMap[size];
  
  return (
    <div className={`${sizeClass} ${className} relative`}>
      {/* Voice Wave SVG */}
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="45" fill="#0EA5E9" />
        
        {/* Brain Icon (representing AI) */}
        <path
          d="M50 25C41.716 25 35 31.716 35 40C35 43.283 36.082 46.34 37.929 48.828C36.163 50.662 35 53.136 35 55.833C35 61.452 39.548 66 45.167 66H50M50 25C58.284 25 65 31.716 65 40C65 43.283 63.918 46.34 62.071 48.828C63.837 50.662 65 53.136 65 55.833C65 61.452 60.452 66 54.833 66H50M50 25V66"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Sound Waves (representing Voice) */}
        <path
          d="M30 50C27 50 25 48 25 45C25 42 27 40 30 40"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M24 55C20 55 17 52 17 48C17 44 20 41 24 41"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M70 50C73 50 75 48 75 45C75 42 73 40 70 40"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M76 55C80 55 83 52 83 48C83 44 80 41 76 41"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Bottom Microphone */}
        <rect x="45" y="66" width="10" height="15" rx="2" fill="white" />
      </svg>
    </div>
  );
};

export default SmartVoiceAILogo;
