import { Box } from "@mui/material";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import HeatmapLayer from "./HeatmapLayer";
import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function Map_App() {
  const nzCenter = [-41.0, 174.0];

  return (
    // ROOT MUST HAVE HEIGHT
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

      {/* MAIN FLEX ROW */}
      <Box sx={{ flexGrow: 1, display: "flex", minHeight: 0 }}>

        {/* MAP PANEL */}
        <Box sx={{
          flexGrow: 1,
          flexBasis: "100%",
          display: "flex",
          minHeight: 0, // IMPORTANT
        }}>
          <MapContainer
            center={nzCenter}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }} // Must be explicit
            className="map-container"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap & CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </MapContainer>
        </Box>
      </Box>
    </Box>
  );
}

