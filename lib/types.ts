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
  staff: string;
  status: 'completed' | 'voided';
  voidReason?: string;
  voidDate?: string;
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
