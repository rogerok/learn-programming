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
