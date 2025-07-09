✅ 1. Partially applied API clients (Reusable request builders)

```typescript
// Curried API fetcher
const fetchWithToken = (token: string) => (url: string) =>
    fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
    });

const myApi = fetchWithToken(store.auth.token);
await myApi('/user/profile');
await myApi('/user/settings');
```

✅ 2. Validation pipeline / reusable rule builders

```typescript
const minLength = (n: number) => (value: string) =>
    value.length >= n || `Must be at least ${n} characters`;

const isEmail = (value: string) =>
    /.+@.+\..+/.test(value) || 'Invalid email';

const validators = [minLength(6), isEmail];
const result = validators.map(fn => fn(form.email));
```

✅ 3. Event handler factories in React

```tsx
const handleInput = (field: keyof FormType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    formStore.setField(field, e.target.value);
};

// Usage:
<input onChange={handleInput('email')}/>
```

✅ 4. MobX/Redux action builders

```tsx
const setField = (field: keyof FormState) => (value: string) =>
    formState[field] = value;

<input onChange={(e) => setField('name')(e.target.value)}/>
```

✅ 5. Custom hooks with pre-bound dependencies

```typescript
const useFetchWithBase = (base: string) => (endpoint: string) =>
    useFetch(`${base}${endpoint}`);

const useApi = useFetchWithBase('/api/v1');
useApi('/users');
useApi('/projects');
```

✅ 6. tRPC: curried middleware

```typescript
const roleGuard = (allowedRoles: string[]) =>
    t.middleware(({ctx, next}) => {
        if (!ctx.user || !allowedRoles.includes(ctx.user.role)) {
            throw new TRPCError({code: 'FORBIDDEN'});
        }
        return next();
    });

const adminOnly = roleGuard(['admin']);
const moderatorOnly = roleGuard(['admin', 'moderator']);

export const protectedRouter = t.router({
    deleteUser: t.procedure
        .use(adminOnly)
        .mutation(() => { /* ... */
        }),

    reviewComment: t.procedure
        .use(moderatorOnly)
        .mutation(() => { /* ... */
        }),
});

```
