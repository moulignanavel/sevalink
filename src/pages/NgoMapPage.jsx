import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useTaskStore } from '../context/TaskStore';
import { useAuth } from '../context/AuthContext';
import { db, collection, getDocs, query, where } from '../firebase';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const HAS_API_KEY = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here';

const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };
const DEFAULT_ZOOM   = 5;

// Status colors for NGO map (different from urgency colors)
const STATUS_COLOR = {
  Pending:   '#6366f1', // indigo
  Accepted:  '#f59e0b', // amber
  Completed: '#10b981', // emerald
  Closed:    '#6b7280', // gray
};

const STATUS_BADGE = {
  Pending:   'bg-indigo-100 text-indigo-700 border-indigo-200',
  Accepted:  'bg-amber-100 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Closed:    'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICON = {
  Pending:   '⏳',
  Accepted:  '✅',
  Completed: '🏆',
  Closed:    '🔒',
};

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

// ── Google Maps NGO view ──────────────────────────────────────────────────────
function NgoGoogleMapView({ tasks, userLocation, volunteerNames }) {
  const [selected, setSelected]         = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [map, setMap]                   = useState(null);
  const [centered, setCentered]         = useState(false);

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

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  const filtered = tasks
    .filter(t => activeFilter === 'All' || t.status === activeFilter)
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
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Accepted', 'Completed', 'Closed'].map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              activeFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}>
            {f !== 'All' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[f] }} />}
            {f !== 'All' && STATUS_ICON[f]} {f}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ minHeight: 400 }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={userLocation || DEFAULT_CENTER}
          zoom={userLocation ? 12 : DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={m => setMap(m)}
        >
          {/* User location */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#6366f1',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              }}
            />
          )}

          {/* Task markers — colored by STATUS */}
          {filtered.map(task => (
            <Marker
              key={task.id}
              position={task.coords}
              onClick={() => setSelected(task)}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: STATUS_COLOR[task.status] || '#6b7280',
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
              <div className="font-sans w-64 p-1">
                {/* Status badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[selected.status]}`}>
                    {STATUS_ICON[selected.status]} {selected.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1">{selected.title}</h3>
                <p className="text-xs text-gray-500 mb-1">📍 {selected.location}</p>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{selected.description}</p>

                {/* Required skills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(selected.requiredSkills || []).map(s => (
                    <span key={s} className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{s}</span>
                  ))}
                </div>

                {/* Volunteer info */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <p className="text-xs font-bold text-gray-600 mb-1">
                    👥 {selected.volunteers || 0} volunteer{selected.volunteers !== 1 ? 's' : ''} joined
                  </p>
                  {selected.status === 'Accepted' && selected.acceptedBy?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Accepted by:</p>
                      {selected.acceptedBy.map(uid => (
                        <p key={uid} className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">👤</span>
                          {volunteerNames[uid] || uid.slice(0, 8) + '...'}
                        </p>
                      ))}
                    </div>
                  )}
                  {selected.status === 'Pending' && (
                    <p className="text-xs text-indigo-600 font-medium">⏳ Waiting for volunteers</p>
                  )}
                  {selected.status === 'Completed' && (
                    <p className="text-xs text-emerald-600 font-medium">🏆 Task completed successfully</p>
                  )}
                  {selected.status === 'Closed' && (
                    <p className="text-xs text-gray-500 font-medium">🔒 Task closed by NGO</p>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {STATUS_ICON[status]} {status}
          </span>
        ))}
        {userLocation && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Your location
          </span>
        )}
      </div>
    </div>
  );
}

