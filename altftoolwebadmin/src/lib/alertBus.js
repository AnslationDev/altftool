let listeners = [];

export function emitAlert(alert) {
  listeners.forEach((cb) => cb(alert));
}

export function subscribeAlert(cb) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}