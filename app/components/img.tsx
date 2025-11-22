'use client';

import { useRef, useEffect, useState, ReactNode, CSSProperties } from 'react';
import { useTheme } from 'next-themes';

interface ImgProps {
  src: string;
  alt?: string;
  caption?: ReactNode;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
}

const applyInverseFilter = (ctx: CanvasRenderingContext2D): void => {
  const buf = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < buf.data.length; i += 4) {
    buf.data[i] = 255 - buf.data[i];
    buf.data[i + 1] = 255 - buf.data[i + 1];
    buf.data[i + 2] = 255 - buf.data[i + 2];
    const f = 0.2126 * buf.data[i] + 0.7152 * buf.data[i + 1] + 0.0722 * buf.data[i + 2];
    if (f < 50) {
      buf.data[i + 3] = 0;
    }
  }
  ctx.putImageData(buf, 0, 0);
};


export default function Img({
  src,
  alt = '',
  caption,
  className = '',
  imgClassName = '',
  width,
  height
}: ImgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Clien
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  useEffect(() => {
    if (!src) {
      return;
    }

    const img = new Image();
    img.src = src;
    imgRef.current = img;

    img.onload = () => setIsLoaded(true);
    img.onerror = (e) => console.error('[Img] Failed to load:', src, e);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (isDark) {
      applyInverseFilter(ctx);
    }
  }, [isDark, isLoaded]);

  const canvasStyle: CSSProperties = {
    aspectRatio: width && height ? `${width} / ${height}` : undefined,
    background: !isLoaded ? 'var(--color-bg-secondary)' : undefined,
  };

  return (
    <figure className={className || 'my-8'}>
      <canvas
        ref={canvasRef}
        className={`rounded-lg ${imgClassName || 'w-full'}`}
        style={canvasStyle}
      />
      {caption && (
        <figcaption
          className="text-sm text-center mt-2"
          style={{ color: 'var(--color-dim)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
