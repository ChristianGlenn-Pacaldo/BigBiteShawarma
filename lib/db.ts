import Dexie, { type Table } from 'dexie';
import { Product, Ingredient, InventoryMovement, Sale, Expense, StoreSettings, MovementType, Shift } from './types';

export class BigBiteDatabase extends Dexie {
  products!: Table<Product, string>;
  ingredients!: Table<Ingredient, string>;
  inventoryMovements!: Table<InventoryMovement, string>;
  sales!: Table<Sale, string>;
  expenses!: Table<Expense, string>;
  settings!: Table<StoreSettings, string>;
  shifts!: Table<Shift, string>;

  constructor() {
    super('BigBiteShawarmaDB');

    this.version(1).stores({
      products: 'id, name, category, status',
      ingredients: 'id, name, category, currentQuantity, minimumStock',
      inventoryMovements: 'id, ingredientId, type, date',
      sales: 'id, timestamp, date, status, staff',
      expenses: 'id, category, date',
      settings: '++id, storeName'
    });

    this.version(2).stores({
      products: 'id, name, category, status',
      ingredients: 'id, name, category, currentQuantity, minimumStock',
      inventoryMovements: 'id, ingredientId, type, date',
      sales: 'id, timestamp, date, status, staff, shiftId',
      expenses: 'id, category, date, shiftId',
      settings: '++id, storeName',
      shifts: 'id, staff, startTime, status'
    });
  }
}

export const db = new BigBiteDatabase();

