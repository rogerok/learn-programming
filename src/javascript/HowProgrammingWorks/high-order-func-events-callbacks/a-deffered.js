// Отложенный объект

const getConferences = () => {
  let onDone = null;

  const deffered = {
    // метод data сохраняет ссылку на callback в локальную переменную
    data: (callback) => (onDone = callback),
  };

  // эмуляция задержки получения данных
  setTimeout(() => {
    if (onDone) {
      onDone(["first", "second", "third"]);
    }
  });

  return deffered;
};

// Usage

const conferences = getConferences();

console.log(conferences);

conferences.data((list) => {
  console.log(list);
});
