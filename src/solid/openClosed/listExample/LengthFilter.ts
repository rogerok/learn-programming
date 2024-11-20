// LengthFilter.ts
import {ItemFilter} from "./ItemFilterModel.ts";

// The LengthFilter class implements the ItemFilter interface
// It filters items based on their length (greater than or equal to a specified value).
// Again, it adheres to OCP because if we need to add more complex filtering logic,
// we can extend this class or create new classes without touching existing code.
export class LengthFilter implements ItemFilter {
    private readonly minLength: number;

    constructor(minLength: number) {
        this.minLength = minLength;  // Initialize with minimum length value
    }

    // The 'apply' method for this class filters items that meet the length requirement.
    apply(items: string[]): string[] {
        return items.filter((item) => item.length >= this.minLength);
    }
}
