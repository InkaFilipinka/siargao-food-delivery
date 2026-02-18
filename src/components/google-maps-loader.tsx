"use client";

import { useEffect } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

/**
 * Loads Google Maps JS API with Places library once on app mount.
 * Ensures map picker and other map components have Places available.
 */
export function GoogleMapsLoader() {
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || typeof window === "undefined") return;
    if (window.google?.maps?.places) return;
    if (document.querySelector('script[src*="maps.googleapis.com"][src*="libraries=places"]')) return;

    const cbName = "__googleMapsPlacesLoaded";
    (window as unknown as Record<string, () => void>)[cbName] = () => {
      delete (window as unknown as Record<string, unknown>)[cbName];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
