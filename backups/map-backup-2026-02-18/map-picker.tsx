"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, MapPin, AlertCircle, Locate } from "lucide-react";
import { getDeliveryFee } from "@/config/delivery-zones";

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

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve("");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]?.formatted_address) {
        resolve(results[0].formatted_address);
      } else {
        resolve("");
      }
    });
  });
};

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
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string>("");
  const [geoAttemptDone, setGeoAttemptDone] = useState(false);
  const [pendingGeoResult, setPendingGeoResult] = useState<{ lat: number; lng: number } | null>(null);
  const geoResultRef = useRef<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const selectedMarkerRef = useRef<google.maps.Marker | null>(null);

  const applyLocationToMap = useCallback(
    async (lat: number, lng: number, locationName: string) => {
      const map = mapInstanceRef.current;
      const marker = selectedMarkerRef.current;
      if (marker) marker.setMap(null);
      setMapError("");
      if (locationName && locationName !== "Current location") {
        setPlaceName(locationName);
      } else if (window.google?.maps?.Geocoder) {
        const addr = await reverseGeocode(lat, lng);
        setPlaceName(addr || locationName || "");
      } else {
        setPlaceName(locationName || "");
      }
      setSelectedLocation({ lat, lng });
      setCalculating(true);
      try {
        const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
        setDistance(dist);
      } catch {
        setMapError("Could not calculate road distance.");
        setSelectedLocation(null);
      } finally {
        setCalculating(false);
      }
      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(18);
        const m = new window.google!.maps.Marker({
          position: { lat, lng },
          map,
          title: "Your Delivery Address — drag to adjust",
          draggable: true,
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
        });
        m.addListener("dragend", async () => {
          const pos = m.getPosition();
          if (!pos || calculating) return;
          const newLat = pos.lat();
          const newLng = pos.lng();
          setPlaceName("");
          setSelectedLocation({ lat: newLat, lng: newLng });
          setCalculating(true);
          try {
            const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, newLat, newLng);
            setDistance(dist);
          } catch {
            setMapError("Could not calculate road distance.");
          } finally {
            setCalculating(false);
          }
        });
        selectedMarkerRef.current = m;
      }
    },
    []
  );

  const geoOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  };

  const tryGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoAttemptDone(true);
      return;
    }
    setGeoError("");
    setGeoLoading(true);
    setGeoAttemptDone(false);
    geoResultRef.current = null;

    let best: { lat: number; lng: number; accuracy: number } | null = null;
    let watchId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const applyBest = () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (best) {
        geoResultRef.current = { lat: best.lat, lng: best.lng };
        setPendingGeoResult({ lat: best.lat, lng: best.lng });
      }
      setGeoLoading(false);
      setGeoAttemptDone(true);
    };

    const onSuccess = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy ?? 999;
      if (!best || acc < best.accuracy) {
        best = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: acc,
        };
      }
    };

    const onError = () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (best) {
        geoResultRef.current = { lat: best.lat, lng: best.lng };
        setPendingGeoResult({ lat: best.lat, lng: best.lng });
      }
      setGeoLoading(false);
      setGeoAttemptDone(true);
      if (!best) setGeoError("Could not get your location. Pick on the map or search below.");
    };

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    timeoutId = setTimeout(applyBest, 15000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos);
        applyBest();
      },
      () => {},
      geoOptions
    );
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoError("");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoLoading(false);
        await applyLocationToMap(lat, lng, "Current location");
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please enable it in your browser.");
        } else {
          setGeoError("Could not get your location. Try again or pick on the map.");
        }
      },
      geoOptions
    );
  }, [applyLocationToMap]);

  useEffect(() => {
    if (!isOpen) return;
    tryGeolocation();
  }, [isOpen, tryGeolocation]);

  useEffect(() => {
    if (!mapReady || !pendingGeoResult || geoLoading || calculating) return;
    const { lat, lng } = pendingGeoResult;
    setPendingGeoResult(null);
    applyLocationToMap(lat, lng, "Current location");
  }, [mapReady, pendingGeoResult, geoLoading, calculating, applyLocationToMap]);

  useEffect(() => {
    if (!isOpen) return;
    setMapError("");
    setMapReady(false);
    setSelectedLocation(null);
    setDistance(0);
    setPlaceName("");
    setGeoError("");
    setGeoAttemptDone(false);
    setPendingGeoResult(null);

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError("Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local");
      return;
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: BASE_LAT, lng: BASE_LNG },
          zoom: 18,
          clickableIcons: false,
        });
        mapInstanceRef.current = map;

        map.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || calculating) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
          const m = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Your Delivery Address — drag to adjust",
            draggable: true,
            icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
          });
          m.addListener("dragend", async () => {
            const pos = m.getPosition();
            if (!pos || calculating) return;
            const newLat = pos.lat();
            const newLng = pos.lng();
            setPlaceName("");
            setSelectedLocation({ lat: newLat, lng: newLng });
            setCalculating(true);
            try {
              const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, newLat, newLng);
              setDistance(dist);
            } catch {
              setMapError("Could not calculate road distance.");
            } finally {
              setCalculating(false);
            }
          });
          selectedMarkerRef.current = m;
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
            if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
            selectedMarkerRef.current = null;
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
            strictBounds: false,
            componentRestrictions: { country: "ph" },
            types: ["establishment", "geocode", "address"],
          });
          autocomplete.addListener("place_changed", async () => {
            if (calculating) return;
            const place = autocomplete.getPlace();
            const locationName = place.name ? `${place.name} - ${place.formatted_address || ""}` : (place.formatted_address || "");
            let lat: number | null = null;
            let lng: number | null = null;
            if (place.geometry?.location) {
              lat = place.geometry.location.lat();
              lng = place.geometry.location.lng();
            } else if ((place.formatted_address || place.name) && window.google?.maps?.Geocoder) {
              const geocoder = new window.google.maps.Geocoder();
              const res = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
                geocoder.geocode(
                  { address: place.formatted_address || place.name || "" },
                  (results, status) => resolve(status === "OK" && results ? results : null)
                );
              });
              if (res?.[0]?.geometry?.location) {
                lat = res[0].geometry!.location!.lat();
                lng = res[0].geometry!.location!.lng();
              }
            }
            if (lat != null && lng != null) {
              setPlaceName(locationName);
              map.setCenter({ lat, lng });
              map.setZoom(18);
              if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
              const searchMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map,
                title: "Your Delivery Address — drag to adjust",
                draggable: true,
                icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
              });
              searchMarker.addListener("dragend", async () => {
                const pos = searchMarker.getPosition();
                if (!pos || calculating) return;
                const newLat = pos.lat();
                const newLng = pos.lng();
                setPlaceName("");
                setSelectedLocation({ lat: newLat, lng: newLng });
                setCalculating(true);
                try {
                  const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, newLat, newLng);
                  setDistance(dist);
                } catch {
                  setMapError("Could not calculate road distance.");
                } finally {
                  setCalculating(false);
                }
              });
              selectedMarkerRef.current = searchMarker;
              setMapError("");
              setDistance(0);
              setSelectedLocation({ lat, lng });
              setCalculating(true);
              try {
                const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
                setDistance(dist);
              } catch {
                setMapError("Could not calculate road distance.");
                if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
                selectedMarkerRef.current = null;
                setSelectedLocation(null);
              } finally {
                setCalculating(false);
              }
            } else {
              setMapError("Could not get coordinates for this place. Try another search or click on the map.");
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

    const initWhenReady = () => {
      if (window.google?.maps && window.google.maps.places) {
        googleMapsLoaded = true;
        googleMapsLoading = false;
        setTimeout(initializeMap, 100);
        return true;
      }
      return false;
    };

    if (initWhenReady()) return;

    if (!googleMapsLoading) {
      googleMapsLoading = true;
      const cbName = "__siargaoMapPickerLoaded";
      (window as unknown as Record<string, () => void>)[cbName] = () => {
        delete (window as unknown as Record<string, unknown>)[cbName];
        initWhenReady();
      };
      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (!existing) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${cbName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          delete (window as unknown as Record<string, unknown>)[cbName];
          googleMapsLoading = false;
          setMapError("Failed to load Google Maps.");
        };
        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          if (initWhenReady()) {
            clearInterval(check);
            clearTimeout(timeout);
          }
        }, 300);
        const timeout = setTimeout(() => {
          clearInterval(check);
          if (!window.google?.maps?.places) {
            googleMapsLoading = false;
            setMapError("Google Maps is still loading. Please refresh the page.");
          }
        }, 15000);
      }
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

  const { feePhp } = distance > 0 ? getDeliveryFee(distance) : { feePhp: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select Delivery Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedLocation
                ? "Drag the pin or search to fine-tune • GPS can be ±20–50m — move the pin for exact spot"
                : "Locating you… or click the map, drag the pin, or search by place name (e.g. hotel, resort)"}
            </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search place, hotel, resort, or address..."
                className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                autoComplete="off"
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={!mapReady || geoLoading || calculating}
              className="flex items-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 shrink-0"
              title="Update my current location"
            >
              {geoLoading ? (
                <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Locate className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Update my location</span>
            </button>
          </div>
          {(geoError || (geoLoading && mapReady)) ? (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              {geoLoading && mapReady ? "Getting your location..." : geoError}
            </p>
          ) : null}
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
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {geoLoading ? "Getting your location..." : "Loading map..."}
              </p>
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
                    Delivery: ₱{feePhp}
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
