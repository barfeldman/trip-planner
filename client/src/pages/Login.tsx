import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = login(username.trim(), password);
    if (!ok) {
      setError(t('login.error'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[hsl(var(--background))]">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -start-20 w-96 h-96 bg-saffron-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -end-20 w-96 h-96 bg-ocean-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-saffron-300/10 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-sm px-4 relative z-10">
        <div className="glass-card rounded-2xl p-8 shadow-2xl animate-fade-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🌴</div>
            <h1 className="text-2xl font-bold font-display text-[hsl(var(--foreground))]">
              {t('app.tripPlanner')}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('login.username')}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  className="ps-9"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="ps-9"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('action.saving') : t('login.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
