import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Navigation, AlertTriangle, Shield, Truck, 
  Hospital, Radio, Users, Target, Route 
} from "lucide-react";

// Emergency locations in Bengaluru
const EMERGENCY_LOCATIONS = {
  policeStations: [
    { name: "Brigade Road Police Station", lat: 12.9716, lng: 77.6197, type: "police" },
    { name: "MG Road Police Station", lat: 12.9791, lng: 77.6127, type: "police" },
    { name: "Koramangala Police Station", lat: 12.9352, lng: 77.6245, type: "police" },
    { name: "Indiranagar Police Station", lat: 12.9719, lng: 77.6412, type: "police" },
    { name: "Jayanagar Police Station", lat: 12.9279, lng: 77.5831, type: "police" },
  ],
  hospitals: [
    { name: "Manipal Hospital", lat: 12.9698, lng: 77.7500, type: "hospital" },
    { name: "Apollo Hospital", lat: 12.9698, lng: 77.6469, type: "hospital" },
    { name: "Fortis Hospital", lat: 12.9698, lng: 77.6388, type: "hospital" },
    { name: "St. John's Medical College", lat: 12.9495, lng: 77.6187, type: "hospital" },
    { name: "Victoria Hospital", lat: 12.9698, lng: 77.5980, type: "hospital" },
  ],
  fireStations: [
    { name: "Central Fire Station", lat: 12.9716, lng: 77.5946, type: "fire" },
    { name: "Koramangala Fire Station", lat: 12.9279, lng: 77.6271, type: "fire" },
    { name: "Indiranagar Fire Station", lat: 12.9719, lng: 77.6412, type: "fire" },
  ]
};

// Common event venues in Bengaluru
const EVENT_VENUES = [
  { name: "Brigade Road", lat: 12.9716, lng: 77.6197 },
  { name: "MG Road", lat: 12.9791, lng: 77.6127 },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "Indiranagar", lat: 12.9719, lng: 77.6412 },
  { name: "Jayanagar", lat: 12.9279, lng: 77.5831 },
  { name: "Electronic City", lat: 12.8458, lng: 77.6603 },
  { name: "Whitefield", lat: 12.9698, lng: 77.7500 },
  { name: "Bannerghatta Road", lat: 12.8996, lng: 77.6077 },
];

interface EmergencyMapProps {}

