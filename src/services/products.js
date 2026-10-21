import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  increment
} from "firebase/firestore";
import { requireDb } from "./firebase";
import { onSnapshot, getDocs } from "./firestoreAccess";
import { normalizeProduct, validateProduct } from "./normalize";
import { addActivityLog } from "./activityLogs";
import { addNotification } from "./notifications";

// Reference to the 'products' collection
const productsCollection = () => collection(requireDb(), "products");

/**
 * Add a new product to the inventory
 * @param {Object} productData - { name, category, price, stock, imageUrl }
 */
export const addProduct = async (productData) => {
  try {
    validateProduct(productData);
    const docRef = await addDoc(productsCollection(), {
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      demandCount: 0,
      createdAt: serverTimestamp()
    });

    await addActivityLog({
      actionType: "Product added",
      description: `Newly materialized asset: ${productData.productName || productData.name}`,
      user: "Admin",
      category: "Products"
    });

    await addNotification({
      message: `System Alert: New product added - ${productData.productName || productData.name}`,
      type: "system",
      actionPath: "/inventory"
    });

    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
};

/**
 * Subscribe to products in real-time
 */
export const subscribeToProducts = (callback, onError = console.error) => {
  const q = () => query(productsCollection(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products = [];
    snapshot.forEach((doc) => {
      products.push(normalizeProduct(doc.data(), doc.id));
    });
    callback(products);
  }, (error) => {
    console.error("Error subscribing to products: ", error);
    onError(error);
  });
};

/**
 * Atomic increment of product demand count
 */
export const incrementDemandCount = async (productId) => {
  try {
    const productRef = doc(requireDb(), "products", productId);
    await updateDoc(productRef, {
      demandCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error incrementing demand count: ", error);
    throw error;
  }
};

/**
 * Fetch all products, ordered by creation date descending
 */
export const getProducts = async () => {
  try {
    const q = () => query(productsCollection(), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push(normalizeProduct(doc.data(), doc.id));
    });
    return products;
  } catch (error) {
    console.error("Error fetching products: ", error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {string} id - The document ID of the product
 * @param {Object} updates - Fields to update
 */
export const updateProduct = async (id, updates) => {
  try {
    if ('price' in updates || 'productName' in updates || 'category' in updates) validateProduct(updates);
    if ('stock' in updates && (!Number.isInteger(Number(updates.stock)) || Number(updates.stock) < 0)) throw new Error('Stock must be a non-negative whole number.');
    const productRef = doc(requireDb(), "products", id);
    await updateDoc(productRef, {
      ...updates,
      ...('price' in updates ? { price: Number(updates.price) } : {}),
      ...('stock' in updates ? { stock: Number(updates.stock) } : {}),
      updatedAt: serverTimestamp()
    });

    // Determine description for the log
    let description = `Asset updated: ID ${id.slice(0, 8)}`;
    if (updates.productName || updates.name) {
      description = `Asset re-configured: ${updates.productName || updates.name}`;
    } else if (updates.stock !== undefined) {
      description = `Stock level adjusted to ${updates.stock} for ID ${id.slice(0, 8)}`;
    }

    await addActivityLog({
      actionType: updates.stock !== undefined ? "Stock updated" : "Product updated",
      description: description,
      user: "Admin",
      category: updates.stock !== undefined ? "Inventory" : "Products"
    });

    if (updates.stock !== undefined && updates.stock < 5) {
      await addNotification({
        message: `Inventory Alert: Stock level below threshold (< 5) for ID ${id.slice(0, 8)}`,
        type: "stock",
        actionPath: "/inventory"
      });
    }

    return { id, ...updates };
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

/**
 * Delete a product by its ID
 * @param {string} id - The document ID of the product
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(requireDb(), "products", id);
    await deleteDoc(productRef);

    await addActivityLog({
      actionType: "Product deleted",
      description: `Asset purged: ID ${id.slice(0, 8)}`,
      user: "Admin",
      category: "Products"
    });

    return id;
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};
