import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { requireDb } from "./firebase";
import { onSnapshot } from "./firestoreAccess";

const activityLogsCollection = () => collection(requireDb(), "activityLogs");

/**
 * Add a new activity log entry
 * @param {Object} logData - { actionType, description, user, category }
 */
export const addActivityLog = async (logData) => {
  try {
    await addDoc(activityLogsCollection(), {
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
export const subscribeToActivityLogs = (callback, category = null, onError = console.error) => {
  const q = () => query(activityLogsCollection(), orderBy("timestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const logs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({ ...data, id: doc.id, description: String(data.description ?? ''), actionType: String(data.actionType ?? ''), user: String(data.user ?? '') });
    });
    callback(category && category !== 'System' ? logs.filter(log => log.category === category) : logs);
  }, (error) => {
    console.error("Error subscribing to activity logs: ", error);
    onError(error);
  });
};
