import React, { useState, useEffect, useRef } from 'react';
import { resolveImageFromFirestore, clientImageCache } from '../utils/firebaseStorage';
import { ImageIcon } from 'lucide-react';

export interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
  containerClassName?: string;
}

/**
 * Universal, self-healing image component for Long Hoàng Logistics.
 * 
 * Features:
 * 1. Synchronously reads from memory cache (0ms instant display).
 * 2. Proactively resolves Firebase Firestore uploaded images (img_xxx) in background.
 * 3. On load failure (e.g. Vercel SPA returning index.html for /api/images/), safely intercepts
 *    the error and retrieves the exact binary/base64 from Cloud Firestore.
 * 4. Never displays a broken image icon.
 */
export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc,
  fallbackText,
  containerClassName = '',
  onError,
  ...props
}) => {
  const getInitialSrc = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (clientImageCache.has(url)) return clientImageCache.get(url)!;

    const match = url.match(/(img_\d+_[a-zA-Z0-9_-]+)/);
    if (match && clientImageCache.has(match[1])) {
      return clientImageCache.get(match[1])!;
    }
    return url;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => getInitialSrc(src));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initial = getInitialSrc(src);
    setCurrentSrc(initial);
    setHasError(false);
    setIsLoading(true);

    if (src && (src.includes('img_') || src.includes('/api/images/')) && !initial.startsWith('data:')) {
      resolveImageFromFirestore(src).then((resolved) => {
        if (isMounted && resolved) {
          setCurrentSrc(resolved);
          setIsLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  const handleError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.dataset.triedFallback === 'true') {
      if (fallbackSrc && target.src !== fallbackSrc) {
        target.src = fallbackSrc;
      } else {
        setHasError(true);
      }
      if (onError) onError(e);
      return;
    }

    target.dataset.triedFallback = 'true';

    if (src) {
      const resolved = await resolveImageFromFirestore(src);
      if (resolved) {
        setCurrentSrc(resolved);
        target.src = resolved;
        setHasError(false);
        return;
      }
    }

    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      target.src = fallbackSrc;
    } else {
      setHasError(true);
    }

    if (onError) onError(e);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (!src || hasError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          loading="lazy"
          referrerPolicy="no-referrer"
          {...props}
        />
      );
    }

    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-800/80 text-slate-400 p-2 text-center select-none ${className} ${containerClassName}`}
      >
        <ImageIcon className="w-5 h-5 opacity-60 mb-1" />
        <span className="text-[10px] leading-tight line-clamp-1 opacity-70">
          {fallbackText || alt || 'Hình ảnh'}
        </span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};

export default AppImage;
