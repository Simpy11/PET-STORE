export function firebaseSettings(env) {
  const fields = { apiKey: 'VITE_FIREBASE_API_KEY', authDomain: 'VITE_FIREBASE_AUTH_DOMAIN', projectId: 'VITE_FIREBASE_PROJECT_ID', storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET', messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID', appId: 'VITE_FIREBASE_APP_ID' };
  const config = Object.fromEntries(Object.entries(fields).map(([key, name]) => [key, typeof env[name] === 'string' ? env[name].trim() : '']));
  const missing = Object.entries(fields).filter(([key]) => !config[key]).map(([, name]) => name);
  if (env.VITE_FIREBASE_MEASUREMENT_ID) config.measurementId = env.VITE_FIREBASE_MEASUREMENT_ID;
  return { config, missing };
}
export function dataErrorMessage(error) {
  if (error?.code === 'app/configuration') return error.message;
  if (error?.code === 'permission-denied' || error?.code === 'unauthenticated') return 'Database access denied. An administrator must check Firebase authentication and Firestore rules for this deployment.';
  if (error?.code === 'deadline-exceeded' || error?.code === 'unavailable') return 'The database did not respond. Check your internet connection and try again.';
  if (error?.code === 'failed-precondition') return 'The database query could not run. Check the browser console for a required Firestore index or database configuration.';
  return 'Data could not load. Check your connection and Firebase configuration, then try again.';
}
