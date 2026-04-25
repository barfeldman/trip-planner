import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { convertToHome, formatCurrency } from '@/lib/utils';

interface CurrencyFieldProps {
  label: string;
  name: string;
  currencyName: string;
  defaultValue?: number;
  defaultCurrency?: string;
  trip: any;
  className?: string;
}

export function CurrencyField({ label, name, currencyName, defaultValue = 0, defaultCurrency = 'ILS', trip, className }: CurrencyFieldProps) {
  const [amount, setAmount] = useState(String(defaultValue || ''));
  const [currency, setCurrency] = useState(defaultCurrency);

  const home = trip?.homeCurrency || 'ILS';
  const numAmount = parseFloat(amount) || 0;
  const inHome = convertToHome(numAmount, currency, trip);
  const showPreview = currency !== home && numAmount > 0;

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="flex gap-1.5 mt-1">
        <Input
          type="number"
          name={name}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 min-w-0"
          min="0"
          step="0.01"
        />
        <select
          name={currencyName}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="h-10 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 text-sm cursor-pointer"
        >
          <option value="ILS">₪ ILS</option>
          <option value="USD">$ USD</option>
          <option value="THB">฿ THB</option>
        </select>
      </div>
      {showPreview && (
        <p className="text-xs text-saffron-600 dark:text-saffron-400 mt-0.5 num-ltr">
          ≈ {formatCurrency(inHome, home)}
        </p>
      )}
    </div>
  );
}