// ── Leaflet fallback ──────────────────────────────────────────────────────────
function NgoLeafletMapView({ tasks, userLocation, volunteerNames }) {
  const [LeafletComponents, setLeafletComponents] = useState(null);
  const [selected, setSelected]                   = useState(null);
  const [activeFilter, setActiveFilter]           = useState('All');

  useEffect(() => {
    Promise.all([import('react-leaflet'), import('leaflet'), import('leaflet/dist/leaflet.css')])
      .then(([rl, L]) => {
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
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
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

  const filtered = tasks
    .filter(t => activeFilter === 'All' || t.status === activeFilter)
    .map(t => ({ ...t, coords: getCoordsFromLocation(t.location) }))
    .filter(t => t.coords);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Accepted', 'Completed', 'Closed'].map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              activeFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}>
            {f !== 'All' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[f] }} />}
            {f !== 'All' && STATUS_ICON[f]} {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 'calc(100vh - 320px)', minHeight: 400 }}>
        <MapContainer center={center} zoom={userLocation ? 12 : 5} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map(task => (
            <Marker key={task.id} position={[task.coords.lat, task.coords.lng]}
              icon={createPin(STATUS_COLOR[task.status] || '#6b7280')}>
              <Popup minWidth={240}>
                <div className="font-sans">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[task.status]}`}>
                    {STATUS_ICON[task.status]} {task.status}
                  </span>
                  <h3 className="font-bold text-gray-800 text-sm mt-2 mb-1">{task.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">📍 {task.location}</p>
                  <p className="text-xs text-gray-400 mb-2">{task.description}</p>
                  <p className="text-xs font-bold text-gray-600">👥 {task.volunteers || 0} volunteers</p>
                  {task.status === 'Accepted' && task.acceptedBy?.length > 0 && (
                    <div className="mt-1">
                      <p className="text-[10px] font-bold text-amber-600">Accepted by:</p>
                      {task.acceptedBy.map(uid => (
                        <p key={uid} className="text-xs text-gray-600">
                          👤 {volunteerNames[uid] || uid.slice(0, 8) + '...'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {STATUS_ICON[status]} {status}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main NGO Map Page ─────────────────────────────────────────────────────────
export default function NgoMapPage() {
  const { tasks } = useTaskStore();
  const { user }  = useAuth();
  const [userLocation, setUserLocation]   = useState(null);
  const [volunteerNames, setVolunteerNames] = useState({});

  // Get user GPS location with high accuracy
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      (err) => console.warn('[NgoMapPage] Geolocation error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Filter to NGO's own tasks
  const myTasks = tasks.filter(t => t.createdBy === user?.uid || t.createdBy === null);

  // Fetch volunteer names for accepted tasks
  useEffect(() => {
    const allUids = [...new Set(myTasks.flatMap(t => t.acceptedBy || []))].filter(uid => !uid.startsWith('demo'));
    if (allUids.length === 0) return;

    const fetchNames = async () => {
      const names = {};
      await Promise.all(allUids.map(async uid => {
        try {
          const { getDoc, doc } = await import('../firebase');
          const { db } = await import('../firebase');
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            names[uid] = snap.data().fullName || snap.data().name || snap.data().email?.split('@')[0] || 'Volunteer';
          }
        } catch {}
      }));
      setVolunteerNames(names);
    };
    fetchNames();
  }, [tasks]);

  // Stats
  const stats = {
    total:     myTasks.length,
    pending:   myTasks.filter(t => t.status === 'Pending').length,
    accepted:  myTasks.filter(t => t.status === 'Accepted').length,
    completed: myTasks.filter(t => t.status === 'Completed').length,
    closed:    myTasks.filter(t => t.status === 'Closed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Task Map</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Real-time status of your posted tasks · {HAS_API_KEY ? 'Google Maps' : 'OpenStreetMap'}
        </p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pending',   value: stats.pending,   color: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700'  },
          { label: 'Accepted',  value: stats.accepted,  color: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700'   },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Closed',    value: stats.closed,    color: 'bg-gray-400',    light: 'bg-gray-50',    text: 'text-gray-600'    },
        ].map(s => (
          <div key={s.label} className={`${s.light} rounded-2xl p-3 text-center border border-white`}>
            <div className={`w-2.5 h-2.5 rounded-full ${s.color} mx-auto mb-1`} />
            <div className={`text-xl font-bold ${s.text}`}>{s.value}</div>
            <div className={`text-[10px] font-semibold ${s.text}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ height: 'calc(100vh - 300px)', minHeight: 450 }}>
        {HAS_API_KEY
          ? <NgoGoogleMapView tasks={myTasks} userLocation={userLocation} volunteerNames={volunteerNames} />
          : <NgoLeafletMapView tasks={myTasks} userLocation={userLocation} volunteerNames={volunteerNames} />
        }
      </div>
    </div>
  );
}
