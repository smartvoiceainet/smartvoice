'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import LazyLoad from './LazyLoad';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onLoadingComplete'> {
  lazyLoad?: boolean;
  lazyThreshold?: number;
}

/**
 * OptimizedImage component combines Next.js Image with lazy loading
 * and blur-up technique for improved Core Web Vitals metrics
 * Part of Step 4: Testing & Optimization
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazyLoad = true,
  lazyThreshold = 0.1,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Don't lazy load above-the-fold images that have priority flag
  if (priority || !lazyLoad) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoadingComplete={() => setIsLoaded(true)}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        {...props}
      />
    );
  }

  // Default blur placeholder if none provided
  const defaultBlurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiIC8+PC9zdmc+";

  return (
    <LazyLoad 
      height={typeof height === 'number' ? height : undefined} 
      width={typeof width === 'number' ? width : undefined}
      threshold={lazyThreshold}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoadingComplete={() => setIsLoaded(true)}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        {...props}
      />
    </LazyLoad>
  );
};

export default OptimizedImage;
