'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface ImgProps {
  src: string;
  alt?: string;
  caption?: ReactNode;
  className?: string;
}

function darkenImage(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const darkR = 13, darkG = 17, darkB = 23, whiteThreshold = 230;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (brightness > whiteThreshold) {
      data[i] = darkR;
      data[i + 1] = darkG;
      data[i + 2] = darkB;
    } else {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export default function Img({ src, alt = "", caption, className = "" }: ImgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  // Load image
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    imgRef.current = img;

    img.onload = () => {
      setIsLoaded(true);
    };

    img.onerror = (e) => {
      console.error('[Img] Failed to load image:', src, e);
    };
  }, [src]);

  // Draw on canvas when loaded or theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (isDark) {
      darkenImage(ctx);
    }
  }, [isDark, isLoaded]);

  return (
    <figure className={className || "my-8"}>
      <canvas
        ref={canvasRef}
        className="rounded-lg w-full"
        style={!isLoaded ? { minHeight: '200px', background: '#f5f5f5' } : undefined}
      />
      {caption && <figcaption className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">{caption}</figcaption>}
    </figure>
  );
}
