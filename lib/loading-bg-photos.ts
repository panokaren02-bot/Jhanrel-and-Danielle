import { siteConfig } from "@/content/site";

const isPlain = siteConfig.loadingScreen.display === "plain";

/**
 * Loader background photos for preloading — set in content/site.ts (loadingScreen.backgroundPhotos).
 * Empty in "plain" display so nothing is downloaded.
 */
export const LOADING_BG_PHOTOS = isPlain
  ? []
  : (siteConfig.loadingScreen.backgroundPhotos ?? []).map((src) => encodeURI(src));

/** Landscape marquee photos for ≥768px — `public/desktop-background` (loadingScreen.backgroundPhotosDesktop) */
export const LOADING_BG_PHOTOS_DESKTOP = isPlain
  ? []
  : (siteConfig.loadingScreen.backgroundPhotosDesktop ?? []).map((src) => encodeURI(src));

/** Mobile invitation photo marquee — `public/mobile-background` */
export const MOBILE_BACKGROUND_PHOTOS = LOADING_BG_PHOTOS;
