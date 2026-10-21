export function withTimeout(operation, milliseconds = 15000) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error('The database request timed out.'), { code: 'deadline-exceeded' })), milliseconds);
  });
  return Promise.race([Promise.resolve().then(operation), deadline]).finally(() => clearTimeout(timer));
}

// A timeout reports connectivity trouble but leaves the listener able to recover.
export function subscribeWithTimeout(start, next, onError, milliseconds = 15000) {
  let active = true;
  let unsubscribe = () => {};
  const timer = setTimeout(() => { if (active) onError(Object.assign(new Error('The database subscription timed out.'), { code: 'deadline-exceeded' })); }, milliseconds);
  const fail = error => { clearTimeout(timer); if (active) onError(error); };
  try {
    unsubscribe = start(value => { clearTimeout(timer); if (active) next(value); }, fail);
  } catch (error) { queueMicrotask(() => fail(error)); }
  return () => { active = false; clearTimeout(timer); unsubscribe(); };
}
