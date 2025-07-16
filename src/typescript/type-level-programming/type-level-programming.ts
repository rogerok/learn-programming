interface RouteConfig {
  path: string;
  method: "GET" | "POST";
  hasIdParam: boolean;
}

type Routes = {
  getUsers: RouteConfig;
  getUserById: RouteConfig;
  createUser: RouteConfig;
};

// Опишем конкретную конфигурацию
const routes = {
  getUsers: {
    path: "/users",
    method: "GET",
    hasIdParam: false,
  },
  getUserById: {
    path: "/users",
    method: "GET",
    hasIdParam: true,
  },
  createUser: {
    path: "/users",
    method: "POST",
    hasIdParam: false,
  },
} as const satisfies Routes;

type ClientFunction<T extends RouteConfig> = T["hasIdParam"] extends true
  ? (id: number) => Promise<string>
  : () => Promise<string>;

type Client<T extends Record<string, RouteConfig>> = {
  [K in keyof T]: ClientFunction<T[K]>;
};

// Создадим фабрику, которая сделает реальный объект со всеми методами:
function createClient<T extends Record<string, RouteConfig>>(
  config: T,
): Client<T> {
  const entries = Object.entries(config).map(([key, route]) => {
    const fn = route.hasIdParam
      ? (id: number) =>
          Promise.resolve(`${route.method} ${route.path}/${id} was called!`)
      : () => Promise.resolve(`${route.method} ${route.path} was called!`);

    return [key, fn];
  });

  return Object.fromEntries(entries);
}
