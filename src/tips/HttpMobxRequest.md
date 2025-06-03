```typescript
import {z, ZodTypeAny} from "zod";
import {pipe} from "fp-ts/function";
import * as E from "fp-ts/Either";
import {makeAutoObservable, autorun} from "mobx";
import {useEffect, useMemo} from "react";

// Тип состояния
export type HttpState<T> =
    | { type: "unsent" }
    | { type: "loading" }
    | { type: "done"; data: T }
    | { type: "error"; error: unknown }
    | { type: "timeout" };

export class HttpRequest<T, S extends ZodTypeAny> {
    state: HttpState<T> = {type: "unsent"};
    readonly schema: S;
    readonly timeoutMs: number;

    constructor(schema: S, timeoutMs = 5000) {
        makeAutoObservable(this);
        this.schema = schema;
        this.timeoutMs = timeoutMs;
    }

    async send(url: string, retries = 0): Promise<void> {
        this.state = {type: "loading"};
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

            const res = await fetch(url, {signal: controller.signal});
            clearTimeout(timeout);

            const json = await res.json();
            const parse = this.schema.safeParse(json);
            if (!parse.success) {
                this.state = {type: "error", error: parse.error};
                return;
            }
            this.state = {type: "done", data: parse.data};
        } catch (err: any) {
            if (retries > 0) {
                return this.send(url, retries - 1);
            }
            if (err.name === "AbortError") {
                this.state = {type: "timeout"};
                return;
            }
            this.state = {type: "error", error: err};
        }
    }

    reset(): void {
        this.state = {type: "unsent"};
    }

    get isDone(): boolean {
        return this.state.type === "done";
    }

    get data(): T {
        if (this.state.type !== "done") {
            throw new Error("Cannot access data unless state is 'done'");
        }
        return this.state.data;
    }

    get error(): unknown {
        if (this.state.type !== "error") {
            throw new Error("Cannot access error unless state is 'error'");
        }
        return this.state.error;
    }

    fold<R>(cases: {
        done: (data: T) => R;
        error: (e: unknown) => R;
        timeout: () => R;
        unsent: () => R;
        loading?: () => R;
    }): R {
        switch (this.state.type) {
            case "done":
                return cases.done(this.state.data);
            case "error":
                return cases.error(this.state.error);
            case "timeout":
                return cases.timeout();
            case "unsent":
                return cases.unsent();
            case "loading":
                return cases.loading?.() ?? cases.unsent();
        }
    }

    toEither(): E.Either<unknown, T> {
        return this.state.type === "done"
            ? E.right(this.state.data)
            : E.left(this.state.type === "error" ? this.state.error : new Error("HttpRequest not completed"));
    }

    asResult(): E.Either<unknown, T> {
        return this.toEither();
    }

    pipe<U>(fn: (req: HttpRequest<T, S>) => U): U {
        return fn(this);
    }

    catchAll<R>(handler: (e: unknown) => R): E.Either<unknown, T | R> {
        return pipe(
            this.toEither(),
            E.mapLeft(handler)
        );
    }

    tap(fn: (data: T) => void): this {
        if (this.state.type === "done") {
            fn(this.state.data);
        }
        return this;
    }

    chain<U>(fn: (data: T) => HttpRequest<U, S>): HttpRequest<U, S> {
        if (this.state.type !== "done") {
            const chained = new HttpRequest<U, S>(this.schema, this.timeoutMs);
            chained.state = this.state as any;
            return chained;
        }
        return fn(this.state.data);
    }

    autorunLogger(name = "HttpRequest"): void {
        autorun(() => {
            console.log(`[${name}] State:`, this.state);
        });
    }
}

// React hook: useHttpRequest
export function useHttpRequest<T, S extends ZodTypeAny>(schema: S, timeoutMs = 5000) {
    return useMemo(() => new HttpRequest<T, S>(schema, timeoutMs), []);
}

// Next.js loader example (for route handlers or server actions)
export async function fetchServerSide<T>(url: string, schema: ZodTypeAny, timeoutMs = 5000): Promise<E.Either<unknown, T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {signal: controller.signal});
        clearTimeout(timeout);
        const json = await res.json();
        const result = schema.safeParse(json);
        return result.success ? E.right(result.data) : E.left(result.error);
    } catch (e) {
        return E.left(e);
    }
}

```


