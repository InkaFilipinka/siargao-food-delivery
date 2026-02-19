"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, MapPin, AlertCircle, Locate } from "lucide-react";

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

/** Siargao island bounds - restrict Places search to island only */
const SIARGAO_BOUNDS = {
  south: 9.45,
  west: 125.7,
  north: 10.05,
  east: 126.55,
};

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
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string>("");
  const [pendingGeoResult, setPendingGeoResult] = useState<{ lat: number; lng: number } | null>(null);
  const geoResultRef = useRef<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedMarkerRef = useRef<google.maps.Marker | null>(null);

  const geoOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  };

  const handleUseMyLocation = useCallback(async () => {
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
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
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
          map.setCenter({ lat, lng });
          map.setZoom(18);
        }
        setPlaceName("");
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
  }, []);

  const tryGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoError("");
    setGeoLoading(true);
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
    };

    const onSuccess = (pos: GeolocationPosition) => {
      const acc = pos.coords.accuracy ?? 999;
      if (!best || acc < best.accuracy) {
        best = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: acc };
      }
    };

    const onError = () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (best) {
        geoResultRef.current = { lat: best.lat, lng: best.lng };
        setPendingGeoResult({ lat: best.lat, lng: best.lng });
      }
      setGeoLoading(false);
      if (!best) setGeoError("Could not get your location. Pick on the map or search below.");
    };

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    timeoutId = setTimeout(applyBest, 15000);

    navigator.geolocation.getCurrentPosition(
      (pos) => { onSuccess(pos); applyBest(); },
      () => {},
      geoOptions
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    tryGeolocation();
  }, [isOpen, tryGeolocation]);

  useEffect(() => {
    if (!mapReady || !pendingGeoResult || geoLoading || calculating) return;
    const { lat, lng } = pendingGeoResult;
    setPendingGeoResult(null);
    const map = mapInstanceRef.current;
    if (map) {
      if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
      const m = new window.google!.maps.Marker({
        position: { lat, lng },
        map,
        title: "Your Delivery Address — drag to adjust",
        draggable: true,
        icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
      });
      m.addListener("dragend", async () => {
        const pos = m.getPosition();
        if (!pos) return;
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
      map.setCenter({ lat, lng });
      map.setZoom(18);
    }
    setPlaceName("");
    setSelectedLocation({ lat, lng });
    setCalculating(true);
    (async () => {
      try {
        const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
        setDistance(dist);
      } catch {
        setMapError("Could not calculate road distance.");
        setSelectedLocation(null);
      } finally {
        setCalculating(false);
      }
    })();
  }, [mapReady, pendingGeoResult, geoLoading, calculating]);

  useEffect(() => {
    if (!isOpen) return;

    setMapError("");
    setMapReady(false);
    setSelectedLocation(null);
    setDistance(0);
    setPlaceName("");
    setGeoError("");
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

        let selectedMarker: google.maps.Marker | null = null;

        map.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || calculating) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
          selectedMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Your Delivery Address — drag to adjust",
            draggable: true,
            icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
          });
          selectedMarker.addListener("dragend", async () => {
            const pos = selectedMarker!.getPosition();
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
          selectedMarkerRef.current = selectedMarker;

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
            selectedMarker = null;
            selectedMarkerRef.current = null;
            setSelectedLocation(null);
          } finally {
            setCalculating(false);
          }
        });

        mapInstanceRef.current = map;
        setMapReady(true);
        setMapError("");

        if (searchInputRef.current && window.google.maps.places) {
          const siargaoBounds = new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(SIARGAO_BOUNDS.south, SIARGAO_BOUNDS.west),
            new window.google.maps.LatLng(SIARGAO_BOUNDS.north, SIARGAO_BOUNDS.east)
          );

          const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
            bounds: siargaoBounds,
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

              let locationName = "";
              if (place.name && place.formatted_address) {
                locationName = `${place.name} - ${place.formatted_address}`;
              } else if (place.name) {
                locationName = place.name;
              } else if (place.formatted_address) {
                locationName = place.formatted_address;
              }
              setPlaceName(locationName);

              map.setCenter({ lat, lng });
              map.setZoom(18);

              if (selectedMarkerRef.current) selectedMarkerRef.current.setMap(null);
              selectedMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map,
                title: "Your Delivery Address — drag to adjust",
                draggable: true,
                icon: { url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
              });
              selectedMarker.addListener("dragend", async () => {
                const pos = selectedMarker!.getPosition();
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
              selectedMarkerRef.current = selectedMarker;

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
                selectedMarker = null;
                selectedMarkerRef.current = null;
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
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach((s) => s.remove());

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
    } else {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          googleMapsLoaded = true;
          setTimeout(initializeMap, 100);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select Delivery Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedLocation ? "Drag the pin or search to fine-tune" : "Locating you… or click the map, drag the pin, or search"}
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
                id="map-picker-search"
                name="addressSearch"
                type="text"
                placeholder="Search for a place, hotel, resort, or address..."
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
              title="Update my location"
            >
              {geoLoading ? (
                <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Locate className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Update my location</span>
            </button>
          </div>
          {(geoError || (geoLoading && mapReady)) && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              {geoLoading && mapReady ? "Getting your location..." : geoError}
            </p>
          )}
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
              <p className="text-slate-600 dark:text-slate-400">
                {geoLoading ? "Getting your location..." : "Loading map..."}
              </p>
            </div>
          ) : null}
          <div ref={mapRef} className="w-full h-full absolute inset-0" />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {selectedLocation && !mapError ? (
            <div className="flex items-center justify-end">
              <button
                onClick={handleConfirm}
                disabled={calculating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? "Calculating…" : "Confirm Location"}
              </button>
            </div>
          ) : !mapError ? (
            <p className="text-center text-slate-500">Click on the map or search for your delivery location</p>
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
