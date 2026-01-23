import type { CartLine } from '@/stores/cartStore';
import { db } from '@/config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';

export type OrderItemDelivery = {
  itemId: number;
  counter: 'Snacks & Hot Beverages' | 'Meals' | 'Cold Beverages';
  delivered: boolean;
};

export type ScratchToken = {
  id?: string;
  orderId: number;
  userId: string;
  counter: 'Snacks & Hot Beverages' | 'Meals' | 'Cold Beverages';
  used: boolean;
  expiresAt: Timestamp;
  revealedAt?: Timestamp | null;
  items: { name: string; qty: number }[];
};

export type Order = {
  id: number;
  orderCode: string; // 4-digit code
  items: CartLine[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: number; // epoch ms
  itemDeliveryStatus: OrderItemDelivery[]; // Track delivery per item per counter
  userId?: string; // Phone number of the user who placed the order
  paymentMethod: string;
};

const ORDERS_COLLECTION = 'orders';

// Convert Firestore document to Order
function docToOrder(docData: any, docId: string): Order {
  const data = docData;
  const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt || Date.now();

  return {
    id: data.id || parseInt(docId, 10) || 0,
    orderCode: data.orderCode || '',
    items: data.items || [],
    total: data.total || 0,
    status: data.status || 'pending',
    createdAt: createdAt,
    itemDeliveryStatus: data.itemDeliveryStatus || [],
    userId: data.userId,
    paymentMethod: data.paymentMethod || 'Unknown',
  };
}

// Convert Order to Firestore document
function orderToDoc(order: Order): any {
  return {
    id: order.id,
    orderCode: order.orderCode,
    items: order.items,
    total: order.total,
    status: order.status,
    createdAt: Timestamp.fromMillis(order.createdAt),
    itemDeliveryStatus: order.itemDeliveryStatus,
    userId: order.userId || null,
    paymentMethod: order.paymentMethod,
  };
}

// Generate unique 4-digit code
async function generateOrderCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    code = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if code exists in Firestore
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('orderCode', '==', code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      isUnique = true;
      return code;
    }

    attempts++;
  }

  // Fallback: use timestamp-based code if uniqueness check fails
  return Date.now().toString().slice(-4);
}

export async function createOrder(items: CartLine[], paymentMethod: string, userId?: string): Promise<Order> {
  try {
    const total = items.reduce((s, l) => s + l.price * l.qty, 0);
    const orderCode = await generateOrderCode();

    // Create delivery status for each item based on its counter
    const itemDeliveryStatus: OrderItemDelivery[] = items.map(item => ({
      itemId: item.id,
      counter: item.counter || 'Snacks & Hot Beverages',
      delivered: false,
    }));

    // Detect unique counters
    const uniqueCounters = Array.from(new Set(items.map(i => i.counter || 'Snacks & Hot Beverages')));

    // Get next order ID
    const allOrders = await getAllOrders();
    const maxId = allOrders.length > 0
      ? Math.max(...allOrders.map(o => o.id))
      : 0;
    const nextId = maxId + 1;

    const order: Order = {
      id: nextId,
      orderCode,
      items,
      total,
      status: 'completed',
      createdAt: Date.now(),
      itemDeliveryStatus,
      userId: userId,
      paymentMethod,
    };

    const docData = orderToDoc(order);
    await addDoc(collection(db, ORDERS_COLLECTION), docData);

    // Generate Scratch Tokens
    const scratchTokensRef = collection(db, 'scratchTokens');
    const expiresAt = Timestamp.fromMillis(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now

    for (const counterName of uniqueCounters) {
      const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit random token

      // Filter items belonging to this counter
      const counterItems = items
        .filter(i => (i.counter || 'Snacks & Hot Beverages') === counterName)
        .map(i => ({ name: i.name, qty: i.qty }));

      const scratchToken: ScratchToken = {
        orderId: nextId,
        userId: userId || 'unknown',
        counter: counterName as any,
        used: false,
        expiresAt: expiresAt,
        revealedAt: null,
        items: counterItems,
      };
      await addDoc(scratchTokensRef, scratchToken as any);
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getMyOrders(userId?: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    let q;

    if (userId) {
      // Remove orderBy to avoid composite index requirement
      q = query(ordersRef, where('userId', '==', userId));
    } else {
      q = query(ordersRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((docSnapshot) => {
      const order = docToOrder(docSnapshot.data(), docSnapshot.id);
      orders.push(order);
    });

    // Sort client-side if filtered by userId
    if (userId) {
      orders.sort((a, b) => b.createdAt - a.createdAt);
    }

    return orders;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    return [];
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const order = docToOrder(docSnapshot.data(), docSnapshot.id);
      orders.push(order);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

export async function updateOrderStatusInOrders(id: number, status: Order['status']) {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const querySnapshot = await getDocs(ordersRef);

    let docId: string | null = null;
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.id === id) {
        docId = docSnapshot.id;
      }
    });

    if (docId) {
      const docRef = doc(db, ORDERS_COLLECTION, docId);
      await updateDoc(docRef, { status });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
