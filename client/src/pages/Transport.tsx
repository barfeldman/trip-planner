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
import { Plus, Plane, Train, Ship, Bus, Car, ArrowRight, Trash2, Edit } from 'lucide-react';

const typeConfig: Record<string, { icon: any; emoji: string; color: string }> = {
  flight: { icon: Plane, emoji: '✈️', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' },
  train: { icon: Train, emoji: '🚂', color: 'bg-green-50 text-green-600 dark:bg-green-500/10' },
  ferry: { icon: Ship, emoji: '⛴️', color: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-500/10' },
  bus: { icon: Bus, emoji: '🚌', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10' },
  taxi: { icon: Car, emoji: '🚕', color: 'bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10' },
  'private-transfer': { icon: Car, emoji: '🚗', color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' },
};

export function Transport({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: transports = [] } = useQuery({
    queryKey: ['transports', tripId],
    queryFn: () => api.getTransports(tripId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateTransport(editing.id, data) : api.createTransport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTransport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const toggleBooked = useMutation({
    mutationFn: ({ id, isBooked }: { id: string; isBooked: boolean }) =>
      api.updateTransport(id, { isBooked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('trans.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]"><span className="num-ltr">{transports.length}</span> {t('trans.bookings')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          {t('trans.addTransport')}
        </Button>
      </div>

      <div className="space-y-3">
        {transports.map((tr: any) => {
          const config = typeConfig[tr.type] || typeConfig['taxi'];
          const Icon = config.icon;
          return (
            <Card key={tr.id} className="overflow-hidden group">
              <div className={`h-1 ${tr.isBooked ? 'bg-green-500' : 'bg-gray-300'}`} />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{tr.fromLocation}</span>
                      <ArrowRight className="h-4 w-4 text-saffron-500 flex-shrink-0" />
                      <span className="font-semibold">{tr.toLocation}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>📅 {formatDate(tr.departureDate)}</span>
                      {tr.departureTime && <span>🕐 {tr.departureTime}</span>}
                      {tr.operator && <span>🏢 {tr.operator}</span>}
                      {tr.seatInfo && <span>💺 {tr.seatInfo}</span>}
                    </div>
                    {tr.confirmationCode && (
                      <p className="text-xs mt-1">
                        <span className="text-[hsl(var(--muted-foreground))]">{t('action.confirmation')} </span>
                        <span className="font-mono font-medium">{tr.confirmationCode}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-end flex flex-col items-end gap-2">
                    {tr.price && (
                      <span className="font-bold text-saffron-600 num-ltr">
                        {formatCurrency(tr.price, tr.currency)}
                      </span>
                    )}
                    <Button
                      variant={tr.isBooked ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => toggleBooked.mutate({ id: tr.id, isBooked: !tr.isBooked })}
                    >
                      {tr.isBooked ? t('accom.booked') : t('trans.notBooked')}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(tr); setShowForm(true); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(tr.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {transports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plane className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('trans.noTransport')}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('trans.editTransport') : t('trans.addTransport')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                tripId,
                type: fd.get('type'),
                fromLocation: fd.get('fromLocation'),
                toLocation: fd.get('toLocation'),
                departureDate: new Date(fd.get('departureDate') as string).toISOString(),
                departureTime: fd.get('departureTime') || null,
                arrivalDate: fd.get('arrivalDate') ? new Date(fd.get('arrivalDate') as string).toISOString() : null,
                arrivalTime: fd.get('arrivalTime') || null,
                operator: fd.get('operator') || null,
                confirmationCode: fd.get('confirmationCode') || null,
                price: parseFloat(fd.get('price') as string) || null,
                currency: fd.get('currency') || 'THB',
                seatInfo: fd.get('seatInfo') || null,
                notes: fd.get('notes') || null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="type">{t('form.type')}</Label>
              <select name="type" id="type" defaultValue={editing?.type || 'flight'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                <option value="flight">✈️ {t('trans.flight')}</option>
                <option value="train">🚂 {t('trans.train')}</option>
                <option value="ferry">⛴️ {t('trans.ferry')}</option>
                <option value="bus">🚌 {t('trans.bus')}</option>
                <option value="taxi">🚕 {t('trans.taxi')}</option>
                <option value="private-transfer">🚗 {t('trans.privateTransfer')}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fromLocation">{t('form.from')}</Label>
                <Input id="fromLocation" name="fromLocation" required defaultValue={editing?.fromLocation} />
              </div>
              <div>
                <Label htmlFor="toLocation">{t('form.to')}</Label>
                <Input id="toLocation" name="toLocation" required defaultValue={editing?.toLocation} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="departureDate">{t('form.departureDate')}</Label>
                <Input type="date" id="departureDate" name="departureDate" required defaultValue={editing?.departureDate?.split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="departureTime">{t('form.departureTime')}</Label>
                <Input type="time" id="departureTime" name="departureTime" defaultValue={editing?.departureTime} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="arrivalDate">{t('form.arrivalDate')}</Label>
                <Input type="date" id="arrivalDate" name="arrivalDate" defaultValue={editing?.arrivalDate?.split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="arrivalTime">{t('form.arrivalTime')}</Label>
                <Input type="time" id="arrivalTime" name="arrivalTime" defaultValue={editing?.arrivalTime} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="operator">{t('form.airline')}</Label>
                <Input id="operator" name="operator" defaultValue={editing?.operator} />
              </div>
              <div>
                <Label htmlFor="confirmationCode">{t('form.confirmationCode')}</Label>
                <Input id="confirmationCode" name="confirmationCode" defaultValue={editing?.confirmationCode} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="price">{t('form.price')}</Label>
                <Input type="number" id="price" name="price" defaultValue={editing?.price} />
              </div>
              <div>
                <Label htmlFor="currency">{t('form.currency')}</Label>
                <select name="currency" id="currency" defaultValue={editing?.currency || 'THB'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="THB">THB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <Label htmlFor="seatInfo">{t('form.seatInfo')}</Label>
                <Input id="seatInfo" name="seatInfo" defaultValue={editing?.seatInfo} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={editing?.notes} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.saving') : editing ? t('action.update') : t('trans.addTransport')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
