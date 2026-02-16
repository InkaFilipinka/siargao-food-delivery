"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; distance: number; placeName?: string }) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Base coordinates (General Luna center - food delivery hub)
const BASE_LAT = 9.7854;
const BASE_LNG = 126.1574;

const SEARCH_CENTER_LAT = 9.7854;
const SEARCH_CENTER_LNG = 126.1574;
const SEARCH_RADIUS_KM = 25;
const DELIVERY_FEE_PER_KM = 6.5;

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const calculateRoadDistance = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.DistanceMatrixService) {
      reject(new Error("Distance Matrix Service not available"));
      return;
    }
    const service = new window.google.maps.DistanceMatrixService();
    const origin = new window.google.maps.LatLng(originLat, originLng);
    const destination = new window.google.maps.LatLng(destLat, destLng);
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === "OK" && response?.rows[0]?.elements[0]?.status === "OK") {
          const distanceInMeters = response.rows[0].elements[0].distance.value;
          const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
          resolve(distanceInKm);
        } else {
          reject(new Error("Could not calculate road distance"));
        }
      }
    );
  });
};

let googleMapsLoaded = false;
let googleMapsLoading = false;

export function MapPicker({ onLocationSelect, isOpen, onClose }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [placeName, setPlaceName] = useState<string>("");
  const [mapError, setMapError] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMapError("");
    setMapReady(false);
    setSelectedLocation(null);
    setDistance(0);
    setPlaceName("");

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError("Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local");
      return;
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: BASE_LAT, lng: BASE_LNG },
          zoom: 12,
          clickableIcons: false,
        });

        new window.google.maps.Marker({
          position: { lat: BASE_LAT, lng: BASE_LNG },
          map,
          title: "Delivery Hub - General Luna",
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
        });

        let selectedMarker: google.maps.Marker | null = null;

        map.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || calculating) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          if (selectedMarker) selectedMarker.setMap(null);
          selectedMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Your Delivery Address",
          });
          setMapError("");
          setDistance(0);
          setPlaceName("");
          setSelectedLocation({ lat, lng });
          setCalculating(true);
          try {
            const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
            setDistance(dist);
          } catch {
            setMapError("Could not calculate road distance. Try another location.");
            if (selectedMarker) selectedMarker.setMap(null);
            setSelectedLocation(null);
          } finally {
            setCalculating(false);
          }
        });

        setMapReady(true);

        if (searchInputRef.current && window.google.maps.places) {
          const searchCenter = new window.google.maps.LatLng(SEARCH_CENTER_LAT, SEARCH_CENTER_LNG);
          const searchCircle = new window.google.maps.Circle({ center: searchCenter, radius: SEARCH_RADIUS_KM * 1000 });
          const searchBounds = searchCircle.getBounds();
          const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            bounds: searchBounds!,
            strictBounds: true,
            componentRestrictions: { country: "ph" },
            fields: ["geometry", "name", "formatted_address"],
          });
          autocomplete.addListener("place_changed", async () => {
            if (calculating) return;
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              const locationName = place.name ? `${place.name} - ${place.formatted_address || ""}` : (place.formatted_address || "");
              setPlaceName(locationName);
              map.setCenter({ lat, lng });
              map.setZoom(15);
              if (selectedMarker) selectedMarker.setMap(null);
              selectedMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map,
                title: place.name || "Selected Location",
              });
              setMapError("");
              setDistance(0);
              setSelectedLocation({ lat, lng });
              setCalculating(true);
              try {
                const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
                setDistance(dist);
              } catch {
                setMapError("Could not calculate road distance.");
                if (selectedMarker) selectedMarker.setMap(null);
                setSelectedLocation(null);
              } finally {
                setCalculating(false);
              }
            }
          });
        }
      } catch {
        setMapError("Failed to initialize map");
      }
    };

    window.gm_authFailure = () => {
      setMapError("Google Maps API key error. Check your settings.");
      googleMapsLoading = false;
    };

    if (window.google?.maps) {
      googleMapsLoaded = true;
      setTimeout(initializeMap, 100);
    } else if (!googleMapsLoading) {
      googleMapsLoading = true;
      document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach((s) => s.remove());
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleMapsLoaded = true;
        googleMapsLoading = false;
        setTimeout(initializeMap, 100);
      };
      script.onerror = () => {
        googleMapsLoading = false;
        setMapError("Failed to load Google Maps.");
      };
      document.head.appendChild(script);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        distance,
        placeName: placeName || undefined,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const deliveryCost = distance > 0 ? Math.round(distance * DELIVERY_FEE_PER_KM * 2) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select Delivery Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Search or click on the map</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search hotel, resort, or address..."
              className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              autoComplete="off"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 relative min-h-[400px]">
          {mapError ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Map Failed to Load</h4>
                <p className="text-slate-600 dark:text-slate-400">{mapError}</p>
              </div>
            </div>
          ) : !mapReady ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : null}
          <div ref={mapRef} className="w-full h-full absolute inset-0" />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {selectedLocation && !mapError ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  {calculating || distance === 0 ? (
                    <span className="font-semibold">Calculating...</span>
                  ) : (
                    <span className="font-semibold">Distance: {distance} km</span>
                  )}
                </div>
                {distance > 0 && !calculating && (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Delivery: ₱{deliveryCost} (round trip)
                  </span>
                )}
              </div>
              {distance > 0 && !calculating && (
                <button
                  onClick={handleConfirm}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Confirm Location
                </button>
              )}
            </div>
          ) : !mapError ? (
            <p className="text-center text-slate-500">Click or search for your delivery location</p>
          ) : (
            <div className="text-center">
              <button onClick={onClose} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    google?: { maps: typeof google.maps };
    gm_authFailure?: () => void;
  }
}
