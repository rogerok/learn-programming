const breadthFirstPrint = (graph, source) => {
  const queue = [source];

  while (queue.length) {
    const current = queue.shift();

    console.log(current);

    for (let neighbour of graph[current]) {
      queue.push(neighbour);
    }
  }
};

const graph = {
  you: ["alice", "bob", "claire"],
  bob: ["anuj", "peggy"],
  alice: ["peggy"],
  claire: ["thom", "jonny"],
  anuj: [],
  peggy: [],
  thom: [],
  jonny: [],
};

// breadthFirstPrint(graph, "bob");

const breadthFirsPrintRecursive = (graph, source) => {
  console.log(source + " recursive call");

  for (let neighbour of graph[source]) {
    breadthFirsPrintRecursive(graph, neighbour);
  }
};

// breadthFirsPrintRecursive(graph, "bob");

const findMangoSeller = (graph, source) => {
  const queue = [source];

  while (queue.length) {
    const current = queue.shift();

    if (current.includes("m")) {
      console.log(current + " is mango seller");
      break;
    }

    for (let neighbour of graph[current]) {
      queue.push(neighbour);
    }
  }
};

const findMangoSellerWithCheck = (graph, source) => {
  const queue = [source];
  const checked = new Set();

  while (queue.length) {
    const current = queue.shift();

    checked.add(current);

    if (current.includes("m")) {
      console.log(current + " is mango seller");
      break;
    }

    for (let neighbour of graph[current]) {
      if (!checked.has(neighbour)) {
        queue.push(neighbour);
      }
    }
  }

  console.log(checked);
};

findMangoSellerWithCheck(graph, "you");
