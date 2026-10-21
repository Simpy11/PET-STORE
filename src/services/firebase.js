import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseSettings } from './config';

const { config, missing } = firebaseSettings(import.meta.env);
let initializationError = missing.length ? Object.assign(new Error(`Firebase configuration is missing: ${missing.join(', ')}. Add these variables to Vercel and redeploy.`), { code: 'app/configuration' }) : null;
let database = null;
if (!initializationError) {
  try {
    database = getFirestore(getApps().length ? getApp() : initializeApp(config));
  } catch (error) { initializationError = error; }
}
export const db = database;
export const firebaseConfigurationError = initializationError;
export function requireDb() {
  if (initializationError) throw initializationError;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw Object.assign(new Error('You are offline. Reconnect before accessing the database.'), { code: 'unavailable' });
  return database;
}
