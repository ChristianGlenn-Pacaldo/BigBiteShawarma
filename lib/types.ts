export type ProductVariant = 'solo' | 'bogo';

export interface RecipeItem {
  ingredientId: string;
  ingredientName?: string;
  quantitySolo: number; // e.g. 100g for solo
  quantityBogo: number; // e.g. 200g for B1T1
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  soloPrice: number;       // e.g. 75
  bogoPrice: number;       // e.g. 130 (Buy 1 Take 1)
  costPrice: number;       // e.g. 35
  lowStockThreshold: number;
  status: 'active' | 'disabled';
  imageUrl?: string;
  recipe: RecipeItem[];
}

export type IngredientCategory = 'Meat' | 'Produce' | 'Dry Goods' | 'Sauces' | 'Packaging' | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  currentQuantity: number;
  unit: 'kg' | 'g' | 'pcs' | 'ml' | 'L' | 'bags';
  costPerUnit: number;     // Cost per unit in PHP
  minimumStock: number;    // Low stock threshold
  supplier: string;
  lastRestocked: string;   // ISO date string
  expirationDate?: string;
}

export type MovementType = 
  | 'RESTOCK' 
  | 'SALE_DEDUCTION' 
  | 'MANUAL_ADJUSTMENT' 
  | 'WASTE' 
  | 'EXPIRED' 
  | 'DAMAGED' 
  | 'VOID_REVERSAL';

export interface InventoryMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: MovementType;
  quantityChange: number; // positive for restock, negative for deduction
  unit: string;
  cost: number;
  reason: string;
  date: string;           // ISO date string
  staff: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  cost: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  cost: number;
}

export interface Sale {
  id: string;             // e.g. #BBS-0001
  timestamp: string;      // ISO string
  date: string;           // YYYY-MM-DD
  items: SaleItem[];
  totalAmount: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'gcash' | 'card';
  gcashRef?: string;      // Optional GCash Reference / Txn ID
  shiftId?: string;       // Linked Shift ID
  staff: string;
  status: 'completed' | 'voided';
  voidReason?: string;
  voidDate?: string;
}

export interface Shift {
  id: string;             // e.g. "shift-1723456789"
  staff: string;          // Cashier / Staff Name
  startTime: string;      // ISO timestamp
  endTime?: string;       // ISO timestamp when closed
  startingCash: number;   // Opening Cash Float / Petty Cash (e.g. ₱500)
  endingCashActual?: number; // Actual physical cash counted in drawer
  expectedCash?: number;  // startingCash + cashSales - cashExpenses
  cashSales: number;      // Total Cash sales during shift
  gcashSales: number;     // Total GCash sales during shift
  totalSales: number;     // Total gross sales (Cash + GCash)
  totalExpenses: number;  // Expenses logged during shift
  netSales: number;       // Gross Sales - COGS - Expenses
  itemsSold: number;      // Total units sold
  discrepancy?: number;   // endingCashActual - expectedCash (Over/Short)
  notes?: string;         // Closing shift notes
  status: 'active' | 'closed';
}

export type ExpenseCategory = 
  | 'Ingredients' 
  | 'Transportation' 
  | 'Electricity' 
  | 'Water' 
  | 'Packaging' 
  | 'Rent' 
  | 'Salaries' 
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;           // YYYY-MM-DD
  notes: string;
  shiftId?: string;
}

export interface StoreSettings {
  id?: string;
  storeName: string;
  storeAddress: string;
  contactNumber: string;
  currency: string;       // ₱
  receiptFooter: string;
  ownerPin: string;       // Default '1234'
  staffPin: string;       // Default '0000'
  theme: 'dark' | 'light';
  lowStockGlobalThreshold: number;
}

export type UserRole = 'OWNER' | 'STAFF';
