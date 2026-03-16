const sum = (a, b) =>
  new Promise((resolve, reject) => {
    if (typeof a === "number" && typeof b === "number") {
      resolve(a + b);
    } else {
      reject(new Error("a and b should be numbers"));
    }
  });

sum(2, 3)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
