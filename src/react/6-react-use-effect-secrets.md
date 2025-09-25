# [6 React useEffect Secrets That Professional Teams Use (But Never Document)](https://javascript.plainenglish.io/6-react-useeffect-secrets-that-professional-teams-use-but-never-document-432609f2ea2a)

## You can use abort controller also for aborting event listeners, timeouts, timers

Custom hook for abort effect

```js
const useAbortableEffect = (effect, deps) => {
  useEffect(() => {
    const controller = new AbortController();
    const cleanupPromise = effect(controller.signal);

    return () => {
      controller.abort();

      if (cleanupPromise && typeof cleanupPromise.then === "function") {
        cleanupPromise.then((cleanup) => cleanup?.());
      }
    };
  }, deps);
};

// Usage

useAbortableEffect(async (signal) => {
  const ws = new WebSocket("wss://api.example.com");

  signal.addEventListener("abort", () => {
    ws.close();
  });

  ws.onmessage = (event) => {
    if (!signal.aborted) {
      processMessage(event.data);
    }
  };
  // Return cleanup function for additional cleanup

  return () => {};
  // Additional cleanup if needed
}, []);
```

## useDebouncedEffect

```js
const useDebouncedEffect = (effect, delay, deps) => {
  const callback = useRef(effect);
  const timer = useRef(null);

  // update callback on each render
  useLayoutEffect(() => {
    callback.current = effect;
  }, []);

  useEffect(() => {
    // Clear existing timer
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      callback.current();
    }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [...deps, delay]);
};

// Usage

function AutoSaveComponent({ content }) {
  const [saveDelay, setSaveDelay] = useState(1000);

  useDebouncedEffect(
    () => {
      saveContent(content);
    },
    saveDelay,
    [content],
  );

  return (
    <Editor
      content={content}
      onUrgentChange={() => setSaveDelay(100)}
      onNormalChange={() => setSaveDelay(1000)}
    />
  );
}
```

## Request Version Tracking

Version tracking ensures latest data wins
Each request has unique ID, only latest updates state
Combine request versioning with optimistic updates. Store the version with the optimistic data and only revert if a newer request fails.

```js
const useLatestEffect = (asyncEffect, deps) => {
  const versionRef = useRef(0);

  useEffect(() => {
    versionRef.current += 1;

    const controller = new AbortController();

    const executeEffect = async () => {
      try {
        await asyncEffect({
          signal: controller.signal,
          isLatest: () => version === versionRef.current,
          updateIfLatest: (updater) => {
            if (version === versionRef.current) {
              updater();
            }
          },
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Effect error", error);
        }
      }
    };

    executeEffect();

    return () => {
      controller.abort();
    };
  }, deps);
};
```

## Guard Pattern Inside Effects

Log guard failures in development but not in production. Use a feature flag or environment variable to control logging verbosity.

```js
const useGuardEffect = (guards, effect, deps) => {
  useEffect(() => {
    // Execute guards
    const guardResults = guards.map((guard) => ({
      name: guard.name,
      passed: guard.check(),
      message: guard.message,
    }));
    //  Check if all guards pass

    const failedGuard = guardResults.find((g) => !g.passed);

    if (failedGuard) {
      console.log(`Effect skipped: ${failedGuard.message}`);
      if (failedGuard.onFail) {
        failedGuard.onFail();
      }
      return;
    }

    //   All guards passed
    console.log("All guards passed, executing effect");

    const cleanup = effect();

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, deps);
};

// Usage

const DataComp = ({ userId }) => {
  const { isAuthenticated, token } = useAuth();
  const { hasPermission } = usePermissions();

  useGuardEffect(
    [
      {
        name: "auth",
        check: () => isAuthenticated && token,
        message: "User not authenticated",
        onFail: () => redirectToLogin(),
      },
      {
        name: "permission",
        check: () => hasPermission("read:data"),
        message: "Insufficient permissions",
      },
      {
        name: "validUser",
        check: () => userId && userId !== "guest",
        message: "Invalid user ID",
      },
    ],
    () => {
      //   Effect logic
      fetchUserData(userId, token);
    },
    [userId, isAuthenticated, token, hasPermission],
  );
};
```

## Dependency Optimization with Stable References

Use useLayoutEffect for updating refs that are read during render. This ensures the ref is updated before the browser paints, preventing visual inconsistencies.

```js
// Custom hook for stable callback references

const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callback.current = callback;
  }, []);

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

// Custom hook for deep comparison dependencies
const useDeepCompareEffect = (effect, deps) => {
  const ref = useRef(undefined);
  const siganlRef = useRef(0);

  if (!isDeepEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  useEffect(effect, [signalRef.current]);
};

function isEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    if (typeof a[key] === "object" && typeof b[key] === "object") {
      return isEqual(a[key], b[key]);
    }
    return a[key] === b[key];
  });
}
```

## Error Boundary Bridge

Create different error boundaries for different parts of your app. A failure in analytics shouldn’t break the entire UI — isolate non-critical features with their own boundaries.

```js
function useAsyncError() {
  const [, setError] = useState();

  return useCallback((error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// Comprehensive error handling system
const ErrorContext = createContext();

const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const logError = useCallback((error, context = {}) => {
    const errorEntry = {
      id: Date.now(),
      error,
      context,
      timestamp: new Date().toISOString(),
    };

    setErrors((prev) => [...prev, errorEntry]);
    // Send to monitoring
    if (window.errorReporter) {
      window.errorReporter.log(error, context);
    }
  });

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, logError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

const useErrorHandleEffect = (effect, deps, options = {}) => {
  const { logError } = useContext(ErrorContext);
  const throwError = useAsyncError();

  useEffect(() => {
    const wrappedEffect = async () => {
      try {
        await effect();
      } catch (error) {
        const errorContext = {
          component: options.componentName,
          effect: options.effectName,
          dependencies: deps,
        };
      }

      logError(error, errorContext);

      if (options.throwToBoundary) {
        throwError(error);
      }

      if (options.onError) {
        options.onError(error);
      }
    };

    wrappedEffect();
  }, deps);
};
```
