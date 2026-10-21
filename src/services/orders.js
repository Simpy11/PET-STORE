import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeOrder } from "./normalize";
import { incrementDemandCount } from "./products";
import { addActivityLog } from "./activityLogs";
import { addNotification } from "./notifications";

const ordersCollection = collection(db, "orders");

/**
 * Add a new order
 */
export const addOrder = async (orderData) => {
  try {
    if (!orderData.productId || !orderData.customerName?.trim() || !orderData.customerEmail?.trim()) throw new Error('Product and customer details are required.');
    if (!Number.isInteger(orderData.quantity) || orderData.quantity < 1) throw new Error('Quantity must be a positive whole number.');
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp(),
      status: orderData.status || "Pending"
    });
    
    // Automatically increment demand count for the product
    if (orderData.productId) {
      await incrementDemandCount(orderData.productId).catch(error => console.error("Order saved, but demand count update failed", error));
    }
    
    await addActivityLog({
      actionType: "Order created",
      description: `New manifestation for ${orderData.customerName}: ${orderData.productName}`,
      user: "Admin",
      category: "Orders"
    });

    await addNotification({
      message: `New Order: ${orderData.customerName} purchased ${orderData.productName}`,
      type: "order",
      actionPath: "/orders"
    });
    
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error adding order: ", error);
    throw error;
  }
};

/**
 * Subscribe to orders in real-time
 */
export const subscribeToOrders = (callback, onError = console.error) => {
  const q = query(ordersCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = [];
    snapshot.forEach((doc) => {
      orders.push(normalizeOrder(doc.data(), doc.id));
    });
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to orders: ", error);
    onError(error);
  });
};

/**
 * Fetch all orders, ordered by creation date descending
 */
export const getOrders = async () => {
  try {
    const q = query(ordersCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push(normalizeOrder(doc.data(), doc.id));
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders: ", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrder = async (id, updates) => {
  try {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, updates);

    if (updates.status) {
      await addActivityLog({
        actionType: "Order status updated",
        description: `Order ${id.slice(0, 8)} status adjusted to ${updates.status}`,
        user: "Admin",
        category: "Orders"
      });
    }

    return { id, ...updates };
  } catch (error) {
    console.error("Error updating order: ", error);
    throw error;
  }
};

/**
 * Delete an order
 */
export const deleteOrder = async (id) => {
  try {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);
    return id;
  } catch (error) {
    console.error("Error deleting order: ", error);
    throw error;
  }
};
