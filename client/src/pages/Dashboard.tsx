import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { daysUntil, daysBetween, formatDate, formatCurrency, budgetCategoryColor } from '@/lib/utils';
import { CalendarDays, MapPin, Wallet, Plane, Hotel, Clock, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { TripForm } from './TripForm';

export function Dashboard({ tripId }: { tripId: string }) {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const { data: budgetSummary } = useQuery({
    queryKey: ['budgetSummary', tripId],
    queryFn: () => api.getBudgetSummary(tripId),
  });

  const deleteTrip = useMutation({
    mutationFn: () => api.deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowDeleteConfirm(false);
    },
  });

  if (!trip) return null;

  if (showEdit) {
    return <TripForm trip={trip} onDone={() => setShowEdit(false)} />;
  }

  const countdown = daysUntil(trip.startDate);
  const tripDays = daysBetween(trip.startDate, trip.endDate);
  const destinations = trip.destinations || [];
  const accommodations = trip.accommodations || [];
  const transports = trip.transports || [];
  const activities = trip.activities || [];
  const mustDos = activities.filter((a: any) => a.priority === 'must-do');
  const bookedAccom = accommodations.filter((a: any) => a.isBooked).length;
  const bookedTransport = transports.filter((t: any) => t.isBooked).length;
  const totalPlanned = budgetSummary?.totalPlanned || 0;
  const totalActual = budgetSummary?.totalActual || 0;
  const budgetPercent = totalPlanned > 0 ? Math.min((totalActual / totalPlanned) * 100, 100) : 0;

  return (
    <div className="space-y-8 stagger-children">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-saffron-500 via-temple-500 to-ocean-700 p-8 md:p-10 text-white warm-shadow">
        <div className="absolute top-0 end-0 text-[120px] opacity-10 leading-none select-none">✈️</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-saffron-100 text-sm font-medium mb-1 num-ltr">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{trip.name}</h1>
              <p className="text-white/80 text-sm max-w-xl">{trip.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEdit(true)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-white/70 hover:text-red-300 hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-8">
            <div className="text-center">
              <div className="text-4xl font-extrabold num-ltr">
                {countdown > 0 ? countdown : countdown === 0 ? '🎉' : Math.abs(countdown)}
              </div>
              <div className="text-xs text-white/70 mt-1">
                {countdown > 0 ? t('dash.daysToGo') : countdown === 0 ? t('dash.today') : t('dash.daysAgo')}
              </div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-4xl font-extrabold num-ltr">{tripDays}</div>
              <div className="text-xs text-white/70 mt-1">{t('dash.days')}</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-4xl font-extrabold num-ltr">{destinations.length}</div>
              <div className="text-xs text-white/70 mt-1">{t('dash.cities')}</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-4xl font-extrabold num-ltr">{activities.length}</div>
              <div className="text-xs text-white/70 mt-1">{t('dash.activities')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="warm-shadow hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-saffron-50 dark:bg-saffron-500/10">
                <Wallet className="h-5 w-5 text-saffron-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.budget')}</p>
                <p className="font-bold text-lg num-ltr">{formatCurrency(totalActual, 'THB')}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.of')} {formatCurrency(totalPlanned, 'THB')} {t('dash.planned')}</p>
              </div>
            </div>
            <Progress value={budgetPercent} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="warm-shadow hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-ocean-50 dark:bg-ocean-500/10">
                <Hotel className="h-5 w-5 text-ocean-600" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.accommodations')}</p>
                <p className="font-bold text-lg num-ltr">{bookedAccom}/{accommodations.length}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.booked')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="warm-shadow hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.transport')}</p>
                <p className="font-bold text-lg num-ltr">{bookedTransport}/{transports.length}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.booked')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="warm-shadow hover:scale-[1.02] transition-transform duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-temple-50 dark:bg-temple-500/10">
                <MapPin className="h-5 w-5 text-temple-600" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.mustDoActivities')}</p>
                <p className="font-bold text-lg num-ltr">{mustDos.length}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.planned')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline + Budget breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route timeline */}
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-saffron-500" />
              {t('dash.tripRoute')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {destinations.map((dest: any, i: number) => {
                const destDays = trip.days?.filter((d: any) => d.destinationId === dest.id) || [];
                const destAccom = accommodations.find((a: any) => a.destinationId === dest.id);
                return (
                  <div key={dest.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-400 to-temple-500 flex items-center justify-center text-white text-xs font-bold shadow-md num-ltr">
                        {i + 1}
                      </div>
                      {i < destinations.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-saffron-300 to-ocean-300 my-1" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <h4 className="font-semibold">{dest.name}</h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] num-ltr">{destDays.length} {t('dash.days')}</p>
                      {destAccom && (
                        <p className="text-xs text-ocean-600 mt-1">🏨 {destAccom.name}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {destDays.slice(0, 3).map((d: any) => (
                          <Badge key={d.id} variant="outline" className="text-[10px]">
                            {d.title || `${t('itin.day')} ${d.dayNumber}`}
                          </Badge>
                        ))}
                        {destDays.length > 3 && (
                          <Badge variant="outline" className="text-[10px] num-ltr">+{destDays.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget breakdown */}
        <Card className="warm-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ocean-500" />
              {t('dash.budgetBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetSummary?.categories &&
                Object.entries(budgetSummary.categories).map(([cat, data]: [string, any]) => {
                  const pct = data.planned > 0 ? (data.actual / data.planned) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium capitalize">{cat}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] num-ltr">
                          {formatCurrency(data.actual)} / {formatCurrency(data.planned)}
                        </span>
                      </div>
                      <Progress value={pct} indicatorClassName={budgetCategoryColor(cat)} />
                    </div>
                  );
                })}
              {!budgetSummary?.categories && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('dash.noBudgetData')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick reference */}
      <Card className="warm-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-temple-500" />
            {t('dash.quickRef')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm mb-2">{t('dash.exchangeRate')}</h4>
              <p className="text-2xl font-bold text-saffron-600 num-ltr">1 {trip.homeCurrency} = {trip.exchangeRate}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">{t('dash.budgetIn')}{trip.homeCurrency}</h4>
              <p className="text-2xl font-bold text-ocean-600 num-ltr">
                {formatCurrency(totalPlanned / (trip.exchangeRate || 1), trip.homeCurrency)}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('dash.totalPlanned')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('trip.deleteTrip')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('trip.deleteConfirm')}</p>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {locale === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTrip.mutate()}
              disabled={deleteTrip.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTrip.isPending ? t('action.saving') : t('trip.deleteTrip')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
