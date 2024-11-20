// Without OCP
import {useState} from "react";
import {ItemFilter} from "./ItemFilterModel.ts";
import {StartsWithFilter} from "./StartsWithFilter.ts";
import {LengthFilter} from "./LengthFilter.ts";

// Here, we are directly embedding the filtering logic in the component.
// This is inflexible and violates OCP because if we need to add a new filter,
// we have to modify this component directly (i.e., modify filtering logic inside the component).
const ItemList = ({items}: { items: string[] }) => {
    const [showFiltered, setShowFiltered] = useState(false);

    // The filtering logic is directly embedded in the component,
    // and modifying the filter (e.g., adding a new one) requires changing this component.
    const filteredItems = showFiltered
        ? items.filter((item) => item.startsWith("A"))  // Hardcoded filter logic
        : items;

    return (
        <div>
            <button onClick={() => setShowFiltered(!showFiltered)}>
                Toggle Filter
            </button>
            <ul>
                {filteredItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

// With OCP - The item filtering logic is separated and abstracted out into specific filter classes

// This component is flexible and adheres to the Open-Closed Principle.
// The ItemList component does not need to be modified when new filters are added.
// We can simply create new filter classes and inject them into the component.
const ItemList2 = ({items, filter}: { items: string[]; filter: ItemFilter }) => {
    // The filtering logic is now abstracted and can be extended with different filters
    const filteredItems = filter.apply(items);

    return (
        <div>
            <ul>
                {filteredItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

// Now, when using the ItemList2 component, we can pass different filter implementations
const App = () => {
    const items = ["Apple", "Banana", "Avocado", "Blueberry"];
    const startsWithAFilter = new StartsWithFilter("A");  // A filter to select items starting with 'A'
    const lengthFilter = new LengthFilter(6);  // A filter to select items with length >= 6

    return (
        <div>
            <h1>Filter by StartsWith "A"</h1>
            <ItemList2 items={items} filter={startsWithAFilter}/> {/* Reusable filter */}

            <h1>Filter by Length </h1>
            <ItemList2 items={items} filter={lengthFilter}/> {/* Reusable filter */}
        </div>
    );
};
