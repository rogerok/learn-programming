// ItemFilterModel.ts
// This interface enforces that all filters will have an 'apply' method.
// It abstracts the filtering logic and allows us to easily add new filters without modifying existing code.
export interface ItemFilter {
    apply(items: string[]): string[];
}
