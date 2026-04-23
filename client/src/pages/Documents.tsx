import { useState, useRef } from 'react';
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
import { Plus, FileText, Upload, Trash2, Download, File, Image } from 'lucide-react';

const typeEmoji: Record<string, string> = {
  passport: '🛂',
  visa: '📋',
  insurance: '🛡️',
  vaccination: '💉',
  booking: '🎫',
  other: '📄',
};

export function Documents({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', tripId],
    queryFn: () => api.getDocuments(tripId),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', tripId] }),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('docs.title')}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('docs.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          {t('docs.upload')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc: any) => (
          <Card key={doc.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-[hsl(var(--muted))]">
                  {doc.mimeType?.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-saffron-500" />
                  ) : (
                    <File className="h-5 w-5 text-ocean-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      {typeEmoji[doc.type]} {doc.type}
                    </Badge>
                    {doc.fileSize && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    )}
                  </div>
                  {doc.fileName && (
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 truncate">{doc.fileName}</p>
                  )}
                  {doc.notes && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 italic line-clamp-2">{doc.notes}</p>
                  )}
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-2">
                    {t('docs.added')} {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]">
                {doc.filePath && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/uploads/${doc.filePath}`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      {t('action.view')}
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(doc.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-[hsl(var(--muted-foreground))]">{t('docs.noDocuments')}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('docs.noDocumentsHint')}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('docs.upload')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              uploadMutation.mutate(fd);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="tripId" value={tripId} />
            <div>
              <Label htmlFor="name">{t('docs.docName')}</Label>
              <Input id="name" name="name" required placeholder={t('docs.namePlaceholder')} />
            </div>
            <div>
              <Label htmlFor="type">{t('form.type')}</Label>
              <select name="type" id="type" className="flex h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm">
                <option value="passport">🛂 {t('docs.passport')}</option>
                <option value="visa">📋 {t('docs.visa')}</option>
                <option value="insurance">🛡️ {t('docs.insurance')}</option>
                <option value="vaccination">💉 {t('docs.vaccination')}</option>
                <option value="booking">🎫 {t('docs.bookingConf')}</option>
                <option value="other">📄 {t('docs.other')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="file">{t('docs.fileLabel')}</Label>
              <Input
                type="file"
                id="file"
                name="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                className="cursor-pointer"
              />
            </div>
            <div>
              <Label htmlFor="notes">{t('form.notes')}</Label>
              <Textarea id="notes" name="notes" rows={2} placeholder={t('form.notesPlaceholder')} />
            </div>
            <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? t('docs.uploading') : t('docs.upload')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
