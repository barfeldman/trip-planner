import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatCurrency, categoryIcon } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, Star, MapPin, Trash2, Edit, Heart } from 'lucide-react';

export function Activities({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: () => api.getActivities(tripId),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const destinations = trip?.destinations || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateActivity(editing.id, data) : api.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const updateInterest = useMutation({
    mutationFn: ({ id, field, value }: { id: string; field: string; value: number }) =>
      api.updateActivity(id, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', tripId] }),
  });

  const filtered = filter === 'all' ? activities : activities.filter((a: any) => {
    if (filter === 'must-do') return a.priority === 'must-do';
    return a.destinationId === filter;
  });

  const categories = [...new Set(activities.map((a: any) => a.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('act.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]"><span className="num-ltr">{activities.length}</span> {t('act.thingsToDo')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          {t('act.addActivity')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          {t('act.all')} (<span className="num-ltr">{activities.length}</span>)
        </Button>
        <Button variant={filter === 'must-do' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('must-do')}>
          ⭐ {t('dash.mustDoActivities')} (<span className="num-ltr">{activities.filter((a: any) => a.priority === 'must-do').length}</span>)
        </Button>
        {destinations.map((d: any) => (
          <Button
            key={d.id}
            variant={filter === d.id ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter(d.id)}
          >
            {d.name} ({activities.filter((a: any) => a.destinationId === d.id).length})
          </Button>
        ))}
      </div>

      {/* Activities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((activity: any) => (
          <Card key={activity.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcon(activity.category)}</span>
                  <div>
                    <h4 className="font-medium text-sm">{activity.name}</h4>
                    {activity.destination && (
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {activity.destination.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(activity); setShowForm(true); }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(activity.id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {activity.priority === 'must-do' && <Badge>{t('itin.mustDoLabel')}</Badge>}
                <Badge variant="outline" className="text-[10px] capitalize">{activity.category}</Badge>
              </div>

              {activity.description && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2">{activity.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                {activity.estimatedCost > 0 && <span>💰 {formatCurrency(activity.estimatedCost, activity.currency)}</span>}
                {activity.duration && <span>⏱ {activity.duration}</span>}
              </div>

              {/* Interest levels */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-lotus-500" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{t('act.you')}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateInterest.mutate({ id: activity.id, field: 'interestP1', value: n })}
                        className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center cursor-pointer transition-colors ${n <= activity.interestP1 ? 'bg-saffron-400 text-white' : 'bg-[hsl(var(--muted))]'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-ocean-500" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{t('act.partner')}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateInterest.mutate({ id: activity.id, field: 'interestP2', value: n })}
                        className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center cursor-pointer transition-colors ${n <= activity.interestP2 ? 'bg-ocean-400 text-white' : 'bg-[hsl(var(--muted))]'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('act.editActivity') : t('act.addActivity')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                tripId,
                name: fd.get('name'),
                category: fd.get('category'),
                destinationId: fd.get('destinationId') || null,
                estimatedCost: parseFloat(fd.get('estimatedCost') as string) || 0,
                duration: fd.get('duration') || null,
                priority: fd.get('priority'),
                description: fd.get('description') || null,
                notes: fd.get('notes') || null,
                lat: parseFloat(fd.get('lat') as string) || null,
                lng: parseFloat(fd.get('lng') as string) || null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input id="name" name="name" required defaultValue={editing?.name} />
            </div>
            <div>
              <Label htmlFor="description">{t('form.description')}</Label>
              <Input id="description" name="description" defaultValue={editing?.description} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">{t('form.category')}</Label>
                <select name="category" id="category" defaultValue={editing?.category || 'sightseeing'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  {['sightseeing', 'temple', 'beach', 'restaurant', 'tour', 'market', 'nightlife', 'nature', 'culture', 'shopping'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="estimatedCost">{t('form.cost')}</Label>
                <Input type="number" id="estimatedCost" name="estimatedCost" defaultValue={editing?.estimatedCost || 0} />
              </div>
              <div>
                <Label htmlFor="duration">{t('form.duration')}</Label>
                <Input id="duration" name="duration" defaultValue={editing?.duration} placeholder={t('form.durationPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="priority">{t('form.priority')}</Label>
                <select name="priority" id="priority" defaultValue={editing?.priority || 'nice-to-have'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  <option value="nice-to-have">{t('itin.niceTohave')}</option>
                  <option value="must-do">{t('itin.mustDoLabel')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lat">{t('form.latitude')}</Label>
                <Input type="number" step="any" id="lat" name="lat" defaultValue={editing?.lat} />
              </div>
              <div>
                <Label htmlFor="lng">{t('form.longitude')}</Label>
                <Input type="number" step="any" id="lng" name="lng" defaultValue={editing?.lng} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea id="notes" name="notes" rows={2} defaultValue={editing?.notes} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.saving') : editing ? t('action.update') : t('act.addActivity')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
