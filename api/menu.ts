import type { MenuItem } from '@/components/FoodCard';
import { db } from '@/config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const MENU_COLLECTION = 'menuItems';

// Convert Firestore document to MenuItem
function docToMenuItem(docData: any, docId: string): MenuItem {
  const data = docData;
  return {
    id: data.id || parseInt(docId, 10) || 0, // Use stored id or parse docId as fallback
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    veg: data.veg ?? true,
    category: data.category || 'Snacks',
    available: data.available ?? true,
    image: data.image || require('../design/snacks/sandwich.jpg'),
    madeWith: data.madeWith,
    calories: data.calories,
    protein: data.protein,
    prepTime: data.prepTime,
    quantity: data.quantity,
    counter: data.counter || 'Snacks & Hot Beverages',
  };
}

// Convert MenuItem to Firestore document
function menuItemToDoc(item: MenuItem): any {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    veg: item.veg,
    category: item.category,
    available: item.available ?? true,
    image: typeof item.image === 'string' ? item.image : null, // Store only string URIs, not require() numbers
    madeWith: item.madeWith || null,
    calories: item.calories || null,
    protein: item.protein || null,
    prepTime: item.prepTime || null,
    quantity: item.quantity || null,
    counter: item.counter || 'Snacks & Hot Beverages',
  };
}

export async function getMenu(): Promise<MenuItem[]> {
  try {
    const menuRef = collection(db, MENU_COLLECTION);
    const q = query(menuRef, orderBy('id', 'desc')); // Order by id descending
    const querySnapshot = await getDocs(q);

    const menu: MenuItem[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const menuItem = docToMenuItem(docSnapshot.data(), docSnapshot.id);
      menu.push(menuItem);
    });

    return menu;
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
}

export async function addMenuItem(partial: {
  name: string;
  price: number;
  veg: boolean;
  category: MenuItem['category'];
  available: boolean;
  image?: string | number;
  description?: string;
  madeWith?: string;
  calories?: number;
  protein?: number;
  prepTime?: number;
  quantity?: number;
  counter: MenuItem['counter'];
}): Promise<MenuItem> {
  try {
    // Get current menu to determine next ID
    const currentMenu = await getMenu();
    const maxId = currentMenu.length > 0
      ? Math.max(...currentMenu.map(m => m.id))
      : 0;
    const nextId = maxId + 1;

    const item: MenuItem = {
      id: nextId,
      name: partial.name,
      description: partial.description ?? '',
      price: partial.price,
      veg: partial.veg,
      category: partial.category,
      available: partial.available,
      image: partial.image !== undefined ? partial.image : require('../design/snacks/sandwich.jpg'),
      madeWith: partial.madeWith ?? '',
      calories: partial.calories ?? undefined,
      protein: partial.protein ?? undefined,
      prepTime: partial.prepTime ?? undefined,
      quantity: partial.quantity ?? undefined,
      counter: partial.counter,
    };

    const docData = menuItemToDoc(item);
    const docRef = await addDoc(collection(db, MENU_COLLECTION), docData);

    return item;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<void> {
  try {
    const menuRef = collection(db, MENU_COLLECTION);
    const querySnapshot = await getDocs(menuRef);

    let docId: string | null = null;
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.id === id) {
        docId = docSnapshot.id;
      }
    });

    if (docId) {
      const docRef = doc(db, MENU_COLLECTION, docId);
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.veg !== undefined) updateData.veg = updates.veg;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.available !== undefined) updateData.available = updates.available;
      if (updates.image !== undefined) updateData.image = typeof updates.image === 'string' ? updates.image : null;
      if (updates.madeWith !== undefined) updateData.madeWith = updates.madeWith;
      if (updates.calories !== undefined) updateData.calories = updates.calories;
      if (updates.protein !== undefined) updateData.protein = updates.protein;
      if (updates.prepTime !== undefined) updateData.prepTime = updates.prepTime;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.counter !== undefined) updateData.counter = updates.counter;

      await updateDoc(docRef, updateData);
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

export async function deleteMenuItem(id: number): Promise<void> {
  try {
    const menuRef = collection(db, MENU_COLLECTION);
    const querySnapshot = await getDocs(menuRef);

    let docId: string | null = null;
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.id === id) {
        docId = docSnapshot.id;
      }
    });

    if (docId) {
      const docRef = doc(db, MENU_COLLECTION, docId);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}
