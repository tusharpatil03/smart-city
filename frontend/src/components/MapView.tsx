import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CivicIssue } from "../services/api";

interface MapViewProps {
  issues: CivicIssue[];
  onMarkerClick?: (issue: CivicIssue) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showCurrentLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

const statusColor: Record<CivicIssue["status"], string> = {
  Reported: "#ef4444",
  "In Progress": "#eab308",
  Resolved: "#22c55e"
};

export function MapView({
  issues,
  onMarkerClick,
  center = [40.7128, -74.006],
  zoom = 13,
  height = "100%",
  showCurrentLocation = false,
  onLocationSelect,
  selectedLocation
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const issueMarkersRef = useRef<L.Marker[]>([]);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    if (onLocationSelect) {
      map.on("click", (event: L.LeafletMouseEvent) => {
        onLocationSelect(event.latlng.lat, event.latlng.lng);
      });
    }

    if (showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const currentIcon = L.divIcon({
          html: '<div class="map-current-pin"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: ""
        });

        L.marker([pos.coords.latitude, pos.coords.longitude], { icon: currentIcon })
          .addTo(map)
          .bindPopup("Your current location");
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, onLocationSelect, showCurrentLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    issueMarkersRef.current.forEach((marker) => marker.remove());
    issueMarkersRef.current = [];

    issues.forEach((issue) => {
      const icon = L.divIcon({
        html: `<div class="map-issue-pin" style="background:${statusColor[issue.status]}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: ""
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon }).addTo(map);

      marker.bindPopup(`<strong>${issue.title}</strong><br/>${issue.category}<br/>${issue.status}`);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(issue));
      }

      issueMarkersRef.current.push(marker);
    });
  }, [issues, onMarkerClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedLocation) {
      const icon = L.divIcon({
        html: '<div class="map-selected-pin"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: ""
      });

      selectedMarkerRef.current = L.marker([selectedLocation[0], selectedLocation[1]], {
        icon
      }).addTo(map);

      map.panTo([selectedLocation[0], selectedLocation[1]]);
    }
  }, [selectedLocation]);

  return <div ref={containerRef} className="map-view" style={{ height }} />;
}
