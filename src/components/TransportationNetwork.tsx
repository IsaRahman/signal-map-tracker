import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, LayerGroup, LayersControl } from "react-leaflet";
import L from "leaflet";
import axios from 'axios';
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Vite/Webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redDotIcon = L.divIcon({
  className: "custom-red-dot",
  html: `<div style="
      width: 12px;
      height: 12px;
      background-color: red;
      border-radius: 50%;
      border: 2px solid white;
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6], // center the dot
});

// Custom crossing icon
const crossingIcon = L.divIcon({
  className: "custom-crossing-icon",
  html: `<div style="
    width: 24px;
    height: 24px;
    position: relative;
    transform: rotate(45deg);
  ">
    <div style="
      position: absolute;
      width: 24px;
      height: 4px;
      background: black;
      top: 10px;
    "></div>
    <div style="
      position: absolute;
      width: 4px;
      height: 24px;
      background: black;
      left: 10px;
    "></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface VehicleData {
  train_id: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
}

interface Crossing {
  id: string;
  position: [number, number];
  name: string;
}

const crossings: Crossing[] = [
  {
    id: "85",
    position: [38.43222525534034, -104.29483988240153],
    name: "Railroad Crossing #85"
  },

{
  id: "86",
  position: [38.422040, -104.338302],
  name: "Railroad Crossing #86"
  //Lat: 38.422040, Lng: -104.338302
}


];

export const TransportationNetwork: React.FC = () => {
  const [vehicleData, setVehicleData] = useState<VehicleData & { speed?: number, train_linestring?: any }>({
    train_id: "Train-1",
    coordinates: [38.43222525534034, -104.29483988240153],
    timestamp: new Date().toISOString(),
    speed: 0,
    train_linestring: null,
  });

  // Move train every 100ms with random movement
  useEffect(() => {
  const fetchTrainData = async () => {
    //console.log('Trying to fetch train data...');
    try {
      const response = await axios.post('api/cbs-train*/_search', {
        size: 10,
        _source: ["train_id", "HOT_latitude", "HOT_longitude", "HOT_data_timestamp", "HOT_speed_mph", "train_linestring"],
        query: {
          range: {
            HOT_data_timestamp: { gte: "now-15m" }
          }
          //match_all: {} 
        },
        sort: [
    { "HOT_data_timestamp": { "order": "desc" } }  // Sort by timestamp, newest first
  ]
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const trains = response.data.hits.hits;
      //console.log('Found trains:', trains.length);
      if (trains.length > 0) {
        const latestTrain = trains[0]._source;
        setVehicleData({
          train_id: latestTrain.train_id,
          coordinates: [latestTrain.HOT_latitude, latestTrain.HOT_longitude],
          timestamp: latestTrain.HOT_data_timestamp,
          speed: latestTrain.HOT_speed_mph,
          train_linestring: latestTrain.train_linestring,
        });
      //console.log('Updated at:', new Date().toISOString(), 'Train coords:', latestTrain.HOT_latitude, latestTrain.HOT_longitude);

      }
    } catch (error) {
      console.error('Error fetching train data:', error);
    }
  };

  fetchTrainData();
  const interval = setInterval(fetchTrainData, 100); // 100 ms
  return () => clearInterval(interval);
}, []);
  return (
    <div style={{ width: "100%", height: "1500px", borderRadius: 12, overflow: "hidden", position: "relative" }}>
      {/* Info Box - Top Left */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 48,
        zIndex: 1000,
        background: 'rgba(160, 54, 54, 0.95)',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        padding: '12px 20px',
        fontSize: '1rem',
        minWidth: 180,
        border: '1px solid #ddd',
      }}>
        <div><strong>Train ID:</strong> {vehicleData.train_id}</div>
        <div><strong>Latitude:</strong> {vehicleData.coordinates[0].toFixed(6)}</div>
        <div><strong>Longitude:</strong> {vehicleData.coordinates[1].toFixed(6)}</div>
        <div><strong>Speed:</strong> {vehicleData.speed !== undefined ? vehicleData.speed.toFixed(1) + ' mph' : 'N/A'}</div>
      </div>
      <MapContainer
        center={vehicleData.coordinates}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />


  


        
        <LayersControl position="topright">
          <LayersControl.Overlay name="Crossings">
            <LayerGroup>
              {crossings.map(crossing => (
                <Marker
                  key={crossing.id}
                  position={crossing.position}
                  icon={crossingIcon}
                >
                  <Popup>
                    {crossing.name}
                    <br />
                    Lat: {crossing.position[0]}
                    <br />
                    Lng: {crossing.position[1]}
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Draw train linestring if available */}
        {vehicleData.train_linestring && Array.isArray(vehicleData.train_linestring) && (
          <Polyline
            key={vehicleData.timestamp} // force re-render on update
            positions={[
              ...vehicleData.train_linestring.map((coord: any) => Array.isArray(coord) && coord.length === 2 ? [coord[0], coord[1]] : coord),
              [vehicleData.coordinates[0], vehicleData.coordinates[1]] // Ensure [lat, lng] format
            ] as [number, number][]}
            color="blue"
            weight={4}
          />
        )}
        {vehicleData.train_linestring && vehicleData.train_linestring.type === 'LineString' && (
          <GeoJSON
            key={vehicleData.timestamp} // force re-render on update
            data={{
              ...vehicleData.train_linestring,
              coordinates: [
                ...vehicleData.train_linestring.coordinates,
                [vehicleData.coordinates[1], vehicleData.coordinates[0]] // GeoJSON is [lng, lat]
              ]
            }}
            style={{ color: 'blue', weight: 15 }}
          />
        )}
        <Marker
  key={`${vehicleData.coordinates[0]}-${vehicleData.coordinates[1]}-${Date.now()}`}
  position={vehicleData.coordinates as [number, number]}
  icon={redDotIcon}
>
          <Popup >
            🚆 Train #{vehicleData.train_id}
            <br />
            Lat: {vehicleData.coordinates[0].toFixed(6)}, Lng:{" "}
            {vehicleData.coordinates[1].toFixed(6)}
            <br />
           {/* Updated: {new Date(vehicleData.timestamp).toLocaleTimeString()} */}
Updated: {new Date(vehicleData.timestamp).toISOString().slice(11, 23)}
 </Popup>
        </Marker>
        {/* Display linestring as JSON in a preformatted block */}
        {/* (Removed linestring JSON display as requested) */}
      </MapContainer>
    </div>
  );
};

export default TransportationNetwork;