import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';

const categoryEmoji: Record<string, string> = {
  documents: '📄',
  clothes: '👕',
  toiletries: '🧴',
  electronics: '📱',
  beach: '🏖️',
  medicine: '💊',
  misc: '📦',
};

const CATEGORIES = ['documents', 'clothes', 'toiletries', 'electronics', 'beach', 'medicine', 'misc'];

export function PackingList({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => api.getPacking(tripId),
  });

  const togglePacked = useMutation({
    mutationFn: ({ id, isPacked }: { id: string; isPacked: boolean }) =>
      api.updatePackingItem(id, { isPacked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packing', tripId] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createPackingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePackingItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packing', tripId] }),
  });

  const totalItems = items.length;
  const packedItems = items.filter((i: any) => i.isPacked).length;
  const progressPct = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i: any) => i.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('pack.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]"><span className="num-ltr">{packedItems}</span> {t('dash.of')} <span className="num-ltr">{totalItems}</span> {t('pack.itemsPacked')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          {t('pack.addItem')}
        </Button>
      </div>

      {/* Progress */}
      <Card className="bg-gradient-to-r from-saffron-50 to-ocean-50 dark:from-saffron-500/5 dark:to-ocean-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-ocean-600" />
              <span className="font-medium">{t('pack.progress')}</span>
            </div>
            <span className="text-sm font-display font-bold text-saffron-600">{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} indicatorClassName="bg-gradient-to-r from-saffron-400 to-ocean-500" />
          {progressPct === 100 && (
            <p className="text-sm text-ocean-600 font-medium mt-2">{t('pack.allPacked')}</p>
          )}
        </CardContent>
      </Card>

      {/* Category sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grouped.map(({ category, items: catItems }) => {
          const catPacked = catItems.filter((i: any) => i.isPacked).length;
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <span>{categoryEmoji[category]}</span>
                    <span className="capitalize">{category}</span>
                  </span>
                  <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
                    {catPacked}/{catItems.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {catItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(var(--muted))]/50 group transition-colors"
                    >
                      <Checkbox
                        checked={item.isPacked}
                        onCheckedChange={(checked) =>
                          togglePacked.mutate({ id: item.id, isPacked: !!checked })
                        }
                      />
                      <span className={cn(
                        'flex-1 text-sm',
                        item.isPacked && 'line-through text-[hsl(var(--muted-foreground))]'
                      )}>
                        {item.name}
                        {item.quantity > 1 && <span className="text-xs text-[hsl(var(--muted-foreground))]"> ×{item.quantity}</span>}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pack.addPackingItem')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                tripId,
                name: fd.get('name'),
                category: fd.get('category'),
                quantity: parseInt(fd.get('quantity') as string) || 1,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">{t('pack.itemName')}</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">{t('form.category')}</Label>
                <select name="category" id="category" className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryEmoji[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="quantity">{t('form.quantity')}</Label>
                <Input type="number" id="quantity" name="quantity" min="1" defaultValue="1" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.adding') : t('pack.addItem')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
