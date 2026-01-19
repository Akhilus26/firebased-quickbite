import type { Order } from './orders';
import { getMenu as getUserMenu } from './menu';
import { getAllOrders, updateOrderStatusInOrders } from './orders';
import { updateMenuItem, deleteMenuItem } from './menu';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CANTEEN_STATUS_DOC = 'canteenStatus';

export async function getOwnerStats() {
  const all = await getAllOrders();
  const completed = all.filter(o => o.status === 'completed').length;
  const pending = all.filter(o => o.status !== 'completed').length;
  const totalOrders = all.length;
  const today = new Date();
  today.setHours(0,0,0,0);
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
      // Initialize with default value
      await setDoc(statusRef, { open: true });
      return { open: true };
    }
  } catch (error) {
    console.error('Error fetching canteen status:', error);
    return { open: true }; // Default to open on error
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

export async function updateOrderStatus(id: number, status: 'preparing'|'ready'|'completed') {
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

export async function getReports() {
  const all = await getAllOrders();
  const now = Date.now();
  const dayMs = 24*60*60*1000;
  const last7 = all.filter(o => o.createdAt >= now - 7*dayMs);
  const last30 = all.filter(o => o.createdAt >= now - 30*dayMs);
  const sum = (arr: Order[]) => arr.reduce((s,o)=> s + (o.status === 'completed' ? o.total : 0), 0);
  const earnings7 = sum(last7);
  const earnings30 = sum(last30);
  // top selling by item id across all
  const counts = new Map<number, number>();
  for (const o of all) {
    for (const line of o.items) {
      counts.set(line.id, (counts.get(line.id) || 0) + line.qty);
    }
  }
  const topSelling = [...counts.entries()].sort((a,b)=> b[1]-a[1]).slice(0,5).map(([id, qty])=> ({ id, qty }));
  const totalEarnings = sum(all);
  return { earnings7, earnings30, topSelling, totalEarnings };
}
