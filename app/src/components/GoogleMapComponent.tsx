import React from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { Module } from "../models/types";
import { CircularProgress } from "@mui/material";
import { moduleIsOnline } from "../views/modules/functions/moduleIsOnline";

interface MapProps {
  modules: Module[];
  onMarkerClick: (moduleId: string) => void;
  onMarkerHover: (module: Module, event: google.maps.MapMouseEvent) => void;
  onMarkerLeave: () => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  display: "flex",
};

const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const GoogleMapComponent: React.FC<MapProps> = ({
  modules,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });

  const svg = (online: boolean) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="${online ? "#4CAF50" : "#f44336"}" />
    <path d="M24 34h.01" stroke="white" stroke-width="3" stroke-linecap="round" />
    <path d="M17 27a10 10 0 0 1 14 0" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
    <path d="M12 22a16 16 0 0 1 24 0" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
  </svg>
`;

  if (!isLoaded) {
    return <CircularProgress />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={{
        lat: modules[0]?.position[0],
        lng: modules[0]?.position[1],
      }}
      zoom={5}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {modules.map(
        (module) =>
          module && (
            <MarkerF
              key={module.id}
              position={{
                lat: module.position[0] || 0,
                lng: module.position[1] || 0,
              }}
              onClick={() => onMarkerClick(module.id)}
              onMouseOver={(e) => onMarkerHover(module, e)}
              onMouseOut={onMarkerLeave}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(svg(moduleIsOnline(module))),
                scaledSize: new window.google.maps.Size(25, 25),
                fillColor: moduleIsOnline(module) ? "#4CAF50" : "#f44336",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                scale: 7,
              }}
            />
          )
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
