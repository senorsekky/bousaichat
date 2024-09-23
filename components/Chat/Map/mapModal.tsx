import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

interface MapData {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    geofenceCenter: { lat: number; lng: number };
    geofenceRadius: number;
}

interface MapModalProps {
  isOpen: MapData;
  onClose: () => void;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: { location: { lat: number; lng: number } }[];
  geofenceCenter: { lat: number; lng: number };
  geofenceRadius: number;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, origin, destination, waypoints, geofenceCenter, geofenceRadius }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
  
    useEffect(() => {
      const initMap = () => {
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: origin,
            zoom: 14,
            mapTypeId: 'satellite',  // 3D satellite view
            tilt: 45  // Adjust tilt for 3D perspective
          });
  
          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            suppressMarkers: true, // すべてのマーカーを非表示にする
          });
  
          const request: google.maps.DirectionsRequest = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING,
          };
  
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);
              directionsRenderer.setPanel(
                document.getElementById("sidebar") as HTMLElement
              );

            }
          });
  
          // 出発地と目的地のマーカーを手動で表示
          new google.maps.Marker({ position: origin, map: mapInstanceRef.current });
          new google.maps.Marker({ position: destination, map: mapInstanceRef.current });
  
          // ジオフェンスを表示
          new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: mapInstanceRef.current,
            center: geofenceCenter,
            radius: geofenceRadius
          });

          // 浸水データのスタイル設定
          mapInstanceRef.current.data.setStyle({
            fillColor: 'blue',
            strokeWeight: 1,
            fillOpacity: 0.5,
          });
        }
      };
  
      if (isOpen) {
        if (window.google && window.google.maps) {
          initMap();
        } else {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.onload = initMap;
          document.body.appendChild(script);
        }
      }
  
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current = null;
        }
      };
    }, [isOpen, origin, destination, waypoints, geofenceCenter, geofenceRadius]);
  
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-4 w-4/5 h-4/5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
                aria-label="Close map"
              >
                <X size={24} />
              </button>
              <div ref={mapRef} className="w-full h-full">
                {!mapInstanceRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
}
  
export default MapModal