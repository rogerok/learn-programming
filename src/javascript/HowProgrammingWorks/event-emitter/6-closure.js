const emitter = () => {
  const events = {};
  return {
    on: (name, fn) => {
      const event = events[name];
      if (event) {
        event.push(fn);
      } else {
        events[name] = [fn];
      }
    },
    emit: (name, ...args) => {
      const event = events[name];
      if (event) {
        event.forEach((fn) => fn(...args));
      }
    },
  };
};
