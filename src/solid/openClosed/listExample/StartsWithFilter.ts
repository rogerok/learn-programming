// StartsWithFilter.ts
import {ItemFilter} from "./ItemFilterModel.ts";

// The StartsWithFilter class implements the ItemFilter interface
// It provides specific logic to filter items starting with a given letter.
// This approach allows us to add new filtering mechanisms without modifying existing classes,
// which aligns with the Open-Closed Principle (OCP) – the class is open for extension but closed for modification.
export class StartsWithFilter implements ItemFilter {
    private readonly letter: string;

    constructor(letter: string) {
        this.letter = letter;  // Initialize the letter to filter by
    }

    // 'apply' method is specific to this filter: it returns only items that start with the specified letter.
    apply(items: string[]): string[] {
        return items.filter((item) => item.startsWith(this.letter));
    }
}
