import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useTaskStore } from '../context/TaskStore';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const HAS_API_KEY = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here';

// Default center — India
const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };
const DEFAULT_ZOOM   = 5;

const URGENCY_COLOR = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#22c55e',
};

const URGENCY_BADGE = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low:      'bg-green-100 text-green-700 border-green-200',
};

// Map task location string to lat/lng (simple geocode lookup for known cities)
const CITY_COORDS = {
  'new delhi':  { lat: 28.6139, lng: 77.2090 },
  'delhi':      { lat: 28.6139, lng: 77.2090 },
  'mumbai':     { lat: 19.0760, lng: 72.8777 },
  'pune':       { lat: 18.5204, lng: 73.8567 },
  'bangalore':  { lat: 12.9716, lng: 77.5946 },
  'bengaluru':  { lat: 12.9716, lng: 77.5946 },
  'chennai':    { lat: 13.0827, lng: 80.2707 },
  'hyderabad':  { lat: 17.3850, lng: 78.4867 },
  'kolkata':    { lat: 22.5726, lng: 88.3639 },
  'jaipur':     { lat: 26.9124, lng: 75.7873 },
  'assam':      { lat: 26.2006, lng: 92.9376 },
  'vellore':    { lat: 12.9165, lng: 79.1325 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'ahmedabad':  { lat: 23.0225, lng: 72.5714 },
};

function getCoordsFromLocation(locationStr) {
  if (!locationStr) return null;
  const lower = locationStr.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

// ── Google Maps component ─────────────────────────────────────────────────────
function GoogleMapView({ tasks, userLocation }) {
  const [map, setMap]               = useState(null);
  const [selected, setSelected]     = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [accepted, setAccepted]     = useState(new Set());
  const [centered, setCentered]     = useState(false);

  const center = userLocation || DEFAULT_CENTER;

  // Re-center map when user location first arrives
  useEffect(() => {
    if (map && userLocation && !centered) {
      map.panTo(userLocation);
      map.setZoom(14);
      setCentered(true);
    }
  }, [map, userLocation, centered]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback(m => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    ],
  };

  const tasksWithCoords = tasks
    .filter(t => activeFilter === 'All' || t.urgencyLevel === activeFilter)
    .map(t => ({ ...t, coords: getCoordsFromLocation(t.location) }))
    .filter(t => t.coords);

  if (loadError) return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl border border-gray-200">
      <div className="text-center p-8 max-w-sm">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="font-bold text-gray-700 mb-1">Google Maps unavailable</p>
        <p className="text-sm text-gray-400 mb-3">
          Your API key may need billing enabled or HTTP referrer restrictions updated.
        </p>
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer"
          className="text-xs text-emerald-600 font-semibold underline">
          Fix in Google Cloud Console →
        </a>
      </div>
    </div>
  );

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Google Maps...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              activeFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}>
            {f !== 'All' && (
              <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: URGENCY_COLOR[f] }} />
            )}
            {f}
          </button>
        ))}
        {userLocation && (
          <button onClick={() => map?.panTo(userLocation)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-all">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            My Location
          </button>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ minHeight: 400 }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={userLocation || DEFAULT_CENTER}
          zoom={userLocation ? 12 : DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Task markers */}
          {tasksWithCoords.map(task => (
            <Marker
              key={task.id}
              position={task.coords}
              onClick={() => setSelected(task)}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: URGENCY_COLOR[task.urgencyLevel] || '#6b7280',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 1.5,
                scale: 1.8,
                anchor: new window.google.maps.Point(12, 24),
              }}
            />
          ))}

          {/* Info window */}
          {selected && (
            <InfoWindow
              position={selected.coords}
              onCloseClick={() => setSelected(null)}
            >
              <div className="font-sans w-56 p-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug">{selected.title}</h3>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${URGENCY_BADGE[selected.urgencyLevel]}`}>
                    {selected.urgencyLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">📍 {selected.location}</p>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{selected.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(selected.requiredSkills || []).map(s => (
                    <span key={s} className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{s}</span>
                  ))}
                </div>
                {accepted.has(selected.id) ? (
                  <p className="text-xs text-emerald-600 font-bold">✓ Task Accepted</p>
                ) : (
                  <button
                    onClick={() => { setAccepted(p => new Set([...p, selected.id])); setSelected(null); }}
                    className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Accept Task
                  </button>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(URGENCY_COLOR).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {level}
          </span>
        ))}
        {userLocation && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Your location
          </span>
        )}
      </div>
    </div>
  );
}

// ── Leaflet fallback (no API key) ─────────────────────────────────────────────
function LeafletMapView({ tasks, userLocation }) {
  const [LeafletComponents, setLeafletComponents] = useState(null);

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl, L]) => {
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletComponents({ ...rl, L: L.default });
    });
  }, []);

  if (!LeafletComponents) return (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-2xl">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  const { MapContainer, TileLayer, Marker, Popup, L } = LeafletComponents;
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [22.9734, 78.6569];

  const createPin = (color) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 8.75 14 22 14 22S28 22.75 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
    return L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -40],
    });
  };

  const tasksWithCoords = tasks
    .map(t => ({ ...t, coords: getCoordsFromLocation(t.location) }))
    .filter(t => t.coords);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}>
      <MapContainer center={center} zoom={userLocation ? 12 : 5} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tasksWithCoords.map(task => (
          <Marker key={task.id} position={[task.coords.lat, task.coords.lng]}
            icon={createPin(URGENCY_COLOR[task.urgencyLevel] || '#6b7280')}>
            <Popup minWidth={220}>
              <div className="font-sans">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm">{task.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${URGENCY_BADGE[task.urgencyLevel]}`}>
                    {task.urgencyLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">📍 {task.location}</p>
                <p className="text-xs text-gray-400 mb-2">{task.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MapPage() {
  const { tasks } = useTaskStore();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    // Use watchPosition for accurate real-time location
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      (err) => console.warn('[MapPage] Geolocation error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Map</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {tasks.length} tasks · {HAS_API_KEY ? 'Google Maps' : 'OpenStreetMap'}
          </p>
        </div>
        {!HAS_API_KEY && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-amber-700 font-medium">
              Add <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to use Google Maps
            </span>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ height: 'calc(100vh - 240px)', minHeight: 450 }}>
        {HAS_API_KEY
          ? <GoogleMapView tasks={tasks} userLocation={userLocation} />
          : <LeafletMapView tasks={tasks} userLocation={userLocation} />
        }
      </div>
    </div>
  );
}