export default function EmergencyMap({}: EmergencyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [emergencyRoutes, setEmergencyRoutes] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: approvedEvents } = useQuery({
    queryKey: ["/api/events/approved"],
    refetchInterval: 30000,
  });

  const { data: dispatchedUnits } = useQuery({
    queryKey: ["/api/dispatch/units"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!mapRef.current || isMapLoaded) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      // Initialize map centered on Bengaluru
      const map = window.L.map(mapRef.current).setView([12.9716, 77.5946], 12);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add emergency locations
      addEmergencyLocations(map);
      
      // Add event locations
      addEventLocations(map);

      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    };

    loadLeaflet();
  }, []);

  const addEmergencyLocations = (map: any) => {
    // Add police stations
    EMERGENCY_LOCATIONS.policeStations.forEach(location => {
      const marker = window.L.marker([location.lat, location.lng], {
        icon: createCustomIcon('🚔', '#3b82f6')
      }).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><br/>Police Station`);
    });

    // Add hospitals
    EMERGENCY_LOCATIONS.hospitals.forEach(location => {
      const marker = window.L.marker([location.lat, location.lng], {
        icon: createCustomIcon('🏥', '#ef4444')
      }).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><br/>Hospital`);
    });

    // Add fire stations
    EMERGENCY_LOCATIONS.fireStations.forEach(location => {
      const marker = window.L.marker([location.lat, location.lng], {
        icon: createCustomIcon('🚒', '#f97316')
      }).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><br/>Fire Station`);
    });
  };

  const addEventLocations = (map: any) => {
    if (!Array.isArray(approvedEvents)) return;

    approvedEvents.forEach((event: any) => {
      const venue = EVENT_VENUES.find(v => 
        event.location.toLowerCase().includes(v.name.toLowerCase())
      );
      
      if (venue) {
        const marker = window.L.marker([venue.lat, venue.lng], {
          icon: createCustomIcon('🎪', '#8b5cf6')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${event.title}</strong><br/>
          ${event.location}<br/>
          Date: ${new Date(event.date).toLocaleDateString()}<br/>
          Expected: ${event.expectedAttendance?.toLocaleString()} people
        `);
      }
    });
  };

  const createCustomIcon = (emoji: string, color: string) => {
    return window.L.divIcon({
      html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const calculateEmergencyRoutes = (venueName: string) => {
    const venue = EVENT_VENUES.find(v => v.name === venueName);
    if (!venue || !mapInstanceRef.current) return;

    // Clear existing routes
    emergencyRoutes.forEach(route => mapInstanceRef.current.removeLayer(route));
    setEmergencyRoutes([]);

    const newRoutes: any[] = [];

    // Find nearest emergency services
    const nearestPolice = findNearestLocation(venue, EMERGENCY_LOCATIONS.policeStations);
    const nearestHospital = findNearestLocation(venue, EMERGENCY_LOCATIONS.hospitals);
    const nearestFireStation = findNearestLocation(venue, EMERGENCY_LOCATIONS.fireStations);

    // Draw routes to nearest emergency services
    if (nearestPolice) {
      const route = window.L.polyline([
        [venue.lat, venue.lng],
        [nearestPolice.lat, nearestPolice.lng]
      ], { color: '#3b82f6', weight: 4, opacity: 0.7 }).addTo(mapInstanceRef.current);
      newRoutes.push(route);
      
      route.bindPopup(`Emergency Route to ${nearestPolice.name}`);
    }

    if (nearestHospital) {
      const route = window.L.polyline([
        [venue.lat, venue.lng],
        [nearestHospital.lat, nearestHospital.lng]
      ], { color: '#ef4444', weight: 4, opacity: 0.7 }).addTo(mapInstanceRef.current);
      newRoutes.push(route);
      
      route.bindPopup(`Emergency Route to ${nearestHospital.name}`);
    }

    if (nearestFireStation) {
      const route = window.L.polyline([
        [venue.lat, venue.lng],
        [nearestFireStation.lat, nearestFireStation.lng]
      ], { color: '#f97316', weight: 4, opacity: 0.7 }).addTo(mapInstanceRef.current);
      newRoutes.push(route);
      
      route.bindPopup(`Emergency Route to ${nearestFireStation.name}`);
    }

    setEmergencyRoutes(newRoutes);

    // Focus map on selected venue
    mapInstanceRef.current.setView([venue.lat, venue.lng], 14);
  };

  const findNearestLocation = (venue: any, locations: any[]) => {
    let nearest = null;
    let minDistance = Infinity;

    locations.forEach(location => {
      const distance = Math.sqrt(
        Math.pow(venue.lat - location.lat, 2) + 
        Math.pow(venue.lng - location.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    });

    return nearest;
  };

  const addDispatchedUnitsToMap = () => {
    if (!Array.isArray(dispatchedUnits) || !mapInstanceRef.current) return;

    dispatchedUnits.forEach((unit: any) => {
      const venue = EVENT_VENUES.find(v => 
        unit.location.toLowerCase().includes(v.name.toLowerCase())
      );
      
      if (venue) {
        const marker = window.L.marker([venue.lat, venue.lng], {
          icon: createCustomIcon('🚓', '#10b981')
        }).addTo(mapInstanceRef.current);
        
        marker.bindPopup(`
          <strong>Dispatched Unit</strong><br/>
          Type: ${unit.unitType}<br/>
          Quantity: ${unit.quantity}<br/>
          Priority: ${unit.priority}<br/>
          Status: ${unit.status}
        `);
      }
    });
  };

  useEffect(() => {
    if (isMapLoaded && dispatchedUnits) {
      addDispatchedUnitsToMap();
    }
  }, [dispatchedUnits, isMapLoaded]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <MapPin className="mr-3 h-6 w-6 text-red-500" />
          Emergency Response Map
        </h2>
        <div className="flex space-x-2">
          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Event Venue" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_VENUES.map(venue => (
                <SelectItem key={venue.name} value={venue.name}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => selectedVenue && calculateEmergencyRoutes(selectedVenue)}
            disabled={!selectedVenue}
          >
            <Route className="h-4 w-4 mr-2" />
            Show Routes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="mr-2 h-5 w-5" />
                Live Emergency Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef} 
                className="w-full h-96 rounded-lg border border-gray-300"
                style={{ minHeight: '400px' }}
              />
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading Emergency Map...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Shield className="mr-2 h-4 w-4" />
                Map Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">🚔</div>
                <span className="text-sm">Police Stations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">🏥</div>
                <span className="text-sm">Hospitals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm">🚒</div>
                <span className="text-sm">Fire Stations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">🎪</div>
                <span className="text-sm">Event Venues</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">🚓</div>
                <span className="text-sm">Dispatched Units</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Target className="mr-2 h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => mapInstanceRef.current?.setView([12.9716, 77.5946], 12)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Center on Bengaluru
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Zones
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Radio className="h-4 w-4 mr-2" />
                Communication Hub
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4" />
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(approvedEvents) && approvedEvents.slice(0, 3).map((event: any) => (
                  <div key={event.id} className="p-2 border border-gray-700 rounded">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-400">{event.location}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {event.expectedAttendance?.toLocaleString()} expected
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}