const poolify = (factory, min, norm, max) => {
  const duplicate = (n) => new Array(n).fill(null).map(() => factory());
  const items = duplicate(norm);

  return (item) => {
    if (item) {
      if (items.length < max) {
        items.push(item);
      }
      console.log("Recycle item, count =", items.length);
    }
    if (items.length < min) {
      const instances = duplicate(norm - items.length);
      items.push(...instances);
    }
    const res = items.pop();
    console.log("Get from pool, count =", items.length);
    return res;
  };
};

const poolify2 = (factory, { size, max }) => {
  const instances = new Array(size).fill(null).map(factory);

  const acquire = () => instances.pop() || factory();

  const release = (instance) => {
    if (instances.length < max) {
      instances.push(instance);
    }
  };
  return { acquire, release };
};

// Usage

const createBuffer = (size) => new Uint8Array(size);

const FILE_BUFFER_SIZE = 4096;
const createFileBuffer = () => createBuffer(FILE_BUFFER_SIZE);

const pool = poolify2(createFileBuffer, { size: 10, max: 15 });
const instance = pool.acquire();
console.log({ instance });
pool.release(instance);
