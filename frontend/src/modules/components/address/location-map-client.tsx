"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "cn";

// CHANGE THIS ONE LINE TO SWITCH TILE PROVIDER LATER
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`;
const DEFAULT_CENTER: L.LatLngTuple = [-16.5, -68.15]; // La Paz

const round6 = (value: number) => {
  return Math.round(value * 1_000_000) / 1_000_000;
};

const keyOf = (lat: number, lng: number) => {
  return `${lat},${lng}`;
};

const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#FF6A00" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#FFFFFF" /></svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

export type LocationMapProps = {
  latitude: number | null;
  longitude: number | null;
  onChange?: (latitude: number, longitude: number) => void;
  readOnly?: boolean;
  className?: string;
};

const LocationMapClient = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
  className,
}: LocationMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  // the last position the map itself reported, so we don't "fly" to a spot the user just clicked or dragged to
  const emittedRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 1. create the map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const start: L.LatLngTuple | null =
      latitude !== null && longitude !== null ? [latitude, longitude] : null;

    const map = L.map(container, {
      center: start ?? DEFAULT_CENTER,
      zoom: start ? 17 : 12,
      scrollWheelZoom: false,
    });
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    emittedRef.current = start ? keyOf(start[0], start[1]) : null;

    if (!readOnly) {
      map.on("click", (event: L.LeafletMouseEvent) => {
        const lat = round6(event.latlng.lat);
        const lng = round6(event.latlng.lng);
        emittedRef.current = keyOf(lat, lng);
        onChangeRef.current?.(lat, lng);
      });
    }

    // dialog animate in, so the container's size changes after mount
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. keep the pin in sync with the props
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (latitude === null || longitude === null) {
      markerRef.current?.remove();
      markerRef.current = null;
      emittedRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      const marker = L.marker([latitude, longitude], {
        icon: pinIcon,
        draggable: !readOnly,
        keyboard: false,
      }).addTo(map);
      if (!readOnly) {
        marker.on("dragend", () => {
          const point = marker.getLatLng();
          const lat = round6(point.lat);
          const lng = round6(point.lng);
          emittedRef.current = keyOf(lat, lng);
          onChangeRef.current?.(lat, lng);
        });
      }
      markerRef.current = marker;
    }

    // the position came from outside (GPS button, saved address): bring it into view
    if (emittedRef.current !== keyOf(latitude, longitude)) {
      // map.flyTo([latitude, longitude], Math.max(map.getZoom(), 17));
      map.setView([latitude, longitude], Math.max(map.getZoom(), 17), {
        animate: false,
      });
      map.invalidateSize();
    }
  }, [latitude, longitude, readOnly]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "isolate z-0 h-64 w-full overflow-hidden rounded-2xl border",
        className,
      )}
    />
  );
};

export default LocationMapClient;
