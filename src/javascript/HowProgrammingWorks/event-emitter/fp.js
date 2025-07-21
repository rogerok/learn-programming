const ee = (events = {}) => {
  return {
    on: (name, fn) => (events[name] = events[name] || []).push(fn),
    emit: (name, ...args) => (events[name] || []).forEach((fn) => fn(...args)),
  };
};
