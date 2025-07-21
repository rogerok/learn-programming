```typescript
import { makeAutoObservable, runInAction } from "mobx";

type Status = "idle" | "loading" | "error" | "success";

export class PaginatedStore<T, Args extends any[] = []> {
  data: ListModel<T> | null = null;
  status: Status = "idle";
  error: unknown = null;
  currentPage = 1;

  constructor(
    private fetchFn: (...args: Args) => Promise<ListModel<T>>,
    private getArgs: () => Args, // like () => [query]
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLoading() {
    return this.status === "loading";
  }

  get isSuccess() {
    return this.status === "success";
  }

  get hasMore() {
    return this.data?.hasMore ?? false;
  }

  async fetchPage(page = 1) {
    this.status = "loading";
    this.error = null;
    this.currentPage = page;

    try {
      const args = this.getArgs();
      const result = await this.fetchFn(...args);

      runInAction(() => {
        this.data = result;
        this.status = result.items.length ? "success" : "empty";
      });
    } catch (e) {
      runInAction(() => {
        this.status = "error";
        this.error = e;
      });
    }
  }

  refetch() {
    return this.fetchPage(this.currentPage);
  }

  fetchNext() {
    if (this.hasMore) {
      return this.fetchPage(this.currentPage + 1);
    }
  }
}
```
