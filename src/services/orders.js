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
import { incrementDemandCount } from "./products";
import { addActivityLog } from "./activityLogs";
import { addNotification } from "./notifications";

const ordersCollection = collection(db, "orders");

/**
 * Add a new order
 */
export const addOrder = async (orderData) => {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp(),
      status: orderData.status || "Pending"
    });
    
    // Automatically increment demand count for the product
    if (orderData.productId) {
      await incrementDemandCount(orderData.productId);
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
export const subscribeToOrders = (callback) => {
  const q = query(ordersCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to orders: ", error);
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
      orders.push({ id: doc.id, ...doc.data() });
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