```typescript
import {z, ZodTypeAny} from "zod";
import {pipe} from "fp-ts/function";
import * as E from "fp-ts/Either";
import {makeAutoObservable, autorun} from "mobx";
import {useEffect, useMemo} from "react";
import {EventEmitter} from "events";

// Тип состояния
export type HttpState<T> =
    | { type: "unsent" }
    | { type: "loading" }
    | { type: "done"; data: T }
    | { type: "error"; error: unknown }
    | { type: "timeout" };

export class HttpRequest<T, S extends ZodTypeAny> {
    state: HttpState<T> = {type: "unsent"};
    readonly schema: S;
    readonly timeoutMs: number;
    private readonly emitter = new EventEmitter();

    constructor(schema: S, timeoutMs = 5000) {
        makeAutoObservable(this);
        this.schema = schema;
        this.timeoutMs = timeoutMs;
    }

    async send(url: string, retries = 0, backoffMs = 300): Promise<void> {
        this.updateState({type: "loading"});
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

            const res = await fetch(url, {signal: controller.signal});
            clearTimeout(timeout);

            const json = await res.json();
            const parse = this.schema.safeParse(json);
            if (!parse.success) {
                this.updateState({type: "error", error: parse.error});
                return;
            }
            this.updateState({type: "done", data: parse.data});
        } catch (err: any) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, backoffMs));
                return this.send(url, retries - 1, backoffMs * 2);
            }
            if (err.name === "AbortError") {
                this.updateState({type: "timeout"});
                return;
            }
            this.updateState({type: "error", error: err});
        }
    }

    private updateState(state: HttpState<T>) {
        this.state = state;
        this.emitter.emit("state", state);
    }

    on(event: "state", listener: (state: HttpState<T>) => void) {
        this.emitter.on(event, listener);
    }

    off(event: "state", listener: (state: HttpState<T>) => void) {
        this.emitter.off(event, listener);
    }

    reset(): void {
        this.updateState({type: "unsent"});
    }

    get isDone(): boolean {
        return this.state.type === "done";
    }

    get data(): T {
        if (this.state.type !== "done") {
            throw new Error("Cannot access data unless state is 'done'");
        }
        return this.state.data;
    }

    get error(): unknown {
        if (this.state.type !== "error") {
            throw new Error("Cannot access error unless state is 'error'");
        }
        return this.state.error;
    }

    fold<R>(cases: {
        done: (data: T) => R;
        error: (e: unknown) => R;
        timeout: () => R;
        unsent: () => R;
        loading?: () => R;
    }): R {
        switch (this.state.type) {
            case "done":
                return cases.done(this.state.data);
            case "error":
                return cases.error(this.state.error);
            case "timeout":
                return cases.timeout();
            case "unsent":
                return cases.unsent();
            case "loading":
                return cases.loading?.() ?? cases.unsent();
        }
    }

    toEither(): E.Either<unknown, T> {
        return this.state.type === "done"
            ? E.right(this.state.data)
            : E.left(this.state.type === "error" ? this.state.error : new Error("HttpRequest not completed"));
    }

    asResult(): E.Either<unknown, T> {
        return this.toEither();
    }

    pipe<U>(fn: (req: HttpRequest<T, S>) => U): U {
        return fn(this);
    }

    catchAll<R>(handler: (e: unknown) => R): E.Either<unknown, T | R> {
        return pipe(
            this.toEither(),
            E.mapLeft(handler)
        );
    }

    tap(fn: (data: T) => void): this {
        if (this.state.type === "done") {
            fn(this.state.data);
        }
        return this;
    }

    chain<U>(fn: (data: T) => HttpRequest<U, S>): HttpRequest<U, S> {
        if (this.state.type !== "done") {
            const chained = new HttpRequest<U, S>(this.schema, this.timeoutMs);
            chained.state = this.state as any;
            return chained;
        }
        return fn(this.state.data);
    }

    flow<U>(fn: (data: T) => U): U | undefined {
        if (this.state.type === "done") {
            return fn(this.state.data);
        }
        return undefined;
    }

    autorunLogger(name = "HttpRequest"): void {
        autorun(() => {
            console.log(`[${name}] State:`, this.state);
        });
    }
}

// React hook: useHttpRequest
export function useHttpRequest<T, S extends ZodTypeAny>(schema: S, timeoutMs = 5000) {
    return useMemo(() => new HttpRequest<T, S>(schema, timeoutMs), []);
}

// Next.js loader example (for route handlers or server actions)
export async function fetchServerSide<T>(url: string, schema: ZodTypeAny, timeoutMs = 5000): Promise<E.Either<unknown, T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {signal: controller.signal});
        clearTimeout(timeout);
        const json = await res.json();
        const result = schema.safeParse(json);
        return result.success ? E.right(result.data) : E.left(result.error);
    } catch (e) {
        return E.left(e);
    }
}

const UserView = observer(({ request }: { request: HttpRequest<User, any> }) => {
    return request.fold({
        done: (user) => <div>Привет, {user.name}!</div>,
    error: (err) => <div>Ошибка: {String(err)}</div>,
    timeout: () => <div>Timeout. Повторите попытку.</div>,
    unsent: () => <button onClick={() => request.send("/api/user")}>Загрузить</button>,
    loading: () => <div>Загрузка...</div>,
    });
    
});

```

```typescript
class HttpClient {
  async do(request) {
    try {
      const response = await fetch(request)
      if (response.ok) {
        return response
      }
      return Promise.reject(new Error(response.statusText))
    } catch(error) {
      throw error
    }
  }
}

class Storage {
  #client;
  #headers = new Headers({ 'Content-type', 'application/json })
  #path = 'api/todos' 
   
  constructor(client) {
    this.#client = client
  }                        
  
  async getAll() {
    try {
      const request = new Request(this.#path, { headers: this.#headers })
      const response = await this.#client.do(request)
      return await response.json()
    } catch(error) {
      throw error
    }
  }

  async getById(id) {
    try {
      const request = new Request(`${this.#path}/${id}`, { headers: this.#headers })
      const response = await this.#client.do(request)
      return await response.json()
    } catch(error) {
      throw error
    }
  }
}

class State {
  #storage;
  todos = [];
  loading = false;
  
  constructor(storage) {
    this.#storage = storage
  }
  
  async getAll() {
    try {
      this.loading = true
      this.todos = await this.#storage.getAll()
    } catch(error) {
      // maybe show error
    } finally {
      this.loading = false
    }
  }
}

const storage = new Storage(new HttpClient())
const state = new State(storage)
```