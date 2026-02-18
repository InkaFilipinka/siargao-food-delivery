"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const SIARGAO_CENTER = { lat: 9.7854, lng: 126.1574 };

interface DeliveryMapProps {
  driverLat: number | null;
  driverLng: number | null;
  deliveryLat: number;
  deliveryLng: number;
  landmark?: string;
  restaurantLat?: number | null;
  restaurantLng?: number | null;
  restaurantName?: string;
  className?: string;
  showNavigateButton?: boolean;
  lastUpdatedAt?: string | null;
}

export function DeliveryMap({
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
  landmark,
  restaurantLat,
  restaurantLng,
  restaurantName,
  className = "",
  showNavigateButton = true,
  lastUpdatedAt,
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.google?.maps || !mapRef.current) return;
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: SIARGAO_CENTER,
          zoom: 14,
          minZoom: 10,
          clickableIcons: false,
        });
        mapInstanceRef.current = map;

        const dest = new window.google.maps.LatLng(deliveryLat, deliveryLng);
        new window.google.maps.Marker({
          position: dest,
          map,
          title: landmark || "Delivery address",
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" },
        });

        if (restaurantLat != null && restaurantLng != null) {
          new window.google.maps.Marker({
            position: new window.google.maps.LatLng(restaurantLat, restaurantLng),
            map,
            title: restaurantName || "Restaurant",
            icon: { url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png" },
          });
        }

        if (driverLat != null && driverLng != null) {
          const driverPos = new window.google.maps.LatLng(driverLat, driverLng);
          new window.google.maps.Marker({
            position: driverPos,
            map,
            title: "Driver",
            icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
          });

          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
          });

          directionsService.route(
            {
              origin: driverPos,
              destination: dest,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                directionsRenderer.setDirections(result);
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(driverPos);
                bounds.extend(dest);
                // Avoid world view: if driver/delivery are too far apart (>~50km), center on delivery instead
                const latDiff = Math.abs(driverLat - deliveryLat);
                const lngDiff = Math.abs(driverLng - deliveryLng);
                const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
                if (approxKm <= 60) {
                  map.fitBounds(bounds, 60);
                  const listener = window.google.maps.event.addListener(map, "idle", () => {
                    window.google.maps.event.removeListener(listener);
                    const z = map.getZoom();
                    if (z != null && z < 10) map.setZoom(10);
                  });
                } else {
                  map.setCenter(dest);
                  map.setZoom(15);
                }
              } else {
                map.setCenter(dest);
                map.setZoom(14);
              }
            }
          );
        } else if (restaurantLat != null && restaurantLng != null) {
          const restPos = new window.google.maps.LatLng(restaurantLat, restaurantLng);
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(dest);
          bounds.extend(restPos);
          const latDiff = Math.abs(restaurantLat - deliveryLat);
          const lngDiff = Math.abs(restaurantLng - deliveryLng);
          const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
          if (approxKm <= 60) {
            map.fitBounds(bounds, 60);
            const listener = window.google.maps.event.addListener(map, "idle", () => {
              window.google.maps.event.removeListener(listener);
              const z = map.getZoom();
              if (z != null && z < 10) map.setZoom(10);
            });
          } else {
            map.setCenter(dest);
            map.setZoom(15);
          }
        } else {
          map.setCenter(dest);
          map.setZoom(15);
        }

        setMapReady(true);
      } catch {
        setMapError("Failed to load map");
      }
    };

    if (window.google?.maps) {
      initMap();
    } else if (GOOGLE_MAPS_API_KEY) {
      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existing) {
        const check = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(check);
            initMap();
          }
        }, 200);
        return () => clearInterval(check);
      } else {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=Function.prototype`;
        script.async = true;
        script.defer = true;
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () => setMapError("Failed to load Google Maps");
        document.head.appendChild(script);
      }
    } else {
      setMapError("Google Maps not configured");
    }

    return () => {
      mapInstanceRef.current = null;
    };
  }, [driverLat, driverLng, deliveryLat, deliveryLng, restaurantLat, restaurantLng]);

  const navUrl =
    driverLat != null && driverLng != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${driverLat},${driverLng}&destination=${deliveryLat},${deliveryLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${deliveryLat},${deliveryLng}`;

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
      {mapError && <p className="text-sm text-red-500 mt-1">{mapError}</p>}
      <div className="flex items-center justify-between mt-2 gap-2">
        {lastUpdatedAt && (
          <p className="text-xs text-slate-500">
            Driver location updated {new Date(lastUpdatedAt).toLocaleTimeString("en-PH", { minute: "2-digit", second: "2-digit" })}
          </p>
        )}
        {showNavigateButton && (
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <ExternalLink className="w-4 h-4" />
            Navigate in Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
