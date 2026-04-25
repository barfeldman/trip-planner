import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, MapPin, Plane } from 'lucide-react';

interface TripFormProps {
  trip?: any;
  onDone: () => void;
}

interface DestinationInput {
  name: string;
  country: string;
  lat?: string;
  lng?: string;
}

export function TripForm({ trip, onDone }: TripFormProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isEditing = !!trip;

  const [name, setName] = useState(trip?.name || '');
  const [description, setDescription] = useState(trip?.description || '');
  const [startDate, setStartDate] = useState(trip ? trip.startDate.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(trip ? trip.endDate.slice(0, 10) : '');
  const [homeCurrency, setHomeCurrency] = useState(trip?.homeCurrency || 'ILS');
  const [exchangeRate, setExchangeRate] = useState(trip?.exchangeRate?.toString() || '');
  const [usdRate, setUsdRate] = useState(trip?.usdRate?.toString() || '3.7');
  const [destinations, setDestinations] = useState<DestinationInput[]>(
    trip?.destinations?.map((d: any) => ({ name: d.name, country: d.country, lat: d.lat?.toString() || '', lng: d.lng?.toString() || '' })) || [{ name: '', country: '', lat: '', lng: '' }]
  );

  const createTrip = useMutation({
    mutationFn: async (data: any) => {
      const tripData = await api.createTrip({
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        homeCurrency: data.homeCurrency,
        exchangeRate: parseFloat(data.exchangeRate) || 1,
        usdRate: parseFloat(data.usdRate) || 3.7,
      });

      // Create destinations
      for (let i = 0; i < data.destinations.length; i++) {
        const dest = data.destinations[i];
        if (dest.name.trim()) {
          await api.createDestination({
            tripId: tripData.id,
            name: dest.name.trim(),
            country: dest.country.trim() || '',
            lat: dest.lat ? parseFloat(dest.lat) : undefined,
            lng: dest.lng ? parseFloat(dest.lng) : undefined,
            sortOrder: i,
          });
        }
      }

      // Auto-generate days based on date range
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < dayCount; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(dayDate.getDate() + i);
        await api.createDay({
          tripId: tripData.id,
          date: dayDate.toISOString(),
          dayNumber: i + 1,
          sortOrder: i,
        });
      }

      return tripData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      onDone();
    },
  });

  const updateTrip = useMutation({
    mutationFn: async (data: any) => {
      await api.updateTrip(trip.id, {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        homeCurrency: data.homeCurrency,
        exchangeRate: parseFloat(data.exchangeRate) || 1,
        usdRate: parseFloat(data.usdRate) || 3.7,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      onDone();
    },
  });

  const addDestination = () => {
    setDestinations([...destinations, { name: '', country: '', lat: '', lng: '' }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: keyof DestinationInput, value: string) => {
    const updated = [...destinations];
    updated[index] = { ...updated[index], [field]: value };
    setDestinations(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, description, startDate, endDate, homeCurrency, exchangeRate, usdRate, destinations };
    if (isEditing) {
      updateTrip.mutate(data);
    } else {
      createTrip.mutate(data);
    }
  };

  const isPending = createTrip.isPending || updateTrip.isPending;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">✈️</div>
          <h1 className="text-3xl font-bold font-display">
            {isEditing ? t('trip.editTrip') : t('trip.createTrip')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-saffron-500" />
                {t('trip.tripName')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t('trip.tripName')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('trip.tripNamePlaceholder')}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">{t('trip.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('trip.descPlaceholder')}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">{t('trip.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1 num-ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">{t('trip.endDate')}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1 num-ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeCurrency">{t('trip.homeCurrency')}</Label>
                  <Input
                    id="homeCurrency"
                    value={homeCurrency}
                    onChange={(e) => setHomeCurrency(e.target.value.toUpperCase())}
                    placeholder="ILS"
                    maxLength={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="exchangeRate">{t('trip.exchangeRate')}</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    placeholder="1.0"
                    className="mt-1 num-ltr"
                  />
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">{t('trip.exchangeHelp')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usdRate">1 USD = {homeCurrency || 'ILS'}</Label>
                  <Input
                    id="usdRate"
                    type="number"
                    step="0.01"
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                    placeholder="3.7"
                    className="mt-1 num-ltr"
                  />
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">How many {homeCurrency || 'ILS'} per 1 USD</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinations */}
          {!isEditing && (
            <Card className="warm-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-ocean-500" />
                  {t('trip.destinations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {destinations.map((dest, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 rounded-xl bg-[hsl(var(--muted))]/50">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron-400 to-temple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          value={dest.name}
                          onChange={(e) => updateDestination(index, 'name', e.target.value)}
                          placeholder={t('trip.destNamePlaceholder')}
                        />
                      </div>
                      <div>
                        <Input
                          value={dest.country}
                          onChange={(e) => updateDestination(index, 'country', e.target.value)}
                          placeholder={t('trip.countryPlaceholder')}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDestination(index)}
                      className="text-red-400 hover:text-red-600 mt-1"
                      disabled={destinations.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDestination}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  {t('trip.addDestination')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending || !name || !startDate || !endDate}
            className="w-full h-12 text-lg bg-gradient-to-r from-saffron-500 to-ocean-600 hover:from-saffron-600 hover:to-ocean-700 text-white rounded-xl"
          >
            {isPending
              ? (isEditing ? t('action.saving') : t('trip.generating'))
              : (isEditing ? t('trip.saveBtn') : t('trip.createBtn'))}
          </Button>
        </form>
      </div>
    </div>
  );
}
