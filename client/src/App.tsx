import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Itinerary } from '@/pages/Itinerary';
import { Accommodations } from '@/pages/Accommodations';
import { Activities } from '@/pages/Activities';
import { Budget } from '@/pages/Budget';
import { Transport } from '@/pages/Transport';
import { PackingList } from '@/pages/PackingList';
import { Documents } from '@/pages/Documents';
import { MapView } from '@/pages/MapView';
import { Notes } from '@/pages/Notes';

export default function App() {
  const { t } = useI18n();
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: api.getTrips,
  });

  const tripId = trips?.[0]?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="text-6xl animate-bounce">🌴</div>
          <p className="text-lg font-display text-[hsl(var(--muted-foreground))]">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-lg">{t('app.noTrips')}</p>
      </div>
    );
  }

  return (
    <Layout tripId={tripId}>
      <Routes>
        <Route path="/" element={<Dashboard tripId={tripId} />} />
        <Route path="/itinerary" element={<Itinerary tripId={tripId} />} />
        <Route path="/accommodations" element={<Accommodations tripId={tripId} />} />
        <Route path="/activities" element={<Activities tripId={tripId} />} />
        <Route path="/budget" element={<Budget tripId={tripId} />} />
        <Route path="/transport" element={<Transport tripId={tripId} />} />
        <Route path="/packing" element={<PackingList tripId={tripId} />} />
        <Route path="/documents" element={<Documents tripId={tripId} />} />
        <Route path="/map" element={<MapView tripId={tripId} />} />
        <Route path="/notes" element={<Notes tripId={tripId} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
