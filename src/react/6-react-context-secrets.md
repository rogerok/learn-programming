# [6 React Context Secrets That Professional Teams Use (But Never Document)](https://javascript.plainenglish.io/6-react-context-secrets-that-professional-teams-use-but-never-document-b2422b5a2141)

## Context Composition Pattern (Eliminates Provider Hell)

### ❌ Common Approach: Provider Hell

```jsx
/* ================================================
 * ❌ PROBLEM: Deeply nested providers create maintenance nightmares
 * Impact: Difficult to test, hard to reason about, prone to errors
 * Common assumption: Each context needs its own provider wrapper
 * ================================================ */

// Multiple nested providers - the dreaded "provider hell"
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UserProvider>
          <SettingsProvider>
            <NotificationProvider>
              <RouterProvider>
                <ActualApp />
              </RouterProvider>
            </NotificationProvider>
          </SettingsProvider>
        </UserProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### ✅ Context Composition

Compose contexts into a single provider component

```jsx
/* ================================================
 * 🎯
 * Centralized context management with clean API
 * ================================================ */

const composeProviders = (...providers) => {
  return ({ children }) => {
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children,
    );
  };
};

// Clean, composed provider

const AppProvider = composeProviders(
  AuthProvider,
  ThemeProvider,
  UserProvider,
  SettingsProvider,
  NotificationProvider,
  RouterProvider,
);

// Usage

function App() {
  return (
    <AppProvider>
      <ActualApp />
    </AppProvider>
  );
}
```

### Advanced Implementation:

```jsx
const createAppProvider = (config = {}) => {
  const providers = [
    config.auth !== false && AuthProvider,
    config.theme !== false && ThemeProvider,
    config.user !== false && UserProvider,
  ].filter(Boolean);
};

const ComposedProvider = composeProviders(...providers);

return ({ children }) => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <ComposedProvider>{children}</ComposedProvider>
  </ErrorBoundary>
);
```

## Context Provider Optimization

```jsx
// Production-ready provider with deep optimization
function createOptimizedProvider(name, defaultValue) {
  const Context = createContext(defaultValue);

  function Provider({ children, ...props }) {
    const [state, setState] = useState(() =>
      typeof defaultValue === "function" ? defaultValue() : defaultValue,
    );

    // ✅ Stable actions defined outside useMemo
    const reset = useCallback(() => {
      setState(defaultValue);
    }, []); // Never changes

    const update = useCallback((updates) => {
      setState((prev) => ({ ...prev, ...updates }));
    }, []); // Never changes

    // ✅ Separate state and actions for maximum optimization
    const value = useMemo(
      () => ({
        state,
        actions: {
          setState, // Already stable from useState
          reset, // Stable from useCallback
          update, // Stable from useCallback
        },
      }),
      [state, reset, update],
    ); // Only state actually changes

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return { Context, Provider };
}
```

## Context Splitting Strategy (Optimizes Render Performance)

Split contexts by update frequency to minimize re-render scope.

```jsx
/* ================================================
 * 🎯 SECRET: Split contexts based on update frequency patterns
 * Why it works: Isolates re-renders to relevant consumers only
 * ================================================ */

// Static/rarely changing data
const UserContext = createContext();
const ThemeContext = createContext();

// Frequently updating data
const NotificationContext = createContext();
const UIStateContext = createContext();

// Composed provider maintains clean API
function AppProvider({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          <UIStateProvider>{children}</UIStateProvider>
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// Consumers only re-render when their specific context updates
function UserProfile() {
  const { user } = useContext(UserContext); // Only re-renders on user change
  return <div>{user.name}</div>;
}

function NotificationBadge() {
  const { count } = useContext(NotificationContext); // Frequent updates isolated
  return <Badge count={count} />;
}
```

### Advanced Implementation:

```jsx
const createSplitContexts = (config) => {
  const contexts = {};

  Object.entries(config).forEach(([key, { updateFrequency, defaultValue }]) => {
    const Context = createContext(defaultValue);
    const Provider = ({ children }) => {
      const [state, setState] = useState(defaultValue);

      //   Add performance tracking in development
      if (process.env.NODE_ENV === "development") {
        useEffect(() => {
          console.log(`${key} Context updated:`, state);
        }, []);
      }

      const value = useMemo(() => ({ state, setState }), [state]);

      return <Context.Provider value={value}>{children}</Context.Provider>;
    };
    contexts[key] = { Context, Provider, updateFrequency };
  });

  return contexts;
};

// Usage
const contexts = createSplitContexts({
  user: { updateFrequency: "rare", defaultValue: null },
  theme: { updateFrequency: "rare", defaultValue: "light" },
  notifications: { updateFrequency: "frequent", defaultValue: [] },
  ui: { updateFrequency: "frequent", defaultValue: {} },
});
```

## Context Factory Pattern

Factory function generates consistent, type-safe contexts
DRY principle + guaranteed consistency + type safety

```jsx
import { useMemo } from "react";

const createContextFactory = (name, defaultValue = null) => {
  // Create context with display name for DevTools
  const Context = createContext(defaultValue);
  Context.displayName = `${name}Context`;

  // Provider with built-in optimization

  const Provider = ({ children, value }) => {
    const memoizedValue = useMemo(() => value, [value]);

    return (
      <Context.Provider value={memoizedValue}>{children}</Context.Provider>
    );
  };

  const useContextHook = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    return context;
  };

  // Optional: selector hook for performance
  function useContextSelector(selector) {
    const context = useContextHook();
    return useMemo(() => selector(context), [context, selector]);
  }

  return {
    Provider,
    [`use${name}`]: useContextHook,
    [`use${name}Selector`]: useContextSelector,
    Context,
  };
};

// Usage - create any context with one line
const { Provider: ThemeProvider, useTheme } = createContextFactory("Theme");
const {
  Provider: UserProvider,
  useUser,
  useUserSelector,
} = createContextFactory("User");
```

### Advanced Implementation:

```jsx
// Production-ready factory with TypeScript and middleware support
function createAdvancedContextFactory(name, options = {}) {
  const {
    defaultValue = null,
    middleware = [],
    persist = false,
    persistKey = name.toLowerCase(),
  } = options;

  const Context = createContext(defaultValue);

  function Provider({ children, initialValue = defaultValue }) {
    // Load from persistence if enabled
    const [state, setState] = useState(() => {
      if (persist && typeof window !== "undefined") {
        const saved = localStorage.getItem(persistKey);
        return saved ? JSON.parse(saved) : initialValue;
      }
      return initialValue;
    });

    // Apply middleware to setState
    const enhancedSetState = useCallback(
      (newState) => {
        let finalState =
          typeof newState === "function" ? newState(state) : newState;

        // Run through middleware
        middleware.forEach((fn) => {
          finalState = fn(finalState, state);
        });

        setState(finalState);

        // Persist if enabled
        if (persist) {
          localStorage.setItem(persistKey, JSON.stringify(finalState));
        }
      },
      [state],
    );

    const value = useMemo(
      () => ({
        state,
        setState: enhancedSetState,
        reset: () => enhancedSetState(initialValue),
      }),
      [state, enhancedSetState],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  // ... rest of factory implementation

  return { Provider, useContext: useContextHook, Context };
}
```
