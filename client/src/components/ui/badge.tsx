import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' }) {
  const variants = {
    default: 'bg-saffron-100 text-saffron-800 border-saffron-200',
    secondary: 'bg-ocean-100 text-ocean-800 border-ocean-200',
    outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
