import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  limit
} from "firebase/firestore";
import { requireDb } from "./firebase";
import { onSnapshot } from "./firestoreAccess";

const notificationsCollection = () => collection(requireDb(), "notifications");

/**
 * Add a new notification
 * @param {Object} data - { message, type: "order" | "stock" | "system", actionPath: string }
 */
export const addNotification = async (data) => {
  try {
    await addDoc(notificationsCollection(), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding notification: ", error);
  }
};

/**
 * Subscribe to notifications in real-time
 */
export const subscribeToNotifications = (callback, onError = console.error) => {
  const q = () => query(
    notificationsCollection(),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  }, (error) => {
    console.error("Error subscribing to notifications: ", error);
    onError(error);
  });
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(requireDb(), "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error("Error marking notification as read: ", error);
  }
};
