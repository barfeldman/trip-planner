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
import { formatDate, categoryIcon } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, GripVertical, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function Itinerary({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const addActivity = useMutation({
    mutationFn: (data: any) => api.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowAddActivity(null);
    },
  });

  const deleteActivity = useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  if (!trip) return null;

  const days: any[] = trip.days || [];
  const destinations: any[] = trip.destinations || [];

  // Group days: first unassigned, then by destination
  const assignedIds = new Set(days.filter((d) => d.destinationId).map((d) => d.id));
  const unassignedDays = days.filter((d) => !d.destinationId);

  const groups: { label: string; color: string; days: any[] }[] = [];

  if (unassignedDays.length > 0) {
    groups.push({ label: trip.name, color: 'from-saffron-400 to-saffron-600', days: unassignedDays });
  }

  destinations.forEach((dest: any, i: number) => {
    const destDays = days.filter((d) => d.destinationId === dest.id);
    if (destDays.length > 0) {
      const colors = [
        'from-saffron-400 to-temple-500',
        'from-ocean-400 to-ocean-600',
        'from-rose-400 to-rose-600',
        'from-emerald-400 to-emerald-600',
      ];
      groups.push({ label: dest.name, color: colors[i % colors.length], days: destDays });
    }
  });

  // Fallback: if no groups at all, still show all days flat
  if (groups.length === 0 && days.length > 0) {
    groups.push({ label: trip.name, color: 'from-saffron-400 to-saffron-600', days });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('itin.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('itin.subtitle')}</p>
        </div>
      </div>

      {days.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <p className="text-4xl mb-3">📅</p>
            <p>{t('app.noTrips')}</p>
          </CardContent>
        </Card>
      )}

      {groups.map(({ label, color, days: groupDays }) => (
        <div key={label} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              ✈
            </div>
            <h3 className="font-display text-lg font-semibold">{label}</h3>
            <Badge variant="secondary"><span className="num-ltr">{groupDays.length}</span> {t('dash.days')}</Badge>
          </div>

          <div className="ml-4 border-l-2 border-saffron-200 dark:border-saffron-800 pl-6 space-y-3">
            {groupDays.map((day: any) => {
              const isExpanded = expandedDay === day.id;
              const dayActivities: any[] = day.activities || [];

              return (
                <Card key={day.id} className="overflow-hidden">
                  <button
                    className="w-full text-left p-4 flex items-center gap-4 hover:bg-[hsl(var(--accent))]/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-saffron-50 dark:bg-saffron-500/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-saffron-700">{t('itin.day')}</span>
                      <span className="text-sm font-display font-bold text-saffron-600 -mt-0.5">{day.dayNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{day.title || `${t('itin.day')} ${day.dayNumber}`}</h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(day.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dayActivities.length > 0 && (
                        <Badge variant="outline" className="text-[10px]"><span className="num-ltr">{dayActivities.length}</span> {t('itin.activities')}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-saffron-500 hover:text-saffron-700 hover:bg-saffron-50 dark:hover:bg-saffron-500/10"
                        onClick={(e) => { e.stopPropagation(); setShowAddActivity(day.id); }}
                        title={t('itin.addActivity')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 px-4">
                      {day.notes && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 italic">{day.notes}</p>
                      )}

                      <div className="space-y-2">
                        {dayActivities.length === 0 && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-3">
                            {t('itin.addActivity')} ↑
                          </p>
                        )}
                        {dayActivities.map((activity: any) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] transition-colors group"
                          >
                            <GripVertical className="h-4 w-4 mt-0.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 cursor-grab" />
                            <span className="text-lg flex-shrink-0">{categoryIcon(activity.category)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">{activity.name}</h5>
                                {activity.priority === 'must-do' && (
                                  <Badge className="text-[10px]">{t('itin.mustDo')}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                                {activity.startTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {activity.startTime}
                                  </span>
                                )}
                                {activity.duration && <span>⏱ {activity.duration}</span>}
                                {activity.estimatedCost > 0 && <span>฿{activity.estimatedCost}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteActivity.mutate(activity.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add Activity Dialog */}
      <Dialog open={!!showAddActivity} onOpenChange={() => setShowAddActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('itin.addActivity')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addActivity.mutate({
                tripId,
                dayId: showAddActivity,
                name: formData.get('name'),
                category: formData.get('category'),
                estimatedCost: parseFloat(formData.get('cost') as string) || 0,
                duration: formData.get('duration'),
                priority: formData.get('priority'),
                notes: formData.get('notes'),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t('itin.activityName')}</Label>
              <Input id="name" name="name" required autoFocus className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">{t('form.category')}</Label>
                <select name="category" id="category" className="mt-1 flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="sightseeing">{t('cat.sightseeing')}</option>
                  <option value="temple">{t('cat.temple')}</option>
                  <option value="beach">{t('cat.beach')}</option>
                  <option value="restaurant">{t('cat.restaurant')}</option>
                  <option value="tour">{t('cat.tour')}</option>
                  <option value="market">{t('cat.market')}</option>
                  <option value="nightlife">{t('cat.nightlife')}</option>
                  <option value="nature">{t('cat.nature')}</option>
                  <option value="culture">{t('cat.culture')}</option>
                  <option value="shopping">{t('cat.shopping')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">{t('form.priority')}</Label>
                <select name="priority" id="priority" className="mt-1 flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="nice-to-have">{t('itin.niceTohave')}</option>
                  <option value="must-do">{t('itin.mustDoLabel')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost">{t('form.estimatedCost')}</Label>
                <Input id="cost" name="cost" type="number" defaultValue="0" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="duration">{t('form.duration')}</Label>
                <Input id="duration" name="duration" placeholder={t('form.durationPlaceholder')} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea id="notes" name="notes" rows={2} className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={addActivity.isPending}>
              {addActivity.isPending ? t('action.adding') : t('itin.addActivity')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
