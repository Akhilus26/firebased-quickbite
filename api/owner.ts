import type { Order } from './orders';
import { getMenu as getUserMenu } from './menu';
import { getAllOrders, updateOrderStatusInOrders } from './orders';
import { updateMenuItem, deleteMenuItem } from './menu';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';

const CANTEEN_STATUS_DOC = 'canteenStatus';

export async function getOwnerStats() {
  const all = await getAllOrders();
  const completed = all.filter(o => o.status === 'completed').length;
  const pending = all.filter(o => o.status !== 'completed').length;
  const totalOrders = all.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEarnings = all.reduce((s, o) => s + ((o.status === 'completed' && o.createdAt >= today.getTime()) ? o.total : 0), 0);
  const totalEarnings = all.reduce((s, o) => s + (o.status === 'completed' ? o.total : 0), 0);
  return { completed, pending, totalOrders, todayEarnings, totalEarnings };
}

export async function getCanteenStatus() {
  try {
    const statusRef = doc(db, CANTEEN_STATUS_DOC, 'status');
    const statusSnap = await getDoc(statusRef);

    if (statusSnap.exists()) {
      const data = statusSnap.data();
      return { open: data.open ?? true };
    } else {
      // Return default value if document doesn't exist
      // We don't initialize it here to avoid permission errors for users
      return { open: true };
    }
  } catch (error: any) {
    // If we get a permission error or any other fetch error, default to open
    // and log the error for debugging
    console.error('Error fetching canteen status:', error);
    return { open: true };
  }
}

export async function setCanteenStatus(open: boolean) {
  try {
    const statusRef = doc(db, CANTEEN_STATUS_DOC, 'status');
    await setDoc(statusRef, { open }, { merge: true });
    return { open };
  } catch (error) {
    console.error('Error setting canteen status:', error);
    throw error;
  }
}

export async function getLiveOrders(status?: Order['status']): Promise<Order[]> {
  const all = await getAllOrders();
  return typeof status === 'string' ? all.filter(o => o.status === status) : all;
}

export async function updateOrderStatus(id: number, status: 'preparing' | 'ready' | 'completed') {
  await updateOrderStatusInOrders(id, status);
}

export async function getMenu() {
  return getUserMenu();
}

export async function toggleAvailability(id: number) {
  try {
    const menu = await getUserMenu();
    const item = menu.find(m => m.id === id);
    if (item) {
      await updateMenuItem(id, { available: !item.available });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error toggling availability:', error);
    throw error;
  }
}

export async function removeMenuItem(id: number) {
  try {
    await deleteMenuItem(id);
    return true;
  } catch (error) {
    console.error('Error removing menu item:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function deleteUser(uid: string) {
  try {
    await deleteDoc(doc(db, 'users', uid));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getReports() {
  const all = await getAllOrders();
  const now = new Date();
  const nowMs = now.getTime();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todayOrders = all.filter(o => o.createdAt >= startOfToday);
  const weekOrders = all.filter(o => o.createdAt >= startOfWeek);
  const monthOrders = all.filter(o => o.createdAt >= startOfMonth);

  const sum = (arr: Order[]) => arr.reduce((s, o) => s + (o.status === 'completed' ? o.total : 0), 0);

  const earningsToday = sum(todayOrders);
  const earningsMonth = sum(monthOrders);

  // Top selling
  const counts = new Map<number, { name: string, qty: number }>();
  for (const o of all) {
    if (o.status !== 'completed') continue;
    for (const line of o.items) {
      const existing = counts.get(line.id) || { name: line.name, qty: 0 };
      counts.set(line.id, { name: line.name, qty: existing.qty + line.qty });
    }
  }
  const topSelling = [...counts.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Category wise
  const catCounts = new Map<string, number>();
  for (const o of all) {
    for (const line of o.items) {
      const cat = line.counter || 'Others';
      catCounts.set(cat, (catCounts.get(cat) || 0) + line.qty);
    }
  }
  const categorySales = [...catCounts.entries()].map(([name, count]) => ({ name, count }));

  // Peak times
  const hours = new Array(24).fill(0);
  for (const o of all) {
    const h = new Date(o.createdAt).getHours();
    hours[h]++;
  }
  const peakHour = hours.indexOf(Math.max(...hours));
  const peakTimeRange = `${peakHour}:00 - ${peakHour + 1}:00`;

  return {
    orders: {
      today: todayOrders.length,
      week: weekOrders.length,
      month: monthOrders.length
    },
    revenue: {
      today: earningsToday,
      month: earningsMonth
    },
    topSelling,
    categorySales,
    peakTimeRange
  };
}
