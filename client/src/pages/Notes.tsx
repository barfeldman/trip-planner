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
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Plus, StickyNote, Pin, Trash2, Edit } from 'lucide-react';

const categoryEmoji: Record<string, string> = {
  general: '📝',
  restaurant: '🍜',
  phrase: '🗣️',
  tip: '💡',
  emergency: '🚨',
};

const categoryColors: Record<string, string> = {
  general: 'border-l-gray-400',
  restaurant: 'border-l-saffron-400',
  phrase: 'border-l-ocean-400',
  tip: 'border-l-temple-400',
  emergency: 'border-l-red-400',
};

export function Notes({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', tripId],
    queryFn: () => api.getNotes(tripId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? api.updateNote(editing.id, data) : api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', tripId] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', tripId] }),
  });

  const togglePin = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      api.updateNote(id, { isPinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', tripId] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('notes.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]"><span className="num-ltr">{notes.length}</span> {t('notes.noteCount')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          {t('notes.addNote')}
        </Button>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {notes.map((note: any) => {
          const isExpanded = expandedNote === note.id;
          return (
            <Card
              key={note.id}
              className={`break-inside-avoid border-l-4 ${categoryColors[note.category] || 'border-l-gray-400'} group hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{categoryEmoji[note.category] || '📝'}</span>
                    <h4 className="font-display font-semibold text-sm">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => togglePin.mutate({ id: note.id, isPinned: !note.isPinned })}
                      className={note.isPinned ? 'text-saffron-500' : 'opacity-0 group-hover:opacity-100'}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => { setEditing(note); setShowForm(true); }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => deleteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div
                  className={`text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-wrap ${!isExpanded ? 'line-clamp-6' : ''}`}
                >
                  {note.content}
                </div>

                {note.content.length > 200 && (
                  <button
                    onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                    className="text-xs text-saffron-600 hover:underline mt-2 cursor-pointer"
                  >
                    {isExpanded ? t('notes.showLess') : t('notes.showMore')}
                  </button>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[hsl(var(--border))]">
                  <Badge variant="outline" className="text-[10px] capitalize">{note.category}</Badge>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(note.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <StickyNote className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('notes.noNotes')}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('notes.noNotesHint')}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('notes.editNote') : t('notes.newNote')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                tripId,
                title: fd.get('title'),
                content: fd.get('content'),
                category: fd.get('category'),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">{t('form.title')}</Label>
              <Input id="title" name="title" required defaultValue={editing?.title} />
            </div>
            <div>
              <Label htmlFor="category">{t('form.category')}</Label>
              <select name="category" id="category" defaultValue={editing?.category || 'general'} className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                <option value="general">📝 {t('notes.general')}</option>
                <option value="restaurant">🍜 {t('cat.restaurant')}</option>
                <option value="phrase">🗣️ {t('notes.phrase')}</option>
                <option value="tip">💡 {t('notes.tip')}</option>
                <option value="emergency">🚨 {t('cat.emergency')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">{t('form.content')}</Label>
              <Textarea id="content" name="content" required rows={8} defaultValue={editing?.content} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('action.saving') : editing ? t('notes.updateNote') : t('notes.createNote')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
