import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ActionNavbar from '../components/ActionNavbar';
import { useNavigate } from 'react-router-dom';
import './map.css';

// Fix marker icon issues
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Example locations with minigame integration
const locations = [
  {
    id: 1,
    name: 'Piazza del Duomo',
    coordinates: [43.7739, 11.2556],
    description: 'Develop the vaccine here by completing the Build Vaccine game.',
    quest: 'build-vaccine', // Minigame or quest route
  },
  {
    id: 2,
    name: 'Uffizi Gallery',
    coordinates: [43.7678, 11.2556],
    description: 'Test your knowledge through Trivia Bingo.',
    quest: 'trivia-bingo',
  },
  {
    id: 3,
    name: 'Ponte Vecchio',
    coordinates: [43.7687, 11.2539],
    description: 'Stop the outbreak by breaking the Infection Chain.',
    quest: 'infection-chain-breaker',
  },
  {
    id: 4,
    name: 'Piazzale Michelangelo',
    coordinates: [43.7629, 11.2656],
    description: 'Catch antibodies and protect the city.',
    quest: 'antibody-catch',
  },
];

const FlorenceMap = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleStartQuest = () => {
    if (selectedLocation) {
      navigate(`/games/${selectedLocation.quest}`);
    }
  };

  return (
    <div className='Map-container'>
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Map Container */}
      <MapContainer
        center={[43.7696, 11.2558]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', overflow:'hidden' }} // Adjust height to leave room for navbar
      >
        {/* Map Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Markers for Locations */}
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location.coordinates}
            eventHandlers={{
              click: () => handleLocationClick(location),
            }}
          >
            <Popup>
              <strong>{location.name}</strong>
              <p>{location.description}</p>
              <button
                onClick={() => navigate(`/games/${location.quest}`)}
                className="start-quest-btn"
              >
                Start Quest
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location Details Section */}
      {selectedLocation && (
        <div className="location-details">
          <h2>{selectedLocation.name}</h2>
          <p>{selectedLocation.description}</p>
          <button onClick={handleStartQuest}>Start Quest</button>
        </div>
      )}

      {/* Action Navbar */}
      <ActionNavbar
        navigate={navigate}
        options={[
          { label: 'Shop', route: '/shop', iconClass: 'la-store' },
          { label: 'Forum', route: '/forum', iconClass: 'la-comments' },
          { label: 'Home', route: '/home', iconClass: 'la-home' },
          { label: 'Profile', route: '/profile', iconClass: 'la-user' },
          { label: 'Map', route: '/map', iconClass: 'la-map' }, // Highlight current page
        ]}
      />
    </div>
    </div>
  );
};

export default FlorenceMap;
