'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import {
  LOADING_BG_PHOTOS,
  LOADING_BG_PHOTOS_DESKTOP,
  MOBILE_BACKGROUND_PHOTOS,
} from '@/lib/loading-bg-photos';
import './loading-screen.css';

export { LOADING_BG_PHOTOS };

export const MOBILE_BG_PHOTOS = MOBILE_BACKGROUND_PHOTOS;

const MARQUEE_SAMPLE_SIZE = 24;
const DESKTOP_QUERY = '(min-width: 768px)';

/** Landscape set on desktop, portrait set on phones; falls back to mobile if no desktop set. */
export function useResponsivePhotos(
  mobile: readonly string[],
  desktop?: readonly string[],
) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isDesktop && desktop && desktop.length > 0 ? desktop : mobile;
}

function pickRandomPhotos(photos: readonly string[], count: number) {
  const next = [...photos];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next.slice(0, Math.min(count, next.length));
}

function splitMarqueeRows(photos: readonly string[]) {
  const top: string[] = [];
  const bottom: string[] = [];
  photos.forEach((src, index) => {
    (index % 2 === 0 ? top : bottom).push(src);
  });
  return [top, bottom] as const;
}

function MarqueeRow({
  photos,
  copies,
  direction,
  eagerCount,
}: {
  photos: readonly string[];
  copies: number;
  direction: 'left' | 'right';
  eagerCount: number;
}) {
  return (
    <div className={`loading-screen__marquee-row loading-screen__marquee-row--${direction}`}>
      <div className="loading-screen__slide-track">
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} className="loading-screen__slide-strip">
            {photos.map((src, index) => {
              const eager = copy === 0 && index < eagerCount;
              return (
                <div key={`${copy}-${src}`} className="loading-screen__slide-photo">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 38vw, 82vw"
                    quality={55}
                    priority={eager}
                    draggable={false}
                    decoding="async"
                    fetchPriority={copy === 0 && index < 2 ? 'high' : 'low'}
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoMarquee({
  photos,
  copies,
  variant,
  shuffle = true,
}: {
  photos: readonly string[];
  copies: number;
  variant: 'mobile' | 'desktop' | 'loader';
  shuffle?: boolean;
}) {
  const compact = !shuffle || photos.length <= 5;
  const [selected, setSelected] = useState(() =>
    compact ? [...photos] : photos.slice(0, MARQUEE_SAMPLE_SIZE),
  );

  useEffect(() => {
    if (compact) {
      setSelected([...photos]);
      return;
    }
    setSelected(pickRandomPhotos(photos, MARQUEE_SAMPLE_SIZE));
  }, [photos, compact]);

  const [top, bottom] = compact
    ? [selected, [...selected].reverse()]
    : splitMarqueeRows(selected);
  const eagerCount = compact ? selected.length : 3;

  return (
    <div className={`loading-screen__marquee loading-screen__marquee--${variant}`}>
      <MarqueeRow photos={top} copies={copies} direction="left" eagerCount={eagerCount} />
      <MarqueeRow photos={bottom} copies={copies} direction="right" eagerCount={eagerCount} />
    </div>
  );
}

/** Fixed photo marquee + veil — continuity from loading screen (photos display only). */
export function InvitePhotoBackdrop({
  className = '',
  photos,
  desktopPhotos,
}: {
  className?: string;
  photos?: readonly string[];
  desktopPhotos?: readonly string[];
}) {
  const reduceMotion = useReducedMotion();
  const copies = reduceMotion ? 1 : 2;
  const resolved = useResponsivePhotos(
    photos && photos.length > 0
      ? photos
      : LOADING_BG_PHOTOS.length > 0
        ? LOADING_BG_PHOTOS
        : MOBILE_BG_PHOTOS,
    desktopPhotos && desktopPhotos.length > 0
      ? desktopPhotos
      : LOADING_BG_PHOTOS_DESKTOP,
  );

  if (resolved.length === 0) return null;

  return (
    <div className={`invite-photo-backdrop ${className}`.trim()} aria-hidden="true">
      <PhotoMarquee photos={resolved} copies={copies} variant="mobile" />
      <div className="loading-screen__backdrop-veil" />
    </div>
  );
}
