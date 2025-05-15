import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LineItem } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function calculateInvoiceTotals(lineItems: LineItem[]) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  
  return {
    subtotal,
    vat,
    total
  };
}

export function formatDateForInput(dateString: string): string {
  // Convert DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  // If it's already in YYYY-MM-DD format, return as is
  return dateString;
}
