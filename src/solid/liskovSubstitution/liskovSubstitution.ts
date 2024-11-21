/**
 * Here’s a scenario where LSP is followed:
 */


// Base class
class Rectangle {
    constructor(protected width: number, protected height: number) {
    }

    setWidth(width: number) {
        this.width = width;
    }

    setHeight(height: number) {
        this.height = height;
    }

    getArea(): number {
        return this.width * this.height;
    }
}

// Subclass
class Square extends Rectangle {
    setWidth(width: number) {
        this.width = width;
        this.height = width; // Ensuring square property
    }

    setHeight(height: number) {
        this.width = height; // Ensuring square property
        this.height = height;
    }
}

// Function using the base class
function calculateArea(rectangle: Rectangle) {
    rectangle.setWidth(5);
    rectangle.setHeight(10);
    console.log(`Area: ${rectangle.getArea()}`);
}

// Works for both Rectangle and Square
const rectangle = new Rectangle(0, 0);
calculateArea(rectangle); // Output: Area: 50

const square = new Square(0, 0);
calculateArea(square); // Output: Area: 100


/**
 * Violating LSP
 */

class Bird {
    fly(): string {
        return "I can fly!";
    }
}

class Penguin extends Bird {
    // Penguins can't fly
    fly(): string {
        throw new Error("I can't fly!");
    }
}

// Function using the base class
function letBirdFly(bird: Bird) {
    console.log(bird.fly());
}

// Works for general birds
const sparrow = new Bird();
letBirdFly(sparrow); // Output: I can fly!

// Fails for penguins
const penguin = new Penguin();
letBirdFly(penguin); // Throws Error: I can't fly!

// Here, substituting a Penguin for a Bird breaks the program's behavior, violating LSP.
// The subclass (Penguin) changes the contract of the base class (Bird) in a way that leads to runtime errors.