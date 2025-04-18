import type React from 'react';
import { useState } from 'react';
import placeholderSrc from '../assets/placeholder.svg';
import useLazyLoad from '../hooks/useLazyLoad';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  loadingClassName?: string;
}

const Image: React.FC<ImageProps> = ({
                                       src,
                                       alt,
                                       className = '',
                                       loadingClassName = 'image-loading',
                                     }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, imageRef] = useLazyLoad<HTMLImageElement>({
    threshold: 0.1,
    rootMargin: '200px',
    triggerOnce: true,
  });

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  const imageStyle = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  return (
    <img
      ref={imageRef}
      className={`${className} ${!isLoaded && !hasError ? loadingClassName : ''}`}
      src={isVisible ? (hasError ? placeholderSrc : src) : placeholderSrc}
      alt={alt}
      style={imageStyle}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default Image;