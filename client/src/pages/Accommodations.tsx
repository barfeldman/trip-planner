import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, Hotel, MapPin, Calendar, ExternalLink, Trash2, Edit, Star } from 'lucide-react';

export function Accommodations({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: accommodations = [] } = useQuery({
    queryKey: ['accommodations', tripId],
    queryFn: () => api.getAccommodations(tripId),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const destinations = trip?.destinations || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateAccommodation(editing.id, data) : api.createAccommodation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAccommodation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const toggleBooked = useMutation({
    mutationFn: ({ id, isBooked }: { id: string; isBooked: boolean }) =>
      api.updateAccommodation(id, { isBooked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const typeEmoji: Record<string, string> = {
    hotel: '🏨',
    hostel: '🏠',
    airbnb: '🏡',
    resort: '🌴',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('accom.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('accom.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          {t('accom.addStay')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accommodations.map((accom: any) => (
          <Card key={accom.id} className="overflow-hidden group">
            <div className={`h-1.5 ${accom.isBooked ? 'bg-green-500' : 'bg-saffron-300'}`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeEmoji[accom.type] || '🏨'}</span>
                  <div>
                    <h3 className="font-display font-semibold">{accom.name}</h3>
                    {accom.destination && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {accom.destination.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(accom); setShowForm(true); }}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(accom.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(accom.checkIn)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(accom.checkOut)}</span>
                </div>
              </div>

              {accom.roomType && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">🛏️ {accom.roomType}</p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <div>
                  <span className="text-lg font-display font-bold text-saffron-600">
                    {formatCurrency(accom.totalCost, accom.currency)}
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
                    ({formatCurrency(accom.pricePerNight, accom.currency)}/night)
                  </span>
                </div>
                <Button
                  variant={accom.isBooked ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleBooked.mutate({ id: accom.id, isBooked: !accom.isBooked })}
                >
                  {accom.isBooked ? t('accom.booked') : t('accom.markBooked')}
                </Button>
              </div>

              {accom.bookingLink && (
                <a
                  href={accom.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-saffron-600 hover:underline mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Booking link
                </a>
              )}

              {accom.notes && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 italic">{accom.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {accommodations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Hotel className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('accom.noAccom')}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('accom.editAccom') : t('accom.addAccom')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const data: any = {
                tripId,
                name: fd.get('name'),
                type: fd.get('type'),
                destinationId: fd.get('destinationId') || null,
                checkIn: new Date(fd.get('checkIn') as string).toISOString(),
                checkOut: new Date(fd.get('checkOut') as string).toISOString(),
                pricePerNight: parseFloat(fd.get('pricePerNight') as string) || 0,
                totalCost: parseFloat(fd.get('totalCost') as string) || 0,
                currency: fd.get('currency') || 'THB',
                roomType: fd.get('roomType') || null,
                bookingLink: fd.get('bookingLink') || null,
                confirmationCode: fd.get('confirmationCode') || null,
                notes: fd.get('notes') || null,
              };
              createMutation.mutate(data);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input id="name" name="name" required defaultValue={editing?.name} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">{t('form.type')}</Label>
                <select name="type" id="type" defaultValue={editing?.type || 'hotel'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="hotel">{t('accom.hotel')}</option>
                  <option value="hostel">{t('accom.hostel')}</option>
                  <option value="airbnb">{t('accom.airbnb')}</option>
                  <option value="resort">{t('accom.resort')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="destinationId">{t('form.city')}</Label>
                <select name="destinationId" id="destinationId" defaultValue={editing?.destinationId || ''} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="">{t('form.selectCity')}</option>
                  {destinations.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkIn">{t('form.checkIn')}</Label>
                <Input type="date" id="checkIn" name="checkIn" required defaultValue={editing?.checkIn?.split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="checkOut">{t('form.checkOut')}</Label>
                <Input type="date" id="checkOut" name="checkOut" required defaultValue={editing?.checkOut?.split('T')[0]} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pricePerNight">{t('form.pricePerNight')}</Label>
                <Input type="number" id="pricePerNight" name="pricePerNight" defaultValue={editing?.pricePerNight || 0} />
              </div>
              <div>
                <Label htmlFor="totalCost">{t('form.totalCost')}</Label>
                <Input type="number" id="totalCost" name="totalCost" defaultValue={editing?.totalCost || 0} />
              </div>
              <div>
                <Label htmlFor="currency">{t('form.currency')}</Label>
                <select name="currency" id="currency" defaultValue={editing?.currency || 'THB'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="THB">THB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="roomType">{t('form.roomType')}</Label>
              <Input id="roomType" name="roomType" defaultValue={editing?.roomType} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bookingLink">{t('form.bookingLink')}</Label>
                <Input id="bookingLink" name="bookingLink" type="url" defaultValue={editing?.bookingLink} />
              </div>
              <div>
                <Label htmlFor="confirmationCode">{t('form.confirmationCode')}</Label>
                <Input id="confirmationCode" name="confirmationCode" defaultValue={editing?.confirmationCode} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={editing?.notes} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.saving') : editing ? t('action.update') : t('accom.addAccom')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
