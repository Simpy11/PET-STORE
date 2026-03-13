import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  where
} from "firebase/firestore"; 
import { db } from "./firebase";

const activityLogsCollection = collection(db, "activityLogs");

/**
 * Add a new activity log entry
 * @param {Object} logData - { actionType, description, user, category }
 */
export const addActivityLog = async (logData) => {
  try {
    await addDoc(activityLogsCollection, {
      ...logData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding activity log: ", error);
  }
};

/**
 * Subscribe to activity logs in real-time
 * @param {Function} callback - Callback with logs array
 * @param {String} category - Optional category filter (Orders, Inventory, Products, System)
 */
export const subscribeToActivityLogs = (callback, category = null) => {
  let q;
  if (category && category !== 'System') {
    q = query(
      activityLogsCollection, 
      where("category", "==", category),
      orderBy("timestamp", "desc")
    );
  } else {
    q = query(activityLogsCollection, orderBy("timestamp", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const logs = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    callback(logs);
  }, (error) => {
    console.error("Error subscribing to activity logs: ", error);
  });
};
