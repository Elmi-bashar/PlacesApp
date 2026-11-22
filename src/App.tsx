import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; 

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
            map.flyTo([place.Latitude, place.Longitude], 15);;
        }
    }, [place, map]);

    return null;
};

const App = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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
                <h2>Places</h2>
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
                                color: 'light_blue',
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
        </div>
    );
};

export default App;
