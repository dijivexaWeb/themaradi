export const NEXT_PUBLIC_META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Tracks standard or custom Meta Pixel events.
 * Safe to call from client-side code.
 */
export const trackMetaEvent = (eventName: string, options?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, options);
  }
};
