import { create } from 'zustand';
import type { MenuItem } from '@/components/FoodCard';

export type CartLine = MenuItem & { qty: number };

type State = {
  items: CartLine[];
};

type Actions = {
  addItem: (item: MenuItem) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: () => number;
  validateCart: (menu: MenuItem[]) => boolean;
};

export const useCartStore = create<State & Actions>((set, get) => ({
  items: [],
  addItem(item) {
    set((s) => {
      const existing = s.items.find((l) => l.id === item.id);
      if (existing) {
        return { items: s.items.map((l) => l.id === item.id ? { ...l, qty: l.qty + 1 } : l) };
      }
      return { items: [...s.items, { ...item, qty: 1 }] };
    });
  },
  inc(id) { set((s) => ({ items: s.items.map((l) => l.id === id ? { ...l, qty: l.qty + 1 } : l) })); },
  dec(id) { set((s) => ({ items: s.items.flatMap((l) => l.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l]) })); },
  remove(id) { set((s) => ({ items: s.items.filter((l) => l.id !== id) })); },
  clear() { set({ items: [] }); },
  total() { return get().items.reduce((sum, l) => sum + l.price * l.qty, 0); },
  validateCart(menu) {
    const s = get();
    // Keep item if it exists in menu AND is available
    const validItems = s.items.filter(cartItem => {
      const menuItem = menu.find(m => m.id === cartItem.id);
      return menuItem && menuItem.available;
    });

    if (validItems.length !== s.items.length) {
      set({ items: validItems });
      return true; // Changes made
    }
    return false; // No changes
  }
}));
