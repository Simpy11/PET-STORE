import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, normalizeOrder, validateProduct } from '../src/services/normalize.js';

test('legacy and incomplete products remain searchable and numeric', () => {
  const p = normalizeProduct({ name: 'Dog Food', price: '12.50', stock: '4', id: 'stale' }, 'real-id');
  assert.equal(p.productName, 'Dog Food');
  assert.equal(p.name, 'Dog Food');
  assert.equal(p.id, 'real-id');
  assert.equal(p.category.toLowerCase(), 'uncategorized');
  assert.equal(p.price, 12.5);
  assert.equal(p.stock + 1, 5);
  const malformed = normalizeProduct({ category: null, productName: {}, price: 'bad', stock: -2 }, 'id');
  assert.equal(malformed.price, 0);
  assert.equal(malformed.stock, 0);
  assert.doesNotThrow(() => malformed.name.toLowerCase());
});

test('legacy orders use searchable fields and finite quantities', () => {
  const order = normalizeOrder({ orderId: 123, buyerName: 'Sam', qty: '3', customerEmail: null }, 'id');
  assert.equal(order.orderId.toLowerCase(), '123');
  assert.equal(order.customerName, 'Sam');
  assert.equal(order.quantity, 3);
  assert.equal(order.status, 'Pending');
  assert.equal(normalizeOrder({ quantity: 'bad' }, 'id').quantity, 1);
});

test('product validation allows zero stock and rejects invalid edits', () => {
  const valid = { productName: 'Food', category: 'Dog', price: '0', stock: '0' };
  assert.doesNotThrow(() => validateProduct(valid));
  for (const bad of [{ stock: '2.5' }, { stock: -1 }, { stock: '' }, { price: '' }, { price: 'bad' }, { price: -1 }, { productName: ' ' }]) {
    assert.throws(() => validateProduct({ ...valid, ...bad }));
  }
});
