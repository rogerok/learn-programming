# Build Your Own React - Summary

This document summarizes the process of building a simplified React-like library, **Didact**, step by step.

---

## Step 0: Review

- JSX compiles to `createElement` calls.
- React elements are objects with `type` and `props`.
- `render` creates DOM nodes from elements and appends them to containers.

---

## Step 1: The `createElement` Function

- Converts JSX into JS objects.
- Wraps primitive children into `TEXT_ELEMENT` objects.
- Example:
  ```js
  function createElement(type, props, ...children) {
      return {
          type,
          props: {
              ...props,
              children: children.map(child =>
                  typeof child === "object" ? child : createTextElement(child)
              ),
          },
      };
  }
  ```

---

## Step 2: The `render` Function

- Recursively creates DOM nodes and appends them to the container.
- Handles text elements separately.
- Assigns props to DOM nodes, excluding `children`.

---

## Step 3: Concurrent Mode

- Problem: Recursive rendering blocks the main thread.
- Solution: Break work into small units using `requestIdleCallback`.
- Work loop yields back to the browser if needed.

---

## Step 4: Fibers

- Introduces a **fiber tree** for managing units of work.
- Each fiber represents an element and stores links (`child`, `sibling`, `parent`).
- `performUnitOfWork` creates DOM nodes and sets up the tree traversal logic.

---

## Step 5: Render and Commit Phases

- Rendering is split into two phases:
    1. **Render phase**: Build the fiber tree without mutating the DOM.
    2. **Commit phase**: Traverse the fiber tree and apply DOM changes.
- Prevents partial rendering visible to users.

---

## Step 6: Reconciliation

- Compare new elements with the old fiber tree (from `currentRoot`).
- Each fiber has an `alternate` pointing to its previous version.
- Use `effectTag` to track operations:
    - `PLACEMENT` → Add new node.
    - `UPDATE` → Update existing node.
    - `DELETION` → Remove old node.
- DOM updates handled by `updateDom`, including props and event listeners.

---

## Step 7: Function Components

- Fibers for function components:
    - Do not create DOM nodes.
    - Children come from executing the function.
- Special handling in `updateFunctionComponent`.
- `commitWork` updated to find nearest DOM parent and properly remove nodes.

---

## Step 8: Hooks

- Introduce `useState`:
    - Stores state in `hooks` array on the fiber.
    - Uses `hookIndex` to track multiple calls.
    - State updates trigger a new render by resetting `wipRoot`.
- Actions are queued and processed in order to update state.

---

## Key Differences from React

- React optimizes render and commit phases by skipping unchanged subtrees.
- React maintains a linked list of fibers with effects to reduce traversal cost.
- Didact is a simplified conceptual version.

---

## Final Thoughts

This step-by-step build demonstrates how React manages:

- Declarative rendering through elements.
- Efficient DOM updates via fibers and reconciliation.
- Function components and hooks for stateful logic.
