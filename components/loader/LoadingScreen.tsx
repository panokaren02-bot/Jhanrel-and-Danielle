'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { PhotoMarquee } from '@/components/loader/invite-photo-backdrop';
import { PlainAtmosphere } from '@/components/loader/PlainAtmosphere';
import './loading-screen.css';

interface LoadingScreenProps {
  onComplete: () => void;
  onFadeStart?: () => void;
}

const STAGGER_DELAY_MS = 1100;
const FIRST_BOX_DELAY_MS = 600;
const BOX_TRANSITION_MS = 1100;
/** Plain silk date — follows couple-name reveal (~450ms + 1s animation) */
const PLAIN_DATE_FIRST_MS = 720;
const PLAIN_DATE_STAGGER_MS = 380;
const PLAIN_DATE_STEPS = 4;
const FADE_OUT_MS = 1400;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Soft pollen-like motes drifting up behind the invitation card (plain mode)
const PLAIN_MOTES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  size: 3 + ((i * 7) % 5),
  dur: 14 + ((i * 5) % 10),
  delay: -((i * 3.1) % 18),
  drift: ((i % 2 === 0 ? 1 : -1) * (12 + ((i * 11) % 24))),
}))

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onFadeStart }) => {
  const siteConfig = useSiteConfig();
  // Fall back to the bundled config if a remote override is missing this block.
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const totalDurationMs = content.durationMs;
  const statusMessages = content.statusMessages;
  const isPlain = content.display === 'plain';
  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const showBackdrop = !isPlain && backgroundPhotos.length > 0;
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;

  const reduceMotion = useReducedMotion();
  const [fadeOut, setFadeOut] = useState(false);
  const [visibleBoxes, setVisibleBoxes] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const photoCopies = reduceMotion ? 1 : 2;

  const weddingDate = useMemo(() => new Date(siteConfig.wedding.date), [siteConfig.wedding.date]);
  const hasValidDate = !Number.isNaN(weddingDate.getTime());

  const countdownText = useMemo(() => {
    if (!hasValidDate) return '';
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, hasValidDate, now, weddingDate]);

  const dateParts = hasValidDate
    ? [
        weddingDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        String(weddingDate.getDate()).padStart(2, '0'),
        String(weddingDate.getFullYear()),
      ]
    : [];

  // Plain display: full month + weekday for the engraved-style date line
  const silkDate = hasValidDate
    ? {
        weekday: weddingDate.toLocaleString('en-US', { weekday: 'long' }),
        month: weddingDate.toLocaleString('en-US', { month: 'long' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;

  const ceremonyLine = siteConfig.ceremony.time ?? '';
  const coupleNames = `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}`;


  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setVisibleBoxes(isPlain && hasValidDate ? PLAIN_DATE_STEPS : dateParts.length);
      return;
    }
    if (isPlain && hasValidDate) {
      const timers = Array.from({ length: PLAIN_DATE_STEPS }, (_, i) =>
        setTimeout(() => setVisibleBoxes(i + 1), PLAIN_DATE_FIRST_MS + i * PLAIN_DATE_STAGGER_MS),
      );
      return () => timers.forEach(clearTimeout);
    }
    if (dateParts.length === 0) return;
    const timers = dateParts.map((_, i) =>
      setTimeout(() => setVisibleBoxes(i + 1), FIRST_BOX_DELAY_MS + i * STAGGER_DELAY_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion, isPlain, hasValidDate, dateParts.length]);

  useEffect(() => {
    if (statusMessages.length < 2) return;
    const step = totalDurationMs / statusMessages.length;
    const t = setInterval(
      () => setStatusIndex((i) => Math.min(i + 1, statusMessages.length - 1)),
      step,
    );
    return () => clearInterval(t);
  }, [statusMessages.length, totalDurationMs]);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      onFadeStart?.();
      setFadeOut(true);
      fadeTimer = setTimeout(onComplete, reduceMotion ? 200 : FADE_OUT_MS);
    }, totalDurationMs);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeTimer);
    };
  }, [onComplete, onFadeStart, reduceMotion, totalDurationMs]);

  return (
    <div
      className={`loading-screen loading-screen--invitation${isPlain ? ' loading-screen--plain' : ''} fixed inset-0 z-50 flex flex-col overflow-hidden overscroll-none h-dvh max-h-dvh w-screen${fadeOut ? ' is-fading' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      aria-live="polite"
      aria-busy={!fadeOut}
      aria-label="Loading invitation"
      style={
        {
          pointerEvents: fadeOut ? 'none' : 'auto',
          ...(isPlain && {
            '--ls-plain-bg': plainTheme.background,
            '--ls-plain-ink': plainTheme.text,
            '--ls-plain-accent': plainTheme.accent,
          }),
        } as React.CSSProperties
      }
    >
      {showBackdrop && (
        <>
          <div className="loading-screen__backdrop" aria-hidden="true">
            <PhotoMarquee photos={backgroundPhotos} copies={photoCopies} variant="loader" shuffle={false} />
            <div className="loading-screen__backdrop-veil" />
          </div>
          <div className="loading-screen__readability-scrim" aria-hidden="true" />
        </>
      )}

      {isPlain && (
        <>
          <PlainAtmosphere baseColor={plainTheme.background} />
          <div className="loading-screen__plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, className: 'left-0 top-0' },
                { src: cornerDecos.topRight, className: 'right-0 top-0' },
                { src: cornerDecos.bottomLeft, className: 'left-0 bottom-0' },
                { src: cornerDecos.bottomRight, className: 'right-0 bottom-0' },
              ] as const
            ).map(({ src, className }) => (
              <div
                key={src}
                className={`loading-screen__plain-corner-slot pointer-events-none absolute ${className}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="loading-screen__plain-corner-img" />
              </div>
            ))}
          </div>
          <div className="loading-screen__plain-frame" aria-hidden="true" />
          <div className="ls-plain-glow" aria-hidden="true" />
          {!reduceMotion && (
            <div className="ls-plain-motes" aria-hidden="true">
              {PLAIN_MOTES.map((m, i) => (
                <span
                  key={i}
                  className="ls-plain-mote"
                  style={
                    {
                      '--x': `${m.x}%`,
                      '--size': `${m.size}px`,
                      '--dur': `${m.dur}s`,
                      '--delay': `${m.delay}s`,
                      '--drift': `${m.drift}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="loading-screen__save-date">
        <header className="flex flex-col items-center w-full pt-10 sm:pt-14 md:pt-16 px-4 sm:px-6 flex-shrink-0">
          {isPlain && plainInvite.ornament && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={plainInvite.ornament}
              alt=""
              aria-hidden="true"
              className="loading-screen__plain-ornament ls-reveal"
              style={{ '--ls-delay': '0ms' } as React.CSSProperties}
            />
          )}
          <h1 className="loading-screen__std-headline ls-reveal" style={{ '--ls-delay': '0ms' } as React.CSSProperties}>
            {content.headline}
          </h1>
          {countdownText && (
            <p className="loading-screen__std-kicker ls-reveal" style={{ '--ls-delay': '250ms' } as React.CSSProperties}>
              {countdownText}
            </p>
          )}
        </header>

        {isPlain && plainInvite.lineAbove && (
          <p className="loading-screen__plain-line ls-reveal" style={{ '--ls-delay': '350ms' } as React.CSSProperties}>
            {plainInvite.lineAbove}
          </p>
        )}

        <div className="loading-screen__std-names-slot ls-reveal" style={{ '--ls-delay': '450ms' } as React.CSSProperties}>
          <div
            className="loading-screen__std-names couple-name-lockup"
            role="img"
            aria-label={coupleNames}
            style={{
              maskImage: `url("${content.coupleNameImage}")`,
              WebkitMaskImage: `url("${content.coupleNameImage}")`,
            }}
          />
        </div>

        {isPlain && plainInvite.lineBelow && (
          <p className="loading-screen__plain-line ls-reveal" style={{ '--ls-delay': '550ms' } as React.CSSProperties}>
            {plainInvite.lineBelow}
          </p>
        )}

        {isPlain && silkDate && (
          <div
            className="ls-silk-date px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0"
            role="img"
            aria-label={silkDate.label}
          >
            <p className={`ls-silk-date__weekday${visibleBoxes >= 1 ? ' is-visible' : ''}`}>
              {silkDate.weekday}
            </p>
            <div
              className={`ls-silk-date__row${visibleBoxes >= 2 ? ' is-visible' : ''}`}
              aria-hidden={visibleBoxes < 2}
            >
              <span className={`ls-silk-date__side ls-silk-date__side--month${visibleBoxes >= 2 ? ' is-visible' : ''}`}>
                {silkDate.month}
              </span>
              <span className={`ls-silk-date__day${visibleBoxes >= 3 ? ' is-visible' : ''}`}>
                {silkDate.day}
              </span>
              <span className={`ls-silk-date__side ls-silk-date__side--year${visibleBoxes >= 4 ? ' is-visible' : ''}`}>
                {silkDate.year}
              </span>
            </div>
          </div>
        )}

        {!isPlain && dateParts.length > 0 && (
          <div className="flex items-stretch justify-center gap-3 sm:gap-4 md:gap-6 px-4 pt-1 pb-3 sm:pb-4 flex-shrink-0">
            {dateParts.map((value, i) => {
              const isVisible = i < visibleBoxes;
              const photo = content.photos[i % content.photos.length];
              return (
                <div
                  key={content.dateLabels[i] ?? i}
                  className="loading-screen__std-box relative flex-1 max-w-[28vw] sm:max-w-[140px] md:max-w-[160px] aspect-[3/4] overflow-hidden rounded-2xl"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.94)',
                    transition: reduceMotion
                      ? 'none'
                      : `opacity ${BOX_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${BOX_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                >
                  {photo && (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      priority={i === 0}
                      className="loading-screen__std-box-img object-cover"
                      sizes="(max-width: 640px) 28vw, 160px"
                    />
                  )}
                  <div className="loading-screen__std-box-overlay absolute inset-0" />
                  <div className="absolute bottom-2.5 inset-x-0 sm:bottom-3 flex flex-col items-center">
                    <span className="loading-screen__std-box-num text-2xl sm:text-3xl md:text-4xl select-none leading-none text-center">
                      {value}
                    </span>
                    <span className="loading-screen__std-box-label text-[9px] sm:text-[10px] uppercase mt-1">
                      {content.dateLabels[i]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="loading-screen__std-footer flex flex-col items-center w-full pt-1 px-6 flex-shrink-0">
          {content.showCeremonyDetails && (ceremonyLine || siteConfig.ceremony.location) && (
            <div className="loading-screen__std-venue ls-reveal" style={{ '--ls-delay': '900ms' } as React.CSSProperties}>
              {ceremonyLine && <span className="loading-screen__std-venue-time">{ceremonyLine}</span>}
              {siteConfig.ceremony.location && (
                <span className="loading-screen__std-venue-name">{siteConfig.ceremony.location}</span>
              )}
            </div>
          )}
          <p className="loading-screen__std-eyebrow ls-reveal" style={{ '--ls-delay': '1100ms' } as React.CSSProperties}>
            {content.eyebrow}
          </p>
          <p className="loading-screen__std-copy ls-reveal" style={{ '--ls-delay': '1250ms' } as React.CSSProperties}>
            {content.message}
          </p>
          <div className="loading-screen__std-rule" aria-hidden="true" />
          {statusMessages.length > 0 && (
            <p key={statusIndex} className="loading-screen__std-status">
              {statusMessages[statusIndex]}
            </p>
          )}
          <div
            className="w-full max-w-[200px] sm:max-w-xs mx-auto"
            role="progressbar"
            aria-label="Loading invitation"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="loading-screen__std-track">
              <div
                className="loading-screen__std-bar"
                style={{ animationDuration: `${totalDurationMs}ms` }}
              />
              {isPlain && (
                <span
                  className="ls-plain-progress-glow"
                  style={{ animationDuration: `${totalDurationMs}ms` }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
