'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  width?: string | number;
  threshold?: number;
  placeholder?: React.ReactNode;
  className?: string;
}

/**
 * LazyLoad component to improve performance by only loading content
 * when it comes into the viewport (for Step 4: Testing & Optimization)
 */
const LazyLoad = ({
  children,
  height = 'auto',
  width = '100%',
  threshold = 0.1,
  placeholder,
  className = '',
}: LazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={containerRef}
      className={`lazy-load-container ${className}`}
      style={{
        height: !isVisible ? height : 'auto',
        width: !isVisible ? width : 'auto',
        overflow: 'hidden',
      }}
    >
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div
            style={{
              height: height,
              width: width,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
          </div>
        )
      )}
    </div>
  );
};

export default LazyLoad;
