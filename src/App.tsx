import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import AuthForm, { type AuthUser } from './AuthForm';

type Place = {
    ID: number;
    Name: string;
    Latitude: number;
    Longitude: number;
    UserID: number;
};

const FocusPlace = ({ place }: { place: Place | null }) => {
    const map = useMap();

    useEffect(() => {
        if (place) {
            map.flyTo([place.Latitude, place.Longitude], 15);
        }
    }, [place, map]);

    return null;
};

const App = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showAuth, setShowAuth] = useState(false);
    const [showAddPlace, setShowAddPlace] = useState(false);

    const handleAddPlaceClick = () => {
        console.log('Add Place clicked, currentUser =', currentUser);
        if (currentUser) {
            setShowAddPlace(true);
        } else {
            setShowAuth(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setShowAddPlace(false);
    };

    useEffect(() => {
        const getAllPlaces = async () => {
            const data = await fetch(
                import.meta.env.VITE_SERVER_URL + '/api/places',
            );
            const obj = await data.json();
            setPlaces(obj);
        };
        getAllPlaces();
    }, []);

    return (
        <div className="map-page">
            <div className="places-panel">
                <div className="panel-header">
                    <h2>Places</h2>
                    <button type="button" className="add-btn" onClick={handleAddPlaceClick}>
                        + Add Place
                    </button>
                </div>

                {currentUser && (
                    <p className="user-badge">
                        Logged in as {currentUser.Name}{' '}
                        <button type="button" className="link-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </p>
                )}

                {showAddPlace && <p>Add Place form comes in Step 4</p>}

                <ul>
                    {places.map((p) => (
                        <li key={p.ID}>
                            <button
                                type="button"
                                onClick={() => setSelectedPlace(p)}
                                style={{
                                    backgroundColor:
                                        selectedPlace?.ID === p.ID ? 'orange' : 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                {p.Name} ({p.Latitude.toFixed(4)},{' '}
                                {p.Longitude.toFixed(4)})
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <MapContainer
                style={{ height: '100dvh', width: '100%' }}
                center={[62.59, 29.77]}
                zoom={13}
                minZoom={3}
                maxBounds={[
                    [-85, Infinity],
                    [85, -Infinity]
                ]}
                maxBoundsViscosity={1}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FocusPlace place={selectedPlace} />
                {places.map((p) => (
                    selectedPlace?.ID === p.ID ? (
                        <Marker
                            key={p.ID}
                            position={[p.Latitude, p.Longitude]}
                        >
                            <Popup>{p.Name}</Popup>
                        </Marker>
                    ) : (
                        <CircleMarker
                            key={p.ID}
                            center={[p.Latitude, p.Longitude]}
                            radius={8}
                            pathOptions={{
                                color: 'lightblue',
                                fillColor: 'blue',
                                fillOpacity: 0.7,
                            }}
                            eventHandlers={{
                                click: () => setSelectedPlace(p),
                            }}
                        >
                            <Popup>{p.Name}</Popup>
                        </CircleMarker>
                    )
                ))}
            </MapContainer>

            {showAuth && (
                <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <AuthForm
                            onSuccess={(u) => {
                                setCurrentUser(u);
                                setShowAuth(false);
                                setShowAddPlace(true);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;