// Default Initial Seed Data
export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Pork Shawarma Meat',
    category: 'Meat',
    currentQuantity: 15,
    unit: 'kg',
    costPerUnit: 280,
    minimumStock: 3,
    supplier: 'Meat Master Wholesaler',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-2',
    name: 'Pita / Tortilla Wrap',
    category: 'Dry Goods',
    currentQuantity: 100,
    unit: 'pcs',
    costPerUnit: 6,
    minimumStock: 20,
    supplier: 'Baker Supplier',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-3',
    name: 'Jasmine Rice',
    category: 'Dry Goods',
    currentQuantity: 25,
    unit: 'kg',
    costPerUnit: 52,
    minimumStock: 5,
    supplier: 'Grain Mart',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-4',
    name: 'Shredded Lettuce',
    category: 'Produce',
    currentQuantity: 5,
    unit: 'kg',
    costPerUnit: 90,
    minimumStock: 1,
    supplier: 'Fresh Produce Hub',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-5',
    name: 'Tomatoes',
    category: 'Produce',
    currentQuantity: 4,
    unit: 'kg',
    costPerUnit: 70,
    minimumStock: 1,
    supplier: 'Fresh Produce Hub',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-6',
    name: 'Cucumbers',
    category: 'Produce',
    currentQuantity: 3,
    unit: 'kg',
    costPerUnit: 60,
    minimumStock: 1,
    supplier: 'Fresh Produce Hub',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-7',
    name: 'Onions',
    category: 'Produce',
    currentQuantity: 3,
    unit: 'kg',
    costPerUnit: 80,
    minimumStock: 1,
    supplier: 'Fresh Produce Hub',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-8',
    name: 'Special Garlic Sauce',
    category: 'Sauces',
    currentQuantity: 10,
    unit: 'L',
    costPerUnit: 120,
    minimumStock: 2,
    supplier: 'Sauce Craft',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-9',
    name: 'Hot Sauce',
    category: 'Sauces',
    currentQuantity: 5,
    unit: 'L',
    costPerUnit: 100,
    minimumStock: 1,
    supplier: 'Sauce Craft',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-10',
    name: 'Cheese Sauce',
    category: 'Sauces',
    currentQuantity: 5,
    unit: 'L',
    costPerUnit: 150,
    minimumStock: 1,
    supplier: 'Sauce Craft',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-11',
    name: 'Nacho Chips',
    category: 'Dry Goods',
    currentQuantity: 10,
    unit: 'bags',
    costPerUnit: 110,
    minimumStock: 2,
    supplier: 'Snack Supply Co.',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-12',
    name: 'French Fries',
    category: 'Dry Goods',
    currentQuantity: 8,
    unit: 'kg',
    costPerUnit: 130,
    minimumStock: 2,
    supplier: 'Frozen Foods Ltd',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-13',
    name: 'Food Container Box',
    category: 'Packaging',
    currentQuantity: 150,
    unit: 'pcs',
    costPerUnit: 3.5,
    minimumStock: 30,
    supplier: 'PackRight',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-14',
    name: 'Paper Wrap',
    category: 'Packaging',
    currentQuantity: 200,
    unit: 'pcs',
    costPerUnit: 1.2,
    minimumStock: 40,
    supplier: 'PackRight',
    lastRestocked: new Date().toISOString()
  },
  {
    id: 'ing-15',
    name: 'Carrier Bags',
    category: 'Packaging',
    currentQuantity: 100,
    unit: 'pcs',
    costPerUnit: 0.8,
    minimumStock: 20,
    supplier: 'PackRight',
    lastRestocked: new Date().toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Shawarma Wrap',
    category: 'Shawarma',
    soloPrice: 75,
    bogoPrice: 130,
    costPrice: 35,
    lowStockThreshold: 10,
    status: 'active',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Pork Shawarma Meat', quantitySolo: 0.1, quantityBogo: 0.2, unit: 'kg' },
      { ingredientId: 'ing-2', ingredientName: 'Pita / Tortilla Wrap', quantitySolo: 1, quantityBogo: 2, unit: 'pcs' },
      { ingredientId: 'ing-4', ingredientName: 'Shredded Lettuce', quantitySolo: 0.02, quantityBogo: 0.04, unit: 'kg' },
      { ingredientId: 'ing-5', ingredientName: 'Tomatoes', quantitySolo: 0.02, quantityBogo: 0.04, unit: 'kg' },
      { ingredientId: 'ing-6', ingredientName: 'Cucumbers', quantitySolo: 0.015, quantityBogo: 0.03, unit: 'kg' },
      { ingredientId: 'ing-7', ingredientName: 'Onions', quantitySolo: 0.01, quantityBogo: 0.02, unit: 'kg' },
      { ingredientId: 'ing-8', ingredientName: 'Special Garlic Sauce', quantitySolo: 0.03, quantityBogo: 0.06, unit: 'L' },
      { ingredientId: 'ing-14', ingredientName: 'Paper Wrap', quantitySolo: 1, quantityBogo: 2, unit: 'pcs' },
      { ingredientId: 'ing-15', ingredientName: 'Carrier Bags', quantitySolo: 1, quantityBogo: 1, unit: 'pcs' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Shawarma Rice',
    category: 'Shawarma',
    soloPrice: 79,
    bogoPrice: 150,
    costPrice: 38,
    lowStockThreshold: 10,
    status: 'active',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Pork Shawarma Meat', quantitySolo: 0.1, quantityBogo: 0.2, unit: 'kg' },
      { ingredientId: 'ing-3', ingredientName: 'Jasmine Rice', quantitySolo: 0.15, quantityBogo: 0.3, unit: 'kg' },
      { ingredientId: 'ing-4', ingredientName: 'Shredded Lettuce', quantitySolo: 0.02, quantityBogo: 0.04, unit: 'kg' },
      { ingredientId: 'ing-5', ingredientName: 'Tomatoes', quantitySolo: 0.02, quantityBogo: 0.04, unit: 'kg' },
      { ingredientId: 'ing-6', ingredientName: 'Cucumbers', quantitySolo: 0.015, quantityBogo: 0.03, unit: 'kg' },
      { ingredientId: 'ing-8', ingredientName: 'Special Garlic Sauce', quantitySolo: 0.03, quantityBogo: 0.06, unit: 'L' },
      { ingredientId: 'ing-13', ingredientName: 'Food Container Box', quantitySolo: 1, quantityBogo: 2, unit: 'pcs' },
      { ingredientId: 'ing-15', ingredientName: 'Carrier Bags', quantitySolo: 1, quantityBogo: 1, unit: 'pcs' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Nachos & Fries',
    category: 'Sides',
    soloPrice: 79,
    bogoPrice: 150,
    costPrice: 32,
    lowStockThreshold: 10,
    status: 'active',
    recipe: [
      { ingredientId: 'ing-11', ingredientName: 'Nacho Chips', quantitySolo: 0.25, quantityBogo: 0.5, unit: 'bags' },
      { ingredientId: 'ing-12', ingredientName: 'French Fries', quantitySolo: 0.1, quantityBogo: 0.2, unit: 'kg' },
      { ingredientId: 'ing-10', ingredientName: 'Cheese Sauce', quantitySolo: 0.04, quantityBogo: 0.08, unit: 'L' },
      { ingredientId: 'ing-13', ingredientName: 'Food Container Box', quantitySolo: 1, quantityBogo: 2, unit: 'pcs' },
      { ingredientId: 'ing-15', ingredientName: 'Carrier Bags', quantitySolo: 1, quantityBogo: 1, unit: 'pcs' }
    ]
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'BIG BITE SHAWARMA',
  storeAddress: 'Main St. Branch, Food Park',
  contactNumber: '0917-123-4567',
  currency: '₱',
  receiptFooter: 'Thank you for dining with us! Love at First Bite',
  ownerPin: '1234',
  staffPin: '0000',
  theme: 'dark',
  lowStockGlobalThreshold: 5
};

// Seed database on first launch
export async function initializeDatabase() {
  const productCount = await db.products.count();
  if (productCount === 0) {
    console.log('Seeding initial database...');
    await db.products.bulkAdd(INITIAL_PRODUCTS);
    await db.ingredients.bulkAdd(INITIAL_INGREDIENTS);
    await db.settings.add(INITIAL_SETTINGS);

    // Initial movement records
    const initialMovements: InventoryMovement[] = INITIAL_INGREDIENTS.map(ing => ({
      id: `mov-${Date.now()}-${ing.id}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      type: 'RESTOCK',
      quantityChange: ing.currentQuantity,
      unit: ing.unit,
      cost: ing.currentQuantity * ing.costPerUnit,
      reason: 'Initial Inventory Setup',
      date: new Date().toISOString(),
      staff: 'SYSTEM'
    }));
    await db.inventoryMovements.bulkAdd(initialMovements);
  }
}

// Get Currently Active Shift
export async function getActiveShift(): Promise<Shift | undefined> {
  return await db.shifts.where('status').equals('active').first();
}

// Start New Shift
export async function startNewShift(staff: string, startingCash: number): Promise<Shift> {
  const existingActive = await getActiveShift();
  if (existingActive) {
    throw new Error(`Shift #${existingActive.id} is already active.`);
  }

  const newShift: Shift = {
    id: `shift-${Date.now().toString().slice(-6)}`,
    staff: staff || 'Staff 1',
    startTime: new Date().toISOString(),
    startingCash: startingCash || 0,
    cashSales: 0,
    gcashSales: 0,
    totalSales: 0,
    totalExpenses: 0,
    netSales: 0,
    itemsSold: 0,
    status: 'active'
  };

  await db.shifts.add(newShift);
  return newShift;
}

// End Active Shift (Z-Report Daily Closure)
export async function endActiveShift(shiftId: string, endingCashActual: number, notes?: string): Promise<Shift> {
  return db.transaction('rw', [db.shifts, db.sales, db.expenses], async () => {
    const shift = await db.shifts.get(shiftId);
    if (!shift) throw new Error(`Shift ${shiftId} not found`);
    if (shift.status === 'closed') throw new Error(`Shift ${shiftId} is already closed`);

    const endTime = new Date().toISOString();

    // Query sales during shift
    const shiftSales = await db.sales
      .where('timestamp')
      .aboveOrEqual(shift.startTime)
      .and(s => s.status === 'completed')
      .toArray();

    // Query expenses during shift
    const shiftExpenses = await db.expenses
      .where('date')
      .aboveOrEqual(shift.startTime.split('T')[0])
      .toArray();

    const cashSales = shiftSales
      .filter(s => s.paymentMethod === 'cash' || !s.paymentMethod)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const gcashSales = shiftSales
      .filter(s => s.paymentMethod === 'gcash')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const totalSales = cashSales + gcashSales;

    const itemsSold = shiftSales.reduce((sum, s) => {
      return sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0);
    }, 0);

    const cogsTotal = shiftSales.reduce((sum, s) => {
      return sum + s.items.reduce((iSum, i) => iSum + (i.cost * i.quantity), 0);
    }, 0);

    const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netSales = totalSales - cogsTotal - totalExpenses;

    // Expected Cash in Drawer = Starting Float + Cash Sales - Cash Expenses
    const expectedCash = shift.startingCash + cashSales - totalExpenses;
    const discrepancy = endingCashActual - expectedCash;

    const updatedShift: Shift = {
      ...shift,
      endTime,
      endingCashActual,
      expectedCash,
      cashSales,
      gcashSales,
      totalSales,
      totalExpenses,
      netSales,
      itemsSold,
      discrepancy,
      notes: notes || '',
      status: 'closed'
    };

    await db.shifts.put(updatedShift);
    return updatedShift;
  });
}

// Atomic Transaction: Complete Sale & Deduct Inventory
export async function processSaleTransaction(saleData: Omit<Sale, 'id' | 'timestamp' | 'date'> & { id?: string }) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  const saleId = saleData.id || `#BBS-${Date.now().toString().slice(-6)}`;

  // Attach active shift ID if available
  const activeShift = await getActiveShift();
  const shiftId = activeShift?.id;

  const finalSale: Sale = {
    ...saleData,
    id: saleId,
    timestamp,
    date,
    shiftId
  };

  return db.transaction('rw', [db.sales, db.ingredients, db.inventoryMovements, db.products, db.shifts], async () => {
    // 1. Prevent duplicate submission if ID exists
    const existing = await db.sales.get(saleId);
    if (existing) {
      throw new Error(`Transaction ${saleId} already processed.`);
    }

    // 2. Save Sale Record
    await db.sales.add(finalSale);

    // 3. Process Automatic Inventory Deduction per item recipe
    for (const item of finalSale.items) {
      const product = await db.products.get(item.productId);
      if (product && product.recipe && product.recipe.length > 0) {
        for (const recipeItem of product.recipe) {
          const ing = await db.ingredients.get(recipeItem.ingredientId);
          if (ing) {
            const deductionPerUnit = item.variant === 'bogo' ? recipeItem.quantityBogo : recipeItem.quantitySolo;
            const totalDeduction = deductionPerUnit * item.quantity;
            const newQuantity = Math.max(0, ing.currentQuantity - totalDeduction);

            // Update ingredient current stock
            await db.ingredients.update(ing.id, { currentQuantity: newQuantity });

            // Record Movement
            const movement: InventoryMovement = {
              id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              ingredientId: ing.id,
              ingredientName: ing.name,
              type: 'SALE_DEDUCTION',
              quantityChange: -totalDeduction,
              unit: ing.unit,
              cost: totalDeduction * ing.costPerUnit,
              reason: `Sale ${saleId} - ${product.name} (${item.variant.toUpperCase()}) x${item.quantity}`,
              date: timestamp,
              staff: finalSale.staff
            };
            await db.inventoryMovements.add(movement);
          }
        }
      }
    }

    return finalSale;
  });
}

// Atomic Transaction: Void Sale & Revert Inventory
export async function voidSaleTransaction(saleId: string, voidReason: string, staff: string) {
  const timestamp = new Date().toISOString();

  return db.transaction('rw', [db.sales, db.ingredients, db.inventoryMovements, db.products], async () => {
    const sale = await db.sales.get(saleId);
    if (!sale) throw new Error(`Sale ${saleId} not found`);
    if (sale.status === 'voided') throw new Error(`Sale ${saleId} is already voided`);

    // 1. Mark Sale as Voided
    await db.sales.update(saleId, {
      status: 'voided',
      voidReason,
      voidDate: timestamp
    });

    // 2. Reverse Inventory Deductions
    for (const item of sale.items) {
      const product = await db.products.get(item.productId);
      if (product && product.recipe) {
        for (const recipeItem of product.recipe) {
          const ing = await db.ingredients.get(recipeItem.ingredientId);
          if (ing) {
            const additionPerUnit = item.variant === 'bogo' ? recipeItem.quantityBogo : recipeItem.quantitySolo;
            const totalAddition = additionPerUnit * item.quantity;
            const newQuantity = ing.currentQuantity + totalAddition;

            await db.ingredients.update(ing.id, { currentQuantity: newQuantity });

            const movement: InventoryMovement = {
              id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              ingredientId: ing.id,
              ingredientName: ing.name,
              type: 'VOID_REVERSAL',
              quantityChange: totalAddition,
              unit: ing.unit,
              cost: totalAddition * ing.costPerUnit,
              reason: `Void Reversal for Sale ${saleId}: ${voidReason}`,
              date: timestamp,
              staff
            };
            await db.inventoryMovements.add(movement);
          }
        }
      }
    }

    return true;
  });
}

// Atomic Transaction: Restock Ingredient
export async function restockIngredient(
  ingredientId: string,
  addQuantity: number,
  totalCost: number,
  supplier: string,
  staff: string
) {
  const timestamp = new Date().toISOString();

  return db.transaction('rw', [db.ingredients, db.inventoryMovements], async () => {
    const ing = await db.ingredients.get(ingredientId);
    if (!ing) throw new Error('Ingredient not found');

    const newQuantity = ing.currentQuantity + addQuantity;
    // Calculate weighted average cost per unit if applicable
    const unitCost = totalCost > 0 && addQuantity > 0 ? totalCost / addQuantity : ing.costPerUnit;

    await db.ingredients.update(ingredientId, {
      currentQuantity: newQuantity,
      costPerUnit: unitCost,
      supplier: supplier || ing.supplier,
      lastRestocked: timestamp
    });

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      type: 'RESTOCK',
      quantityChange: addQuantity,
      unit: ing.unit,
      cost: totalCost,
      reason: `Stock In from ${supplier || ing.supplier}`,
      date: timestamp,
      staff
    };
    await db.inventoryMovements.add(movement);

    return newQuantity;
  });
}

// Manual Stock Adjustment (Waste, Expired, Correction)
export async function adjustIngredientStock(
  ingredientId: string,
  quantityChange: number,
  type: MovementType,
  reason: string,
  staff: string
) {
  const timestamp = new Date().toISOString();

  return db.transaction('rw', [db.ingredients, db.inventoryMovements], async () => {
    const ing = await db.ingredients.get(ingredientId);
    if (!ing) throw new Error('Ingredient not found');

    const newQuantity = Math.max(0, ing.currentQuantity + quantityChange);
    await db.ingredients.update(ingredientId, { currentQuantity: newQuantity });

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      type,
      quantityChange,
      unit: ing.unit,
      cost: Math.abs(quantityChange) * ing.costPerUnit,
      reason,
      date: timestamp,
      staff
    };
    await db.inventoryMovements.add(movement);

    return newQuantity;
  });
}

// Export Database Backup as JSON
export async function exportDatabaseBackup() {
  const products = await db.products.toArray();
  const ingredients = await db.ingredients.toArray();
  const inventoryMovements = await db.inventoryMovements.toArray();
  const sales = await db.sales.toArray();
  const expenses = await db.expenses.toArray();
  const shifts = await db.shifts.toArray();
  const settingsArray = await db.settings.toArray();

  const backupData = {
    version: 2,
    exportDate: new Date().toISOString(),
    appName: 'BIG BITE SHAWARMA POS',
    data: {
      products,
      ingredients,
      inventoryMovements,
      sales,
      expenses,
      shifts,
      settings: settingsArray[0] || INITIAL_SETTINGS
    }
  };

  return JSON.stringify(backupData, null, 2);
}

// Import Database Backup from JSON
export async function importDatabaseBackup(jsonString: string) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !parsed.data) {
    throw new Error('Invalid backup file format');
  }

  const { products, ingredients, inventoryMovements, sales, expenses, shifts, settings } = parsed.data;

  return db.transaction('rw', [db.products, db.ingredients, db.inventoryMovements, db.sales, db.expenses, db.shifts, db.settings], async () => {
    await db.products.clear();
    await db.ingredients.clear();
    await db.inventoryMovements.clear();
    await db.sales.clear();
    await db.expenses.clear();
    await db.shifts.clear();
    await db.settings.clear();

    if (products && products.length) await db.products.bulkAdd(products);
    if (ingredients && ingredients.length) await db.ingredients.bulkAdd(ingredients);
    if (inventoryMovements && inventoryMovements.length) await db.inventoryMovements.bulkAdd(inventoryMovements);
    if (sales && sales.length) await db.sales.bulkAdd(sales);
    if (expenses && expenses.length) await db.expenses.bulkAdd(expenses);
    if (shifts && shifts.length) await db.shifts.bulkAdd(shifts);
    if (settings) await db.settings.add(settings);

    return true;
  });
}

// Reset DB to Initial Seed Data
export async function resetDatabaseToSeed() {
  return db.transaction('rw', [db.products, db.ingredients, db.inventoryMovements, db.sales, db.expenses, db.shifts, db.settings], async () => {
    await db.products.clear();
    await db.ingredients.clear();
    await db.inventoryMovements.clear();
    await db.sales.clear();
    await db.expenses.clear();
    await db.shifts.clear();
    await db.settings.clear();

    await db.products.bulkAdd(INITIAL_PRODUCTS);
    await db.ingredients.bulkAdd(INITIAL_INGREDIENTS);
    await db.settings.add(INITIAL_SETTINGS);

    const initialMovements: InventoryMovement[] = INITIAL_INGREDIENTS.map(ing => ({
      id: `mov-${Date.now()}-${ing.id}`,
      ingredientId: ing.id,
      ingredientName: ing.name,
      type: 'RESTOCK',
      quantityChange: ing.currentQuantity,
      unit: ing.unit,
      cost: ing.currentQuantity * ing.costPerUnit,
      reason: 'Database Seed Reset',
      date: new Date().toISOString(),
      staff: 'SYSTEM'
    }));
    await db.inventoryMovements.bulkAdd(initialMovements);
  });
}
