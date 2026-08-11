import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoOrDateStr: string): string {
  if (!isoOrDateStr) return '';
  const date = new Date(isoOrDateStr);
  if (isNaN(date.getTime())) return isoOrDateStr;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateOnly(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatQuantity(qty: number, unit: string): string {
  if (unit === 'kg' || unit === 'g' || unit === 'L' || unit === 'ml') {
    // Round to 2 decimal places if needed
    const rounded = Math.round(qty * 100) / 100;
    return `${rounded} ${unit}`;
  }
  return `${Math.round(qty)} ${unit}`;
}
