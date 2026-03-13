import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

const productsCollection = collection(db, "products");
const ordersCollection = collection(db, "orders");

/**
 * Subscribe to dashboard-wide stats
 */
export const subscribeToDashboardStats = (callback) => {
  const stats = {
    totalProducts: 0,
    itemsSoldToday: 0,
    totalOrdersToday: 0,
    lowStockCount: 0,
    topSellingProduct: "None"
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  // 1. Listen for product stats
  const unsubProducts = onSnapshot(productsCollection, (snapshot) => {
    let lowStock = 0;
    let topProduct = { name: "None", demand: -1 };

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.stock < 5) lowStock++;
      if ((data.demandCount || 0) > topProduct.demand) {
        topProduct = { name: data.name || data.productName, demand: data.demandCount };
      }
    });

    stats.totalProducts = snapshot.size;
    stats.lowStockCount = lowStock;
    stats.topSellingProduct = topProduct.name;
    callback({ ...stats });
  });

  // 2. Listen for ALL orders and filter by today manually
  const qOrders = query(ordersCollection);
  const unsubOrders = onSnapshot(qOrders, (snapshot) => {
    let totalItems = 0;
    let ordersToday = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const orderDate = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date(0));
      
      if (orderDate >= today) {
        ordersToday++;
        totalItems += (data.quantity || data.qty || data.count || 1);
      }
    });
    
    stats.itemsSoldToday = totalItems;
    stats.totalOrdersToday = ordersToday;
    callback({ ...stats });
  });

  return () => {
    unsubProducts();
    unsubOrders();
  };
};

/**
 * Subscribe to hourly order data for Recharts
 */
export const subscribeToHourlyOrders = (callback) => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayAgoTimestamp = Timestamp.fromDate(dayAgo);

  const q = query(
    ordersCollection, 
    where("createdAt", ">=", dayAgoTimestamp),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(dayAgo.getTime() + (i + 1) * 60 * 60 * 1000).getHours();
      return { hour: `${hour}:00`, orders: 0 };
    });

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.createdAt?.toDate) {
        const orderHour = data.createdAt.toDate().getHours();
        const hourKey = `${orderHour}:00`;
        const entry = hourlyData.find(d => d.hour === hourKey);
        if (entry) entry.orders++;
      }
    });

    callback(hourlyData);
  });
};
