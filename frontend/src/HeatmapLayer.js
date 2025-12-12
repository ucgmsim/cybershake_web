// src/HeatmapLayer.js
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet.heat";

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points?.length) return;

    const heatLayer = window.L.heatLayer(
      points.map(p => [p.lat, p.lon, p.value]),
      { radius: 20, blur: 15, maxZoom: 17,
        max: 2,
        gradient: {
          0.0: "#ffffff", // white
          0.25: "#ff8080", // light red
          0.5: "#ff0000"  // red
        }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}