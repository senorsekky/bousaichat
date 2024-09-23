import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Circle } from '@react-google-maps/api'
import { Loader2 } from 'lucide-react'

interface MapProps {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints: { location: { lat: number; lng: number } }[];
    geofenceCenter: { lat: number; lng: number };
    geofenceRadius: number;
    small?: boolean;
    onClick?: () => void;
}

const Map: React.FC<MapProps> = ({ origin, destination, waypoints, geofenceCenter, geofenceRadius, small = false, onClick }) => {
const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
})

const [map, setMap] = useState<google.maps.Map | null>(null)
const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

const containerStyle = small
    ? { width: '600px', height: '350px' }
    : { width: '100%', height: '100%' };

const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
}, [])

const onUnmount = useCallback(() => {
    setMap(null)
}, [])

useEffect(() => {
    if (isLoaded && map) {
    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING
        },
        (result, status) => {
            if (status === 'OK') {
                setDirections(result)
            } else {
                console.error(`Directions request failed due to ${status}`);
            }
        }
    )
    }
}, [isLoaded, map, origin, destination, waypoints])

if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
}

return isLoaded ? (
    <div onClick={onClick} className={small ? 'cursor-pointer' : ''}>
    <GoogleMap
        mapContainerStyle={containerStyle}
        center={origin}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ disableDefaultUI: small }}
    >
        <Marker position={origin} />
        <Marker position={destination} />
        {directions && (
        <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
        />
        )}
        <Circle
        center={geofenceCenter}
        radius={geofenceRadius}
        options={{
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
        }}
        />
    </GoogleMap>
    </div>
) : (
    <div className="flex items-center justify-center" style={containerStyle}>
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
)
}

export default Map