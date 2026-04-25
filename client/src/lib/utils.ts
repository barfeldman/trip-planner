import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'THB'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function daysUntil(date: string | Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function categoryIcon(category: string): string {
  const icons: Record<string, string> = {
    temple: '🛕',
    beach: '🏖️',
    restaurant: '🍜',
    tour: '🚤',
    market: '🏪',
    shopping: '🛍️',
    nightlife: '🌙',
    nature: '🌿',
    culture: '🎭',
    sightseeing: '👀',
  };
  return icons[category] || '📍';
}

export function budgetCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    flights: 'bg-blue-500',
    accommodation: 'bg-ocean-600',
    food: 'bg-saffron-500',
    transport: 'bg-purple-500',
    activities: 'bg-temple-500',
    shopping: 'bg-lotus-500',
    emergency: 'bg-red-500',
  };
  return colors[category] || 'bg-gray-500';
}

export function convertToHome(amount: number, currency: string, trip: any): number {
  if (!amount) return 0;
  const home = trip?.homeCurrency || 'ILS';
  if (currency === home) return amount;
  if (currency === 'THB') return amount / (trip?.exchangeRate || 8.5);
  if (currency === 'USD') return amount * (trip?.usdRate || 3.7);
  return amount;
}
