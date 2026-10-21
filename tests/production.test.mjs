import test from 'node:test';
import assert from 'node:assert/strict';
import { firebaseSettings, dataErrorMessage } from '../src/services/config.js';
import { withTimeout, subscribeWithTimeout } from '../src/services/requestState.js';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('a deployment missing Firebase variables reports names without exposing values', () => {
  const { missing } = firebaseSettings({ VITE_FIREBASE_API_KEY: 'private-test-value' });
  assert.ok(missing.includes('VITE_FIREBASE_PROJECT_ID'));
  assert.ok(!missing.includes('VITE_FIREBASE_API_KEY'));
  const message = dataErrorMessage(Object.assign(new Error('Missing VITE_FIREBASE_PROJECT_ID'), { code: 'app/configuration' }));
  assert.match(message, /VITE_FIREBASE_PROJECT_ID/);
  assert.ok(!message.includes('private-test-value'));
});

test('access denied and offline failures have different actionable messages', () => {
  assert.match(dataErrorMessage({ code: 'permission-denied' }), /authentication and Firestore rules/);
  assert.match(dataErrorMessage({ code: 'unavailable' }), /internet connection/);
});

test('stalled one-shot reads reject instead of leaving loading active', async () => {
  await assert.rejects(withTimeout(() => new Promise(() => {}), 10), { code: 'deadline-exceeded' });
  assert.equal(await withTimeout(() => Promise.resolve('server result'), 50), 'server result');
});

test('synchronous configuration failures reach subscription error handlers', async () => {
  let error;
  const stop = subscribeWithTimeout(() => { throw Object.assign(new Error('missing config'), { code: 'app/configuration' }); }, () => assert.fail('unexpected success'), value => { error = value; }, 50);
  await wait(1);
  assert.equal(error.code, 'app/configuration');
  stop();
});

test('a stalled subscription reports failure and can recover without duplicate setup', async () => {
  let ready, cleanup = 0;
  const failures = [], values = [];
  const stop = subscribeWithTimeout(next => { ready = next; return () => cleanup++; }, value => values.push(value), error => failures.push(error), 10);
  await wait(25);
  assert.equal(failures[0].code, 'deadline-exceeded');
  ready('live data');
  assert.deepEqual(values, ['live data']);
  stop();
  ready('late data');
  assert.deepEqual(values, ['live data']);
  assert.equal(cleanup, 1);
});

test('unmount cancels subscription timeout and ignores deferred setup errors', async () => {
  let failed = false;
  const stop = subscribeWithTimeout(() => { throw new Error('setup'); }, () => {}, () => { failed = true; }, 5);
  stop();
  await wait(15);
  assert.equal(failed, false);
});
