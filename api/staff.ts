import type { Order } from './orders';
import { getAllOrders, updateOrderStatusInOrders } from './orders';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Get all pending/active orders (not completed)
export async function getActiveOrders(): Promise<Order[]> {
  const all = await getAllOrders();
  return all.filter(o => o.status !== 'completed');
}

// Get completed orders (history)
export async function getCompletedOrders(): Promise<Order[]> {
  const all = await getAllOrders();
  return all.filter(o => o.status === 'completed');
}

// Get pending orders count
export async function getPendingOrdersCount(): Promise<number> {
  const active = await getActiveOrders();
  return active.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length;
}

// Search order by 4-digit code
export async function getOrderByCode(code: string): Promise<Order | null> {
  const all = await getAllOrders();
  const order = all.find(o => o.orderCode === code);
  // Only return if order exists and is not completed
  if (order && order.status !== 'completed') {
    return order;
  }
  return null;
}

// Mark an item as delivered
export async function markItemDelivered(orderId: number, itemId: number): Promise<boolean> {
  try {
    const all = await getAllOrders();
    const order = all.find(o => o.id === orderId);
    
    if (!order || order.status === 'completed') {
      return false; // Order not found or already completed
    }
    
    // Update item delivery status
    const deliveryStatus = order.itemDeliveryStatus.find(d => d.itemId === itemId);
    if (deliveryStatus) {
      deliveryStatus.delivered = true;
    }
    
    // Update order in Firestore
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    let docId: string | null = null;
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.id === orderId) {
        docId = docSnapshot.id;
      }
    });

    if (docId) {
      const docRef = doc(db, 'orders', docId);
      await updateDoc(docRef, { itemDeliveryStatus: order.itemDeliveryStatus });
    }
    
    // Check if all items are delivered
    const allDelivered = order.itemDeliveryStatus.every(d => d.delivered);
    if (allDelivered) {
      // Mark order as completed
      await updateOrderStatusInOrders(orderId, 'completed');
    }
    
    return true;
  } catch (error) {
    console.error('Error marking item as delivered:', error);
    return false;
  }
}

// Get order details by ID
export async function getOrderById(id: number): Promise<Order | null> {
  const all = await getAllOrders();
  return all.find(o => o.id === id) || null;
}

