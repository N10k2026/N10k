'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * useLongPressVideo
 * -----------------
 * On touch devices there is no "hover", so the product-card video preview
 * never plays. This hook returns touch handlers that, when the user holds
 * their finger on the card for ~350ms without scrolling, start the video
 * (mirroring desktop hover behaviour). Lifting the finger or moving it
 * beyond the tolerance pauses the video again.
 *
 * Importantly, after a long-press fires we flag it so the subsequent
 * `click` event (which the browser always dispatches after `touchend`)
 * can be suppressed — otherwise opening the product detail would clobber
 * the video preview.
 *
 * Usage:
 *   const touch = useLongPressVideo(videoRef, () => hasVideo, onPlay, onStop);
 *   <div {...touch.handlers} onClick={(e) => {
 *     if (touch.consumedClick()) return;   // long-press happened, swallow click
 *     onViewDetail(product);
 *   }} />
 *
 * The hook is a no-op on desktop (mouse devices) because touchstart never
 * fires there — desktop keeps using onMouseEnter/Leave.
 */
const LONG_PRESS_DELAY = 350; // ms before video starts
const MOVE_TOLERANCE = 10; // px — if finger moves more than this, cancel

export function useLongPressVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  hasVideoFn: () => boolean,
  onPlay?: () => void,
  onStop?: () => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isActiveRef = useRef(false);
  // Set to true when a long-press actually fired, so the next click can be
  // swallowed. Reset immediately after being read.
  const consumedClickRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopVideo = useCallback(() => {
    clearTimer();
    if (isActiveRef.current) {
      isActiveRef.current = false;
      // Flag the upcoming click so it doesn't open the product detail.
      consumedClickRef.current = true;
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      onStop?.();
    }
  }, [clearTimer, videoRef, onStop]);

  /** Returns true once if a long-press just ended (so the click should be
   *  suppressed), then resets the flag. Subsequent clicks behave normally. */
  const consumedClick = useCallback(() => {
    if (consumedClickRef.current) {
      consumedClickRef.current = false;
      return true;
    }
    return false;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!hasVideoFn()) return;
      const touch = e.touches[0];
      if (touch) {
        startXRef.current = touch.clientX;
        startYRef.current = touch.clientY;
      }
      clearTimer();
      timerRef.current = setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          isActiveRef.current = true;
          onPlay?.();
          video.play().catch(() => {});
        }
      }, LONG_PRESS_DELAY);
    },
    [hasVideoFn, clearTimer, videoRef, onPlay]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (timerRef.current === null) return; // long-press not pending
      const touch = e.touches[0];
      if (!touch) return;
      const dx = Math.abs(touch.clientX - startXRef.current);
      const dy = Math.abs(touch.clientY - startYRef.current);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
        clearTimer();
      }
    },
    [clearTimer]
  );

  const onTouchEnd = useCallback(() => {
    stopVideo();
  }, [stopVideo]);

  const onTouchCancel = useCallback(() => {
    stopVideo();
  }, [stopVideo]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel },
    consumedClick,
  };
}
