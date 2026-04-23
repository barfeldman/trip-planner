import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, budgetCategoryColor } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, Wallet, TrendingUp, PieChart, Edit, Trash2 } from 'lucide-react';

const CATEGORIES = ['flights', 'accommodation', 'food', 'transport', 'activities', 'shopping', 'emergency'];
const categoryEmoji: Record<string, string> = {
  flights: '✈️',
  accommodation: '🏨',
  food: '🍜',
  transport: '🚕',
  activities: '🎯',
  shopping: '🛍️',
  emergency: '🚨',
};

export function Budget({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: items = [] } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => api.getBudget(tripId),
  });

  const { data: summary } = useQuery({
    queryKey: ['budgetSummary', tripId],
    queryFn: () => api.getBudgetSummary(tripId),
  });

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId),
  });

  const exchangeRate = trip?.exchangeRate || 33.5;
  const homeCurrency = trip?.homeCurrency || 'USD';

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateBudgetItem(editing.id, data) : api.createBudgetItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary', tripId] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBudgetItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary', tripId] });
    },
  });

  const totalPlanned = summary?.totalPlanned || 0;
  const totalActual = summary?.totalActual || 0;
  const remaining = totalPlanned - totalActual;
  const budgetPct = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('budget.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('budget.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          {t('budget.addExpense')}
        </Button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-saffron-50 to-saffron-100 dark:from-saffron-500/10 dark:to-saffron-500/5 border-saffron-200 dark:border-saffron-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-saffron-600" />
              <span className="text-xs font-medium text-saffron-700">{t('budget.totalPlanned')}</span>
            </div>
            <p className="text-2xl font-display font-bold text-saffron-800">{formatCurrency(totalPlanned)}</p>
            <p className="text-xs text-saffron-600 mt-1">≈ {formatCurrency(totalPlanned / exchangeRate, homeCurrency)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-ocean-50 to-ocean-100 dark:from-ocean-500/10 dark:to-ocean-500/5 border-ocean-200 dark:border-ocean-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-ocean-600" />
              <span className="text-xs font-medium text-ocean-700">{t('budget.spentSoFar')}</span>
            </div>
            <p className="text-2xl font-display font-bold text-ocean-800">{formatCurrency(totalActual)}</p>
            <Progress value={budgetPct} className="mt-2" indicatorClassName={budgetPct > 90 ? 'bg-red-500' : 'bg-ocean-500'} />
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${remaining >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} dark:from-transparent dark:to-transparent`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">{t('budget.remaining')}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(Math.abs(remaining))}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {remaining >= 0 ? t('budget.underBudget') : t('budget.overBudget')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('budget.byCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const catData = summary?.categories?.[cat] || { planned: 0, actual: 0 };
              const pct = catData.planned > 0 ? (catData.actual / catData.planned) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span>{categoryEmoji[cat]}</span>
                      <span className="capitalize">{cat}</span>
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatCurrency(catData.actual)} / {formatCurrency(catData.planned)}
                    </span>
                  </div>
                  <Progress value={Math.min(pct, 100)} indicatorClassName={pct > 100 ? 'bg-red-500' : budgetCategoryColor(cat)} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <Card>
        <CardHeader>
          <CardTitle>{t('budget.allExpenses')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--muted))]/50 group transition-colors">
                <span className="text-lg">{categoryEmoji[item.category] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.description}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium num-ltr">{formatCurrency(item.actual || 0)} <span className="text-[hsl(var(--muted-foreground))]">{t('budget.actual')}</span></p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] num-ltr">{formatCurrency(item.planned)} {t('dash.planned')}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(item); setShowForm(true); }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('budget.editExpense') : t('budget.addExpense')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                tripId,
                category: fd.get('category'),
                description: fd.get('description'),
                planned: parseFloat(fd.get('planned') as string) || 0,
                actual: parseFloat(fd.get('actual') as string) || 0,
                currency: fd.get('currency') || 'THB',
                notes: fd.get('notes') || null,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="description">{t('form.description')}</Label>
              <Input id="description" name="description" required defaultValue={editing?.description} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category">{t('form.category')}</Label>
                <select name="category" id="category" defaultValue={editing?.category || 'food'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryEmoji[c]} {c}</option>
                  ))}
                </select>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="planned">{t('form.plannedAmount')}</Label>
                <Input type="number" id="planned" name="planned" defaultValue={editing?.planned || 0} />
              </div>
              <div>
                <Label htmlFor="actual">{t('form.actualAmount')}</Label>
                <Input type="number" id="actual" name="actual" defaultValue={editing?.actual || 0} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Input id="notes" name="notes" defaultValue={editing?.notes} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.saving') : editing ? t('action.update') : t('budget.addExpense')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
