import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryIcon } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const COLORS = {
  destination: '#f98407',
  accommodation: '#07c4a6',
  activity: '#e27b2c',
  transport: '#6366f1',
};

export function MapView({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  useEffect(() => {
    if (!mapRef.current || !trip) return;

    // Clean up existing map
    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current).setView([13.0, 101.0], 6);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markers: L.LatLng[] = [];

    // Destination markers
    (trip.destinations || []).forEach((dest: any) => {
      if (!dest.lat || !dest.lng) return;
      const latlng = L.latLng(dest.lat, dest.lng);
      markers.push(latlng);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${COLORS.destination}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${dest.sortOrder + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(latlng, { icon })
        .addTo(map)
        .bindPopup(`<strong>${dest.name}</strong><br>Stop ${dest.sortOrder + 1}`);
    });

    // Accommodation markers
    (trip.accommodations || []).forEach((accom: any) => {
      if (!accom.lat || !accom.lng) return;
      const latlng = L.latLng(accom.lat, accom.lng);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${COLORS.accommodation}; color: white; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">🏨</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker(latlng, { icon })
        .addTo(map)
        .bindPopup(`<strong>${accom.name}</strong><br>${accom.destination?.name || ''}<br>${accom.isBooked ? '✅ Booked' : '⏳ Not booked'}`);
    });

    // Activity markers
    (trip.activities || []).forEach((activity: any) => {
      if (!activity.lat || !activity.lng) return;
      const latlng = L.latLng(activity.lat, activity.lng);

      const emoji = categoryIcon(activity.category);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid ${COLORS.activity}; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">${emoji}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(latlng, { icon })
        .addTo(map)
        .bindPopup(`<strong>${activity.name}</strong><br>${activity.destination?.name || ''}<br>${activity.priority === 'must-do' ? '⭐ Must-do' : 'Nice to have'}`);
    });

    // Route line between destinations
    const destCoords = (trip.destinations || [])
      .filter((d: any) => d.lat && d.lng)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((d: any) => L.latLng(d.lat, d.lng));

    if (destCoords.length > 1) {
      L.polyline(destCoords, {
        color: COLORS.destination,
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(map);
    }

    // Fit bounds
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [trip]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('map.title')}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('map.subtitle')}</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: COLORS.destination }} />
          <span className="text-xs">{t('map.destinations')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: COLORS.accommodation }} />
          <span className="text-xs">{t('map.accommodations')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: COLORS.activity }} />
          <span className="text-xs">{t('map.activities')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5" style={{ background: COLORS.destination, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, white 4px, white 8px)' }} />
          <span className="text-xs">{t('map.route')}</span>
        </div>
      </div>

      {/* Map container */}
      <Card className="overflow-hidden">
        <div ref={mapRef} className="h-[500px] md:h-[600px] w-full" />
      </Card>

      {/* Destination summary */}
      {trip?.destinations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trip.destinations.map((dest: any) => {
            const destActivities = (trip.activities || []).filter((a: any) => a.destinationId === dest.id);
            const destAccom = (trip.accommodations || []).filter((a: any) => a.destinationId === dest.id);
            return (
              <Card key={dest.id}>
                <CardContent className="p-4">
                  <h4 className="font-display font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-saffron-500 text-white text-xs flex items-center justify-center font-bold">
                      {dest.sortOrder + 1}
                    </span>
                    {dest.name}
                  </h4>
                  <div className="mt-2 space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <p>📍 <span className="num-ltr">{destActivities.length}</span> {t('map.activities')}</p>
                    <p>🏨 <span className="num-ltr">{destAccom.length}</span> {t('map.stays')}</p>
                    {dest.lat && <p>📐 {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
