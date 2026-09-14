import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  isRealGPS: boolean;
  hasPermission: boolean;
}

export const MANAUS_DEFAULT_LOCATION = { lat: -3.07352, lng: -59.99370 };

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>({
    ...MANAUS_DEFAULT_LOCATION,
    isRealGPS: false,
    hasPermission: false
  });
  const [isLocating, setIsLocating] = useState(false);
  const mounted = useRef(true);
  const hasAcquiredRealGPS = useRef(false);

  const receive = useCallback((position: GeolocationPosition | { coords: { latitude: number; longitude: number; accuracy?: number } }) => {
    if (!mounted.current) return;
    const { latitude: lat, longitude: lng, accuracy } = position.coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    hasAcquiredRealGPS.current = true;
    setLocation({
      lat,
      lng,
      accuracy: accuracy || 10,
      isRealGPS: true,
      hasPermission: true
    });
    setIsLocating(false);
  }, []);

  const unavailable = useCallback((err?: GeolocationPositionError) => {
    if (!mounted.current) return;
    console.warn('[useUserLocation] Geolocation notice:', err?.message || err);
    if (!hasAcquiredRealGPS.current) {
      setLocation(prev => ({
        ...prev,
        isRealGPS: false,
        hasPermission: false
      }));
    }
    setIsLocating(false);
  }, []);

  const requestLocation = useCallback(() => {
    try {
      (window as any).webkit?.messageHandlers?.requestNativeLocation?.postMessage({});
    } catch (e) {}

    if (!navigator.geolocation) {
      unavailable();
      return;
    }
    setIsLocating(true);

    const highAccOpts: PositionOptions = { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 };
    const standardAccOpts: PositionOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 };

    // Progressive fallback: Try high accuracy first; if it times out/fails, try standard accuracy immediately
    navigator.geolocation.getCurrentPosition(
      receive,
      () => {
        if (!mounted.current) return;
        navigator.geolocation.getCurrentPosition(receive, unavailable, standardAccOpts);
      },
      highAccOpts
    );
  }, [receive, unavailable]);

  useEffect(() => {
    (window as any).updateNativeUserLocation = (lat: number, lng: number, accuracy: number = 10) => {
      receive({ coords: { latitude: lat, longitude: lng, accuracy } });
    };
    return () => {
      delete (window as any).updateNativeUserLocation;
    };
  }, [receive]);

  useEffect(() => {
    mounted.current = true;
    if (!navigator.geolocation) return () => { mounted.current = false; };

    requestLocation();

    // Continuous location tracking with standard accuracy for maximum device compatibility
    const watch = navigator.geolocation.watchPosition(
      receive,
      () => {
        if (!mounted.current) return;
        navigator.geolocation.getCurrentPosition(receive, unavailable, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
    );

    return () => {
      mounted.current = false;
      navigator.geolocation.clearWatch(watch);
    };
  }, [receive, unavailable, requestLocation]);

  return { location, isLocating, requestLocation };
}
