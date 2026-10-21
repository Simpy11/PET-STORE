const text = (value, fallback = '') => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback;
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export function normalizeProduct(data, id) {
  const name = text(data.productName) || text(data.name, 'Unnamed product');
  return { ...data, id, productName: name, name, category: text(data.category, 'Uncategorized'), price: Math.max(0, number(data.price)), stock: Math.max(0, Math.trunc(number(data.stock))), demandCount: Math.max(0, number(data.demandCount)) };
}
export function normalizeOrder(data, id) {
  return { ...data, id, orderId: text(data.orderId, id), productName: text(data.productName), customerName: text(data.customerName) || text(data.buyerName) || text(data.userName), customerEmail: text(data.customerEmail) || text(data.buyerEmail) || text(data.email), quantity: Math.max(1, Math.trunc(number(data.quantity ?? data.qty ?? data.count, 1))), status: text(data.status, 'Pending') };
}
export function validateProduct(data) {
  if (!String(data.productName ?? data.name ?? '').trim() || !String(data.category ?? '').trim()) throw new Error('Product name and category are required.');
  if (data.price === '' || !Number.isFinite(Number(data.price)) || Number(data.price) < 0) throw new Error('Price must be a non-negative number.');
  if (data.stock === '' || !Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) throw new Error('Stock must be a non-negative whole number.');
}
